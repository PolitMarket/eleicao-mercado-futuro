import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { ImageIcon } from "lucide-react";

export const CreateMarketForm = () => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    imageUrl: "",
    endDate: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.from("markets").insert({
        title: formData.title,
        description: formData.description,
        category: formData.category,
        image_url: formData.imageUrl,
        end_date: new Date(formData.endDate).toISOString(),
        status: "active",
      });

      if (error) throw error;

      toast({
        title: "Sucesso!",
        description: "Mercado criado com sucesso.",
      });

      setFormData({
        title: "",
        description: "",
        category: "",
        imageUrl: "",
        endDate: "",
      });
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

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) =>
            setFormData({ ...formData, title: e.target.value })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) =>
            setFormData({ ...formData, description: e.target.value })
          }
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="category">Categoria</Label>
        <Select
          value={formData.category}
          onValueChange={(value) =>
            setFormData({ ...formData, category: value })
          }
        >
          <SelectTrigger>
            <SelectValue placeholder="Selecione uma categoria" />
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
        <Label htmlFor="imageUrl">URL da Imagem</Label>
        <Input
          id="imageUrl"
          type="url"
          value={formData.imageUrl}
          onChange={(e) =>
            setFormData({ ...formData, imageUrl: e.target.value })
          }
          placeholder="https://exemplo.com/imagem.jpg"
        />
        <p className="text-xs text-muted-foreground">
          Use URLs diretas de imagens (terminam em .jpg, .png, .webp). Links do Google Images não funcionam - clique com botão direito na imagem e selecione "Copiar endereço da imagem".
        </p>
        {formData.imageUrl && (
          <div className="mt-2 border rounded-lg p-4 bg-muted/50">
            <p className="text-xs font-medium mb-2">Preview:</p>
            <div className="relative w-full h-40 bg-background rounded-md overflow-hidden flex items-center justify-center">
              <img
                src={formData.imageUrl}
                alt="Preview"
                className="max-w-full max-h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent) {
                    const errorDiv = document.createElement('div');
                    errorDiv.className = 'text-destructive text-sm flex flex-col items-center gap-2';
                    errorDiv.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg><span>URL inválida ou imagem inacessível</span>';
                    parent.appendChild(errorDiv);
                  }
                }}
              />
            </div>
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="endDate">Data de Encerramento</Label>
        <Input
          id="endDate"
          type="datetime-local"
          value={formData.endDate}
          onChange={(e) =>
            setFormData({ ...formData, endDate: e.target.value })
          }
          required
        />
      </div>

      <Button type="submit" disabled={loading} className="w-full">
        {loading ? "Criando..." : "Criar Mercado"}
      </Button>
    </form>
  );
};
