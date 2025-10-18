import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
  );

  try {
    const { sessionId } = await req.json();

    if (!sessionId) {
      throw new Error("Session ID is required");
    }

    console.log(`Verifying payment for session: ${sessionId}`);

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    // Buscar a sessão de checkout
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    
    console.log(`Session status: ${session.payment_status}`);

    if (session.payment_status !== "paid") {
      return new Response(JSON.stringify({ success: false, message: "Payment not completed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Verificar se já foi processado
    const { data: existingTransaction } = await supabaseClient
      .from("transactions")
      .select("id")
      .eq("stripe_session_id", sessionId)
      .maybeSingle();

    if (existingTransaction) {
      console.log("Payment already processed");
      return new Response(JSON.stringify({ success: true, message: "Payment already processed" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Adicionar créditos
    const credits = parseInt(session.metadata?.credits || "0");
    
    if (credits <= 0) {
      throw new Error("Invalid credits amount");
    }

    console.log(`Adding ${credits} credits to user ${user.id}`);

    // Atualizar saldo do usuário
    const { error: updateError } = await supabaseClient.rpc("increment_balance", {
      user_id: user.id,
      amount: credits
    }).maybeSingle();

    if (updateError) {
      // Se a função não existir, fazer update direto
      const { data: profile } = await supabaseClient
        .from("profiles")
        .select("balance")
        .eq("id", user.id)
        .single();

      const newBalance = (profile?.balance || 0) + credits;

      const { error: directUpdateError } = await supabaseClient
        .from("profiles")
        .update({ balance: newBalance })
        .eq("id", user.id);

      if (directUpdateError) {
        throw directUpdateError;
      }
    }

    // Registrar transação
    const { error: transactionError } = await supabaseClient
      .from("transactions")
      .insert({
        user_id: user.id,
        amount: credits,
        type: "deposit",
        description: `Compra de ${credits} créditos`,
        stripe_payment_id: session.payment_intent as string,
        stripe_session_id: sessionId,
      });

    if (transactionError) {
      console.error("Error creating transaction:", transactionError);
      throw transactionError;
    }

    console.log("Payment processed successfully");

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Payment processed successfully",
      credits 
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
