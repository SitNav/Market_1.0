import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { 
  Search, 
  Filter, 
  Grid, 
  List, 
  ShoppingCart, 
  Heart, 
  Star, 
  TrendingUp, 
  Clock, 
  MapPin,
  Plus,
  SlidersHorizontal
} from "lucide-react";
import ProductCard from "@/components/product-card";
import CategoryCard from "@/components/category-card";
import MobileSearch from "@/components/mobile-search";
import MobileProductCard from "@/components/mobile-product-card";
import SEOHead from "@/components/seo-head";
import { apiRequest } from "@/lib/queryClient";
import type { ListingWithDetails, Category } from "@shared/schema";

export default function Marketplace() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: "", max: "" });
  const [condition, setCondition] = useState<string>("");
  const [brand, setBrand] = useState<string>("");
  const [model, setModel] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [color, setColor] = useState<string>("");
  const [location, setLocation] = useState<{
    city: string;
    state: string;
    zipCode: string;
    latitude: string;
    longitude: string;
    radius: string;
  }>({
    city: "",
    state: "",
    zipCode: "",
    latitude: "",
    longitude: "",
    radius: "25"
  });
  const [activeTab, setActiveTab] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: listings = [], isLoading } = useQuery<ListingWithDetails[]>({
    queryKey: ["/api/listings", { 
      search, 
      categoryId: selectedCategory, 
      sortBy, 
      priceRange, 
      condition, 
      brand, 
      model, 
      size, 
      color, 
      location 
    }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedCategory && selectedCategory !== "all") params.append("categoryId", selectedCategory);
      if (priceRange.min) params.append("minPrice", priceRange.min);
      if (priceRange.max) params.append("maxPrice", priceRange.max);
      if (condition && condition !== "any") params.append("condition", condition);
      if (brand) params.append("brand", brand);
      if (model) params.append("model", model);
      if (size && size !== "any") params.append("size", size);
      if (color) params.append("color", color);
      if (location.city) params.append("city", location.city);
      if (location.state) params.append("state", location.state);
      if (location.zipCode) params.append("zipCode", location.zipCode);
      if (location.latitude && location.longitude) {
        params.append("latitude", location.latitude);
        params.append("longitude", location.longitude);
        params.append("radius", location.radius);
      }
      params.append("sortBy", sortBy);
      params.append("limit", "50");
      
      const response = await fetch(`/api/listings?${params}`);
      return response.json();
    },
  });

  // Add to cart mutation
  const addToCartMutation = useMutation({
    mutationFn: async (listingId: number) => {
      return await apiRequest("POST", "/api/cart", { listingId, quantity: 1 });
    },
    onSuccess: () => {
      toast({
        title: "Added to cart",
        description: "Item has been added to your cart.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/cart"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to add item to cart.",
        variant: "destructive",
      });
    },
  });

  // Toggle wishlist mutation
  const toggleWishlistMutation = useMutation({
    mutationFn: async (listingId: number) => {
      return await apiRequest("POST", "/api/wishlist/toggle", { listingId });
    },
    onSuccess: () => {
      toast({
        title: "Wishlist updated",
        description: "Item has been updated in your wishlist.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/wishlist"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update wishlist.",
        variant: "destructive",
      });
    },
  });

  // Get cart items count
  const { data: cartCount = 0 } = useQuery<number>({
    queryKey: ["/api/cart/count"],
  });

  // Get wishlist items
  const { data: wishlistItems = [] } = useQuery<number[]>({
    queryKey: ["/api/wishlist"],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Search is handled by the query key change
  };

  // Get user's current location
  const getUserLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation(prev => ({
            ...prev,
            latitude: position.coords.latitude.toString(),
            longitude: position.coords.longitude.toString()
          }));
          toast({
            title: "Location updated",
            description: "Your location has been set for location-based search.",
          });
        },
        (error) => {
          toast({
            title: "Location access denied",
            description: "Please enable location access or enter your location manually.",
            variant: "destructive",
          });
        }
      );
    } else {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive",
      });
    }
  };

  const filteredListings = listings
    .filter(listing => {
      // Search filter
      const matchesSearch = search === "" || 
        listing.title.toLowerCase().includes(search.toLowerCase()) ||
        listing.description.toLowerCase().includes(search.toLowerCase()) ||
        listing.brand?.toLowerCase().includes(search.toLowerCase());
      
      // Tab filter
      const matchesTab = activeTab === "all" || 
        (activeTab === "featured" && listing.isFeatured) ||
        (activeTab === "free" && listing.priceType === "free") ||
        (activeTab === "deals" && listing.originalPrice && parseFloat(listing.originalPrice) > parseFloat(listing.price || "0"));
      
      // Price range filter
      const price = parseFloat(listing.price || "0");
      const matchesPrice = (!priceRange.min || price >= parseFloat(priceRange.min)) &&
                          (!priceRange.max || price <= parseFloat(priceRange.max));
      
      // Condition filter
      const matchesCondition = !condition || condition === "any" || listing.condition === condition;
      
      return matchesSearch && matchesTab && matchesPrice && matchesCondition;
    })
    .sort((a, b) => {
      switch (sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "price-low":
          return (parseFloat(a.price || "0") - parseFloat(b.price || "0"));
        case "price-high":
          return (parseFloat(b.price || "0") - parseFloat(a.price || "0"));
        case "popularity":
          return (b.viewCount || 0) - (a.viewCount || 0);
        case "rating":
          return (b.favoriteCount || 0) - (a.favoriteCount || 0);
        default:
          return 0;
      }
    });

  return (
    <div className="min-h-screen bg-gray-50">
      <SEOHead
        title="Marketplace - Buy & Sell Community Resources"
        description="Browse and purchase essential items including housing, food, clothing, and services from your local community. Find deals, search by location, and connect with sellers near you."
        keywords="marketplace, buy sell, community resources, local marketplace, housing for sale, food services, clothing deals, location-based shopping"
        canonical={window.location.href}
      />
      {/* Mobile Search Component */}
      <MobileSearch
        search={search}
        onSearchChange={setSearch}
        selectedCategory={selectedCategory}
        onCategoryChange={setSelectedCategory}
        priceRange={priceRange}
        onPriceRangeChange={setPriceRange}
        condition={condition}
        onConditionChange={setCondition}
        brand={brand}
        onBrandChange={setBrand}
        size={size}
        onSizeChange={setSize}
        color={color}
        onColorChange={setColor}
        location={location}
        onLocationChange={setLocation}
        categories={categories}
        onClearFilters={() => {
          setSearch("");
          setSelectedCategory("");
          setCondition("");
          setBrand("");
          setModel("");
          setSize("");
          setColor("");
          setPriceRange({ min: "", max: "" });
          setLocation({
            city: "",
            state: "",
            zipCode: "",
            latitude: "",
            longitude: "",
            radius: "25"
          });
        }}
        onGetLocation={getUserLocation}
      />

      {/* Desktop Header */}
      <section className="hidden md:block bg-white shadow-sm py-6 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="mb-4 md:mb-0">
              <h1 className="text-3xl font-bold text-primary">Marketplace</h1>
              <p className="text-gray-600">Discover amazing deals and essential items</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm">
                <Heart className="h-4 w-4 mr-2" />
                Wishlist
              </Button>
              <Button variant="outline" size="sm">
                <ShoppingCart className="h-4 w-4 mr-2" />
                Cart ({cartCount})
              </Button>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                Sell Item
              </Button>
              <Separator orientation="vertical" className="h-6" />
              <Button
                variant={viewMode === "grid" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("grid")}
              >
                <Grid className="h-4 w-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "default" : "outline"}
                size="sm"
                onClick={() => setViewMode("list")}
              >
                <List className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Enhanced Search and Filters */}
        <Card className="mb-8">
          <CardContent className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              {/* Main Search Bar */}
              <div className="flex flex-col md:flex-row gap-4">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Search for items, brands, or keywords..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 h-12 text-lg"
                  />
                </div>
                
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger className="w-full md:w-48 h-12">
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                
                <Button type="submit" className="h-12 px-8">
                  <Search className="h-4 w-4 mr-2" />
                  Search
                </Button>
                
                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                  className="h-12 px-4"
                >
                  <SlidersHorizontal className="h-4 w-4 mr-2" />
                  Advanced Filters
                </Button>
              </div>

              {/* Advanced Filters */}
              <div className="flex flex-wrap gap-4 pt-4 border-t">
                <div className="flex items-center space-x-2">
                  <label className="text-sm font-medium">Price Range:</label>
                  <Input
                    type="number"
                    placeholder="Min"
                    value={priceRange.min}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, min: e.target.value }))}
                    className="w-20"
                  />
                  <span className="text-gray-500">-</span>
                  <Input
                    type="number"
                    placeholder="Max"
                    value={priceRange.max}
                    onChange={(e) => setPriceRange(prev => ({ ...prev, max: e.target.value }))}
                    className="w-20"
                  />
                </div>

                <Select value={condition} onValueChange={setCondition}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Condition" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="any">Any Condition</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                    <SelectItem value="like_new">Like New</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-40">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="oldest">Oldest First</SelectItem>
                    <SelectItem value="price-low">Price: Low to High</SelectItem>
                    <SelectItem value="price-high">Price: High to Low</SelectItem>
                    <SelectItem value="popularity">Most Popular</SelectItem>
                    <SelectItem value="rating">Highest Rated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </form>
          </CardContent>
        </Card>

        {/* Advanced Filters Panel */}
        {showAdvancedFilters && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Advanced Filters</CardTitle>
              <CardDescription>
                Use detailed filters to find exactly what you're looking for
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Brand */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Brand</label>
                  <Input
                    placeholder="Enter brand name"
                    value={brand}
                    onChange={(e) => setBrand(e.target.value)}
                  />
                </div>

                {/* Model */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Model</label>
                  <Input
                    placeholder="Enter model"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                  />
                </div>

                {/* Size */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Size</label>
                  <Select value={size} onValueChange={setSize}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any size</SelectItem>
                      <SelectItem value="xs">XS</SelectItem>
                      <SelectItem value="s">S</SelectItem>
                      <SelectItem value="m">M</SelectItem>
                      <SelectItem value="l">L</SelectItem>
                      <SelectItem value="xl">XL</SelectItem>
                      <SelectItem value="xxl">XXL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Color */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Color</label>
                  <Input
                    placeholder="Enter color"
                    value={color}
                    onChange={(e) => setColor(e.target.value)}
                  />
                </div>
              </div>

              {/* Location Filters */}
              <div className="border-t pt-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-medium text-lg">Location-Based Search</h3>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={getUserLocation}
                  >
                    <MapPin className="h-4 w-4 mr-2" />
                    Use My Location
                  </Button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">City</label>
                    <Input
                      placeholder="Enter city"
                      value={location.city}
                      onChange={(e) => setLocation(prev => ({ ...prev, city: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">State</label>
                    <Input
                      placeholder="Enter state"
                      value={location.state}
                      onChange={(e) => setLocation(prev => ({ ...prev, state: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">ZIP Code</label>
                    <Input
                      placeholder="Enter ZIP"
                      value={location.zipCode}
                      onChange={(e) => setLocation(prev => ({ ...prev, zipCode: e.target.value }))}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Radius</label>
                    <Select value={location.radius} onValueChange={(value) => setLocation(prev => ({ ...prev, radius: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="5">5 miles</SelectItem>
                        <SelectItem value="10">10 miles</SelectItem>
                        <SelectItem value="25">25 miles</SelectItem>
                        <SelectItem value="50">50 miles</SelectItem>
                        <SelectItem value="100">100 miles</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* Filter Actions */}
              <div className="flex justify-end gap-4 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("");
                    setCondition("");
                    setBrand("");
                    setModel("");
                    setSize("");
                    setColor("");
                    setPriceRange({ min: "", max: "" });
                    setLocation({
                      city: "",
                      state: "",
                      zipCode: "",
                      latitude: "",
                      longitude: "",
                      radius: "25"
                    });
                  }}
                >
                  Clear All Filters
                </Button>
                <Button onClick={() => setShowAdvancedFilters(false)}>
                  Apply Filters
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Product Tabs */}
        <div className="mb-8">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="all" className="flex items-center">
                <TrendingUp className="w-4 h-4 mr-2" />
                All Items
              </TabsTrigger>
              <TabsTrigger value="featured" className="flex items-center">
                <Star className="w-4 h-4 mr-2" />
                Featured
              </TabsTrigger>
              <TabsTrigger value="deals" className="flex items-center">
                <Badge className="w-4 h-4 mr-2" />
                Deals
              </TabsTrigger>
              <TabsTrigger value="free" className="flex items-center">
                <Heart className="w-4 h-4 mr-2" />
                Free
              </TabsTrigger>
              <TabsTrigger value="new" className="flex items-center">
                <Clock className="w-4 h-4 mr-2" />
                New
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Categories */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-primary">Browse by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onClick={() => setSelectedCategory(category.id.toString())}
                  isSelected={selectedCategory === category.id.toString()}
                />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-primary">
              {filteredListings.length} Results
              {search && <span className="ml-2 text-sm text-gray-500">for "{search}"</span>}
            </CardTitle>
            <div className="flex items-center space-x-2">
              {selectedCategory && (
                <Badge variant="secondary" className="ml-2">
                  {categories.find(c => c.id.toString() === selectedCategory)?.name}
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedCategory("")}
                    className="ml-2 h-4 w-4 p-0"
                  >
                    ×
                  </Button>
                </Badge>
              )}
              {activeTab !== "all" && (
                <Badge variant="outline" className="capitalize">
                  {activeTab}
                </Badge>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
              </div>
            ) : filteredListings.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                  <Search className="w-10 h-10 text-gray-400" />
                </div>
                <p className="text-gray-900 text-lg font-medium">No items found</p>
                <p className="text-gray-500 mt-2">Try adjusting your search or browse different categories.</p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => {
                    setSearch("");
                    setSelectedCategory("");
                    setActiveTab("all");
                    setPriceRange({ min: "", max: "" });
                    setCondition("");
                  }}
                >
                  Clear all filters
                </Button>
              </div>
            ) : (
              <>
                {/* Mobile Grid */}
                <div className="md:hidden">
                <div className="grid grid-cols-2 gap-3">
                  {filteredListings.map((listing) => (
                    <MobileProductCard
                      key={listing.id}
                      listing={listing}
                      onAddToCart={(listingId) => addToCartMutation.mutate(listingId)}
                      onToggleWishlist={(listingId) => toggleWishlistMutation.mutate(listingId)}
                      isInWishlist={wishlistItems.includes(listing.id)}
                    />
                  ))}
                </div>
              </div>

              {/* Desktop Grid */}
              <div className="hidden md:block">
                <div className={`grid gap-6 ${
                  viewMode === "grid" 
                    ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
                    : "grid-cols-1"
                }`}>
                  {filteredListings.map((listing) => (
                    <ProductCard
                      key={listing.id}
                      listing={listing}
                      viewMode={viewMode}
                      onAddToCart={(listingId) => addToCartMutation.mutate(listingId)}
                      onToggleWishlist={(listingId) => toggleWishlistMutation.mutate(listingId)}
                      isInWishlist={wishlistItems.includes(listing.id)}
                    />
                  ))}
                </div>
              </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
