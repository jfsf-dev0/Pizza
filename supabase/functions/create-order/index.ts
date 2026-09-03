import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface PizzaItemInput {
  type: "pizza";
  pizza_size_id: string;
  pizza_crust_id?: string;
  flavor_ids: string[]; // 1 até 3 sabores
  quantity: number;
  notes?: string;
}

interface ProductItemInput {
  type: "product";
  product_id: string;
  quantity: number;
  notes?: string;
}

type OrderItemInput = PizzaItemInput | ProductItemInput;

interface CreateOrderPayload {
  address_id: string;
  payment_method: "pix" | "credit_card" | "debit_card" | "cash";
  change_for?: number;
  notes?: string;
  items: OrderItemInput[];
}

serve(async (req) => {
  // 1. Tratar preflight CORS
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: CORS_HEADERS });
  }

  try {
    if (req.method !== "POST") {
      return new Response(
        JSON.stringify({ error: "Método não permitido. Utilize POST." }),
        { status: 405, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // 2. Inicializar cliente Supabase com token de autorização do usuário
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: "Cabeçalho de autorização ausente." }),
        { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? supabaseAnonKey;

    const userClient = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: authHeader } },
    });

    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    // Obter usuário autenticado
    const { data: { user }, error: userError } = await userClient.auth.getUser();
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: "Usuário não autenticado ou token inválido." }),
        { status: 401, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // 3. Parse do payload
    const payload: CreateOrderPayload = await req.json();
    const { address_id, payment_method, change_for, notes, items } = payload;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return new Response(
        JSON.stringify({ error: "O pedido deve conter ao menos um item." }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    if (!address_id) {
      return new Response(
        JSON.stringify({ error: "Endereço de entrega obrigatório." }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // 4. Buscar endereço do usuário e criar snapshot JSON
    const { data: addressData, error: addressError } = await adminClient
      .from("addresses")
      .select("*")
      .eq("id", address_id)
      .eq("user_id", user.id)
      .single();

    if (addressError || !addressData) {
      return new Response(
        JSON.stringify({ error: "Endereço de entrega não encontrado ou inválido." }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const deliveryAddressSnapshot = {
      street: addressData.street,
      number: addressData.number,
      complement: addressData.complement,
      neighborhood: addressData.neighborhood,
      city: addressData.city,
      state: addressData.state,
      zip_code: addressData.zip_code,
      reference_point: addressData.reference_point,
    };

    // 5. Processar e Validar Itens + Cálculo do Preço pela REGRA DO MAIOR VALOR
    let subtotalAcc = 0;
    const processedItems = [];

    for (const item of items) {
      const quantity = Math.max(1, Math.floor(item.quantity || 1));

      if (item.type === "pizza") {
        if (!item.pizza_size_id) {
          throw new Error("Tamanho da pizza é obrigatório.");
        }

        if (!item.flavor_ids || !Array.isArray(item.flavor_ids) || item.flavor_ids.length === 0) {
          throw new Error("Selecione ao menos 1 sabor para a pizza.");
        }

        if (item.flavor_ids.length > 3) {
          throw new Error("Uma pizza pode ter no máximo 3 sabores.");
        }

        // Buscar tamanho e verificar limite
        const { data: sizeData, error: sizeError } = await adminClient
          .from("pizza_sizes")
          .select("*")
          .eq("id", item.pizza_size_id)
          .eq("is_active", true)
          .single();

        if (sizeError || !sizeData) {
          throw new Error(`Tamanho de pizza inválido ou inativo. ID: ${item.pizza_size_id}`);
        }

        if (item.flavor_ids.length > sizeData.max_flavors) {
          throw new Error(
            `O tamanho ${sizeData.name} permite no máximo ${sizeData.max_flavors} sabor(es).`
          );
        }

        // Buscar preços de todos os sabores selecionados para este tamanho
        const { data: flavorPrices, error: pricesError } = await adminClient
          .from("pizza_flavor_prices")
          .select("flavor_id, price")
          .eq("size_id", item.pizza_size_id)
          .in("flavor_id", item.flavor_ids);

        if (pricesError || !flavorPrices || flavorPrices.length !== item.flavor_ids.length) {
          throw new Error("Um ou mais sabores selecionados não possuem preço para este tamanho.");
        }

        // REGRA DA PIZZA: Preço cobrado pelo MAIOR valor entre os sabores selecionados
        const pricesList = flavorPrices.map((fp) => Number(fp.price));
        const maxFlavorPrice = Math.max(...pricesList);

        // Borda (opcional)
        let crustPrice = 0;
        if (item.pizza_crust_id) {
          const { data: crustData, error: crustError } = await adminClient
            .from("pizza_crusts")
            .select("price")
            .eq("id", item.pizza_crust_id)
            .eq("is_active", true)
            .single();

          if (crustError || !crustData) {
            throw new Error(`Borda recheada inválida ou inativa ID: ${item.pizza_crust_id}`);
          }
          crustPrice = Number(crustData.price);
        }

        const unitPrice = maxFlavorPrice + crustPrice;
        const itemSubtotal = unitPrice * quantity;
        subtotalAcc += itemSubtotal;

        processedItems.push({
          item_type: "pizza",
          pizza_size_id: item.pizza_size_id,
          pizza_crust_id: item.pizza_crust_id || null,
          product_id: null,
          quantity,
          unit_price: unitPrice,
          subtotal: itemSubtotal,
          notes: item.notes || null,
          flavors: flavorPrices.map((fp) => ({
            flavor_id: fp.flavor_id,
            price_at_time: Number(fp.price),
          })),
        });

      } else if (item.type === "product") {
        if (!item.product_id) {
          throw new Error("ID do produto é obrigatório.");
        }

        const { data: productData, error: productError } = await adminClient
          .from("products")
          .select("price, is_active, name")
          .eq("id", item.product_id)
          .single();

        if (productError || !productData || !productData.is_active) {
          throw new Error(`Produto indisponível ou inválido ID: ${item.product_id}`);
        }

        const unitPrice = Number(productData.price);
        const itemSubtotal = unitPrice * quantity;
        subtotalAcc += itemSubtotal;

        processedItems.push({
          item_type: "product",
          pizza_size_id: null,
          pizza_crust_id: null,
          product_id: item.product_id,
          quantity,
          unit_price: unitPrice,
          subtotal: itemSubtotal,
          notes: item.notes || null,
          flavors: [],
        });
      } else {
        throw new Error(`Tipo de item inválido: ${(item as any).type}`);
      }
    }

    // 6. Taxa de entrega e Total
    const deliveryFee = 5.00; // Taxa padrão de entrega
    const discount = 0.00;
    const totalAmount = subtotalAcc + deliveryFee - discount;

    if (payment_method === "cash" && change_for && change_for < totalAmount) {
      return new Response(
        JSON.stringify({ error: `O troco (R$ ${change_for}) deve ser maior ou igual ao total (R$ ${totalAmount.toFixed(2)}).` }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // 7. Persistir Pedido no Banco de Dados (Order + Order Items + Order Item Flavors)
    const { data: orderData, error: orderInsertError } = await adminClient
      .from("orders")
      .insert({
        user_id: user.id,
        status: "pending",
        payment_method,
        payment_status: payment_method === "pix" ? "pending" : "pending",
        subtotal: subtotalAcc,
        delivery_fee: deliveryFee,
        discount,
        total_amount: totalAmount,
        delivery_address: deliveryAddressSnapshot,
        change_for: payment_method === "cash" ? change_for : null,
        notes: notes || null,
      })
      .select("id, order_number, status, total_amount, created_at")
      .single();

    if (orderInsertError || !orderData) {
      console.error("Erro ao inserir pedido:", orderInsertError);
      throw new Error("Falha ao salvar o pedido no banco de dados.");
    }

    // Insert order items
    for (const pItem of processedItems) {
      const { data: insertedItem, error: itemError } = await adminClient
        .from("order_items")
        .insert({
          order_id: orderData.id,
          item_type: pItem.item_type,
          product_id: pItem.product_id,
          pizza_size_id: pItem.pizza_size_id,
          pizza_crust_id: pItem.pizza_crust_id,
          quantity: pItem.quantity,
          unit_price: pItem.unit_price,
          subtotal: pItem.subtotal,
          notes: pItem.notes,
        })
        .select("id")
        .single();

      if (itemError || !insertedItem) {
        console.error("Erro ao inserir item do pedido:", itemError);
        throw new Error("Falha ao salvar os itens do pedido.");
      }

      // Se for pizza, salvar os sabores selecionados
      if (pItem.flavors && pItem.flavors.length > 0) {
        const flavorsToInsert = pItem.flavors.map((f) => ({
          order_item_id: insertedItem.id,
          flavor_id: f.flavor_id,
          price_at_time: f.price_at_time,
        }));

        const { error: flavorInsertError } = await adminClient
          .from("order_item_flavors")
          .insert(flavorsToInsert);

        if (flavorInsertError) {
          console.error("Erro ao inserir sabores do item:", flavorInsertError);
          throw new Error("Falha ao salvar os sabores da pizza.");
        }
      }
    }

    // 8. Retornar resposta de sucesso
    return new Response(
      JSON.stringify({
        success: true,
        message: "Pedido criado com sucesso!",
        order: {
          id: orderData.id,
          order_number: orderData.order_number,
          status: orderData.status,
          subtotal: subtotalAcc,
          delivery_fee: deliveryFee,
          total_amount: orderData.total_amount,
          created_at: orderData.created_at,
        },
      }),
      { status: 201, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    console.error("Erro na Edge Function create-order:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Erro interno ao processar o pedido." }),
      { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
