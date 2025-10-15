import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Market {
  id: string;
  title: string;
  description: string;
  category: string;
  image_url: string | null;
  end_date: string;
  status: string;
}

interface EditMarketDialogProps {
  market: Market | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const EditMarketDialog = ({ market, open, onOpenChange, onSuccess }: EditMarketDialogProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: market?.title || "",
    description: market?.description || "",
    category: market?.category || "",
    imageUrl: market?.image_url || "",
    endDate: market?.end_date ? new Date(market.end_date).toISOString().slice(0, 16) : "",
    status: market?.status || "active",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!market) return;
    
    setLoading(true);

    try {
      const { error } = await supabase
        .from("markets")
        .update({
          title: formData.title,
          description: formData.description,
          category: formData.category,
          image_url: formData.imageUrl,
          end_date: new Date(formData.endDate).toISOString(),
          status: formData.status,
        })
        .eq("id", market.id);

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Mercado atualizado com sucesso.",
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

  if (!market) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Mercado</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-title">Título</Label>
            <Input
              id="edit-title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-description">Descrição</Label>
            <Textarea
              id="edit-description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-category">Categoria</Label>
            <Select
              value={formData.category}
              onValueChange={(value) => setFormData({ ...formData, category: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Esportes">Esportes</SelectItem>
                <SelectItem value="Política">Política</SelectItem>
                <SelectItem value="Criptomoedas">Criptomoedas</SelectItem>
                <SelectItem value="Entretenimento">Entretenimento</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-imageUrl">URL da Imagem</Label>
            <Input
              id="edit-imageUrl"
              type="url"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-endDate">Data de Encerramento</Label>
            <Input
              id="edit-endDate"
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="edit-status">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value) => setFormData({ ...formData, status: value })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="closed">Fechado</SelectItem>
                <SelectItem value="resolved">Resolvido</SelectItem>
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
