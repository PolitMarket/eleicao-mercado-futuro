import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const MIN_WITHDRAW_CREDITS = 100; // Mínimo de 100 créditos
const CREDIT_TO_BRL = 0.10; // 1 crédito = R$ 0,10 (10 centavos)

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
    const { credits, pixKey } = await req.json();

    console.log(`Processing withdrawal request: ${credits} credits to PIX: ${pixKey}`);

    if (!credits || credits < MIN_WITHDRAW_CREDITS) {
      throw new Error(`Minimum withdrawal is ${MIN_WITHDRAW_CREDITS} credits`);
    }

    if (!pixKey || pixKey.trim() === "") {
      throw new Error("PIX key is required");
    }

    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data: { user } } = await supabaseClient.auth.getUser(token);
    
    if (!user) {
      throw new Error("User not authenticated");
    }

    console.log(`User ${user.id} requesting withdrawal`);

    // Verificar saldo do usuário
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("balance, email")
      .eq("id", user.id)
      .single();

    if (profileError) throw profileError;

    if (!profile || profile.balance < credits) {
      throw new Error("Insufficient balance");
    }

    // Calcular valor em BRL (centavos para Stripe)
    const brlAmountCents = Math.floor(credits * CREDIT_TO_BRL * 100);
    const brlAmount = (brlAmountCents / 100).toFixed(2);

    console.log(`Converting ${credits} credits to R$ ${brlAmount} (${brlAmountCents} centavos)`);

    // Deduzir créditos do usuário
    const newBalance = profile.balance - credits;
    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({ balance: newBalance })
      .eq("id", user.id);

    if (updateError) throw updateError;

    // Registrar transação de saque
    const { error: transactionError } = await supabaseClient
      .from("transactions")
      .insert({
        user_id: user.id,
        amount: -credits,
        type: "withdraw",
        description: `Saque de ${credits} créditos (R$ ${brlAmount}) para PIX: ${pixKey}`,
      });

    if (transactionError) {
      console.error("Error creating transaction:", transactionError);
      // Reverter dedução do saldo
      await supabaseClient
        .from("profiles")
        .update({ balance: profile.balance })
        .eq("id", user.id);
      throw transactionError;
    }

    // Nota: Em produção, você implementaria aqui a integração com Stripe Payouts
    // ou outro serviço de pagamento para enviar o dinheiro para o PIX do usuário
    // Por enquanto, apenas registramos a solicitação
    console.log(`Withdrawal request registered successfully for user ${user.id}`);
    console.log(`Amount: R$ ${brlAmount} to PIX: ${pixKey}`);

    // TODO: Implementar integração com sistema de pagamentos PIX
    // Opções:
    // 1. Stripe Payouts (se disponível no Brasil)
    // 2. Mercado Pago API
    // 3. Pagarme API
    // 4. Outro provedor de pagamentos com suporte a PIX

    return new Response(JSON.stringify({ 
      success: true, 
      message: "Withdrawal request processed successfully",
      amount: brlAmount,
      credits: credits,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error processing withdrawal:", error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error instanceof Error ? error.message : "Unknown error"
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
