import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Star, Plus, Trash2, Edit } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import StarRating from "@/components/star-rating";
import type { ReviewWithDetails } from "@shared/schema";

const createReviewSchema = z.object({
  rating: z.number().min(1, "Rating is required").max(5, "Rating must be between 1 and 5"),
  comment: z.string().min(1, "Comment is required").max(1000, "Comment must be less than 1000 characters"),
});

type CreateReviewData = z.infer<typeof createReviewSchema>;

interface ReviewsSectionProps {
  listingId: number;
  reviewedUserId: string;
  title?: string;
}

export default function ReviewsSection({ listingId, reviewedUserId, title = "Reviews" }: ReviewsSectionProps) {
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);
  const [editingReview, setEditingReview] = useState<ReviewWithDetails | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: reviews = [], isLoading } = useQuery({
    queryKey: ["/api/reviews", "listing", listingId],
    queryFn: () => apiRequest("GET", `/api/reviews?listingId=${listingId}`),
  });

  const { data: userRating } = useQuery({
    queryKey: ["/api/users", reviewedUserId, "rating"],
    queryFn: () => apiRequest("GET", `/api/users/${reviewedUserId}/rating`),
  });

  const form = useForm<CreateReviewData>({
    resolver: zodResolver(createReviewSchema),
    defaultValues: {
      rating: 5,
      comment: "",
    },
  });

  const createReviewMutation = useMutation({
    mutationFn: async (data: CreateReviewData) => {
      return apiRequest("POST", "/api/reviews", {
        ...data,
        listingId,
        reviewedUserId,
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Review added successfully",
      });
      setIsReviewDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/reviews", "listing", listingId] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", reviewedUserId, "rating"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add review",
        variant: "destructive",
      });
    },
  });

  const updateReviewMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: CreateReviewData }) => {
      return apiRequest("PUT", `/api/reviews/${id}`, data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Review updated successfully",
      });
      setEditingReview(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/reviews", "listing", listingId] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", reviewedUserId, "rating"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to update review",
        variant: "destructive",
      });
    },
  });

  const deleteReviewMutation = useMutation({
    mutationFn: async (reviewId: number) => {
      return apiRequest("DELETE", `/api/reviews/${reviewId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Review deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reviews", "listing", listingId] });
      queryClient.invalidateQueries({ queryKey: ["/api/users", reviewedUserId, "rating"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete review",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateReviewData) => {
    if (editingReview) {
      updateReviewMutation.mutate({ id: editingReview.id, data });
    } else {
      createReviewMutation.mutate(data);
    }
  };

  const handleEditReview = (review: ReviewWithDetails) => {
    setEditingReview(review);
    form.setValue("rating", review.rating);
    form.setValue("comment", review.comment || "");
    setIsReviewDialogOpen(true);
  };

  const handleDeleteReview = (reviewId: number) => {
    if (window.confirm("Are you sure you want to delete this review?")) {
      deleteReviewMutation.mutate(reviewId);
    }
  };

  const handleCloseDialog = () => {
    setIsReviewDialogOpen(false);
    setEditingReview(null);
    form.reset();
  };

  // Check if current user has already reviewed this listing
  const userHasReviewed = reviews.some((review: ReviewWithDetails) => review.reviewerId === user?.id);
  const canReview = isAuthenticated && user?.id !== reviewedUserId && !userHasReviewed;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <Star className="w-5 h-5" />
            <span>{title} ({reviews.length})</span>
          </CardTitle>
          
          {canReview && (
            <Dialog open={isReviewDialogOpen} onOpenChange={setIsReviewDialogOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Review
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>
                    {editingReview ? "Edit Review" : "Add Review"}
                  </DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="rating"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Rating</FormLabel>
                          <FormControl>
                            <StarRating
                              rating={field.value}
                              onRatingChange={field.onChange}
                              size="lg"
                              showValue
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="comment"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Comment</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Share your experience..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={handleCloseDialog}>
                        Cancel
                      </Button>
                      <Button type="submit" disabled={createReviewMutation.isPending || updateReviewMutation.isPending}>
                        {(createReviewMutation.isPending || updateReviewMutation.isPending) 
                          ? "Saving..." 
                          : editingReview ? "Update Review" : "Add Review"}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        {/* User Rating Summary */}
        {userRating && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <StarRating rating={userRating.averageRating} readonly size="sm" />
                  <span className="text-sm font-medium">
                    {userRating.averageRating.toFixed(1)} / 5.0
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Based on {userRating.totalReviews} reviews
                </p>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {userRating.totalPoints} points
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Max: 785 points
                </p>
              </div>
            </div>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No reviews yet. Be the first to share your experience!
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map((review: ReviewWithDetails) => (
              <div key={review.id} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-b-0">
                <div className="flex items-start space-x-3">
                  <Avatar className="w-10 h-10">
                    <AvatarImage src={review.reviewer.profileImageUrl || undefined} />
                    <AvatarFallback>
                      {review.reviewer.firstName?.[0]}{review.reviewer.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <div className="flex items-center space-x-2 mb-1">
                          <span className="font-medium">
                            {review.reviewer.firstName} {review.reviewer.lastName}
                          </span>
                          <StarRating rating={review.rating} readonly size="sm" />
                        </div>
                        <span className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDistanceToNow(new Date(review.createdAt))} ago
                        </span>
                      </div>
                      
                      {user?.id === review.reviewerId && (
                        <div className="flex space-x-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditReview(review)}
                          >
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteReview(review.id)}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
                    
                    {review.comment && (
                      <p className="text-gray-700 dark:text-gray-300">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}