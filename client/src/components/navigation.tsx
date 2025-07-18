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
              size="sm"
              className={`${
                isActive 
                  ? "text-primary bg-primary/10" 
                  : "text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-primary/5"
              } transition-all duration-200 ${
                mobile ? "w-full justify-start" : "px-3 py-2"
              } text-sm font-medium`}
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
    <nav className="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/">
            <div className="flex items-center space-x-2 cursor-pointer">
              <Logo className="h-8 w-8" />
              <div>
                <h1 className="text-lg font-bold text-primary">TerraNav Solutions</h1>
                <p className="text-xs text-neutral-gray">Helping You Navigate Forward</p>
              </div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            {isAuthenticated && <NavItems />}
          </div>

          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {isLoading ? (
              <div className="w-8 h-8 rounded-full bg-gray-200 animate-pulse" />
            ) : isAuthenticated ? (
              <>
                <Link href="/create-listing">
                  <Button className="bg-secondary hover:bg-secondary/90 text-white text-sm">
                    <Plus className="h-4 w-4 mr-2" />
                    List Item
                  </Button>
                </Link>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                      <UserAvatar user={user} className="h-8 w-8" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <div className="flex items-center justify-start gap-2 p-2">
                      <div className="flex flex-col space-y-1 leading-none">
                        <p className="font-medium text-sm">{user?.firstName} {user?.lastName}</p>
                        <p className="text-xs text-neutral-gray">{user?.email}</p>
                      </div>
                    </div>
                    <DropdownMenuSeparator />
                    <Link href="/profile">
                      <DropdownMenuItem>
                        <User className="mr-2 h-4 w-4" />
                        Profile
                      </DropdownMenuItem>
                    </Link>
                    <Link href="/marketplace">
                      <DropdownMenuItem>
                        <Search className="mr-2 h-4 w-4" />
                        Marketplace
                      </DropdownMenuItem>
                    </Link>
                    {user?.isAdmin && (
                      <Link href="/admin">
                        <DropdownMenuItem>
                          <Shield className="mr-2 h-4 w-4" />
                          Admin Dashboard
                        </DropdownMenuItem>
                      </Link>
                    )}
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleLogout}>
                      <LogOut className="mr-2 h-4 w-4" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Button onClick={handleLogin} className="text-primary border-primary hover:bg-primary hover:text-white">
                Sign In
              </Button>
            )}

            {/* Mobile menu button */}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px]">
                  <SheetHeader>
                    <SheetTitle>Menu</SheetTitle>
                  </SheetHeader>
                  <div className="mt-6 space-y-2">
                    {isAuthenticated && <NavItems mobile />}
                    {!isAuthenticated && (
                      <Button onClick={handleLogin} className="w-full">
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
