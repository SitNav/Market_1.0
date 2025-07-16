import { useState } from 'react';
import { useListing, useAddComment, useAddToCart, useAddToWishlist } from '@/lib/amplify-react-query';
import { useAuth } from '@/components/auth/AuthProvider';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { MapPin, Eye, Calendar, User, Heart, ShoppingCart, MessageCircle, Star } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { formatDistanceToNow } from 'date-fns';

export default function ListingDetailAmplify({ listingId }) {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [newComment, setNewComment] = useState('');
  const [selectedImage, setSelectedImage] = useState(0);

  // Fetch listing data
  const { data: listing, isLoading, error } = useListing(listingId);

  // Mutations
  const addCommentMutation = useAddComment();
  const addToCartMutation = useAddToCart();
  const addToWishlistMutation = useAddToWishlist();

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add comments",
        variant: "destructive",
      });
      return;
    }

    if (!newComment.trim()) return;

    try {
      await addCommentMutation.mutateAsync({
        content: newComment,
        listingId: listingId,
        userId: user.sub,
      });
      setNewComment('');
      toast({
        title: "Comment added",
        description: "Your comment has been posted successfully",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add comment",
        variant: "destructive",
      });
    }
  };

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to cart",
        variant: "destructive",
      });
      return;
    }

    try {
      await addToCartMutation.mutateAsync({
        userId: user.sub,
        listingId: listingId,
        quantity: 1,
      });
      toast({
        title: "Added to cart",
        description: "Item successfully added to your cart",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to cart",
        variant: "destructive",
      });
    }
  };

  const handleAddToWishlist = async () => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to wishlist",
        variant: "destructive",
      });
      return;
    }

    try {
      await addToWishlistMutation.mutateAsync({
        userId: user.sub,
        listingId: listingId,
      });
      toast({
        title: "Added to wishlist",
        description: "Item successfully added to your wishlist",
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add item to wishlist",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="h-64 bg-gray-200 rounded"></div>
              <div className="flex space-x-2">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-16 w-16 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-6 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-red-600">Error loading listing. Please try again.</p>
        </div>
      </div>
    );
  }

  if (!listing) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <p className="text-gray-500">Listing not found.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Images */}
        <div className="space-y-4">
          <div className="aspect-square bg-gray-100 rounded-lg overflow-hidden">
            <img
              src={listing.images?.[selectedImage] || '/placeholder-image.jpg'}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          </div>
          {listing.images?.length > 1 && (
            <div className="flex space-x-2">
              {listing.images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`w-16 h-16 rounded-md overflow-hidden border-2 ${
                    selectedImage === index ? 'border-primary' : 'border-gray-200'
                  }`}
                >
                  <img
                    src={image}
                    alt={`${listing.title} ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
            <div className="flex items-center space-x-4 text-gray-600 mb-4">
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1" />
                {listing.location || `${listing.city}, ${listing.state}`}
              </div>
              <div className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                {listing.viewCount} views
              </div>
              <div className="flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {formatDistanceToNow(new Date(listing.createdAt), { addSuffix: true })}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-3xl font-bold text-green-600">
              ${listing.price}
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="secondary">{listing.condition}</Badge>
              <Badge variant="outline">{listing.category?.name}</Badge>
            </div>
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <Button 
              onClick={handleAddToCart}
              className="flex-1"
              disabled={addToCartMutation.isPending}
            >
              <ShoppingCart className="h-4 w-4 mr-2" />
              {addToCartMutation.isPending ? 'Adding...' : 'Add to Cart'}
            </Button>
            <Button 
              variant="outline"
              onClick={handleAddToWishlist}
              disabled={addToWishlistMutation.isPending}
            >
              <Heart className="h-4 w-4 mr-2" />
              {addToWishlistMutation.isPending ? 'Adding...' : 'Wishlist'}
            </Button>
          </div>

          {/* Description */}
          <Card>
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
            </CardContent>
          </Card>

          {/* Seller Info */}
          <Card>
            <CardHeader>
              <CardTitle>Seller Information</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-3">
                <Avatar>
                  <AvatarImage src={listing.user?.profileImageUrl} />
                  <AvatarFallback>
                    {listing.user?.firstName?.[0]}{listing.user?.lastName?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="font-semibold">
                    {listing.user?.firstName} {listing.user?.lastName}
                  </p>
                  <p className="text-sm text-gray-600">
                    Member since {formatDistanceToNow(new Date(listing.user?.createdAt), { addSuffix: true })}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Specifications */}
          {(listing.brand || listing.model || listing.size || listing.color) && (
            <Card>
              <CardHeader>
                <CardTitle>Specifications</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {listing.brand && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Brand:</span>
                      <span>{listing.brand}</span>
                    </div>
                  )}
                  {listing.model && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Model:</span>
                      <span>{listing.model}</span>
                    </div>
                  )}
                  {listing.size && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Size:</span>
                      <span>{listing.size}</span>
                    </div>
                  )}
                  {listing.color && (
                    <div className="flex justify-between">
                      <span className="text-gray-600">Color:</span>
                      <span>{listing.color}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      {/* Comments Section */}
      <div className="mt-12">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <MessageCircle className="h-5 w-5 mr-2" />
              Comments ({listing.comments?.items?.length || 0})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Add Comment Form */}
            {isAuthenticated ? (
              <form onSubmit={handleAddComment} className="mb-6">
                <Textarea
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  className="mb-3"
                  rows={3}
                />
                <Button 
                  type="submit" 
                  disabled={!newComment.trim() || addCommentMutation.isPending}
                >
                  {addCommentMutation.isPending ? 'Adding...' : 'Add Comment'}
                </Button>
              </form>
            ) : (
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-gray-600">Please sign in to add comments.</p>
              </div>
            )}

            {/* Comments List */}
            <div className="space-y-4">
              {listing.comments?.items?.map((comment) => (
                <div key={comment.id} className="flex space-x-3">
                  <Avatar>
                    <AvatarImage src={comment.user?.profileImageUrl} />
                    <AvatarFallback>
                      {comment.user?.firstName?.[0]}{comment.user?.lastName?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="font-semibold">
                        {comment.user?.firstName} {comment.user?.lastName}
                      </span>
                      <span className="text-sm text-gray-500">
                        {formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    <p className="text-gray-700">{comment.content}</p>
                  </div>
                </div>
              ))}
            </div>

            {(!listing.comments?.items || listing.comments.items.length === 0) && (
              <div className="text-center py-8 text-gray-500">
                <MessageCircle className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>No comments yet. Be the first to comment!</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}