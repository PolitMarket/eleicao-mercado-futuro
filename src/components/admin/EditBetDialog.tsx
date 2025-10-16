import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Bet {
  id: string;
  user_id: string;
  market_id: string;
  amount: number;
  prediction: boolean;
  created_at: string;
}

interface Market {
  id: string;
  title: string;
}

interface EditBetDialogProps {
  bet: Bet | null;
  markets: Market[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const EditBetDialog = ({ bet, markets, open, onOpenChange, onSuccess }: EditBetDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    amount: bet?.amount.toString() || "",
    prediction: bet?.prediction.toString() || "true",
    market_id: bet?.market_id || "",
  });

  useEffect(() => {
    if (bet) {
      setFormData({
        amount: bet.amount.toString(),
        prediction: bet.prediction.toString(),
        market_id: bet.market_id,
      });
    }
  }, [bet]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bet) return;
    
    setLoading(true);

    try {
      const { error } = await supabase
        .from("bets")
        .update({
          amount: parseFloat(formData.amount),
          prediction: formData.prediction === "true",
          market_id: formData.market_id,
        })
        .eq("id", bet.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Aposta atualizada com sucesso.",
      });

      onSuccess();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!bet) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Aposta</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-market">Mercado</Label>
            <Select
              value={formData.market_id}
              onValueChange={(value) => setFormData({ ...formData, market_id: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {markets.map((market) => (
                  <SelectItem key={market.id} value={market.id}>
                    {market.title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-amount">Valor (R$)</Label>
            <Input
              id="edit-amount"
              type="number"
              step="0.01"
              min="0"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-prediction">Previsão</Label>
            <Select
              value={formData.prediction}
              onValueChange={(value) => setFormData({ ...formData, prediction: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="true">Sim</SelectItem>
                <SelectItem value="false">Não</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
