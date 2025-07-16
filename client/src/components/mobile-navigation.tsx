import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import {
  Home,
  Search,
  ShoppingCart,
  Heart,
  User,
  Menu,
  MessageCircle,
  Settings,
  Bell,
  Store,
  Plus,
  Grid3X3,
  BookOpen,
  MapPin,
  HelpCircle,
  LogOut,
  Shield
} from "lucide-react";

export default function MobileNavigation() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [isOpen, setIsOpen] = useState(false);

  // Get cart count for mobile badge
  const { data: cartCount = 0 } = useQuery<number>({
    queryKey: ["/api/cart/count"],
    enabled: isAuthenticated,
  });

  // Get unread messages count
  const { data: unreadCount = 0 } = useQuery<number>({
    queryKey: ["/api/messages/unread"],
    enabled: isAuthenticated,
  });

  const navItems = [
    { href: "/", icon: Home, label: "Home", active: location === "/" },
    { href: "/marketplace", icon: Search, label: "Marketplace", active: location === "/marketplace" },
    { href: "/forum", icon: MessageCircle, label: "Forum", active: location === "/forum" },
    { href: "/categories", icon: Grid3X3, label: "Categories", active: location === "/categories" },
    { href: "/profile", icon: User, label: "Profile", active: location === "/profile" },
  ];

  const sidebarItems = [
    { href: "/", icon: Home, label: "Home" },
    { href: "/marketplace", icon: Search, label: "Marketplace" },
    { href: "/forum", icon: MessageCircle, label: "Forum", badge: unreadCount > 0 ? unreadCount : null },
    { href: "/categories", icon: Grid3X3, label: "Categories" },
    { href: "/resources", icon: BookOpen, label: "Resources" },
    { href: "/create-listing", icon: Plus, label: "Sell Item" },
    { href: "/profile", icon: User, label: "Profile" },
  ];

  if (!isAuthenticated) {
    return (
      <div className="md:hidden">
        {/* Mobile Bottom Navigation - Not Authenticated */}
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 h-16">
          <div className="flex items-center justify-around h-full px-4">
            <Link href="/">
              <Button variant="ghost" className="flex flex-col items-center justify-center h-full py-2">
                <Home className="h-5 w-5" />
                <span className="text-xs mt-1">Home</span>
              </Button>
            </Link>
            <Link href="/marketplace">
              <Button variant="ghost" className="flex flex-col items-center justify-center h-full py-2">
                <Search className="h-5 w-5" />
                <span className="text-xs mt-1">Browse</span>
              </Button>
            </Link>
            <Link href="/categories">
              <Button variant="ghost" className="flex flex-col items-center justify-center h-full py-2">
                <Grid3X3 className="h-5 w-5" />
                <span className="text-xs mt-1">Categories</span>
              </Button>
            </Link>
            <Button 
              variant="ghost" 
              className="flex flex-col items-center justify-center h-full py-2"
              onClick={() => window.location.href = "/api/login"}
            >
              <User className="h-5 w-5" />
              <span className="text-xs mt-1">Login</span>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="md:hidden">
      {/* Mobile Top Bar */}
      <div className="fixed top-0 left-0 right-0 bg-white border-b border-gray-200 z-50 h-14">
        <div className="flex items-center justify-between h-full px-4">
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <div className="flex flex-col h-full">
                {/* Profile Section */}
                <div className="flex items-center gap-3 p-4 border-b">
                  <div className="w-12 h-12 bg-primary rounded-full flex items-center justify-center">
                    <User className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{user?.firstName || "User"}</h3>
                    <p className="text-sm text-gray-500">{user?.email}</p>
                  </div>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 py-4">
                  {sidebarItems.map((item) => (
                    <Link key={item.href} href={item.href}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start mb-1 relative"
                        onClick={() => setIsOpen(false)}
                      >
                        <item.icon className="h-5 w-5 mr-3" />
                        {item.label}
                        {item.badge && (
                          <Badge variant="destructive" className="ml-auto">
                            {item.badge}
                          </Badge>
                        )}
                      </Button>
                    </Link>
                  ))}
                </nav>

                {/* Admin Link */}
                {user?.isAdmin && (
                  <div className="border-t pt-4">
                    <Link href="/admin">
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setIsOpen(false)}
                      >
                        <Shield className="h-5 w-5 mr-3" />
                        Admin Panel
                      </Button>
                    </Link>
                  </div>
                )}

                {/* Settings & Logout */}
                <div className="border-t pt-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-start mb-2"
                    onClick={() => setIsOpen(false)}
                  >
                    <Settings className="h-5 w-5 mr-3" />
                    Settings
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-red-600"
                    onClick={() => window.location.href = "/api/logout"}
                  >
                    <LogOut className="h-5 w-5 mr-3" />
                    Logout
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>

          <h1 className="font-bold text-lg">TerraNav</h1>

          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" className="relative">
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                  {unreadCount}
                </Badge>
              )}
            </Button>
            <Link href="/cart">
              <Button variant="ghost" size="sm" className="relative">
                <ShoppingCart className="h-5 w-5" />
                {cartCount > 0 && (
                  <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Mobile Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 h-16">
        <div className="flex items-center justify-around h-full px-2">
          {navItems.map((item) => (
            <Link key={item.href} href={item.href}>
              <Button
                variant="ghost"
                className={`flex flex-col items-center justify-center h-full py-2 px-3 ${
                  item.active ? "text-primary" : "text-gray-600"
                }`}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs mt-1">{item.label}</span>
              </Button>
            </Link>
          ))}
        </div>
      </div>

      {/* Spacer for fixed navigation */}
      <div className="h-14"></div>
      <div className="h-16 fixed bottom-0 w-full pointer-events-none"></div>
    </div>
  );
}