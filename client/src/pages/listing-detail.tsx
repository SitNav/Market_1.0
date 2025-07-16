import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { 
  MessageSquare, 
  MapPin, 
  Calendar, 
  Eye, 
  Heart, 
  Share2, 
  Flag,
  CheckCircle,
  Edit,
  Trash2
} from "lucide-react";
import { format } from "date-fns";
import UserAvatar from "@/components/user-avatar";
import type { ListingWithDetails, Message } from "@shared/schema";

export default function ListingDetail() {
  const { id } = useParams();
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [message, setMessage] = useState("");
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const { data: listing, isLoading } = useQuery<ListingWithDetails>({
    queryKey: ["/api/listings", id],
    queryFn: async () => {
      const response = await fetch(`/api/listings/${id}`);
      if (!response.ok) {
        throw new Error("Listing not found");
      }
      return response.json();
    },
    enabled: !!id,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      return apiRequest("POST", "/api/messages", {
        receiverId: listing?.userId,
        listingId: parseInt(id!),
        content,
      });
    },
    onSuccess: () => {
      toast({
        title: "Message sent",
        description: "Your message has been sent to the seller.",
      });
      setMessage("");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const reportMutation = useMutation({
    mutationFn: async (reason: string) => {
      return apiRequest("POST", "/api/reports", {
        listingId: parseInt(id!),
        reason,
        description: "Reported from listing detail page",
      });
    },
    onSuccess: () => {
      toast({
        title: "Report submitted",
        description: "Thank you for reporting this listing. We'll review it shortly.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      return apiRequest("DELETE", `/api/listings/${id}`);
    },
    onSuccess: () => {
      toast({
        title: "Listing deleted",
        description: "Your listing has been deleted successfully.",
      });
      navigate("/marketplace");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSendMessage = () => {
    if (!message.trim()) return;
    sendMessageMutation.mutate(message);
  };

  const handleReport = () => {
    reportMutation.mutate("inappropriate_content");
  };

  const handleDelete = () => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      deleteMutation.mutate();
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({
      title: "Link copied",
      description: "Listing link has been copied to your clipboard.",
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-gray flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-warm-gray flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <h2 className="text-2xl font-bold text-primary mb-2">Listing Not Found</h2>
              <p className="text-neutral-gray mb-4">The listing you're looking for doesn't exist or has been removed.</p>
              <Button onClick={() => navigate("/marketplace")}>Back to Marketplace</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  const isOwner = user?.id === listing.userId;
  const canMessage = user && !isOwner;

  return (
    <div className="min-h-screen bg-warm-gray py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            <Card>
              <CardContent className="p-0">
                {/* Image Gallery */}
                {listing.images && listing.images.length > 0 ? (
                  <div className="relative">
                    <img
                      src={listing.images[currentImageIndex]}
                      alt={listing.title}
                      className="w-full h-64 md:h-96 object-cover rounded-t-lg"
                    />
                    {listing.images.length > 1 && (
                      <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                        {listing.images.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndex(index)}
                            className={`w-3 h-3 rounded-full ${
                              index === currentImageIndex ? "bg-white" : "bg-white/50"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="w-full h-64 md:h-96 bg-gray-200 rounded-t-lg flex items-center justify-center">
                    <span className="text-gray-500">No image available</span>
                  </div>
                )}

                <div className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold text-primary mb-2">
                        {listing.title}
                      </h1>
                      <div className="flex items-center space-x-4 text-sm text-neutral-gray">
                        <div className="flex items-center space-x-1">
                          <Eye className="h-4 w-4" />
                          <span>{listing.viewCount} views</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <Calendar className="h-4 w-4" />
                          <span>{format(new Date(listing.createdAt), "MMM d, yyyy")}</span>
                        </div>
                        {listing.location && (
                          <div className="flex items-center space-x-1">
                            <MapPin className="h-4 w-4" />
                            <span>{listing.location}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Badge variant="secondary">{listing.category.name}</Badge>
                      {listing.isPromoted && (
                        <Badge variant="default">Featured</Badge>
                      )}
                    </div>
                  </div>

                  {/* Price */}
                  <div className="mb-6">
                    {listing.priceType === "free" ? (
                      <span className="text-2xl font-bold text-green-600">Free</span>
                    ) : (
                      <div className="flex items-center space-x-2">
                        <span className="text-2xl font-bold text-primary">
                          ${listing.price}
                        </span>
                        {listing.priceType === "negotiable" && (
                          <Badge variant="outline">Negotiable</Badge>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  <div className="prose max-w-none">
                    <h3 className="text-lg font-semibold text-primary mb-3">Description</h3>
                    <p className="text-neutral-gray whitespace-pre-wrap">
                      {listing.description}
                    </p>
                  </div>

                  {/* Action Buttons */}
                  <div className="mt-6 flex flex-wrap gap-2">
                    <Button variant="outline" onClick={handleShare}>
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                    {!isOwner && (
                      <Button variant="outline" onClick={handleReport}>
                        <Flag className="h-4 w-4 mr-2" />
                        Report
                      </Button>
                    )}
                    {isOwner && (
                      <>
                        <Button variant="outline" onClick={() => navigate(`/edit-listing/${listing.id}`)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button variant="destructive" onClick={handleDelete}>
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Seller Information */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Seller Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center space-x-3 mb-4">
                  <UserAvatar user={listing.user} />
                  <div>
                    <h4 className="font-semibold text-primary">
                      {listing.user.firstName} {listing.user.lastName}
                    </h4>
                    <div className="flex items-center space-x-2">
                      {listing.user.isVerified && (
                        <div className="flex items-center space-x-1 text-green-600">
                          <CheckCircle className="h-4 w-4" />
                          <span className="text-sm">Verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                
                <p className="text-sm text-neutral-gray mb-4">
                  Member since {format(new Date(listing.user.createdAt), "MMM yyyy")}
                </p>
              </CardContent>
            </Card>

            {/* Contact */}
            {canMessage && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Seller</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <Textarea
                      placeholder="Hi! I'm interested in your listing..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      rows={3}
                    />
                    <Button
                      onClick={handleSendMessage}
                      disabled={!message.trim() || sendMessageMutation.isPending}
                      className="w-full bg-primary hover:bg-primary/90"
                    >
                      <MessageSquare className="h-4 w-4 mr-2" />
                      {sendMessageMutation.isPending ? "Sending..." : "Send Message"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Safety Tips */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Safety Tips</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-neutral-gray">
                  <li>• Meet in a public place</li>
                  <li>• Bring a friend if possible</li>
                  <li>• Verify the item before payment</li>
                  <li>• Trust your instincts</li>
                  <li>• Report suspicious activity</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
