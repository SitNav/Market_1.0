import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuSeparator, 
  DropdownMenuTrigger 
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAuth } from "@/hooks/useAuth";
import { 
  Plus, 
  Search, 
  Menu, 
  User, 
  Settings, 
  LogOut, 
  Shield, 
  Home,
  Store,
  MessageSquare,
  Grid3X3,
  BookOpen,
  Bell,
  Heart,
  ShoppingCart
} from "lucide-react";
import Logo from "@/components/logo";
import UserAvatar from "@/components/user-avatar";

export default function Navigation() {
  const [location] = useLocation();
  const { user, isAuthenticated, isLoading } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  const handleLogout = () => {
    window.location.href = "/api/logout";
  };

  const navigationItems = [
    { href: "/", label: "Home", icon: Home },
    { href: "/marketplace", label: "Marketplace", icon: Store },
    { href: "/forum", label: "Forum", icon: MessageSquare },
    { href: "/categories", label: "Categories", icon: Grid3X3 },
    { href: "/resources", label: "Resources", icon: BookOpen },
  ];

  const NavItems = ({ mobile = false }) => (
    <>
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = location === item.href;
        return (
          <Link key={item.href} href={item.href}>
            <Button
              variant="ghost"
              className={`${
                isActive 
                  ? "text-primary bg-primary/10 border-primary/20" 
                  : "text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-primary/5"
              } transition-all duration-200 ${
                mobile ? "w-full justify-start" : "px-4 py-2"
              } ${isActive ? "border-b-2 border-primary" : ""}`}
            >
              <Icon className="w-4 h-4 mr-2" />
              {item.label}
            </Button>
          </Link>
        );
      })}
    </>
  );

  return (
    <nav className="bg-gradient-to-r from-white via-blue-50 to-white dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 shadow-lg border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-3 cursor-pointer hover:scale-105 transition-transform duration-200">
              <div className="relative">
                <Logo className="h-12 w-12 drop-shadow-md" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <div>
                <h1 className="text-xl font-bold text-primary bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  TerraNav Solutions
                </h1>
                <p className="text-xs text-gray-600 dark:text-gray-400 font-medium">
                  Helping You Navigate Forward
                </p>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-2 bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm rounded-full px-4 py-2 shadow-md border border-gray-100 dark:border-gray-700">
            {isAuthenticated && <NavItems />}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {isLoading ? (
              <div className="w-10 h-10 rounded-full bg-gradient-to-r from-gray-200 to-gray-300 animate-pulse" />
            ) : isAuthenticated ? (
              <>
                {/* Notifications */}
                <Button variant="ghost" size="sm" className="relative hover:bg-primary/10 transition-colors">
                  <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
                  <Badge className="absolute -top-1 -right-1 w-5 h-5 text-xs bg-red-500 hover:bg-red-500">
                    3
                  </Badge>
                </Button>

                {/* Create Listing */}
                <Link href="/create-listing">
                  <Button className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-500 text-white shadow-lg hover:shadow-xl transition-all duration-200">
                    <Plus className="h-4 w-4 mr-2" />
                    List Item
                  </Button>
                </Link>
                
                {/* User Menu */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full hover:ring-2 hover:ring-primary/20 transition-all duration-200">
                      <UserAvatar user={user} className="h-10 w-10 ring-2 ring-white shadow-md" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-64 shadow-xl border-0" align="end" forceMount>
                    <div className="flex items-center justify-start gap-3 p-4 bg-gradient-to-r from-primary/10 to-blue-50 dark:from-primary/20 dark:to-blue-900/20">
                      <UserAvatar user={user} className="h-12 w-12 ring-2 ring-white shadow-md" />
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-semibold text-gray-900 dark:text-white">
                          {user?.firstName} {user?.lastName}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-300">
                          {user?.email}
                        </p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <Link href="/profile">
                      <DropdownMenuItem className="hover:bg-primary/5 py-3">
                        <User className="mr-3 h-4 w-4 text-primary" />
                        <span className="font-medium">Profile</span>
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/marketplace">
                      <DropdownMenuItem className="hover:bg-primary/5 py-3">
                        <Store className="mr-3 h-4 w-4 text-primary" />
                        <span className="font-medium">Marketplace</span>
                      </DropdownMenuItem>
                    </Link>
                    {user?.isAdmin && (
                      <Link href="/admin">
                        <DropdownMenuItem className="hover:bg-primary/5 py-3">
                          <Shield className="mr-3 h-4 w-4 text-primary" />
                          <span className="font-medium">Admin Dashboard</span>
                        </DropdownMenuItem>
                      </Link>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout} className="hover:bg-red-50 dark:hover:bg-red-900/20 py-3">
                      <LogOut className="mr-3 h-4 w-4 text-red-500" />
                      <span className="font-medium text-red-600 dark:text-red-400">Sign Out</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button 
                onClick={handleLogin} 
                className="bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-500 text-white shadow-lg hover:shadow-xl transition-all duration-200"
              >
                Sign In
              </Button>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm" className="hover:bg-primary/10">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-800">
                  <SheetHeader>
                    <SheetTitle className="text-xl font-semibold text-primary">Menu</SheetTitle>
                  </SheetHeader>
                  <div className="mt-8 space-y-3">
                    {isAuthenticated && <NavItems mobile />}
                    {!isAuthenticated && (
                      <Button 
                        onClick={handleLogin} 
                        className="w-full bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-500 text-white shadow-lg"
                      >
                        Sign In
                      </Button>
                    )}
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
