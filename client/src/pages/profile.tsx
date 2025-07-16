import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { Edit, Settings, MessageSquare, Package, Star, Calendar, CheckCircle } from "lucide-react";
import { format } from "date-fns";
import ListingCard from "@/components/listing-card";
import UserAvatar from "@/components/user-avatar";
import type { ListingWithDetails, MessageWithDetails } from "@shared/schema";

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [phone, setPhone] = useState(user?.phone || "");

  const { data: userListings = [] } = useQuery<ListingWithDetails[]>({
    queryKey: ["/api/listings", "user", user?.id],
    queryFn: async () => {
      const response = await fetch(`/api/listings?userId=${user?.id}`);
      return response.json();
    },
    enabled: !!user?.id,
  });

  const { data: conversations = [] } = useQuery<MessageWithDetails[]>({
    queryKey: ["/api/conversations"],
    enabled: !!user?.id,
  });

  const updateProfileMutation = useMutation({
    mutationFn: async (data: { firstName: string; lastName: string; phone: string }) => {
      return apiRequest("PUT", "/api/auth/profile", data);
    },
    onSuccess: () => {
      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleUpdateProfile = () => {
    updateProfileMutation.mutate({ firstName, lastName, phone });
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-warm-gray flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  const activeListings = userListings.filter(listing => listing.status === "active");
  const soldListings = userListings.filter(listing => listing.status === "sold");

  return (
    <div className="min-h-screen bg-warm-gray py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Sidebar */}
          <div className="lg:col-span-1">
            <Card>
              <CardContent className="p-6">
                <div className="text-center mb-6">
                  <UserAvatar user={user} className="h-20 w-20 mx-auto mb-4" />
                  <h2 className="text-xl font-bold text-primary">
                    {user.firstName} {user.lastName}
                  </h2>
                  <p className="text-neutral-gray">{user.email}</p>
                  <div className="flex items-center justify-center space-x-2 mt-2">
                    {user.isVerified && (
                      <div className="flex items-center space-x-1 text-green-600">
                        <CheckCircle className="h-4 w-4" />
                        <span className="text-sm">Verified</span>
                      </div>
                    )}
                    {user.isAdmin && (
                      <Badge variant="default">Admin</Badge>
                    )}
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-gray">Member since</span>
                    <span className="text-sm font-medium">
                      {format(new Date(user.createdAt), "MMM yyyy")}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-gray">Active listings</span>
                    <span className="text-sm font-medium">{activeListings.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-neutral-gray">Items sold</span>
                    <span className="text-sm font-medium">{soldListings.length}</span>
                  </div>
                </div>

                <div className="mt-6 space-y-2">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => setIsEditing(!isEditing)}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Profile
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={handleLogout}
                  >
                    <Settings className="h-4 w-4 mr-2" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card className="mt-6">
              <CardHeader>
                <CardTitle className="text-lg">Quick Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-primary">{activeListings.length}</div>
                    <div className="text-sm text-neutral-gray">Active</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-600">{soldListings.length}</div>
                    <div className="text-sm text-neutral-gray">Sold</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-2">
            <Tabs defaultValue="listings" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="listings">My Listings</TabsTrigger>
                <TabsTrigger value="messages">Messages</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <TabsContent value="listings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Package className="h-5 w-5" />
                      <span>Active Listings ({activeListings.length})</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {activeListings.length === 0 ? (
                      <div className="text-center py-8">
                        <Package className="h-12 w-12 text-neutral-gray mx-auto mb-4" />
                        <p className="text-neutral-gray">You haven't created any listings yet.</p>
                        <Button className="mt-4" onClick={() => window.location.href = "/create-listing"}>
                          Create Your First Listing
                        </Button>
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {activeListings.map((listing) => (
                          <ListingCard key={listing.id} listing={listing} />
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {soldListings.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Star className="h-5 w-5" />
                        <span>Sold Items ({soldListings.length})</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {soldListings.map((listing) => (
                          <ListingCard key={listing.id} listing={listing} />
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="messages" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <MessageSquare className="h-5 w-5" />
                      <span>Recent Conversations</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {conversations.length === 0 ? (
                      <div className="text-center py-8">
                        <MessageSquare className="h-12 w-12 text-neutral-gray mx-auto mb-4" />
                        <p className="text-neutral-gray">No conversations yet.</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {conversations.slice(0, 5).map((conversation) => (
                          <div key={conversation.id} className="flex items-center space-x-3 p-3 hover:bg-gray-50 rounded-lg">
                            <UserAvatar user={conversation.sender.id === user.id ? conversation.receiver : conversation.sender} />
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <h4 className="font-medium text-primary">
                                  {conversation.sender.id === user.id ? conversation.receiver.firstName : conversation.sender.firstName}
                                </h4>
                                <span className="text-xs text-neutral-gray">
                                  {format(new Date(conversation.createdAt), "MMM d, h:mm a")}
                                </span>
                              </div>
                              <p className="text-sm text-neutral-gray truncate">{conversation.content}</p>
                              {conversation.listing && (
                                <p className="text-xs text-neutral-gray">Re: {conversation.listing.title}</p>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="settings" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <Settings className="h-5 w-5" />
                      <span>Account Settings</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-6">
                      <div>
                        <Label htmlFor="firstName">First Name</Label>
                        <Input
                          id="firstName"
                          value={firstName}
                          onChange={(e) => setFirstName(e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="lastName">Last Name</Label>
                        <Input
                          id="lastName"
                          value={lastName}
                          onChange={(e) => setLastName(e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          value={user.email || ""}
                          disabled
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                          id="phone"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          disabled={!isEditing}
                        />
                      </div>

                      {isEditing && (
                        <div className="flex space-x-2">
                          <Button onClick={handleUpdateProfile} disabled={updateProfileMutation.isPending}>
                            {updateProfileMutation.isPending ? "Saving..." : "Save Changes"}
                          </Button>
                          <Button variant="outline" onClick={() => setIsEditing(false)}>
                            Cancel
                          </Button>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
