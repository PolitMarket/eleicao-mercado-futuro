import MarketCard from "./MarketCard";

const markets = [
  {
    title: "Eleição Presidencial 2026",
    category: "Presidencial",
    image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=100&h=100&fit=crop",
    options: [
      { name: "Lula da Silva", percentage: 48, trend: "up" as const },
      { name: "Jair Bolsonaro", percentage: 35, trend: "down" as const },
    ],
    volume: "R$ 2,5M",
    isLive: true,
  },
  {
    title: "Governador de São Paulo 2026",
    category: "Governadores",
    image: "https://images.unsplash.com/photo-1541746972996-4e0b0f43e02a?w=100&h=100&fit=crop",
    options: [
      { name: "Tarcísio de Freitas", percentage: 52, trend: "up" as const },
      { name: "Fernando Haddad", percentage: 38, trend: "down" as const },
    ],
    volume: "R$ 1,8M",
  },
  {
    title: "Governador do Rio de Janeiro 2026",
    category: "Governadores",
    image: "https://images.unsplash.com/photo-1483729558449-99ef09a8c325?w=100&h=100&fit=crop",
    options: [
      { name: "Cláudio Castro", percentage: 45 },
      { name: "Marcelo Freixo", percentage: 41, trend: "up" as const },
    ],
    volume: "R$ 1,2M",
  },
  {
    title: "Senador por Minas Gerais",
    category: "Senadores",
    image: "https://images.unsplash.com/photo-1587825140708-dfaf72ae4b04?w=100&h=100&fit=crop",
    options: [
      { name: "Alexandre Kalil", percentage: 43 },
      { name: "Cleitinho Azevedo", percentage: 32 },
    ],
    volume: "R$ 890K",
  },
  {
    title: "Reeleição Lula em 2026?",
    category: "Presidencial",
    image: "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?w=100&h=100&fit=crop",
    options: [
      { name: "Será reeleito", percentage: 47, trend: "up" as const },
    ],
    volume: "R$ 3,1M",
    isLive: true,
  },
  {
    title: "Governador da Bahia 2026",
    category: "Governadores",
    image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=100&h=100&fit=crop",
    options: [
      { name: "Jerônimo Rodrigues", percentage: 39 },
      { name: "ACM Neto", percentage: 51, trend: "up" as const },
    ],
    volume: "R$ 750K",
  },
  {
    title: "Participação eleitoral acima de 75%?",
    category: "Presidencial",
    image: "https://images.unsplash.com/photo-1495555961986-6d4c1ecb7be3?w=100&h=100&fit=crop",
    options: [
      { name: "Acima de 75%", percentage: 68 },
    ],
    volume: "R$ 450K",
  },
  {
    title: "Governador de Pernambuco 2026",
    category: "Governadores",
    image: "https://images.unsplash.com/photo-1516815231560-8f41ec531527?w=100&h=100&fit=crop",
    options: [
      { name: "Raquel Lyra", percentage: 44 },
      { name: "João Campos", percentage: 49, trend: "up" as const },
    ],
    volume: "R$ 680K",
  },
  {
    title: "Senador pelo Rio Grande do Sul",
    category: "Senadores",
    image: "https://images.unsplash.com/photo-1551135049-8a33b5883817?w=100&h=100&fit=crop",
    options: [
      { name: "Eduardo Leite", percentage: 55, trend: "up" as const },
      { name: "Onyx Lorenzoni", percentage: 36 },
    ],
    volume: "R$ 820K",
  },
];

const MarketGrid = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {markets.map((market, idx) => (
          <MarketCard key={idx} {...market} />
        ))}
      </div>
    </div>
  );
};

export default MarketGrid;
