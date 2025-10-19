import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Loader2, DollarSign, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface WithdrawDialogProps {
  balance: number;
  onSuccess?: () => void;
}

const MIN_WITHDRAW = 100; // Mínimo de 100 créditos (R$ 10)
const CREDIT_TO_BRL = 0.10; // 1 crédito = R$ 0,10

export const WithdrawDialog = ({ balance, onSuccess }: WithdrawDialogProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [amount, setAmount] = useState("");
  const [pixKey, setPixKey] = useState("");

  const credits = parseFloat(amount) || 0;
  const brlAmount = (credits * CREDIT_TO_BRL).toFixed(2);

  const handleWithdraw = async () => {
    if (!amount || credits < MIN_WITHDRAW) {
      toast({
        title: "Valor inválido",
        description: `O valor mínimo de saque é ${MIN_WITHDRAW} créditos (R$ ${(MIN_WITHDRAW * CREDIT_TO_BRL).toFixed(2)})`,
        variant: "destructive",
      });
      return;
    }

    if (credits > balance) {
      toast({
        title: "Saldo insuficiente",
        description: "Você não tem créditos suficientes para este saque.",
        variant: "destructive",
      });
      return;
    }

    if (!pixKey || pixKey.trim() === "") {
      toast({
        title: "Chave PIX obrigatória",
        description: "Por favor, informe sua chave PIX para receber o pagamento.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("process-withdrawal", {
        body: { 
          credits,
          pixKey: pixKey.trim(),
        },
      });

      if (error) throw error;

      if (data?.success) {
        toast({
          title: "Saque solicitado!",
          description: `Seu saque de R$ ${brlAmount} foi solicitado e será processado em até 2 dias úteis.`,
        });
        
        setIsOpen(false);
        setAmount("");
        setPixKey("");
        onSuccess?.();
      } else {
        throw new Error(data?.message || "Erro ao processar saque");
      }
    } catch (error: any) {
      console.error("Error processing withdrawal:", error);
      toast({
        title: "Erro ao processar saque",
        description: error.message || "Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <DollarSign className="h-4 w-4" />
          Sacar
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[450px]">
        <DialogHeader>
          <DialogTitle>Solicitar Saque</DialogTitle>
          <DialogDescription>
            Converta seus créditos em dinheiro real via PIX
          </DialogDescription>
        </DialogHeader>

        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Taxa de conversão:</strong> 1 crédito = R$ {CREDIT_TO_BRL.toFixed(2)}
            <br />
            <strong>Saque mínimo:</strong> {MIN_WITHDRAW} créditos (R$ {(MIN_WITHDRAW * CREDIT_TO_BRL).toFixed(2)})
            <br />
            <strong>Prazo:</strong> Até 2 dias úteis
          </AlertDescription>
        </Alert>

        <div className="grid gap-4 py-4">
          <div className="flex items-center justify-between p-3 rounded-lg bg-muted">
            <span className="text-sm font-medium">Saldo disponível:</span>
            <span className="text-lg font-bold">{balance.toFixed(0)} créditos</span>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="amount">Quantidade de créditos</Label>
            <Input
              id="amount"
              type="number"
              placeholder={`Mínimo ${MIN_WITHDRAW}`}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              min={MIN_WITHDRAW}
              max={balance}
              step="1"
            />
            {credits > 0 && (
              <p className="text-sm text-muted-foreground">
                Você receberá: <strong className="text-primary">R$ {brlAmount}</strong>
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="pix">Chave PIX</Label>
            <Input
              id="pix"
              type="text"
              placeholder="CPF, e-mail, telefone ou chave aleatória"
              value={pixKey}
              onChange={(e) => setPixKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              O pagamento será enviado para esta chave PIX
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => setIsOpen(false)} 
            disabled={loading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleWithdraw} 
            disabled={loading || credits < MIN_WITHDRAW || credits > balance}
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Processando...
              </>
            ) : (
              "Confirmar Saque"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
