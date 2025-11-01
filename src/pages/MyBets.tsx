import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, TrendingUp, TrendingDown } from "lucide-react";

interface Bet {
  id: string;
  amount: number;
  prediction: boolean;
  created_at: string;
  market: {
    title: string;
    category: string;
    status: string;
    yes_percentage: number;
    market_type: string;
    candidate_1_name: string | null;
    candidate_2_name: string | null;
  };
}

const MyBets = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [bets, setBets] = useState<Bet[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setSession(session);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setSession(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchBets = async () => {
      if (!session?.user) return;

      try {
        const { data, error } = await supabase
          .from("bets")
          .select(`
            id,
            amount,
            prediction,
            created_at,
            market:markets (
              title,
              category,
              status,
              yes_percentage,
              market_type,
              candidate_1_name,
              candidate_2_name
            )
          `)
          .eq("user_id", session.user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setBets(data as Bet[]);
      } catch (error) {
        console.error("Error fetching bets:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBets();
  }, [session]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const calculatePotentialReturn = (amount: number, prediction: boolean, yesPercentage: number) => {
    // Odds = 1 / Probabilidade
    // Retorno = Aposta * Odd
    const probability = prediction ? yesPercentage / 100 : (100 - yesPercentage) / 100;
    const odd = 1 / probability;
    return amount * odd;
  };

  const calculateOdd = (prediction: boolean, yesPercentage: number) => {
    const probability = prediction ? yesPercentage / 100 : (100 - yesPercentage) / 100;
    return (1 / probability).toFixed(2);
  };

  const getBetOptionLabel = (bet: Bet) => {
    console.log('=== EXIBINDO APOSTA ===');
    console.log('Market type:', bet.market.market_type);
    console.log('Prediction:', bet.prediction);
    console.log('Candidato 1:', bet.market.candidate_1_name);
    console.log('Candidato 2:', bet.market.candidate_2_name);
    
    if (bet.market.market_type === "candidates") {
      // Para mercados de candidatos
      const result = bet.prediction 
        ? bet.market.candidate_1_name || "Candidato 1"
        : bet.market.candidate_2_name || "Candidato 2";
      console.log('Resultado exibido:', result);
      console.log('=======================');
      return result;
    } else {
      // Para mercados sim/não
      return bet.prediction ? "SIM" : "NÃO";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold mb-2">Minhas Apostas</h1>
            <p className="text-muted-foreground">
              Acompanhe todas as suas apostas e resultados
            </p>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : bets.length === 0 ? (
            <Card>
              <CardContent className="py-12 text-center">
                <p className="text-muted-foreground">
                  Você ainda não fez nenhuma aposta.
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {bets.map((bet) => (
                <Card key={bet.id} className="overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-lg mb-2">
                          {bet.market.title}
                        </CardTitle>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="text-xs">
                            {bet.market.category}
                          </Badge>
                          <Badge
                            variant={bet.market.status === "active" ? "default" : "outline"}
                            className="text-xs"
                          >
                            {bet.market.status === "active" ? "Ativo" : "Encerrado"}
                          </Badge>
                        </div>
                      </div>
                      <Badge
                        variant={bet.prediction ? "default" : "destructive"}
                        className="ml-2 max-w-[150px] truncate"
                        title={getBetOptionLabel(bet)}
                      >
                        {getBetOptionLabel(bet)}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Valor Apostado</p>
                        <p className="text-lg font-bold">{bet.amount} créditos</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Odd</p>
                        <p className="text-lg font-bold text-primary">
                          {calculateOdd(bet.prediction, bet.market.yes_percentage)}x
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Retorno Potencial</p>
                        <p className="text-lg font-bold text-success">
                          {calculatePotentialReturn(
                            bet.amount,
                            bet.prediction,
                            bet.market.yes_percentage
                          ).toFixed(2)}{" "}
                          créditos
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Probabilidade</p>
                        <div className="flex items-center gap-1">
                          <p className="text-lg font-bold">
                            {bet.prediction
                              ? bet.market.yes_percentage
                              : 100 - bet.market.yes_percentage}
                            %
                          </p>
                          {bet.prediction ? (
                            <TrendingUp className="h-4 w-4 text-success" />
                          ) : (
                            <TrendingDown className="h-4 w-4 text-danger" />
                          )}
                        </div>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Data</p>
                        <p className="text-sm font-medium">{formatDate(bet.created_at)}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default MyBets;
