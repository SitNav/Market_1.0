import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  fetchListingsWithFilters, 
  fetchListingDetails, 
  fetchCategoriesWithCounts,
  searchListingsWithFilters,
  fetchUserMessages,
  fetchForumPosts
} from './amplify-queries';
import { 
  createListing, 
  updateListing, 
  deleteListing,
  sendMessage,
  addComment,
  createForumPost,
  updateUserProfile,
  createReview,
  addToCart,
  addToWishlist
} from './amplify-mutations';

// Custom hooks that integrate Amplify GraphQL with React Query
export const useListings = (filter = {}, limit = 20) => {
  return useQuery({
    queryKey: ['listings', filter, limit],
    queryFn: () => fetchListingsWithFilters(filter, limit),
    staleTime: 5 * 60 * 1000, // 5 minutes
    cacheTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useListing = (id) => {
  return useQuery({
    queryKey: ['listing', id],
    queryFn: () => fetchListingDetails(id),
    enabled: !!id,
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

export const useCategories = () => {
  return useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategoriesWithCounts,
    staleTime: 15 * 60 * 1000, // 15 minutes
    cacheTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useSearchListings = (searchFilters, enabled = true) => {
  return useQuery({
    queryKey: ['searchListings', searchFilters],
    queryFn: () => searchListingsWithFilters(searchFilters),
    enabled: enabled && !!searchFilters,
    staleTime: 2 * 60 * 1000, // 2 minutes
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUserMessages = (userId) => {
  return useQuery({
    queryKey: ['userMessages', userId],
    queryFn: () => fetchUserMessages(userId),
    enabled: !!userId,
    staleTime: 1 * 60 * 1000, // 1 minute
    cacheTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useForumPosts = (filter = {}, limit = 20) => {
  return useQuery({
    queryKey: ['forumPosts', filter, limit],
    queryFn: () => fetchForumPosts(filter, limit),
    staleTime: 5 * 60 * 1000,
    cacheTime: 10 * 60 * 1000,
  });
};

// Mutation hooks
export const useCreateListing = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useUpdateListing = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateListing,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['listing', data.id] });
    },
  });
};

export const useDeleteListing = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: deleteListing,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['listings'] });
      queryClient.invalidateQueries({ queryKey: ['categories'] });
    },
  });
};

export const useSendMessage = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: sendMessage,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['userMessages'] });
    },
  });
};

export const useAddComment = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: addComment,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['listing', data.listingId] });
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
    },
  });
};

export const useCreateForumPost = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createForumPost,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['forumPosts'] });
    },
  });
};

export const useUpdateUserProfile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: updateUserProfile,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['user', data.id] });
    },
  });
};

export const useCreateReview = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: createReview,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['listing', data.listingId] });
      queryClient.invalidateQueries({ queryKey: ['userReviews'] });
    },
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, listingId, quantity }) => addToCart(userId, listingId, quantity),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cartItems'] });
    },
  });
};

export const useAddToWishlist = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ userId, listingId }) => addToWishlist(userId, listingId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wishlistItems'] });
    },
  });
};