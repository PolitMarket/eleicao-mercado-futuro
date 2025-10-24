import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { CheckCircle2, XCircle } from "lucide-react";

interface ResolveMarketDialogProps {
  market: {
    id: string;
    title: string;
    market_type: string;
    candidate_1_name?: string;
    candidate_2_name?: string;
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onResolved: () => void;
}

export function ResolveMarketDialog({
  market,
  open,
  onOpenChange,
  onResolved,
}: ResolveMarketDialogProps) {
  const [resolving, setResolving] = useState(false);

  const handleResolve = async (result: boolean) => {
    setResolving(true);
    try {
      const { error } = await supabase.rpc("resolve_market", {
        _market_id: market.id,
        _result: result,
      });

      if (error) throw error;

      toast.success("Mercado resolvido com sucesso!");
      onOpenChange(false);
      onResolved();
    } catch (error) {
      console.error("Error resolving market:", error);
      toast.error("Erro ao resolver mercado");
    } finally {
      setResolving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resolver Mercado</DialogTitle>
          <DialogDescription>
            Selecione o resultado para o mercado: <strong>{market.title}</strong>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {market.market_type === "yes_no" ? (
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => handleResolve(true)}
                disabled={resolving}
                className="h-24 flex flex-col items-center justify-center gap-2"
                variant="outline"
              >
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <span className="text-lg font-semibold">SIM</span>
              </Button>
              <Button
                onClick={() => handleResolve(false)}
                disabled={resolving}
                className="h-24 flex flex-col items-center justify-center gap-2"
                variant="outline"
              >
                <XCircle className="h-8 w-8 text-red-600" />
                <span className="text-lg font-semibold">NÃO</span>
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <Button
                onClick={() => handleResolve(true)}
                disabled={resolving}
                className="h-24 flex flex-col items-center justify-center gap-2"
                variant="outline"
              >
                <CheckCircle2 className="h-8 w-8 text-green-600" />
                <span className="text-lg font-semibold text-center">
                  {market.candidate_1_name || "Candidato 1"}
                </span>
              </Button>
              <Button
                onClick={() => handleResolve(false)}
                disabled={resolving}
                className="h-24 flex flex-col items-center justify-center gap-2"
                variant="outline"
              >
                <CheckCircle2 className="h-8 w-8 text-blue-600" />
                <span className="text-lg font-semibold text-center">
                  {market.candidate_2_name || "Candidato 2"}
                </span>
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={resolving}
          >
            Cancelar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
