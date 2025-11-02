import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

// Mapeamento de price_id para quantidade de créditos
const CREDIT_PACKAGES: Record<string, number> = {
  "price_1SP9lhPMwKgpsB6lSg0aAUSI": 100,  // R$ 10 = 100 créditos
  "price_1SP9mKPMwKgpsB6l0B1PGDN7": 500,  // R$ 45 = 500 créditos
  "price_1SP9mZPMwKgpsB6lX0jMEbU7": 1000, // R$ 80 = 1000 créditos
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { 
      headers: corsHeaders,
      status: 200 
    });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    console.log("[CREATE-PAYMENT] Starting payment creation");
    
    // Parse request body
    let priceId;
    try {
      const body = await req.json();
      priceId = body.priceId;
      console.log("[CREATE-PAYMENT] Price ID:", priceId);
      console.log("[CREATE-PAYMENT] Request body:", JSON.stringify(body));
    } catch (parseError) {
      console.error("[CREATE-PAYMENT] Error parsing request body:", parseError);
      throw new Error("Invalid request body");
    }

    console.log("[CREATE-PAYMENT] Available packages:", Object.keys(CREDIT_PACKAGES));
    console.log("[CREATE-PAYMENT] Checking if price ID exists in packages...");
    
    if (!priceId) {
      console.error("[CREATE-PAYMENT] Price ID is missing");
      throw new Error("Price ID is required");
    }
    
    if (!CREDIT_PACKAGES[priceId]) {
      console.error("[CREATE-PAYMENT] Invalid price ID:", priceId);
      console.error("[CREATE-PAYMENT] Available price IDs:", Object.keys(CREDIT_PACKAGES));
      throw new Error(`Invalid price ID: ${priceId}`);
    }

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      console.error("[CREATE-PAYMENT] No authorization header");
      throw new Error("No authorization header");
    }

    const token = authHeader.replace("Bearer ", "");
    const { data, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError) {
      console.error("[CREATE-PAYMENT] Auth error:", authError);
      throw authError;
    }
    
    const user = data.user;
    
    if (!user?.email) {
      console.error("[CREATE-PAYMENT] User not authenticated");
      throw new Error("User not authenticated or email not available");
    }

    console.log(`[CREATE-PAYMENT] Creating payment for user: ${user.email}`);

    // Verify Stripe key
    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      console.error("[CREATE-PAYMENT] STRIPE_SECRET_KEY not configured");
      throw new Error("Payment system not configured. Contact support.");
    }
    console.log("[CREATE-PAYMENT] Stripe key found");

    const stripe = new Stripe(stripeKey, {
      apiVersion: "2025-08-27.basil",
    });

    // Verificar se o cliente já existe no Stripe
    const customers = await stripe.customers.list({ email: user.email, limit: 1 });
    let customerId;
    if (customers.data.length > 0) {
      customerId = customers.data[0].id;
      console.log(`[CREATE-PAYMENT] Found existing customer: ${customerId}`);
    } else {
      console.log(`[CREATE-PAYMENT] Creating new customer for ${user.email}`);
    }

    // Criar sessão de checkout com suporte a Pix e Cartão
    const session = await stripe.checkout.sessions.create({
      customer: customerId,
      customer_email: customerId ? undefined : user.email,
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: "payment",
      payment_method_types: ['card', 'pix'], // Permite pagamento via Pix e Cartão
      success_url: `${req.headers.get("origin")}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get("origin")}/?payment=canceled`,
      metadata: {
        user_id: user.id,
        credits: CREDIT_PACKAGES[priceId].toString(),
      },
    });

    console.log(`[CREATE-PAYMENT] Payment session created: ${session.id}`);
    console.log(`[CREATE-PAYMENT] Payment methods:`, session.payment_method_types);
    console.log(`[CREATE-PAYMENT] Currency:`, session.currency);

    return new Response(JSON.stringify({ url: session.url, sessionId: session.id }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("[CREATE-PAYMENT] Error:", error);
    console.error("[CREATE-PAYMENT] Error stack:", error instanceof Error ? error.stack : "No stack trace");
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error";
    const userFriendlyMessage = errorMessage.includes("STRIPE_SECRET_KEY") 
      ? "Sistema de pagamento não configurado. Entre em contato com o suporte."
      : "Erro ao processar pagamento. Tente novamente.";
    
    return new Response(JSON.stringify({ 
      error: userFriendlyMessage,
      details: errorMessage 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
