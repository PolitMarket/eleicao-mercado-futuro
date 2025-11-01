import { TrendingUp, LogOut, Shield, Coins, ListChecks, DollarSign, User } from "lucide-react";
import { Button } from "./ui/button";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useEffect, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { Session } from "@supabase/supabase-js";
import { BuyCreditsDialog } from "./BuyCreditsDialog";
import { WithdrawDialog } from "./WithdrawDialog";
import { useUserBalance } from "@/hooks/useUserBalance";
import { NotificationsDropdown } from "./NotificationsDropdown";

const CREDIT_TO_BRL = 0.10; // 1 crédito = R$ 0,10

const Header = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<Session | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const { balance, refetch: refetchBalance } = useUserBalance(session);

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
    const checkAdmin = async () => {
      if (!session?.user) {
        setIsAdmin(false);
        return;
      }

      const { data } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "admin")
        .maybeSingle();

      setIsAdmin(!!data);
    };

    checkAdmin();
  }, [session]);

  const handleLogout = async () => {
    await supabase.auth.signOut();
    toast({
      title: "Logout realizado",
      description: "Até logo!",
    });
  };

  const brlValue = (balance * CREDIT_TO_BRL).toFixed(2);

  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-3">
        {/* Main Row */}
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-2 flex-shrink-0">
            <TrendingUp className="h-6 w-6 text-primary" />
            <h1 className="text-xl md:text-2xl font-bold">PolitMarket</h1>
          </div>
          
          {/* Navigation - Hidden on small screens */}
          <nav className="hidden lg:flex items-center gap-6">
            <a href="/" className="text-sm font-medium hover:text-primary transition-colors">
              Mercados
            </a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
              Como Funciona
            </a>
          </nav>

          {/* User Actions */}
          <div className="flex items-center gap-2">
            {session ? (
              <>
                {/* Balance Display */}
                <div className="hidden md:flex flex-col items-end gap-0.5 px-4 py-2 rounded-lg bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20">
                  <div className="flex items-center gap-2">
                    <Coins className="h-4 w-4 text-primary" />
                    <span className="text-lg font-bold text-primary">{balance.toFixed(0)}</span>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <DollarSign className="h-3 w-3" />
                    <span>R$ {brlValue}</span>
                  </div>
                </div>

                {/* Mobile Balance */}
                <div className="flex md:hidden items-center gap-1 px-3 py-1.5 rounded-md bg-primary/10 text-primary">
                  <Coins className="h-4 w-4" />
                  <span className="text-sm font-semibold">{balance.toFixed(0)}</span>
                </div>

                {/* Action Buttons */}
                <div className="hidden md:flex items-center gap-2">
                  <BuyCreditsDialog />
                  <WithdrawDialog balance={balance} onSuccess={refetchBalance} />
                </div>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate("/my-bets")} 
                  className="hidden lg:flex"
                >
                  <ListChecks className="h-4 w-4 mr-2" />
                  Apostas
                </Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate("/transactions")} 
                  className="hidden lg:flex"
                >
                  <DollarSign className="h-4 w-4 mr-2" />
                  Transações
                </Button>

                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => navigate("/profile")} 
                  className="hidden lg:flex"
                >
                  <User className="h-4 w-4 mr-2" />
                  Perfil
                </Button>

                <NotificationsDropdown session={session} />

                {isAdmin && (
                  <Button variant="outline" size="sm" onClick={() => navigate("/admin")}>
                    <Shield className="h-4 w-4 mr-2 hidden sm:inline" />
                    <span className="hidden sm:inline">Admin</span>
                    <Shield className="h-4 w-4 sm:hidden" />
                  </Button>
                )}

                <Button variant="ghost" size="sm" onClick={handleLogout}>
                  <LogOut className="h-4 w-4 mr-0 sm:mr-2" />
                  <span className="hidden sm:inline">Sair</span>
                </Button>
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                  Entrar
                </Button>
                <Button size="sm" onClick={() => navigate("/auth")}>
                  Cadastrar
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Mobile Action Bar - Only visible on small screens when logged in */}
        {session && (
          <div className="flex md:hidden items-center justify-center gap-2 mt-3 pt-3 border-t">
            <BuyCreditsDialog />
            <WithdrawDialog balance={balance} onSuccess={refetchBalance} />
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate("/my-bets")}
            >
              <ListChecks className="h-4 w-4 mr-1.5" />
              Apostas
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate("/transactions")}
            >
              <DollarSign className="h-4 w-4 mr-1.5" />
              Transações
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => navigate("/profile")}
            >
              <User className="h-4 w-4 mr-1.5" />
              Perfil
            </Button>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
