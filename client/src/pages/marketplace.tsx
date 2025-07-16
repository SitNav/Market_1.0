import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import { apiRequest } from "@/lib/queryClient";
import type { ListingWithDetails, Category } from "@shared/schema";

export default function Marketplace() {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [priceRange, setPriceRange] = useState<{ min: string; max: string }>({ min: "", max: "" });
  const [condition, setCondition] = useState<string>("");
  const [activeTab, setActiveTab] = useState("all");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: listings = [], isLoading } = useQuery<ListingWithDetails[]>({
    queryKey: ["/api/listings", { search, categoryId: selectedCategory, sortBy, priceRange, condition }],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (selectedCategory) params.append("categoryId", selectedCategory);
      if (priceRange.min) params.append("minPrice", priceRange.min);
      if (priceRange.max) params.append("maxPrice", priceRange.max);
      if (condition) params.append("condition", condition);
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
      const matchesCondition = !condition || listing.condition === condition;
      
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
      {/* Enhanced Header */}
      <section className="bg-white shadow-sm py-6 border-b">
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
                    <SelectItem value="">All Categories</SelectItem>
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
                    <SelectItem value="">Any Condition</SelectItem>
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
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
