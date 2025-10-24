import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Share2, Copy, Twitter, Facebook, MessageCircle, Linkedin } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState } from "react";

interface SocialSharePreviewProps {
  title: string;
  description: string;
  image: string;
  stats?: {
    volume?: string;
    percentage?: number;
    participants?: number;
  };
  url?: string;
}

const SocialSharePreview = ({ title, description, image, stats, url }: SocialSharePreviewProps) => {
  const [open, setOpen] = useState(false);
  const shareUrl = url || window.location.href;
  const shareText = `${title} - ${description}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      toast({
        title: "Link copiado!",
        description: "O link foi copiado para sua área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Não foi possível copiar o link.",
        variant: "destructive",
      });
    }
  };

  const handleShare = (platform: string) => {
    const encodedUrl = encodeURIComponent(shareUrl);
    const encodedText = encodeURIComponent(shareText);
    
    let shareLink = "";
    
    switch (platform) {
      case "twitter":
        shareLink = `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`;
        break;
      case "facebook":
        shareLink = `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;
        break;
      case "whatsapp":
        shareLink = `https://wa.me/?text=${encodedText}%20${encodedUrl}`;
        break;
      case "linkedin":
        shareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;
        break;
    }
    
    if (shareLink) {
      window.open(shareLink, "_blank", "width=600,height=400");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" className="gap-2">
          <Share2 className="h-4 w-4" />
          Compartilhar
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Compartilhar Mercado</DialogTitle>
          <DialogDescription>
            Compartilhe este mercado nas suas redes sociais
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Preview Card - Compacto */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Preview:</p>
            <Card className="overflow-hidden border">
              <div className="relative h-32 bg-muted">
                <img 
                  src={image} 
                  alt={title}
                  className="w-full h-full object-contain"
                />
              </div>
              <div className="p-3 space-y-1">
                <h4 className="font-semibold text-sm line-clamp-1">
                  {title}
                </h4>
                <p className="text-xs text-muted-foreground line-clamp-1">
                  {description}
                </p>
                {stats && (
                  <div className="flex gap-3 text-xs text-muted-foreground">
                    {stats.volume && <span>{stats.volume}</span>}
                    {stats.percentage && <span className="font-semibold text-primary">{stats.percentage}%</span>}
                  </div>
                )}
              </div>
            </Card>
          </div>

          {/* Share Buttons */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Compartilhar em:</p>
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                className="gap-2 justify-start"
                onClick={() => handleShare("twitter")}
              >
                <Twitter className="h-4 w-4" />
                Twitter
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 justify-start"
                onClick={() => handleShare("facebook")}
              >
                <Facebook className="h-4 w-4" />
                Facebook
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 justify-start"
                onClick={() => handleShare("whatsapp")}
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="gap-2 justify-start"
                onClick={() => handleShare("linkedin")}
              >
                <Linkedin className="h-4 w-4" />
                LinkedIn
              </Button>
            </div>
          </div>

          {/* Copy Link */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Ou copie o link:</p>
            <div className="flex gap-2">
              <div className="flex-1 px-2 py-1.5 rounded-md border bg-muted text-xs truncate">
                {shareUrl}
              </div>
              <Button onClick={handleCopyLink} size="sm" className="gap-2">
                <Copy className="h-4 w-4" />
                Copiar
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default SocialSharePreview;
