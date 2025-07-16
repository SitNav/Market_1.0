import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import { useAnalytics } from "@/hooks/use-analytics";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Home from "@/pages/home";
import Marketplace from "@/pages/marketplace";
import CreateListing from "@/pages/create-listing";
import ListingDetail from "@/pages/listing-detail";
import Profile from "@/pages/profile";
import Admin from "@/pages/admin";
import Forum from "@/pages/forum";
import ForumPost from "@/pages/forum-post";
import Categories from "@/pages/categories";
import Resources from "@/pages/resources";
import Navigation from "@/components/navigation";
import MobileLayout from "@/components/mobile-layout";
import { useEffect } from "react";
import { initGA } from "./lib/analytics";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();
  
  // Track page views when routes change
  useAnalytics();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-warm-gray">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <MobileLayout>
      <Switch>
        {!isAuthenticated ? (
          <Route path="/" component={Landing} />
        ) : (
          <>
            <Route path="/" component={Home} />
            <Route path="/marketplace" component={Marketplace} />
            <Route path="/create-listing" component={CreateListing} />
            <Route path="/listing/:id" component={ListingDetail} />
            <Route path="/profile" component={Profile} />
            <Route path="/admin" component={Admin} />
            <Route path="/forum" component={Forum} />
            <Route path="/forum/:id" component={ForumPost} />
            <Route path="/categories" component={Categories} />
            <Route path="/resources" component={Resources} />
          </>
        )}
        <Route component={NotFound} />
      </Switch>
    </MobileLayout>
  );
}

function App() {
  // Initialize Google Analytics when app loads
  useEffect(() => {
    // Verify required environment variable is present
    if (!import.meta.env.VITE_GA_MEASUREMENT_ID) {
      console.warn('Missing required Google Analytics key: VITE_GA_MEASUREMENT_ID');
    } else {
      initGA();
    }
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
