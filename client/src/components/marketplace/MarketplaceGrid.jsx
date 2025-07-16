import { useState, useEffect } from 'react';
import { useListings, useCategories, useSearchListings } from '@/lib/amplify-react-query';
import { useAuth } from '@/components/auth/AuthProvider';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Filter, MapPin, Eye, Clock, Grid, List, Heart, ShoppingCart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useMobile } from '@/hooks/use-mobile';
import { useAddToCart, useAddToWishlist } from '@/lib/amplify-react-query';

const MarketplaceGrid = () => {
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const isMobile = useMobile();
  
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [sortBy, setSortBy] = useState('newest');
  const [viewMode, setViewMode] = useState('grid');
  const [filters, setFilters] = useState({
    minPrice: '',
    maxPrice: '',
    condition: '',
    location: '',
  });
  
  const [searchFilters, setSearchFilters] = useState(null);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Update search filters when inputs change
  useEffect(() => {
    if (debouncedSearchTerm || selectedCategory || filters.minPrice || filters.maxPrice || filters.condition || filters.location) {
      setSearchFilters({
        searchTerm: debouncedSearchTerm || undefined,
        categoryId: selectedCategory || undefined,
        minPrice: filters.minPrice ? parseFloat(filters.minPrice) : undefined,
        maxPrice: filters.maxPrice ? parseFloat(filters.maxPrice) : undefined,
        condition: filters.condition || undefined,
        city: filters.location || undefined,
        limit: 20,
      });
    } else {
      setSearchFilters(null);
    }
  }, [debouncedSearchTerm, selectedCategory, filters]);

  // Fetch data
  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: listings, isLoading: listingsLoading, error: listingsError } = useListings(
    { status: { eq: 'active' } },
    20
  );
  const { data: searchResults, isLoading: searchLoading } = useSearchListings(
    searchFilters,
    !!searchFilters
  );

  // Mutations
  const addToCartMutation = useAddToCart();
  const addToWishlistMutation = useAddToWishlist();

  const displayListings = searchFilters ? searchResults?.items : listings?.items;
  const isLoading = searchFilters ? searchLoading : listingsLoading;

  const handleAddToCart = async (listingId) => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your cart",
        variant: "destructive",
      });
      return;
    }

    try {
      await addToCartMutation.mutateAsync({
        userId: user.sub,
        listingId,
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

  const handleAddToWishlist = async (listingId) => {
    if (!isAuthenticated) {
      toast({
        title: "Sign in required",
        description: "Please sign in to add items to your wishlist",
        variant: "destructive",
      });
      return;
    }

    try {
      await addToWishlistMutation.mutateAsync({
        userId: user.sub,
        listingId,
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

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('');
    setFilters({
      minPrice: '',
      maxPrice: '',
      condition: '',
      location: '',
    });
  };

  if (listingsError) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">Error loading listings. Please try again.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="space-y-4">
            {/* Search Bar */}
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search listings..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Categories</SelectItem>
                  {categories?.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name} ({category.count})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Min Price"
                type="number"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              />

              <Input
                placeholder="Max Price"
                type="number"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              />

              <Select value={filters.condition} onValueChange={(value) => handleFilterChange('condition', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Condition" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Any Condition</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="like-new">Like New</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                </SelectContent>
              </Select>

              <Input
                placeholder="Location"
                value={filters.location}
                onChange={(e) => handleFilterChange('location', e.target.value)}
              />
            </div>

            {/* Controls */}
            <div className="flex justify-between items-center">
              <Button variant="outline" onClick={clearFilters}>
                Clear Filters
              </Button>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardContent className="p-4">
                <div className="bg-gray-200 h-48 rounded mb-4"></div>
                <div className="bg-gray-200 h-4 rounded mb-2"></div>
                <div className="bg-gray-200 h-4 rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : displayListings?.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-500">No listings found matching your criteria.</p>
        </div>
      ) : (
        <div className={`grid gap-4 ${
          viewMode === 'grid' 
            ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4' 
            : 'grid-cols-1'
        }`}>
          {displayListings?.map((listing) => (
            <Card key={listing.id} className="hover:shadow-lg transition-shadow">
              <CardContent className="p-4">
                {/* Image */}
                <div className="relative mb-4">
                  <img
                    src={listing.images?.[0] || '/placeholder-image.jpg'}
                    alt={listing.title}
                    className="w-full h-48 object-cover rounded"
                  />
                  <div className="absolute top-2 right-2 flex space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAddToWishlist(listing.id)}
                      className="bg-white/90 hover:bg-white"
                    >
                      <Heart className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Content */}
                <div className="space-y-2">
                  <h3 className="font-semibold text-lg truncate">{listing.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">{listing.description}</p>
                  
                  <div className="flex items-center justify-between">
                    <span className="text-xl font-bold text-green-600">
                      ${listing.price}
                    </span>
                    <Badge variant="secondary">{listing.condition}</Badge>
                  </div>

                  <div className="flex items-center text-sm text-gray-500">
                    <MapPin className="h-4 w-4 mr-1" />
                    {listing.location || listing.city}
                  </div>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <span>By {listing.user?.firstName} {listing.user?.lastName}</span>
                    <div className="flex items-center">
                      <Eye className="h-4 w-4 mr-1" />
                      {listing.viewCount}
                    </div>
                  </div>

                  <div className="flex space-x-2 mt-4">
                    <Button
                      size="sm"
                      onClick={() => handleAddToCart(listing.id)}
                      className="flex-1"
                    >
                      <ShoppingCart className="h-4 w-4 mr-1" />
                      Add to Cart
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.location.href = `/listing/${listing.id}`}
                    >
                      View Details
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default MarketplaceGrid;