import { useState } from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface StarRatingProps {
  rating: number;
  onRatingChange?: (rating: number) => void;
  maxRating?: number;
  size?: "sm" | "md" | "lg";
  readonly?: boolean;
  showValue?: boolean;
  className?: string;
}

export default function StarRating({
  rating,
  onRatingChange,
  maxRating = 5,
  size = "md",
  readonly = false,
  showValue = false,
  className,
}: StarRatingProps) {
  const [hoverRating, setHoverRating] = useState(0);

  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-5 h-5",
    lg: "w-6 h-6",
  };

  const handleClick = (value: number) => {
    if (!readonly && onRatingChange) {
      onRatingChange(value);
    }
  };

  const handleMouseEnter = (value: number) => {
    if (!readonly) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (!readonly) {
      setHoverRating(0);
    }
  };

  const displayRating = hoverRating || rating;

  return (
    <div className={cn("flex items-center space-x-1", className)}>
      <div className="flex items-center space-x-1">
        {[...Array(maxRating)].map((_, index) => {
          const starValue = index + 1;
          const isFilled = starValue <= displayRating;
          const isHalfFilled = starValue - 0.5 <= displayRating && starValue > displayRating;

          return (
            <button
              key={index}
              type="button"
              className={cn(
                "transition-colors duration-200",
                readonly
                  ? "cursor-default"
                  : "cursor-pointer hover:scale-110 transform transition-transform"
              )}
              onClick={() => handleClick(starValue)}
              onMouseEnter={() => handleMouseEnter(starValue)}
              onMouseLeave={handleMouseLeave}
              disabled={readonly}
            >
              <Star
                className={cn(
                  sizeClasses[size],
                  isFilled
                    ? "fill-yellow-400 text-yellow-400"
                    : isHalfFilled
                    ? "fill-yellow-400/50 text-yellow-400"
                    : "text-gray-300 dark:text-gray-600"
                )}
              />
            </button>
          );
        })}
      </div>
      
      {showValue && (
        <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
          {rating.toFixed(1)} / {maxRating}
        </span>
      )}
    </div>
  );
}

// Helper component to display user rating points
interface UserRatingDisplayProps {
  totalPoints: number;
  totalReviews: number;
  averageRating: number;
  className?: string;
}

export function UserRatingDisplay({
  totalPoints,
  totalReviews,
  averageRating,
  className,
}: UserRatingDisplayProps) {
  return (
    <div className={cn("flex items-center space-x-3", className)}>
      <StarRating
        rating={averageRating}
        readonly
        size="sm"
        showValue
      />
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {totalPoints} points ({totalReviews} reviews)
      </div>
    </div>
  );
}