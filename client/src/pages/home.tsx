import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Plus, TrendingUp, Users, MessageSquare, Search } from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import ListingCard from "@/components/listing-card";
import CategoryCard from "@/components/category-card";
import SearchBar from "@/components/search-bar";
import type { ListingWithDetails, Category } from "@shared/schema";

export default function Home() {
  const { user } = useAuth();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: featuredListings = [] } = useQuery<ListingWithDetails[]>({
    queryKey: ["/api/listings"],
    queryFn: async () => {
      const response = await fetch("/api/listings?limit=8");
      return response.json();
    },
  });

  const { data: userListings = [] } = useQuery<ListingWithDetails[]>({
    queryKey: ["/api/listings", "user", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/listings?userId=${user?.id}&limit=4`);
      return response.json();
    },
    enabled: !!user?.id,
  });

  return (
    <div className="min-h-screen bg-warm-gray">
      {/* Hero Section */}
      <section className="terra-gradient text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">
              Welcome back, {user?.firstName || "Friend"}!
            </h1>
            <p className="text-lg mb-6 text-gray-100">
              Continue helping others and finding what you need to move forward.
            </p>
            
            <SearchBar />
            
            <div className="mt-6 flex justify-center space-x-4">
              <Link href="/create-listing">
                <Button size="lg" className="bg-secondary hover:bg-secondary/90">
                  <Plus className="h-4 w-4 mr-2" />
                  List an Item
                </Button>
              </Link>
              <Link href="/marketplace">
                <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-primary">
                  <Search className="h-4 w-4 mr-2" />
                  Browse Marketplace
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-gray">Your Listings</p>
                  <p className="text-2xl font-bold text-primary">{userListings.length}</p>
                </div>
                <TrendingUp className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-gray">Total Categories</p>
                  <p className="text-2xl font-bold text-primary">{categories.length}</p>
                </div>
                <Users className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-gray">Available Items</p>
                  <p className="text-2xl font-bold text-primary">{featuredListings.length}</p>
                </div>
                <MessageSquare className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Categories */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-primary">Browse by Category</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {categories.map((category) => (
                <CategoryCard key={category.id} category={category} />
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Your Recent Listings */}
        {userListings.length > 0 && (
          <Card className="mb-8">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-primary">Your Recent Listings</CardTitle>
              <Link href="/profile">
                <Button variant="outline" size="sm">View All</Button>
              </Link>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {userListings.map((listing) => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Featured Listings */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-primary">Featured Listings</CardTitle>
            <Link href="/marketplace">
              <Button variant="outline" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredListings.map((listing) => (
                <ListingCard key={listing.id} listing={listing} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
