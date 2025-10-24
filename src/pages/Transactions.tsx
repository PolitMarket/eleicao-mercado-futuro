import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import Header from "@/components/Header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowDownCircle,
  ArrowUpCircle,
  TrendingUp,
  CreditCard,
} from "lucide-react";

interface Transaction {
  id: string;
  amount: number;
  type: string;
  description: string | null;
  created_at: string;
}

export default function Transactions() {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        navigate("/auth");
        return;
      }
      setSession(session);
      fetchTransactions(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!session) {
        navigate("/auth");
      } else {
        setSession(session);
        fetchTransactions(session);
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const fetchTransactions = async (session: Session) => {
    try {
      const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setTransactions(data || []);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <ArrowDownCircle className="h-5 w-5 text-green-600" />;
      case "withdrawal":
        return <ArrowUpCircle className="h-5 w-5 text-red-600" />;
      case "bet":
        return <CreditCard className="h-5 w-5 text-blue-600" />;
      case "win":
        return <TrendingUp className="h-5 w-5 text-green-600" />;
      default:
        return <CreditCard className="h-5 w-5" />;
    }
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case "deposit":
        return "Depósito";
      case "withdrawal":
        return "Saque";
      case "bet":
        return "Aposta";
      case "win":
        return "Ganho";
      default:
        return type;
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "deposit":
      case "win":
        return "text-green-600";
      case "withdrawal":
      case "bet":
        return "text-red-600";
      default:
        return "";
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 py-8 max-w-4xl">
        <h1 className="text-3xl font-bold mb-8">Histórico de Transações</h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <Card key={i}>
                <CardContent className="p-6">
                  <Skeleton className="h-20 w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : transactions.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <p className="text-muted-foreground">
                Você ainda não tem transações.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      {getTransactionIcon(transaction.type)}
                      <div>
                        <div className="flex items-center gap-2">
                          <p className="font-semibold">
                            {getTransactionLabel(transaction.type)}
                          </p>
                          <Badge variant="outline" className="text-xs">
                            {transaction.type}
                          </Badge>
                        </div>
                        {transaction.description && (
                          <p className="text-sm text-muted-foreground mt-1">
                            {transaction.description}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatDate(transaction.created_at)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p
                        className={`text-xl font-bold ${getTransactionColor(
                          transaction.type
                        )}`}
                      >
                        {transaction.type === "withdrawal" ||
                        transaction.type === "bet"
                          ? "-"
                          : "+"}
                        {transaction.amount.toLocaleString("pt-BR")} créditos
                      </p>
                      <p className="text-sm text-muted-foreground">
                        R${" "}
                        {(transaction.amount * 0.1).toLocaleString("pt-BR", {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
