import { TrendingUp } from "lucide-react";
import { Button } from "./ui/button";

const Header = () => {
  return (
    <header className="border-b bg-card sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-6 w-6 text-primary" />
              <h1 className="text-2xl font-bold">PolitMarket</h1>
            </div>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
              Eleições
            </a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
              Candidatos
            </a>
            <a href="#" className="text-sm font-medium hover:text-primary transition-colors">
              Como Funciona
            </a>
          </nav>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm">
              Entrar
            </Button>
            <Button size="sm">
              Cadastrar
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
