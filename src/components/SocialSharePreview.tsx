import { Card } from "./ui/card";
import { Button } from "./ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
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
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Compartilhar Mercado</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Preview Card */}
          <div className="space-y-2">
            <p className="text-sm font-medium text-muted-foreground">Preview nas redes sociais:</p>
            <Card className="overflow-hidden border-2">
              <div className="aspect-[1.91/1] relative overflow-hidden bg-muted">
                <img 
                  src={image} 
                  alt={title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-6 space-y-2">
                  <h3 className="font-bold text-xl line-clamp-2 text-foreground">
                    {title}
                  </h3>
                  <p className="text-sm text-muted-foreground line-clamp-2">
                    {description}
                  </p>
                  {stats && (
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      {stats.volume && <span>Volume: {stats.volume}</span>}
                      {stats.percentage && <span className="font-semibold text-primary">{stats.percentage}%</span>}
                      {stats.participants && <span>{stats.participants} participantes</span>}
                    </div>
                  )}
                </div>
              </div>
              <div className="p-4 bg-card">
                <p className="text-xs text-muted-foreground truncate">
                  politmarket.com.br
                </p>
              </div>
            </Card>
          </div>

          {/* Share Buttons */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-muted-foreground">Compartilhar em:</p>
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="outline"
                className="gap-2 justify-start"
                onClick={() => handleShare("twitter")}
              >
                <Twitter className="h-4 w-4" />
                Twitter / X
              </Button>
              <Button
                variant="outline"
                className="gap-2 justify-start"
                onClick={() => handleShare("facebook")}
              >
                <Facebook className="h-4 w-4" />
                Facebook
              </Button>
              <Button
                variant="outline"
                className="gap-2 justify-start"
                onClick={() => handleShare("whatsapp")}
              >
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </Button>
              <Button
                variant="outline"
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
              <div className="flex-1 px-3 py-2 rounded-lg border bg-muted text-sm truncate">
                {shareUrl}
              </div>
              <Button onClick={handleCopyLink} className="gap-2">
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
