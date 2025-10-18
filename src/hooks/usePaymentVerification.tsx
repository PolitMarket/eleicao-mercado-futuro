import { useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { useNavigate, useSearchParams } from "react-router-dom";

export const usePaymentVerification = (onSuccess?: () => void) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  useEffect(() => {
    const verifyPayment = async () => {
      const payment = searchParams.get("payment");
      const sessionId = searchParams.get("session_id");

      if (payment === "success" && sessionId) {
        try {
          const { data, error } = await supabase.functions.invoke("verify-payment", {
            body: { sessionId },
          });

          if (error) throw error;

          if (data?.success) {
            toast({
              title: "Pagamento confirmado!",
              description: `${data.credits} créditos foram adicionados à sua conta.`,
            });
            onSuccess?.();
          }
        } catch (error) {
          console.error("Error verifying payment:", error);
          toast({
            title: "Erro ao verificar pagamento",
            description: "Entre em contato com o suporte.",
            variant: "destructive",
          });
        } finally {
          // Limpar URL
          navigate("/", { replace: true });
        }
      } else if (payment === "canceled") {
        toast({
          title: "Pagamento cancelado",
          description: "Você pode tentar novamente quando quiser.",
        });
        navigate("/", { replace: true });
      }
    };

    verifyPayment();
  }, [searchParams, navigate, onSuccess]);
};
