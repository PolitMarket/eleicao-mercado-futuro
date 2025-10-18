import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Coins, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

interface CreditPackage {
  id: string;
  priceId: string;
  credits: number;
  price: number;
  popular?: boolean;
}

const PACKAGES: CreditPackage[] = [
  {
    id: "small",
    priceId: "price_1SJeZnPMwKgpsB6l1xl5B7jW",
    credits: 100,
    price: 10,
  },
  {
    id: "medium",
    priceId: "price_1SJeahPMwKgpsB6laXXyJTic",
    credits: 500,
    price: 45,
    popular: true,
  },
  {
    id: "large",
    priceId: "price_1SJebLPMwKgpsB6lLTpy7MLN",
    credits: 1000,
    price: 80,
  },
];

export const BuyCreditsDialog = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState<string | null>(null);

  const handlePurchase = async (pkg: CreditPackage) => {
    try {
      setLoading(pkg.id);

      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast({
          title: "Erro",
          description: "Você precisa estar logado para comprar créditos",
          variant: "destructive",
        });
        return;
      }

      const { data, error } = await supabase.functions.invoke("create-payment", {
        body: { priceId: pkg.priceId },
      });

      if (error) throw error;

      if (data?.url) {
        window.open(data.url, "_blank");
        setIsOpen(false);
      }
    } catch (error) {
      console.error("Error creating payment:", error);
      toast({
        title: "Erro",
        description: "Erro ao criar pagamento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(null);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-2">
          <Coins className="h-4 w-4" />
          Comprar Créditos
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Comprar Créditos</DialogTitle>
          <DialogDescription>
            Escolha um pacote de créditos para começar a apostar
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {PACKAGES.map((pkg) => (
            <Card
              key={pkg.id}
              className={`p-6 relative ${
                pkg.popular ? "border-primary shadow-lg" : ""
              }`}
            >
              {pkg.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full">
                    POPULAR
                  </span>
                </div>
              )}
              <div className="text-center space-y-4">
                <div className="flex justify-center">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                    <Coins className="h-6 w-6 text-primary" />
                  </div>
                </div>
                <div>
                  <h3 className="text-2xl font-bold">{pkg.credits}</h3>
                  <p className="text-sm text-muted-foreground">créditos</p>
                </div>
                <div className="text-3xl font-bold">
                  R$ {pkg.price}
                </div>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    R$ {(pkg.price / pkg.credits).toFixed(2)} por crédito
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-primary" />
                    Pagamento seguro via Stripe
                  </li>
                </ul>
                <Button
                  className="w-full"
                  onClick={() => handlePurchase(pkg)}
                  disabled={loading !== null}
                  variant={pkg.popular ? "default" : "outline"}
                >
                  {loading === pkg.id ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Processando...
                    </>
                  ) : (
                    "Comprar"
                  )}
                </Button>
              </div>
            </Card>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  );
};
