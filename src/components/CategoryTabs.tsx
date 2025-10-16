import { Badge } from "./ui/badge";
import { useMarkets } from "@/hooks/useMarkets";

const categories = [
  { id: "all", label: "Todas" },
  { id: "Esportes", label: "Esportes" },
  { id: "Política", label: "Política" },
  { id: "Criptomoedas", label: "Criptomoedas" },
  { id: "Entretenimento", label: "Entretenimento" },
];

interface CategoryTabsProps {
  activeCategory: string;
  onCategoryChange: (category: string) => void;
}

const CategoryTabs = ({ activeCategory, onCategoryChange }: CategoryTabsProps) => {
  const { data: markets } = useMarkets();

  const getCategoryCount = (categoryId: string) => {
    if (!markets) return 0;
    if (categoryId === "all") return markets.length;
    return markets.filter(m => m.category === categoryId).length;
  };

  return (
    <div className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex gap-2 py-4 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onCategoryChange(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {cat.label}
              <Badge variant="secondary" className="ml-2">
                {getCategoryCount(cat.id)}
              </Badge>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryTabs;
