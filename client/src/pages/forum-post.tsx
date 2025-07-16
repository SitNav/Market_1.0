import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useParams, Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { ArrowLeft, MessageSquare, Eye, Calendar, Reply, Edit, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import UserAvatar from "@/components/user-avatar";
import CommentsSection from "@/components/comments-section";
import type { ForumPostWithDetails, CommentWithDetails } from "@shared/schema";

const createCommentSchema = z.object({
  content: z.string().min(1, "Comment content is required").max(2000, "Comment must be less than 2000 characters"),
});

type CreateCommentData = z.infer<typeof createCommentSchema>;

export default function ForumPost() {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: post, isLoading } = useQuery<ForumPostWithDetails>({
    queryKey: ["/api/forum-posts", id],
    queryFn: async () => {
      const response = await apiRequest("GET", `/api/forum-posts/${id}`);
      // Increment view count
      await apiRequest("POST", `/api/forum-posts/${id}/view`);
      return response;
    },
    enabled: !!id,
  });

  const form = useForm<CreateCommentData>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: {
      content: "",
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: async (data: CreateCommentData) => {
      return apiRequest("POST", "/api/comments", {
        ...data,
        forumPostId: parseInt(id!),
      });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
      form.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/comments", "forum-post", parseInt(id!)] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateCommentData) => {
    createCommentMutation.mutate(data);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-warm-gray">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="animate-pulse space-y-6">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4" />
              <Card>
                <CardHeader>
                  <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-3/4" />
                  <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2" />
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-5/6" />
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-4/6" />
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-warm-gray">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <Card>
              <CardContent className="p-12 text-center">
                <p className="text-gray-500 dark:text-gray-400">Forum post not found</p>
                <Link href="/forum">
                  <Button className="mt-4" variant="outline">
                    <ArrowLeft className="w-4 h-4 mr-2" />
                    Back to Forum
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-warm-gray">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Back Button */}
          <Link href="/forum">
            <Button variant="ghost" className="mb-6">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Forum
            </Button>
          </Link>

          {/* Forum Post */}
          <Card className="mb-8">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <UserAvatar user={post.user} className="w-12 h-12" />
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {post.title}
                    </h1>
                    <div className="flex items-center space-x-2 text-sm text-gray-500 dark:text-gray-400">
                      <span>By {post.user.firstName} {post.user.lastName}</span>
                      <span>•</span>
                      <span>{formatDistanceToNow(new Date(post.createdAt))} ago</span>
                      {post.category && (
                        <>
                          <span>•</span>
                          <Badge variant="secondary">{post.category.name}</Badge>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4 text-sm text-gray-500 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Eye className="w-4 h-4" />
                    <span>{post.viewCount}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <MessageSquare className="w-4 h-4" />
                    <span>{post.commentCount || 0}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent>
              <div className="prose max-w-none dark:prose-invert">
                <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                  {post.content}
                </p>
              </div>
              
              {post.isEdited && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Last edited {formatDistanceToNow(new Date(post.updatedAt))} ago
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Comments Section */}
          <CommentsSection listingId={0} forumPostId={parseInt(id!)} title="Discussion" />
        </div>
      </div>
    </div>
  );
}