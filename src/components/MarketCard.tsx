import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { TrendingUp, Bookmark, Coins } from "lucide-react";
import { Button } from "./ui/button";
import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "./ui/dialog";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import { useNavigate } from "react-router-dom";
import SocialSharePreview from "./SocialSharePreview";

interface Option {
  name: string;
  percentage: number;
  trend?: "up" | "down";
}

interface MarketCardProps {
  title: string;
  category: string;
  image: string;
  options: Option[];
  volume: string;
  isLive?: boolean;
  marketId?: string;
}

const MarketCard = ({ title, category, image, options, volume, isLive, marketId }: MarketCardProps) => {
  const navigate = useNavigate();
  const maxPercentage = Math.max(...options.map(o => o.percentage));
  const [betDialogOpen, setBetDialogOpen] = useState(false);
  const [betAmount, setBetAmount] = useState("");
  const [betType, setBetType] = useState<"sim" | "nao">("sim");
  const [selectedOption, setSelectedOption] = useState<Option | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const fetchBalance = async () => {
      if (!session?.user) {
        setBalance(0);
        return;
      }

      const { data } = await supabase
        .from("profiles")
        .select("balance")
        .eq("id", session.user.id)
        .single();

      setBalance(data?.balance || 0);
    };

    fetchBalance();
  }, [session]);

  const handleBetClick = (option: Option, type: "sim" | "nao") => {
    if (!session) {
      toast({
        title: "Login necessário",
        description: "Você precisa estar logado para fazer apostas.",
        variant: "destructive",
      });
      navigate("/auth");
      return;
    }

    setSelectedOption(option);
    setBetType(type);
    setBetDialogOpen(true);
  };

  const handleConfirmBet = async () => {
    if (!session?.user || !marketId) return;

    const amount = parseFloat(betAmount);
    
    if (!amount || amount <= 0) {
      toast({
        title: "Erro",
        description: "Por favor, insira um valor válido.",
        variant: "destructive",
      });
      return;
    }

    if (amount > balance) {
      toast({
        title: "Saldo insuficiente",
        description: "Você não tem créditos suficientes para esta aposta.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      // Buscar o mercado atual
      const { data: market, error: marketFetchError } = await supabase
        .from("markets")
        .select("*")
        .eq("id", marketId)
        .single();

      if (marketFetchError) throw marketFetchError;

      // Atualizar saldo
      const newBalance = balance - amount;
      const { error: balanceError } = await supabase
        .from("profiles")
        .update({ balance: newBalance })
        .eq("id", session.user.id);

      if (balanceError) throw balanceError;

      // Registrar aposta
      // Para mercados de candidatos, determinar prediction baseado no nome do candidato
      let predictionValue = betType === "sim";
      
      if (market.market_type === "candidates" && selectedOption) {
        // true = candidato 1, false = candidato 2
        predictionValue = selectedOption.name === market.candidate_1_name;
      }
      
      const { error: betError } = await supabase
        .from("bets")
        .insert({
          user_id: session.user.id,
          market_id: marketId,
          amount: amount,
          prediction: predictionValue,
        });

      if (betError) throw betError;

      // Atualizar volumes do mercado
      let updatedMarket: any = {
        total_volume: (market.total_volume || 0) + amount,
      };

      if (market.market_type === "candidates") {
        // Para mercados de candidatos, atualizar baseado no nome da opção selecionada
        console.log('Debug - Market type: candidates');
        console.log('Debug - Selected option name:', selectedOption?.name);
        console.log('Debug - Candidate 1 name:', market.candidate_1_name);
        console.log('Debug - Candidate 2 name:', market.candidate_2_name);
        console.log('Debug - Current volumes:', {
          candidate_1_volume: market.candidate_1_volume,
          candidate_2_volume: market.candidate_2_volume
        });
        
        if (selectedOption?.name === market.candidate_1_name) {
          updatedMarket.candidate_1_volume = (market.candidate_1_volume || 0) + amount;
        } else if (selectedOption?.name === market.candidate_2_name) {
          updatedMarket.candidate_2_volume = (market.candidate_2_volume || 0) + amount;
        }
        
        console.log('Debug - Updated volumes:', updatedMarket);
        
        // Calcular nova porcentagem
        const total = (updatedMarket.candidate_1_volume || market.candidate_1_volume || 0) + 
                      (updatedMarket.candidate_2_volume || market.candidate_2_volume || 0);
        if (total > 0) {
          updatedMarket.yes_percentage = Math.round(
            ((updatedMarket.candidate_1_volume || market.candidate_1_volume || 0) / total) * 100
          );
        }
        
        console.log('Debug - New percentage:', updatedMarket.yes_percentage);
      } else {
        // Para mercados sim/não
        if (betType === "sim") {
          updatedMarket.yes_volume = (market.yes_volume || 0) + amount;
        } else {
          updatedMarket.no_volume = (market.no_volume || 0) + amount;
        }
        
        // Calcular nova porcentagem
        const total = (updatedMarket.yes_volume || market.yes_volume || 0) + 
                      (updatedMarket.no_volume || market.no_volume || 0);
        if (total > 0) {
          updatedMarket.yes_percentage = Math.round(
            ((updatedMarket.yes_volume || market.yes_volume || 0) / total) * 100
          );
        }
      }

      const { error: marketUpdateError } = await supabase
        .from("markets")
        .update(updatedMarket)
        .eq("id", marketId);

      if (marketUpdateError) throw marketUpdateError;

      setBalance(newBalance);
      
      toast({
        title: "Aposta confirmada!",
        description: `Você apostou ${amount} créditos em "${selectedOption?.name}" no mercado: ${title}`,
      });

      setBetDialogOpen(false);
      setBetAmount("");
    } catch (error) {
      console.error("Error placing bet:", error);
      toast({
        title: "Erro",
        description: "Erro ao realizar aposta. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <img 
            src={image} 
            alt={title}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-xs">
                {category}
              </Badge>
              {isLive && (
                <Badge className="bg-danger text-danger-foreground text-xs">
                  • AO VIVO
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
              {title}
            </h3>
          </div>
          <button className="text-muted-foreground hover:text-primary transition-colors">
            <Bookmark className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          {/* Aposta simples Sim/Não - mostra apenas 2 botões */}
          {options.length === 2 && options[0].name === "Sim" && options[1].name === "Não" ? (
            <div className="space-y-3">
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="absolute h-full rounded-full transition-all duration-500 bg-success"
                  style={{ width: `${options[0].percentage}%` }}
                />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button 
                  size="sm"
                  variant="outline"
                  className="bg-success/10 border-success/30 hover:bg-success/20"
                  onClick={() => handleBetClick(options[0], "sim")}
                >
                  <span className="font-semibold">Sim {options[0].percentage}%</span>
                </Button>
                <Button 
                  size="sm"
                  variant="outline"
                  className="bg-danger/10 border-danger/30 hover:bg-danger/20"
                  onClick={() => handleBetClick(options[1], "nao")}
                >
                  <span className="font-semibold">Não {options[1].percentage}%</span>
                </Button>
              </div>
            </div>
          ) : (
            /* Aposta entre candidatos - mostra 1 botão por candidato */
            <div className="space-y-3">
              {options.map((option, idx) => (
                <div key={idx} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{option.name}</span>
                    <span className="font-bold">{option.percentage}%</span>
                  </div>
                  <div className="relative h-1.5 bg-muted rounded-full overflow-hidden">
                    <div 
                      className={`absolute h-full rounded-full transition-all duration-500 ${
                        option.percentage === maxPercentage ? 'bg-success' : 'bg-primary'
                      }`}
                      style={{ width: `${option.percentage}%` }}
                    />
                  </div>
                  <Button 
                    size="sm"
                    variant="outline"
                    className="w-full"
                    onClick={() => handleBetClick(option, "sim")}
                  >
                    Apostar
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
          <span>Volume: {volume}</span>
          <div className="flex items-center gap-2">
            <SocialSharePreview
              title={title}
              description={`${category} - Mercado de previsões eleitorais`}
              image={image}
              stats={{
                volume,
                percentage: options[0]?.percentage,
              }}
            />
            <span className="text-primary cursor-pointer hover:underline">
              Ver detalhes →
            </span>
          </div>
        </div>
      </div>

      <Dialog open={betDialogOpen} onOpenChange={setBetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirmar Aposta</DialogTitle>
            <DialogDescription>
              {selectedOption?.name} - {betType === "sim" ? "Sim" : "Não"}
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center justify-between p-3 rounded-lg bg-primary/10">
              <span className="text-sm font-medium">Seu saldo:</span>
              <div className="flex items-center gap-2">
                <Coins className="h-4 w-4 text-primary" />
                <span className="text-lg font-bold">{balance.toFixed(0)} créditos</span>
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="amount">Valor da aposta (créditos)</Label>
              <Input
                id="amount"
                type="number"
                placeholder="100"
                value={betAmount}
                onChange={(e) => setBetAmount(e.target.value)}
                min="1"
                max={balance}
                step="1"
              />
            </div>
            {betAmount && selectedOption && (
              <div className="space-y-2 p-3 rounded-lg bg-muted/50">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Odd:</span>
                  <span className="font-bold text-primary">
                    {(() => {
                      const probability = selectedOption.percentage / 100;
                      return (1 / probability).toFixed(2);
                    })()}x
                  </span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Retorno potencial:</span>
                  <span className="font-bold text-success">
                    {(() => {
                      const amount = parseFloat(betAmount);
                      const probability = selectedOption.percentage / 100;
                      const odd = 1 / probability;
                      return (amount * odd).toFixed(2);
                    })()} créditos
                  </span>
                </div>
                <div className="flex justify-between text-xs text-muted-foreground pt-2 border-t">
                  <span>Lucro potencial:</span>
                  <span className="font-semibold">
                    {(() => {
                      const amount = parseFloat(betAmount);
                      const probability = selectedOption.percentage / 100;
                      const odd = 1 / probability;
                      return ((amount * odd) - amount).toFixed(2);
                    })()} créditos
                  </span>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBetDialogOpen(false)} disabled={loading}>
              Cancelar
            </Button>
            <Button onClick={handleConfirmBet} disabled={loading}>
              {loading ? "Processando..." : "Confirmar Aposta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Card>
  );
};

export default MarketCard;
