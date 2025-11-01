import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Session } from "@supabase/supabase-js";
import Header from "@/components/Header";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Coins, DollarSign, Calendar, Mail, TrendingUp } from "lucide-react";
import { useUserBalance } from "@/hooks/useUserBalance";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const CREDIT_TO_BRL = 0.10;

const Profile = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { balance } = useUserBalance(session);

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
        return;
      }
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!session?.user) return;

      try {
        const { data, error } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (error) throw error;
        setProfile(data);
      } catch (error) {
        console.error("Error fetching profile:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [session]);

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-background flex items-center justify-center">
          <p className="text-muted-foreground">Carregando perfil...</p>
        </div>
      </>
    );
  }

  const brlValue = (balance * CREDIT_TO_BRL).toFixed(2);
  const initials = profile?.full_name
    ? profile.full_name.split(' ').map((n: string) => n[0]).join('').toUpperCase()
    : session?.user?.email?.substring(0, 2).toUpperCase() || '??';

  return (
    <>
      <Header />
      <div className="min-h-screen bg-background py-12">
        <div className="container mx-auto px-4 max-w-4xl">
          <div className="mb-8">
            <Button 
              variant="ghost" 
              onClick={() => navigate("/")}
              className="mb-4"
            >
              ← Voltar
            </Button>
            <h1 className="text-3xl font-bold">Meu Perfil</h1>
            <p className="text-muted-foreground mt-2">
              Gerencie suas informações e acompanhe suas estatísticas
            </p>
          </div>

          <div className="grid gap-6">
            {/* Card de Informações Pessoais */}
            <Card>
              <CardHeader>
                <CardTitle>Informações Pessoais</CardTitle>
                <CardDescription>Seus dados cadastrados na plataforma</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-start gap-6">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={profile?.avatar_url} />
                    <AvatarFallback className="text-2xl">{initials}</AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Email</p>
                        <p className="font-medium">{session?.user?.email}</p>
                      </div>
                    </div>

                    {profile?.full_name && (
                      <div>
                        <p className="text-sm text-muted-foreground">Nome</p>
                        <p className="font-medium">{profile.full_name}</p>
                      </div>
                    )}

                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">Membro desde</p>
                        <p className="font-medium">
                          {profile?.created_at 
                            ? format(new Date(profile.created_at), "dd 'de' MMMM 'de' yyyy", { locale: ptBR })
                            : "N/A"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Card de Saldo */}
            <Card>
              <CardHeader>
                <CardTitle>Saldo e Créditos</CardTitle>
                <CardDescription>Seu saldo disponível para apostas</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="p-6 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                    <div className="flex items-center gap-2 mb-2">
                      <Coins className="h-5 w-5 text-primary" />
                      <p className="text-sm text-muted-foreground">Créditos</p>
                    </div>
                    <p className="text-4xl font-bold text-primary">{balance.toFixed(0)}</p>
                  </div>

                  <div className="p-6 rounded-lg bg-gradient-to-br from-green-500/10 to-green-500/5 border border-green-500/20">
                    <div className="flex items-center gap-2 mb-2">
                      <DollarSign className="h-5 w-5 text-green-600" />
                      <p className="text-sm text-muted-foreground">Valor em Reais</p>
                    </div>
                    <p className="text-4xl font-bold text-green-600">R$ {brlValue}</p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <Button onClick={() => navigate("/my-bets")} variant="outline" className="flex-1">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Minhas Apostas
                  </Button>
                  <Button onClick={() => navigate("/transactions")} variant="outline" className="flex-1">
                    <DollarSign className="h-4 w-4 mr-2" />
                    Transações
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;
