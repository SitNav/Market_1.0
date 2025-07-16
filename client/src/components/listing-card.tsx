import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Link } from "wouter";
import { 
  MapPin, 
  Calendar, 
  Eye, 
  Heart, 
  MessageSquare, 
  Package,
  CheckCircle,
  Star
} from "lucide-react";
import { format } from "date-fns";
import UserAvatar from "@/components/user-avatar";
import type { ListingWithDetails } from "@shared/schema";

interface ListingCardProps {
  listing: ListingWithDetails;
  viewMode?: "grid" | "list";
  showActions?: boolean;
}

export default function ListingCard({ 
  listing, 
  viewMode = "grid",
  showActions = true
}: ListingCardProps) {
  const handleCardClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking on action buttons
    if ((e.target as HTMLElement).closest('button')) {
      e.preventDefault();
      return;
    }
  };

  const priceDisplay = listing.priceType === "free" 
    ? "Free" 
    : listing.price 
      ? `$${listing.price}${listing.priceType === "negotiable" ? " (Negotiable)" : ""}`
      : "Contact for price";

  const cardContent = (
    <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer terra-hover">
      <CardContent className="p-0">
        <div className={cn(
          "flex",
          viewMode === "grid" ? "flex-col" : "flex-row"
        )}>
          {/* Image */}
          <div className={cn(
            "relative",
            viewMode === "grid" ? "w-full h-48" : "w-48 h-32 flex-shrink-0"
          )}>
            {listing.images && listing.images.length > 0 ? (
              <img
                src={listing.images[0]}
                alt={listing.title}
                className="w-full h-full object-cover rounded-t-lg"
              />
            ) : (
              <div className="w-full h-full bg-gray-200 rounded-t-lg flex items-center justify-center">
                <Package className="h-8 w-8 text-gray-400" />
              </div>
            )}
            
            {/* Status badges */}
            <div className="absolute top-2 right-2 flex space-x-1">
              <Badge variant="secondary" className="text-xs">
                {listing.category.name}
              </Badge>
              {listing.isPromoted && (
                <Badge variant="default" className="text-xs">
                  Featured
                </Badge>
              )}
            </div>
          </div>

          {/* Content */}
          <div className={cn(
            "p-4 flex-1",
            viewMode === "list" && "flex flex-col justify-between"
          )}>
            <div>
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-primary text-lg line-clamp-2">
                  {listing.title}
                </h3>
              </div>
              
              <p className="text-neutral-gray text-sm mb-3 line-clamp-2">
                {listing.description}
              </p>
              
              {/* Price */}
              <div className="mb-3">
                <span className={cn(
                  "text-xl font-bold",
                  listing.priceType === "free" ? "text-green-600" : "text-primary"
                )}>
                  {priceDisplay}
                </span>
                {listing.priceType === "negotiable" && (
                  <Badge variant="outline" className="ml-2 text-xs">
                    Negotiable
                  </Badge>
                )}
              </div>

              {/* Metadata */}
              <div className="flex items-center text-xs text-neutral-gray mb-3 space-x-4">
                <div className="flex items-center space-x-1">
                  <Eye className="h-3 w-3" />
                  <span>{listing.viewCount || 0} views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Calendar className="h-3 w-3" />
                  <span>{format(new Date(listing.createdAt), "MMM d")}</span>
                </div>
                {listing.location && (
                  <div className="flex items-center space-x-1">
                    <MapPin className="h-3 w-3" />
                    <span>{listing.location}</span>
                  </div>
                )}
              </div>
            </div>

            {/* User info and actions */}
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserAvatar user={listing.user} className="h-6 w-6" />
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-primary">
                    {listing.user.firstName} {listing.user.lastName}
                  </span>
                  <div className="flex items-center space-x-1">
                    {listing.user.isVerified && (
                      <CheckCircle className="h-3 w-3 text-green-600" />
                    )}
                    <span className="text-xs text-neutral-gray">
                      {listing.user.isVerified ? "Verified" : "Member"}
                    </span>
                  </div>
                </div>
              </div>
              
              {showActions && (
                <div className="flex space-x-2">
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      // Handle favorite action
                    }}
                  >
                    <Heart className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={(e) => {
                      e.preventDefault();
                      // Handle message action
                    }}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <Link href={`/listing/${listing.id}`}>
      <div onClick={handleCardClick}>
        {cardContent}
      </div>
    </Link>
  );
}
