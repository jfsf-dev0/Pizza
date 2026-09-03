import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-forwarded-host",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") ?? "";
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "";
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const url = new URL(req.url);
    const hostHeader = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
    const querySlug = url.searchParams.get("slug");
    const queryDomain = url.searchParams.get("domain");

    let query = supabase
      .from("restaurants")
      .select(`
        id,
        name,
        slug,
        custom_domain,
        logo_url,
        banner_url,
        status,
        plans (
          id,
          name,
          slug,
          max_products,
          max_orders_per_month,
          custom_domain_enabled
        ),
        restaurant_settings (
          is_open,
          delivery_fee_default,
          min_order_value,
          delivery_time_minutes,
          pix_key,
          store_address,
          store_phone,
          theme_primary_color,
          opening_hours
        )
      `);

    if (querySlug) {
      query = query.eq("slug", querySlug);
    } else if (queryDomain) {
      query = query.eq("custom_domain", queryDomain);
    } else if (hostHeader) {
      const cleanHost = hostHeader.split(":")[0];
      if (cleanHost.endsWith(".deliveryapp.com")) {
        const subdomain = cleanHost.replace(".deliveryapp.com", "");
        query = query.eq("slug", subdomain);
      } else {
        query = query.eq("custom_domain", cleanHost);
      }
    } else {
      query = query.eq("slug", "bella-pizza"); // Default fallback
    }

    const { data: restaurant, error } = await query.single();

    if (error || !restaurant) {
      return new Response(
        JSON.stringify({ error: "Tenant not found for domain/subdomain", details: error?.message }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(
      JSON.stringify({
        success: true,
        tenant: restaurant,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
