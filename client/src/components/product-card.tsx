import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart, Star, MapPin, User, Eye } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import UserAvatar from "@/components/user-avatar";
import type { ListingWithDetails } from "@shared/schema";

interface ProductCardProps {
  listing: ListingWithDetails;
  viewMode?: "grid" | "list";
  showActions?: boolean;
  onAddToCart?: (listingId: number) => void;
  onToggleWishlist?: (listingId: number) => void;
  isInWishlist?: boolean;
}

export default function ProductCard({ 
  listing, 
  viewMode = "grid",
  showActions = true,
  onAddToCart,
  onToggleWishlist,
  isInWishlist = false
}: ProductCardProps) {
  const [isHovered, setIsHovered] = useState(false);
  
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

  const isOnSale = listing.originalPrice && parseFloat(listing.originalPrice) > parseFloat(listing.price || "0");
  const discountPercentage = isOnSale 
    ? Math.round(((parseFloat(listing.originalPrice!) - parseFloat(listing.price || "0")) / parseFloat(listing.originalPrice!)) * 100)
    : 0;

  const CardWrapper = viewMode === "grid" ? "div" : "div";
  const cardClass = viewMode === "grid" 
    ? "h-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02] cursor-pointer"
    : "transition-all duration-300 hover:shadow-md cursor-pointer";

  return (
    <Link href={`/listing/${listing.id}`} className="block">
      <Card 
        className={cardClass}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <div className={`relative ${viewMode === "grid" ? "aspect-square" : "flex"}`}>
          {/* Image */}
          <div className={`relative ${viewMode === "list" ? "w-48 h-48 flex-shrink-0" : "w-full h-full"} bg-gray-100 rounded-t-lg overflow-hidden`}>
            {listing.images && listing.images.length > 0 ? (
              <img 
                src={listing.images[0]} 
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <div className="text-center text-gray-400">
                  <div className="w-12 h-12 mx-auto mb-2 bg-gray-300 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6" />
                  </div>
                  <p className="text-sm">No image</p>
                </div>
              </div>
            )}
            
            {/* Badges */}
            <div className="absolute top-2 left-2 space-y-1">
              {listing.isFeatured && (
                <Badge className="bg-yellow-500 text-white">Featured</Badge>
              )}
              {isOnSale && (
                <Badge className="bg-red-500 text-white">-{discountPercentage}%</Badge>
              )}
              {listing.condition && listing.condition !== "new" && (
                <Badge variant="secondary" className="capitalize">
                  {listing.condition.replace('_', ' ')}
                </Badge>
              )}
            </div>

            {/* Quick Actions */}
            {showActions && (
              <div className={`absolute top-2 right-2 space-y-1 transition-opacity duration-300 ${
                isHovered ? 'opacity-100' : 'opacity-0'
              }`}>
                <Button
                  size="sm"
                  variant="secondary"
                  className="w-8 h-8 p-0 bg-white/90 hover:bg-white shadow-sm"
                  onClick={handleToggleWishlist}
                >
                  <Heart className={`w-4 h-4 ${isInWishlist ? 'text-red-500 fill-red-500' : 'text-gray-600'}`} />
                </Button>
                {listing.priceType !== 'free' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-8 h-8 p-0 bg-white/90 hover:bg-white shadow-sm"
                    onClick={handleAddToCart}
                  >
                    <ShoppingCart className="w-4 h-4 text-gray-600" />
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Content */}
          <div className={`${viewMode === "list" ? "flex-1 p-4" : "p-4"}`}>
            <div className="space-y-2">
              {/* Title */}
              <h3 className="font-semibold text-lg text-gray-900 line-clamp-2 hover:text-primary transition-colors">
                {listing.title}
              </h3>

              {/* Category */}
              <Badge variant="outline" className="text-xs">
                {listing.category.name}
              </Badge>

              {/* Price */}
              <div className="flex items-center space-x-2">
                {listing.priceType === 'free' ? (
                  <span className="text-xl font-bold text-green-600">FREE</span>
                ) : (
                  <>
                    <span className="text-2xl font-bold text-gray-900">
                      ${listing.price}
                    </span>
                    {isOnSale && (
                      <span className="text-sm text-gray-500 line-through">
                        ${listing.originalPrice}
                      </span>
                    )}
                  </>
                )}
                {listing.priceType === 'negotiable' && (
                  <Badge variant="secondary" className="text-xs">OBO</Badge>
                )}
              </div>

              {/* Brand */}
              {listing.brand && (
                <p className="text-sm text-gray-600">
                  <span className="font-medium">Brand:</span> {listing.brand}
                </p>
              )}

              {/* Description */}
              <p className="text-sm text-gray-600 line-clamp-2">
                {listing.description}
              </p>

              {/* Location */}
              {listing.location && (
                <div className="flex items-center text-sm text-gray-500">
                  <MapPin className="w-4 h-4 mr-1" />
                  {listing.location}
                </div>
              )}

              {/* Seller & Stats */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-2">
                  <UserAvatar user={listing.user} className="w-6 h-6" />
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {listing.user.firstName} {listing.user.lastName}
                    </p>
                    {listing.user.isVerified && (
                      <Badge variant="outline" className="text-xs">Verified</Badge>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-xs text-gray-500">
                  <div className="flex items-center">
                    <Eye className="w-3 h-3 mr-1" />
                    {listing.viewCount}
                  </div>
                  <div className="flex items-center">
                    <Heart className="w-3 h-3 mr-1" />
                    {listing.favoriteCount}
                  </div>
                </div>
              </div>

              {/* Posted Time */}
              <p className="text-xs text-gray-500">
                Posted {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}
              </p>
            </div>
          </div>
        </div>

        {/* Footer Actions (Grid view only) */}
        {viewMode === "grid" && showActions && (
          <CardFooter className="pt-0 pb-4 px-4 space-x-2">
            {listing.priceType !== 'free' && (
              <Button 
                className="flex-1" 
                onClick={handleAddToCart}
                variant="outline"
              >
                <ShoppingCart className="w-4 h-4 mr-2" />
                Add to Cart
              </Button>
            )}
            <Button className="flex-1" variant="default">
              View Details
            </Button>
          </CardFooter>
        )}
      </Card>
    </Link>
  );
}