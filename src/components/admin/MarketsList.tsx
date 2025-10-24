import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { Pencil, Trash2, CheckCircle } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { EditMarketDialog } from "./EditMarketDialog";
import { ResolveMarketDialog } from "./ResolveMarketDialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";

interface Market {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string | null;
  end_date: string;
  status: string;
  total_volume: number;
  market_type: string;
  candidate_1_name?: string;
  candidate_2_name?: string;
}

export const MarketsList = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editingMarket, setEditingMarket] = useState<Market | null>(null);
  const [resolvingMarket, setResolvingMarket] = useState<Market | null>(null);
  const [deletingMarketId, setDeletingMarketId] = useState<string | null>(null);

  const { data: markets, isLoading } = useQuery({
    queryKey: ["admin-markets"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("markets")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Market[];
    },
  });

  const handleDelete = async (id: string) => {
    try {
      const { error } = await supabase.from("markets").delete().eq("id", id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Mercado excluído com sucesso.",
      });

      queryClient.invalidateQueries({ queryKey: ["admin-markets"] });
      queryClient.invalidateQueries({ queryKey: ["markets"] });
      setDeletingMarketId(null);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleEditSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-markets"] });
    queryClient.invalidateQueries({ queryKey: ["markets"] });
  };

  const handleResolveSuccess = () => {
    queryClient.invalidateQueries({ queryKey: ["admin-markets"] });
    queryClient.invalidateQueries({ queryKey: ["markets"] });
  };

  if (isLoading) {
    return <div className="text-center py-8">Carregando...</div>;
  }

  if (!markets || markets.length === 0) {
    return <div className="text-center py-8 text-muted-foreground">Nenhum mercado criado ainda.</div>;
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Volume</TableHead>
              <TableHead>Data Fim</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {markets.map((market) => (
              <TableRow key={market.id}>
                <TableCell className="font-medium">{market.title}</TableCell>
                <TableCell>{market.category}</TableCell>
                <TableCell>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium
                    ${market.status === 'active' ? 'bg-green-100 text-green-800' : 
                      market.status === 'closed' ? 'bg-yellow-100 text-yellow-800' : 
                      'bg-gray-100 text-gray-800'}`}>
                    {market.status === 'active' ? 'Ativo' : 
                     market.status === 'closed' ? 'Fechado' : 'Resolvido'}
                  </span>
                </TableCell>
                <TableCell>R$ {market.total_volume || 0}</TableCell>
                <TableCell>{new Date(market.end_date).toLocaleString('pt-BR')}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    {market.status === 'active' && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => setResolvingMarket(market)}
                        title="Resolver mercado"
                      >
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingMarket(market)}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setDeletingMarketId(market.id)}
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

      <EditMarketDialog
        market={editingMarket}
        open={!!editingMarket}
        onOpenChange={(open) => !open && setEditingMarket(null)}
        onSuccess={handleEditSuccess}
      />

      {resolvingMarket && (
        <ResolveMarketDialog
          market={resolvingMarket}
          open={!!resolvingMarket}
          onOpenChange={(open) => !open && setResolvingMarket(null)}
          onResolved={handleResolveSuccess}
        />
      )}

      <AlertDialog open={!!deletingMarketId} onOpenChange={(open) => !open && setDeletingMarketId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Tem certeza?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Isso irá excluir permanentemente este mercado e todas as apostas relacionadas.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => deletingMarketId && handleDelete(deletingMarketId)}>
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
