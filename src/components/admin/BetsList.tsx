import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2 } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { EditBetDialog } from "./EditBetDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

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

export const BetsList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingBet, setEditingBet] = useState<Bet | null>(null);
  const [deletingBetId, setDeletingBetId] = useState<string | null>(null);

  const { data: bets, isLoading } = useQuery({
    queryKey: ["admin-bets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("bets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Bet[];
    },
  });

  const { data: markets } = useQuery({
    queryKey: ["markets-for-bets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("markets")
        .select("id, title");

      if (error) throw error;
      return data as Market[];
    },
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("bets").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Aposta excluída com sucesso.",
      });

      queryClient.invalidateQueries({ queryKey: ["admin-bets"] });
      setDeletingBetId(null);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-bets"] });
  };

  const getMarketTitle = (marketId: string) => {
    return markets?.find(m => m.id === marketId)?.title || "Mercado não encontrado";
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  if (!bets || bets.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">Nenhuma aposta criada ainda.</div>;
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Mercado</TableHead>
              <TableHead>Valor</TableHead>
              <TableHead>Previsão</TableHead>
              <TableHead>Data</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bets.map((bet) => (
              <TableRow key={bet.id}>
                <TableCell className="font-medium">{getMarketTitle(bet.market_id)}</TableCell>
                <TableCell>R$ {Number(bet.amount).toFixed(2)}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${bet.prediction ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                    {bet.prediction ? 'Sim' : 'Não'}
                  </span>
                </TableCell>
                <TableCell>{new Date(bet.created_at).toLocaleString('pt-BR')}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingBet(bet)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingBetId(bet.id)}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <EditBetDialog
        bet={editingBet}
        markets={markets || []}
        open={!!editingBet}
        onOpenChange={(open) => !open && setEditingBet(null)}
        onSuccess={handleEditSuccess}
      />

      <AlertDialog open={!!deletingBetId} onOpenChange={(open) => !open && setDeletingBetId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá excluir permanentemente esta aposta.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingBetId && handleDelete(deletingBetId)}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
