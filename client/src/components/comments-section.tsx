import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MessageCircle, Reply, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import type { CommentWithDetails } from "@shared/schema";

const createCommentSchema = z.object({
  content: z.string().min(1, "Comment content is required").max(2000, "Comment must be less than 2000 characters"),
  parentId: z.number().optional(),
});

type CreateCommentData = z.infer<typeof createCommentSchema>;

interface CommentsSectionProps {
  listingId?: number;
  forumPostId?: number;
  title?: string;
}

export default function CommentsSection({ listingId, forumPostId, title = "Comments" }: CommentsSectionProps) {
  const [replyToCommentId, setReplyToCommentId] = useState<number | null>(null);
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const queryKey = listingId 
    ? ["/api/comments", "listing", listingId]
    : ["/api/comments", "forum-post", forumPostId];

  const { data: comments = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => {
      const params = listingId 
        ? `?listingId=${listingId}`
        : `?forumPostId=${forumPostId}`;
      return apiRequest("GET", `/api/comments${params}`);
    },
  });

  const form = useForm<CreateCommentData>({
    resolver: zodResolver(createCommentSchema),
    defaultValues: {
      content: "",
      parentId: undefined,
    },
  });

  const createCommentMutation = useMutation({
    mutationFn: async (data: CreateCommentData) => {
      const payload = {
        ...data,
        ...(listingId && { listingId }),
        ...(forumPostId && { forumPostId }),
      };
      return apiRequest("POST", "/api/comments", payload);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Comment added successfully",
      });
      form.reset();
      setReplyToCommentId(null);
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add comment",
        variant: "destructive",
      });
    },
  });

  const deleteCommentMutation = useMutation({
    mutationFn: async (commentId: number) => {
      return apiRequest("DELETE", `/api/comments/${commentId}`);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Comment deleted successfully",
      });
      queryClient.invalidateQueries({ queryKey });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete comment",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: CreateCommentData) => {
    createCommentMutation.mutate({
      ...data,
      parentId: replyToCommentId || undefined,
    });
  };

  const handleReply = (commentId: number) => {
    setReplyToCommentId(commentId);
    form.setValue("parentId", commentId);
  };

  const handleDeleteComment = (commentId: number) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      deleteCommentMutation.mutate(commentId);
    }
  };

  const renderComments = (comments: CommentWithDetails[], parentId: number | null = null) => {
    const filteredComments = comments.filter(comment => comment.parentId === parentId);
    
    return filteredComments.map((comment) => (
      <div key={comment.id} className={`${parentId ? "ml-8 border-l-2 border-gray-200 dark:border-gray-700 pl-4" : ""}`}>
        <div className="mb-4 bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
          <div className="flex items-start space-x-3">
            <Avatar className="w-8 h-8">
              <AvatarImage src={comment.user.profileImageUrl || undefined} />
              <AvatarFallback>
                {comment.user.firstName?.[0]}{comment.user.lastName?.[0]}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <span className="font-medium text-sm">
                  {comment.user.firstName} {comment.user.lastName}
                </span>
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {formatDistanceToNow(new Date(comment.createdAt))} ago
                </span>
                {comment.isEdited && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">(edited)</span>
                )}
              </div>
              
              <p className="text-gray-700 dark:text-gray-300 mb-3">
                {comment.content}
              </p>
              
              <div className="flex items-center space-x-2">
                {isAuthenticated && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleReply(comment.id)}
                  >
                    <Reply className="w-4 h-4 mr-1" />
                    Reply
                  </Button>
                )}
                
                {user?.id === comment.userId && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteComment(comment.id)}
                  >
                    <Trash2 className="w-4 h-4 mr-1" />
                    Delete
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {renderComments(comments, comment.id)}
      </div>
    ));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageCircle className="w-5 h-5" />
          <span>{title} ({comments.length})</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Add Comment Form */}
        {isAuthenticated && (
          <div className="mb-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                {replyToCommentId && (
                  <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
                    <span>Replying to comment</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setReplyToCommentId(null);
                        form.setValue("parentId", undefined);
                      }}
                    >
                      Cancel
                    </Button>
                  </div>
                )}
                
                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>
                        {replyToCommentId ? "Reply" : "Add a comment"}
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write your comment..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" disabled={createCommentMutation.isPending}>
                  {createCommentMutation.isPending ? "Posting..." : "Post Comment"}
                </Button>
              </form>
            </Form>
          </div>
        )}

        {/* Comments List */}
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        ) : comments.length === 0 ? (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            No comments yet. Be the first to share your thoughts!
          </div>
        ) : (
          <div className="space-y-4">
            {renderComments(comments)}
          </div>
        )}
      </CardContent>
    </Card>
  );
}