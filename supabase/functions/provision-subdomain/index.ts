import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.0";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

interface ProvisionPayload {
  restaurant_id: string;
  subdomain: string; // ex: "pizzariadoze" -> gera pizzariadoze.meusaaspizza.com.br
}

serve(async (req) => {
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

    const cloudflareApiToken = Deno.env.get("CLOUDFLARE_API_TOKEN");
    const cloudflareZoneId = Deno.env.get("CLOUDFLARE_ZONE_ID");
    const cloudflareCnameTarget = Deno.env.get("CLOUDFLARE_CNAME_TARGET") || "cname.meusaaspizza.com.br";

    if (!cloudflareApiToken || !cloudflareZoneId) {
      return new Response(
        JSON.stringify({ error: "Variáveis de ambiente do Cloudflare não configuradas no servidor." }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Cliente Supabase com Service Role para atualização do Tenant
    const adminClient = createClient(supabaseUrl, supabaseServiceKey);

    const payload: ProvisionPayload = await req.json();
    const { restaurant_id, subdomain } = payload;

    if (!restaurant_id || !subdomain) {
      return new Response(
        JSON.stringify({ error: "restaurant_id e subdomain são obrigatórios." }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // Sanitarização do subdomínio (somente letras minúsculas, números e hífens)
    const cleanSubdomain = subdomain.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
    if (cleanSubdomain.length < 3 || cleanSubdomain.length > 63) {
      return new Response(
        JSON.stringify({ error: "Subdomínio deve ter entre 3 e 63 caracteres alfanuméricos." }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    // 1. Criar registro CNAME via API v4 do Cloudflare
    const cfUrl = `https://api.cloudflare.com/client/v4/zones/${cloudflareZoneId}/dns_records`;
    const cfPayload = {
      type: "CNAME",
      name: cleanSubdomain,
      content: cloudflareCnameTarget,
      ttl: 1, // 1 = Auto TTL
      proxied: true, // Habilita CDN, SSL automático e Firewall Cloudflare
      comment: `Provisionado automaticamente via SaaS Edge Function para restaurante ID ${restaurant_id}`,
    };

    const cfResponse = await fetch(cfUrl, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${cloudflareApiToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(cfPayload),
    });

    const cfData = await cfResponse.json();

    if (!cfData.success) {
      console.error("Erro na API Cloudflare:", cfData.errors);
      const errorMsg = cfData.errors?.[0]?.message || "Falha ao registrar CNAME no Cloudflare.";
      return new Response(
        JSON.stringify({ error: errorMsg, cloudflare_errors: cfData.errors }),
        { status: 400, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    const createdDnsRecord = cfData.result;

    // 2. Atualizar configurações do restaurante no Supabase
    const fullSubdomain = `${cleanSubdomain}.meusaaspizza.com.br`;
    const { data: updatedSettings, error: dbError } = await adminClient
      .from("restaurant_settings")
      .upsert({
        restaurant_id: restaurant_id,
        subdomain: cleanSubdomain,
        full_domain: fullSubdomain,
        cloudflare_dns_id: createdDnsRecord.id,
        subdomain_status: "active",
        updated_at: new Date().toISOString(),
      }, { onConflict: "restaurant_id" })
      .select()
      .single();

    if (dbError) {
      console.error("Erro ao atualizar banco de dados:", dbError);
      return new Response(
        JSON.stringify({ error: "DNS criado no Cloudflare, porém falhou ao salvar no banco de dados.", dns_record: createdDnsRecord }),
        { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        message: "Subdomínio CNAME provisionado com sucesso no Cloudflare!",
        dns_record: {
          id: createdDnsRecord.id,
          name: createdDnsRecord.name,
          full_domain: fullSubdomain,
          type: createdDnsRecord.type,
          proxied: createdDnsRecord.proxied,
        },
        restaurant_settings: updatedSettings,
      }),
      { status: 201, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );

  } catch (err: any) {
    console.error("Erro na Edge Function provision-subdomain:", err);
    return new Response(
      JSON.stringify({ error: err.message || "Erro interno ao provisionar subdomínio." }),
      { status: 500, headers: { ...CORS_HEADERS, "Content-Type": "application/json" } }
    );
  }
});
