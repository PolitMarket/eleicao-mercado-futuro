import MarketCard from "./MarketCard";
import { useMarkets } from "@/hooks/useMarkets";

const MarketGrid = () => {
  const { data: markets, isLoading } = useMarkets();

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {markets?.map((market) => (
          <MarketCard
            key={market.id}
            title={market.title}
            category={market.category}
            image={market.image_url || "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=100&h=100&fit=crop"}
            options={[
              { name: "Sim", percentage: market.yes_percentage || 50 },
              { name: "Não", percentage: 100 - (market.yes_percentage || 50) },
            ]}
            volume={`${market.total_volume || 0}`}
          />
        ))}
      </div>
    </div>
  );
};

export default MarketGrid;
