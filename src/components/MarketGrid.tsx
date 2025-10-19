import MarketCard from "./MarketCard";
import { useMarkets } from "@/hooks/useMarkets";

interface MarketGridProps {
  category: string;
}

const MarketGrid = ({ category }: MarketGridProps) => {
  const { data: markets, isLoading } = useMarkets();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  const filteredMarkets = category === "all" 
    ? markets 
    : markets?.filter(m => m.category === category);

  if (!filteredMarkets || filteredMarkets.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-muted-foreground">
          Nenhum mercado encontrado nesta categoria.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMarkets.map((market) => {
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
