import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CreateMarketForm } from "@/components/admin/CreateMarketForm";
import { MarketsList } from "@/components/admin/MarketsList";
import { BetsList } from "@/components/admin/BetsList";

const Admin = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <Button
          variant="ghost"
          onClick={() => navigate("/")}
          className="mb-6"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>

        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold mb-8">Painel de Administração</h1>

          <Tabs defaultValue="manage" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="manage">Gerenciar Mercados</TabsTrigger>
              <TabsTrigger value="bets">Gerenciar Apostas</TabsTrigger>
              <TabsTrigger value="create">Criar Novo Mercado</TabsTrigger>
            </TabsList>
            
            <TabsContent value="manage" className="mt-6">
              <MarketsList />
            </TabsContent>
            
            <TabsContent value="bets" className="mt-6">
              <BetsList />
            </TabsContent>
            
            <TabsContent value="create" className="mt-6">
              <div className="max-w-2xl">
                <CreateMarketForm />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Admin;
