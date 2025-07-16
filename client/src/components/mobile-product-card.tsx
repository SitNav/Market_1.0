import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Heart,
  ShoppingCart,
  Star,
  MapPin,
  Clock,
  Eye,
  MessageCircle,
  Share2,
  MoreHorizontal
} from "lucide-react";
import { Link } from "wouter";
import type { ListingWithDetails } from "@shared/schema";
import { formatDistanceToNow } from "date-fns";

interface MobileProductCardProps {
  listing: ListingWithDetails;
  onAddToCart?: (listingId: number) => void;
  onToggleWishlist?: (listingId: number) => void;
  isInWishlist?: boolean;
}

export default function MobileProductCard({
  listing,
  onAddToCart,
  onToggleWishlist,
  isInWishlist = false,
}: MobileProductCardProps) {
  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onAddToCart?.(listing.id);
  };

  const handleToggleWishlist = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onToggleWishlist?.(listing.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: listing.title,
        text: listing.description,
        url: `/listing/${listing.id}`,
      });
    }
  };

  return (
    <Link href={`/listing/${listing.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow bg-white">
        <div className="relative">
          {/* Product Image */}
          <div className="aspect-square bg-gray-100 relative overflow-hidden">
            {listing.images && listing.images.length > 0 ? (
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gray-200">
                <span className="text-gray-400">No image</span>
              </div>
            )}
            
            {/* Wishlist Button */}
            <Button
              variant="ghost"
              size="sm"
              className="absolute top-2 right-2 h-8 w-8 p-0 bg-white/80 hover:bg-white"
              onClick={handleToggleWishlist}
            >
              <Heart
                className={`h-4 w-4 ${
                  isInWishlist ? "fill-red-500 text-red-500" : "text-gray-600"
                }`}
              />
            </Button>

            {/* Condition Badge */}
            {listing.condition && (
              <Badge
                variant="secondary"
                className="absolute top-2 left-2 text-xs"
              >
                {listing.condition}
              </Badge>
            )}

            {/* Price Badge */}
            <div className="absolute bottom-2 left-2">
              <Badge variant="default" className="text-sm font-bold">
                {listing.priceType === "free" ? "FREE" : `$${listing.price}`}
              </Badge>
            </div>
          </div>

          {/* Product Info */}
          <CardContent className="p-4">
            <div className="space-y-2">
              {/* Title */}
              <h3 className="font-semibold text-sm leading-tight line-clamp-2">
                {listing.title}
              </h3>

              {/* Category */}
              <p className="text-xs text-gray-500">{listing.category.name}</p>

              {/* Description */}
              <p className="text-xs text-gray-600 line-clamp-2">
                {listing.description}
              </p>

              {/* Location & Time */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-1">
                  <MapPin className="h-3 w-3" />
                  <span>
                    {listing.city && listing.state 
                      ? `${listing.city}, ${listing.state}`
                      : "Location not specified"
                    }
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}</span>
                </div>
              </div>

              {/* Stats */}
              <div className="flex items-center justify-between text-xs text-gray-500">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1">
                    <Eye className="h-3 w-3" />
                    <span>{listing.viewCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="h-3 w-3" />
                    <span>{listing.commentCount || 0}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Star className="h-3 w-3" />
                    <span>{listing.favoriteCount || 0}</span>
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={handleShare}
                  >
                    <Share2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1 text-xs"
                  onClick={handleAddToCart}
                  disabled={listing.priceType === "free"}
                >
                  <ShoppingCart className="h-3 w-3 mr-1" />
                  {listing.priceType === "free" ? "Contact" : "Add to Cart"}
                </Button>
                <Link href={`/listing/${listing.id}`}>
                  <Button size="sm" className="text-xs">
                    View Details
                  </Button>
                </Link>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    </Link>
  );
}