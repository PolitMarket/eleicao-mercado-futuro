import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategoryTabs from "@/components/CategoryTabs";
import MarketGrid from "@/components/MarketGrid";

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <CategoryTabs />
      <MarketGrid />
      <footer className="border-t py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 PolitMarket - Plataforma Acadêmica de Previsões Eleitorais</p>
          <p className="mt-2">Este é um projeto educacional e não representa apostas reais.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
