import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/useAuth";
import { apiRequest } from "@/lib/queryClient";
import { isUnauthorizedError } from "@/lib/authUtils";
import { 
  Users, 
  Package, 
  Flag, 
  Clock, 
  TrendingUp, 
  CheckCircle, 
  XCircle, 
  Eye,
  Trash2,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import UserAvatar from "@/components/user-avatar";
import type { User, ListingWithDetails, Report } from "@shared/schema";

interface AdminStats {
  usersCount: number;
  listingsCount: number;
  reportsCount: number;
  pendingReportsCount: number;
}

export default function Admin() {
  const { user, isAuthenticated, isLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState("overview");

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Logging in again...",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/api/login";
      }, 500);
      return;
    }
  }, [isAuthenticated, isLoading, toast]);

  // Check if user is admin
  useEffect(() => {
    if (!isLoading && isAuthenticated && !user?.isAdmin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page.",
        variant: "destructive",
      });
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
      return;
    }
  }, [user, isAuthenticated, isLoading, toast]);

  const { data: stats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ["/api/admin/stats"],
    enabled: !!user?.isAdmin,
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to load admin statistics",
        variant: "destructive",
      });
    },
  });

  const { data: allListings = [] } = useQuery<ListingWithDetails[]>({
    queryKey: ["/api/listings", "admin"],
    queryFn: async () => {
      const response = await fetch("/api/listings?limit=100");
      return response.json();
    },
    enabled: !!user?.isAdmin,
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  const { data: reports = [] } = useQuery<Report[]>({
    queryKey: ["/api/reports"],
    enabled: !!user?.isAdmin,
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
    },
  });

  const updateListingMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PUT", `/api/listings/${id}`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Listing status updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update listing status",
        variant: "destructive",
      });
    },
  });

  const updateReportMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number; status: string }) => {
      return apiRequest("PUT", `/api/reports/${id}`, { status });
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Report status updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/reports"] });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Logging in again...",
          variant: "destructive",
        });
        setTimeout(() => {
          window.location.href = "/api/login";
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to update report status",
        variant: "destructive",
      });
    },
  });

  const handleUpdateListingStatus = (id: number, status: string) => {
    updateListingMutation.mutate({ id, status });
  };

  const handleUpdateReportStatus = (id: number, status: string) => {
    updateReportMutation.mutate({ id, status });
  };

  if (isLoading || statsLoading) {
    return (
      <div className="min-h-screen bg-warm-gray flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user?.isAdmin) {
    return null;
  }

  const pendingReports = reports.filter(report => report.status === "pending");
  const suspendedListings = allListings.filter(listing => listing.status === "suspended");

  return (
    <div className="min-h-screen bg-warm-gray py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-primary mb-2">Admin Dashboard</h1>
          <p className="text-neutral-gray">Manage users, listings, and reports</p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-gray">Total Users</p>
                  <p className="text-2xl font-bold text-primary">{stats?.usersCount || 0}</p>
                </div>
                <Users className="h-8 w-8 text-secondary" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-gray">Active Listings</p>
                  <p className="text-2xl font-bold text-primary">{stats?.listingsCount || 0}</p>
                </div>
                <Package className="h-8 w-8 text-accent" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-gray">Pending Reports</p>
                  <p className="text-2xl font-bold text-primary">{stats?.pendingReportsCount || 0}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-neutral-gray">Total Reports</p>
                  <p className="text-2xl font-bold text-primary">{stats?.reportsCount || 0}</p>
                </div>
                <Flag className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <Tabs value={selectedTab} onValueChange={setSelectedTab}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="listings">Listings</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pendingReports.length > 0 && (
                    <div className="flex items-center space-x-3 p-3 bg-yellow-50 rounded-lg">
                      <AlertTriangle className="h-5 w-5 text-yellow-600" />
                      <div>
                        <p className="text-sm font-medium">Pending Reports</p>
                        <p className="text-xs text-neutral-gray">
                          {pendingReports.length} report{pendingReports.length !== 1 ? 's' : ''} awaiting review
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {suspendedListings.length > 0 && (
                    <div className="flex items-center space-x-3 p-3 bg-red-50 rounded-lg">
                      <XCircle className="h-5 w-5 text-red-600" />
                      <div>
                        <p className="text-sm font-medium">Suspended Listings</p>
                        <p className="text-xs text-neutral-gray">
                          {suspendedListings.length} listing{suspendedListings.length !== 1 ? 's' : ''} currently suspended
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {pendingReports.length === 0 && suspendedListings.length === 0 && (
                    <div className="text-center py-8">
                      <CheckCircle className="h-12 w-12 text-green-600 mx-auto mb-4" />
                      <p className="text-neutral-gray">All systems running smoothly!</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="listings" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>All Listings</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Listing</TableHead>
                        <TableHead>User</TableHead>
                        <TableHead>Category</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {allListings.map((listing) => (
                        <TableRow key={listing.id}>
                          <TableCell>
                            <div className="flex items-center space-x-3">
                              {listing.images && listing.images.length > 0 ? (
                                <img 
                                  src={listing.images[0]} 
                                  alt={listing.title}
                                  className="w-10 h-10 rounded object-cover"
                                />
                              ) : (
                                <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center">
                                  <Package className="h-5 w-5 text-gray-400" />
                                </div>
                              )}
                              <div>
                                <p className="font-medium">{listing.title}</p>
                                <p className="text-sm text-neutral-gray">
                                  {listing.priceType === "free" ? "Free" : `$${listing.price}`}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <UserAvatar user={listing.user} className="h-8 w-8" />
                              <span className="text-sm">{listing.user.firstName} {listing.user.lastName}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{listing.category.name}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={listing.status === "active" ? "default" : 
                                     listing.status === "suspended" ? "destructive" : "secondary"}
                            >
                              {listing.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-neutral-gray">
                            {format(new Date(listing.createdAt), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => window.open(`/listing/${listing.id}`, '_blank')}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              {listing.status === "active" && (
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => handleUpdateListingStatus(listing.id, "suspended")}
                                >
                                  Suspend
                                </Button>
                              )}
                              {listing.status === "suspended" && (
                                <Button
                                  variant="default"
                                  size="sm"
                                  onClick={() => handleUpdateListingStatus(listing.id, "active")}
                                >
                                  Activate
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Reports</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Reporter</TableHead>
                        <TableHead>Listing</TableHead>
                        <TableHead>Reason</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Date</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {reports.map((report) => (
                        <TableRow key={report.id}>
                          <TableCell>
                            <div className="text-sm">
                              <p className="font-medium">Reporter ID: {report.reporterId}</p>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="text-sm">
                              <p className="font-medium">Listing ID: {report.listingId}</p>
                              {report.description && (
                                <p className="text-neutral-gray truncate max-w-xs">
                                  {report.description}
                                </p>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{report.reason}</Badge>
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={report.status === "pending" ? "default" : 
                                     report.status === "resolved" ? "secondary" : "destructive"}
                            >
                              {report.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-neutral-gray">
                            {format(new Date(report.createdAt), "MMM d, yyyy")}
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              {report.status === "pending" && (
                                <>
                                  <Button
                                    variant="default"
                                    size="sm"
                                    onClick={() => handleUpdateReportStatus(report.id, "resolved")}
                                  >
                                    Resolve
                                  </Button>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => handleUpdateReportStatus(report.id, "dismissed")}
                                  >
                                    Dismiss
                                  </Button>
                                </>
                              )}
                              {report.listingId && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => window.open(`/listing/${report.listingId}`, '_blank')}
                                >
                                  <Eye className="h-4 w-4" />
                                </Button>
                              )}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
