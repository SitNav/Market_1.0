import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { 
  Home, 
  Briefcase, 
  Utensils, 
  GraduationCap, 
  Heart, 
  HandHeart,
  Package,
  Wrench,
  Car,
  Shirt
} from "lucide-react";
import type { Category } from "@shared/schema";

interface CategoryCardProps {
  category: Category;
  onClick?: () => void;
  isSelected?: boolean;
  showCount?: boolean;
}

const iconMap: Record<string, any> = {
  home: Home,
  briefcase: Briefcase,
  utensils: Utensils,
  "graduation-cap": GraduationCap,
  heart: Heart,
  "hand-heart": HandHeart,
  package: Package,
  wrench: Wrench,
  car: Car,
  shirt: Shirt,
};

export default function CategoryCard({ 
  category, 
  onClick, 
  isSelected = false, 
  showCount = true 
}: CategoryCardProps) {
  const IconComponent = iconMap[category.icon || "package"] || Package;
  
  const cardContent = (
    <Card 
      className={cn(
        "hover:shadow-lg transition-all duration-200 cursor-pointer terra-hover",
        isSelected && "ring-2 ring-primary shadow-lg"
      )}
      onClick={onClick}
    >
      <CardContent className="p-4 text-center">
        <div 
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3",
            category.color ? `bg-[${category.color}]/10` : "bg-secondary/10"
          )}
        >
          <IconComponent 
            className={cn(
              "h-6 w-6",
              category.color ? `text-[${category.color}]` : "text-secondary"
            )} 
          />
        </div>
        <h3 className="font-semibold text-primary mb-1 text-sm">{category.name}</h3>
        {showCount && (
          <p className="text-xs text-neutral-gray">
            {/* This would be populated with real count data */}
            Browse items
          </p>
        )}
      </CardContent>
    </Card>
  );

  if (onClick) {
    return cardContent;
  }

  return (
    <Link href={`/marketplace?category=${category.slug}`}>
      {cardContent}
    </Link>
  );
}
