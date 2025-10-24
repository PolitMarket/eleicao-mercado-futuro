import MarketCard from "./MarketCard";
import { useMarkets } from "@/hooks/useMarkets";
import { useMemo } from "react";

interface MarketGridProps {
  category: string;
  searchQuery?: string;
  sortBy?: string;
  statusFilter?: string;
}

const MarketGrid = ({ category, searchQuery = "", sortBy = "newest", statusFilter = "all" }: MarketGridProps) => {
  const { data: markets, isLoading } = useMarkets();

  // Filter and sort markets
  const filteredAndSortedMarkets = useMemo(() => {
    if (!markets) return [];

    let filtered = [...markets];

    // Filter by category
    if (category !== "all") {
      filtered = filtered.filter(m => m.category === category);
    }

    // Filter by status
    if (statusFilter !== "all") {
      filtered = filtered.filter(m => m.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(m => 
        m.title.toLowerCase().includes(query) || 
        m.description?.toLowerCase().includes(query)
      );
    }

    // Sort markets
    switch (sortBy) {
      case "oldest":
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "volume":
        filtered.sort((a, b) => (b.total_volume || 0) - (a.total_volume || 0));
        break;
      case "ending-soon":
        filtered.sort((a, b) => new Date(a.end_date).getTime() - new Date(b.end_date).getTime());
        break;
      case "newest":
      default:
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
    }

    return filtered;
  }, [markets, category, searchQuery, sortBy, statusFilter]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  if (!filteredAndSortedMarkets || filteredAndSortedMarkets.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-muted-foreground">
          {searchQuery ? "Nenhum mercado encontrado para sua busca." : "Nenhum mercado encontrado nesta categoria."}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredAndSortedMarkets.map((market) => {
          // Determinar as opções baseado no tipo de mercado
          const options = market.market_type === "candidates" && market.candidate_1_name && market.candidate_2_name
            ? [
                { name: market.candidate_1_name, percentage: market.yes_percentage || 50 },
                { name: market.candidate_2_name, percentage: 100 - (market.yes_percentage || 50) },
              ]
            : [
                { name: "Sim", percentage: market.yes_percentage || 50 },
                { name: "Não", percentage: 100 - (market.yes_percentage || 50) },
              ];

          return (
            <MarketCard
              key={market.id}
              marketId={market.id}
              title={market.title}
              category={market.category}
              image={market.image_url || "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=100&h=100&fit=crop"}
              options={options}
              volume={`${market.total_volume || 0}`}
            />
          );
        })}
      </div>
    </div>
  );
};

export default MarketGrid;
