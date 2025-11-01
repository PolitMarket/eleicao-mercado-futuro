import { TrendingUp, LogOut, Shield, Coins, ListChecks, DollarSign, User, Menu, Plus, Minus } from "lucide-react";
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";

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

                <NotificationsDropdown session={session} />

                {/* User Menu Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Menu className="h-4 w-4 mr-0 sm:mr-2" />
                      <span className="hidden sm:inline">Menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-56 bg-card z-50">
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">Minha Conta</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {session.user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => navigate("/profile")}>
                      <User className="mr-2 h-4 w-4" />
                      <span>Meu Perfil</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/my-bets")}>
                      <ListChecks className="mr-2 h-4 w-4" />
                      <span>Minhas Apostas</span>
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => navigate("/transactions")}>
                      <DollarSign className="mr-2 h-4 w-4" />
                      <span>Transações</span>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <div className="cursor-pointer">
                        <Plus className="mr-2 h-4 w-4" />
                        <BuyCreditsDialog />
                      </div>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <div className="cursor-pointer">
                        <Minus className="mr-2 h-4 w-4" />
                        <WithdrawDialog balance={balance} onSuccess={refetchBalance} />
                      </div>
                    </DropdownMenuItem>
                    {isAdmin && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => navigate("/admin")}>
                          <Shield className="mr-2 h-4 w-4" />
                          <span>Admin</span>
                        </DropdownMenuItem>
                      </>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Sair</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
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
      </div>
    </header>
  );
};

export default Header;
