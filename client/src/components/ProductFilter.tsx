import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { categories } from "@/lib/data";

interface FilterProps {
  currentCategory: string;
  onSelectCategory: (category: string) => void;
}

export function ProductFilter({ currentCategory, onSelectCategory }: FilterProps) {
  return (
    <div className="flex flex-wrap justify-center gap-2 my-8 px-4">
      {categories.map((category) => (
        <Button
          key={category}
          variant={currentCategory === category ? "default" : "outline"}
          onClick={() => onSelectCategory(category)}
          className={cn(
            "rounded-full px-6 transition-all duration-300",
            currentCategory === category 
              ? "bg-primary text-white shadow-md scale-105" 
              : "bg-white border-gray-200 text-gray-600 hover:border-primary/50 hover:text-primary"
          )}
        >
          {category}
        </Button>
      ))}
    </div>
  );
}
