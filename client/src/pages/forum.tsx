import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { 
  Plus, 
  MessageSquare, 
  Eye, 
  Calendar, 
  Users, 
  TrendingUp, 
  ArrowUp, 
  ArrowDown, 
  Share2, 
  Bookmark, 
  MoreHorizontal,
  Image as ImageIcon,
  Star,
  ThumbsUp,
  ThumbsDown,
  Filter,
  Search,
  Hash,
  Flame,
  Clock
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import UserAvatar from "@/components/user-avatar";
import StarRating from "@/components/star-rating";
import type { ForumPostWithDetails, Category } from "@shared/schema";

const createForumPostSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  content: z.string().min(1, "Content is required").max(5000, "Content must be less than 5000 characters"),
  categoryId: z.number().min(1, "Category is required"),
  productRating: z.number().min(1).max(5).optional(),
  productImage: z.string().optional(),
});

type CreateForumPostData = z.infer<typeof createForumPostSchema>;

export default function Forum() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("hot");
  const [searchQuery, setSearchQuery] = useState("");
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const { data: forumPosts = [], isLoading } = useQuery<ForumPostWithDetails[]>({
    queryKey: ["/api/forum/posts", selectedCategory],
    queryFn: async () => {
      const categoryParam = selectedCategory === "all" ? "" : `?categoryId=${selectedCategory}`;
      const response = await apiRequest("GET", `/api/forum/posts${categoryParam}`);
      return Array.isArray(response) ? response : [];
    },
  });

  const form = useForm<CreateForumPostData>({
    resolver: zodResolver(createForumPostSchema),
    defaultValues: {
      title: "",
      content: "",
      categoryId: 1,
      productRating: undefined,
      productImage: "",
    },
  });

  const createPostMutation = useMutation({
    mutationFn: async (data: CreateForumPostData) => {
      return apiRequest("POST", "/api/forum/posts", data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Forum post created successfully",
      });
      setIsCreateDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/forum/posts"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create forum post",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateForumPostData) => {
    createPostMutation.mutate(data);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-primary/10 p-3 rounded-full">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                  TerraNav Community
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Share resources, reviews, and connect with the community
                </p>
              </div>
            </div>
            
            {isAuthenticated && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-primary hover:bg-primary/90">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Post
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Create New Post</DialogTitle>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="title"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Title</FormLabel>
                            <FormControl>
                              <Input placeholder="What's on your mind?" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="categoryId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Category</FormLabel>
                            <Select onValueChange={(value) => field.onChange(parseInt(value))}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Choose a category" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {categories.map((category) => (
                                  <SelectItem key={category.id} value={category.id.toString()}>
                                    {category.name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="content"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Content</FormLabel>
                            <FormControl>
                              <Textarea
                                placeholder="Share your thoughts, ask questions, or review a resource..."
                                className="min-h-[150px]"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="productRating"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product/Service Rating (Optional)</FormLabel>
                            <FormControl>
                              <StarRating
                                rating={field.value || 0}
                                onRatingChange={field.onChange}
                                size="md"
                                showValue
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="productImage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Product Image URL (Optional)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="https://example.com/image.jpg" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <div className="flex justify-end space-x-2">
                        <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button type="submit" disabled={createPostMutation.isPending}>
                          {createPostMutation.isPending ? "Posting..." : "Post"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="space-y-4">
              {/* Search */}
              <Card>
                <CardContent className="p-4">
                  <div className="relative">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Search posts..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Categories */}
              <div className="mb-6">
                <div className="flex flex-wrap gap-2">
                  <Button
                    variant={selectedCategory === "all" ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory("all")}
                  >
                    All Posts
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id.toString() ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(category.id.toString())}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Quick Stats */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Community Stats</CardTitle>
                </CardHeader>
                <CardContent className="p-4 pt-0">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <MessageSquare className="w-4 h-4 text-blue-500" />
                        <span className="text-sm">Total Posts</span>
                      </div>
                      <span className="font-semibold">{forumPosts.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Users className="w-4 h-4 text-green-500" />
                        <span className="text-sm">Categories</span>
                      </div>
                      <span className="font-semibold">{categories.length}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Flame className="w-4 h-4 text-red-500" />
                        <span className="text-sm">Active Today</span>
                      </div>
                      <span className="font-semibold">
                        {forumPosts.filter(post => 
                          new Date(post.createdAt) > new Date(Date.now() - 24 * 60 * 60 * 1000)
                        ).length}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Sort Controls */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm text-gray-500">Sort by:</span>
                <div className="flex space-x-1">
                  <Button
                    variant={sortBy === "hot" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSortBy("hot")}
                  >
                    <Flame className="w-4 h-4 mr-1" />
                    Hot
                  </Button>
                  <Button
                    variant={sortBy === "new" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSortBy("new")}
                  >
                    <Clock className="w-4 h-4 mr-1" />
                    New
                  </Button>
                  <Button
                    variant={sortBy === "top" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setSortBy("top")}
                  >
                    <TrendingUp className="w-4 h-4 mr-1" />
                    Top
                  </Button>
                </div>
              </div>
            </div>

            {/* Forum Posts */}
            <div className="space-y-3">
              {isLoading ? (
                <div className="animate-pulse space-y-3">
                  {[...Array(5)].map((_, i) => (
                    <Card key={i}>
                      <CardContent className="p-4">
                        <div className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : forumPosts.length === 0 ? (
                <Card>
                  <CardContent className="p-12 text-center">
                    <MessageSquare className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-500 dark:text-gray-400 mb-4">
                      No posts yet. Be the first to start a discussion!
                    </p>
                    {isAuthenticated && (
                      <Button onClick={() => setIsCreateDialogOpen(true)}>
                        <Plus className="w-4 h-4 mr-2" />
                        Create First Post
                      </Button>
                    )}
                  </CardContent>
                </Card>
              ) : (
                forumPosts
                  .filter(post => 
                    searchQuery === "" || 
                    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                    post.content.toLowerCase().includes(searchQuery.toLowerCase())
                  )
                  .map((post) => (
                    <Card key={post.id} className="hover:shadow-md transition-shadow bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700">
                      <CardContent className="p-0">
                        <div className="flex">
                          {/* Vote Section */}
                          <div className="flex flex-col items-center p-4 bg-gray-50 dark:bg-gray-700 border-r border-gray-200 dark:border-gray-600">
                            <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                              <ArrowUp className="w-5 h-5 text-gray-500 hover:text-orange-500" />
                            </button>
                            <span className="text-sm font-semibold text-gray-700 dark:text-gray-300 my-1">
                              {Math.floor(Math.random() * 100) + 1}
                            </span>
                            <button className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                              <ArrowDown className="w-5 h-5 text-gray-500 hover:text-blue-500" />
                            </button>
                          </div>

                          {/* Content Section */}
                          <div className="flex-1 p-4">
                            <div className="flex items-center space-x-2 mb-2">
                              <div className="flex items-center space-x-1">
                                <Hash className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-500">
                                  {post.category?.name || "General"}
                                </span>
                              </div>
                              <span className="text-gray-400">•</span>
                              <span className="text-sm text-gray-500">
                                Posted by u/{post.user.firstName}{post.user.lastName}
                              </span>
                              <span className="text-gray-400">•</span>
                              <span className="text-sm text-gray-500">
                                {formatDistanceToNow(new Date(post.createdAt))} ago
                              </span>
                            </div>

                            <Link href={`/forum/${post.id}`}>
                              <h3 className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600 dark:hover:text-blue-400 cursor-pointer mb-2">
                                {post.title}
                              </h3>
                            </Link>

                            <p className="text-gray-600 dark:text-gray-400 mb-3 line-clamp-3">
                              {post.content}
                            </p>

                            {/* Product Rating if exists */}
                            {(post as any).productRating && (
                              <div className="flex items-center space-x-2 mb-3">
                                <span className="text-sm text-gray-500">Product Rating:</span>
                                <StarRating rating={(post as any).productRating} readonly size="sm" />
                              </div>
                            )}

                            {/* Product Image if exists */}
                            {(post as any).productImage && (
                              <div className="mb-3">
                                <img 
                                  src={(post as any).productImage} 
                                  alt="Product" 
                                  className="max-w-xs rounded-lg shadow-sm"
                                />
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex items-center space-x-4 text-sm text-gray-500">
                              <Link href={`/forum/${post.id}`}>
                                <button className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                                  <MessageSquare className="w-4 h-4" />
                                  <span>{post.commentCount || 0} comments</span>
                                </button>
                              </Link>
                              
                              <button className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                                <Share2 className="w-4 h-4" />
                                <span>Share</span>
                              </button>
                              
                              <button className="flex items-center space-x-1 hover:text-gray-700 dark:hover:text-gray-300 transition-colors">
                                <Bookmark className="w-4 h-4" />
                                <span>Save</span>
                              </button>
                              
                              <div className="flex items-center space-x-1">
                                <Eye className="w-4 h-4" />
                                <span>{post.viewCount} views</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}