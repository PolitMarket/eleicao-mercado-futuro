import { Card } from "./ui/card";
import { Badge } from "./ui/badge";
import { TrendingUp, Bookmark } from "lucide-react";
import { Button } from "./ui/button";

interface Option {
  name: string;
  percentage: number;
  trend?: "up" | "down";
}

interface MarketCardProps {
  title: string;
  category: string;
  image: string;
  options: Option[];
  volume: string;
  isLive?: boolean;
}

const MarketCard = ({ title, category, image, options, volume, isLive }: MarketCardProps) => {
  const maxPercentage = Math.max(...options.map(o => o.percentage));

  return (
    <Card className="overflow-hidden hover:shadow-lg transition-all duration-300 group">
      <div className="p-4">
        <div className="flex items-start gap-3 mb-4">
          <img 
            src={image} 
            alt={title}
            className="w-12 h-12 rounded-lg object-cover"
          />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="secondary" className="text-xs">
                {category}
              </Badge>
              {isLive && (
                <Badge className="bg-danger text-danger-foreground text-xs">
                  • AO VIVO
                </Badge>
              )}
            </div>
            <h3 className="font-semibold text-sm group-hover:text-primary transition-colors">
              {title}
            </h3>
          </div>
          <button className="text-muted-foreground hover:text-primary transition-colors">
            <Bookmark className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          {options.map((option, idx) => (
            <div key={idx}>
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">{option.name}</span>
                <div className="flex items-center gap-2">
                  {option.trend && (
                    <TrendingUp 
                      className={`h-3 w-3 ${
                        option.trend === 'up' ? 'text-success rotate-0' : 'text-danger rotate-180'
                      }`} 
                    />
                  )}
                  <span className="text-lg font-bold">
                    {option.percentage}%
                  </span>
                </div>
              </div>
              <div className="relative h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className={`absolute h-full rounded-full transition-all duration-500 ${
                    option.percentage === maxPercentage 
                      ? 'bg-success' 
                      : 'bg-danger'
                  }`}
                  style={{ width: `${option.percentage}%` }}
                />
              </div>
              <div className="flex gap-2 mt-2">
                <Button 
                  size="sm" 
                  variant="outline"
                  className="flex-1 text-xs bg-success/5 border-success/20 hover:bg-success/10"
                >
                  Sim {option.percentage}%
                </Button>
                <Button 
                  size="sm" 
                  variant="outline"
                  className="flex-1 text-xs bg-danger/5 border-danger/20 hover:bg-danger/10"
                >
                  Não {100 - option.percentage}%
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 pt-4 border-t flex items-center justify-between text-xs text-muted-foreground">
          <span>Volume: {volume}</span>
          <span className="text-primary cursor-pointer hover:underline">
            Ver detalhes →
          </span>
        </div>
      </div>
    </Card>
  );
};

export default MarketCard;
