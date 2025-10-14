import { useState } from "react";
import { Badge } from "./ui/badge";

const categories = [
  { id: "all", label: "Todas", count: 12 },
  { id: "presidential", label: "Presidencial", count: 3 },
  { id: "governors", label: "Governadores", count: 5 },
  { id: "senators", label: "Senadores", count: 4 },
];

const CategoryTabs = () => {
  const [active, setActive] = useState("all");

  return (
    <div className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex gap-2 py-4 overflow-x-auto">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActive(cat.id)}
              className={`px-4 py-2 rounded-lg text-sm font-medium whitespace-nowrap transition-all ${
                active === cat.id
                  ? "bg-primary text-primary-foreground"
                  : "hover:bg-muted"
              }`}
            >
              {cat.label}
              <Badge variant="secondary" className="ml-2">
                {cat.count}
              </Badge>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CategoryTabs;
