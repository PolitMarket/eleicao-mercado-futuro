import { TrendingUp, Users, BarChart3 } from "lucide-react";
import { Button } from "./ui/button";

const HeroSection = () => {
  return (
    <section className="bg-gradient-to-b from-primary/5 to-background py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Mercado de Previsões Políticas do Brasil
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Plataforma acadêmica para acompanhar e analisar as probabilidades de eventos 
            eleitorais brasileiros baseada em inteligência coletiva.
          </p>
          
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            <Button size="lg" className="gap-2">
              <TrendingUp className="h-5 w-5" />
              Explorar Mercados
            </Button>
            <Button size="lg" variant="outline">
              Como Funciona
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
            <div className="bg-card rounded-xl p-6 shadow-sm">
              <div className="bg-primary/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold mb-2">Inteligência Coletiva</h3>
              <p className="text-sm text-muted-foreground">
                Previsões baseadas na sabedoria das multidões
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm">
              <div className="bg-success/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <BarChart3 className="h-6 w-6 text-success" />
              </div>
              <h3 className="font-semibold mb-2">Dados em Tempo Real</h3>
              <p className="text-sm text-muted-foreground">
                Acompanhe as mudanças de probabilidade ao vivo
              </p>
            </div>

            <div className="bg-card rounded-xl p-6 shadow-sm">
              <div className="bg-danger/10 w-12 h-12 rounded-lg flex items-center justify-center mb-4 mx-auto">
                <TrendingUp className="h-6 w-6 text-danger" />
              </div>
              <h3 className="font-semibold mb-2">Fins Acadêmicos</h3>
              <p className="text-sm text-muted-foreground">
                Plataforma educacional e de pesquisa
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
