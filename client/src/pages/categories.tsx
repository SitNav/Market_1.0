import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Grid3X3, Users, ShoppingBag } from "lucide-react";
import { Link } from "wouter";
import type { Category } from "@shared/schema";

export default function Categories() {
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: listings } = useQuery({
    queryKey: ["/api/listings"],
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Categories
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Browse resources and services by category
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories?.map((category) => {
            const categoryListings = listings?.filter(
              (listing: any) => listing.category?.id === category.id
            );
            
            return (
              <Link key={category.id} href={`/marketplace?category=${category.id}`}>
                <Card className="hover:shadow-lg transition-shadow cursor-pointer border-l-4 border-l-primary">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg text-gray-900 dark:text-white">
                        {category.name}
                      </CardTitle>
                      <Grid3X3 className="h-6 w-6 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <ShoppingBag className="h-4 w-4 text-gray-500" />
                        <span className="text-sm text-gray-600 dark:text-gray-300">
                          {categoryListings?.length || 0} listings
                        </span>
                      </div>
                      <Badge variant="secondary" className="bg-primary/10 text-primary">
                        View All
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}