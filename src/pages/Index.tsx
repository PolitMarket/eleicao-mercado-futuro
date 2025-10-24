import Header from "@/components/Header";
import HeroSection from "@/components/HeroSection";
import CategoryTabs from "@/components/CategoryTabs";
import MarketGrid from "@/components/MarketGrid";
import { MarketFilters } from "@/components/MarketFilters";
import { useState } from "react";
import { usePaymentVerification } from "@/hooks/usePaymentVerification";

const Index = () => {
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [statusFilter, setStatusFilter] = useState("all");
  
  // Verificar pagamento após redirect do Stripe
  usePaymentVerification();

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <HeroSection />
      <CategoryTabs activeCategory={selectedCategory} onCategoryChange={setSelectedCategory} />
      
      {/* Filters Section */}
      <div className="container mx-auto px-4 py-6">
        <MarketFilters
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          sortBy={sortBy}
          onSortChange={setSortBy}
          statusFilter={statusFilter}
          onStatusFilterChange={setStatusFilter}
        />
      </div>

      <MarketGrid 
        category={selectedCategory}
        searchQuery={searchQuery}
        sortBy={sortBy}
        statusFilter={statusFilter}
      />
      <footer className="border-t py-8 mt-16">
        <div className="container mx-auto px-4 text-center text-sm text-muted-foreground">
          <p>© 2024 PolitMarket - Plataforma de Previsões Eleitorais</p>
          <p className="mt-2">Todos os direitos reservados.</p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
