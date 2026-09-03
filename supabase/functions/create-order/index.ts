import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateOrderBody {
  restaurant_id: string;
  customer: {
    name: string;
    phone: string;
    email?: string;
  };
  order_type: "delivery" | "takeaway";
  payment_method: "pix" | "credit_card" | "debit_card" | "cash";
  delivery_address?: any;
  items: Array<{
    item_type: "pizza" | "product";
    product_id?: string;
    pizza_size_id?: string;
    quantity: number;
    unit_price: number;
    notes?: string;
  }>;
  discount?: number;
  notes?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body: CreateOrderBody = await req.json();

    if (!body.restaurant_id || !body.customer || !body.items || body.items.length === 0) {
      return new Response(
        JSON.stringify({ error: "Campos obrigatórios ausentes (restaurant_id, customer, items)" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 1. Fetch Restaurant Settings
    const { data: settings, error: settingsError } = await supabase
      .from("restaurant_settings")
      .select("is_open, min_order_value, delivery_fee_default")
      .eq("restaurant_id", body.restaurant_id)
      .single();

    if (settingsError || !settings) {
      return new Response(
        JSON.stringify({ error: "Configurações do restaurante não encontradas." }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!settings.is_open) {
      return new Response(
        JSON.stringify({ error: "Restaurante está fechado no momento para novos pedidos." }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 2. Calculate Subtotal & Totals
    const subtotal = body.items.reduce((acc, item) => acc + item.unit_price * item.quantity, 0);

    if (subtotal < settings.min_order_value) {
      return new Response(
        JSON.stringify({ error: `Valor mínimo do pedido para esta loja é R$ ${settings.min_order_value.toFixed(2)}` }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const deliveryFee = body.order_type === "delivery" ? settings.delivery_fee_default : 0;
    const discount = body.discount || 0;
    const totalAmount = Math.max(0, subtotal + deliveryFee - discount);

    // 3. Get Next Sequential Order Number for Tenant
    const { data: lastOrder } = await supabase
      .from("orders")
      .select("order_number")
      .eq("restaurant_id", body.restaurant_id)
      .order("order_number", { ascending: false })
      .limit(1)
      .single();

    const nextOrderNumber = (lastOrder?.order_number || 1000) + 1;

    // 4. Create Order Record
    const { data: newOrder, error: orderError } = await supabase
      .from("orders")
      .insert({
        restaurant_id: body.restaurant_id,
        order_number: nextOrderNumber,
        customer_name: body.customer.name,
        customer_phone: body.customer.phone,
        order_type: body.order_type,
        status: "pending",
        payment_method: body.payment_method,
        payment_status: "pending",
        subtotal,
        delivery_fee: deliveryFee,
        discount,
        total_amount: totalAmount,
        delivery_address: body.delivery_address || null,
        notes: body.notes || null,
      })
      .select()
      .single();

    if (orderError || !newOrder) {
      return new Response(
        JSON.stringify({ error: "Erro ao criar pedido no banco de dados", details: orderError?.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // 5. Create Order Items Records
    const orderItemsToInsert = body.items.map((item) => ({
      order_id: newOrder.id,
      item_type: item.item_type,
      product_id: item.product_id || null,
      pizza_size_id: item.pizza_size_id || null,
      quantity: item.quantity,
      unit_price: item.unit_price,
      subtotal: item.unit_price * item.quantity,
      notes: item.notes || null,
    }));

    const { error: itemsError } = await supabase
      .from("order_items")
      .insert(orderItemsToInsert);

    if (itemsError) {
      console.error("Erro ao inserir order_items:", itemsError);
    }

    return new Response(
      JSON.stringify({
        success: true,
        order: newOrder,
        message: `Pedido #${nextOrderNumber} criado com sucesso!`,
      }),
      { status: 201, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
