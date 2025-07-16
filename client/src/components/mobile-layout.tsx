import { ReactNode } from "react";
import { useAuth } from "@/hooks/useAuth";
import MobileNavigation from "@/components/mobile-navigation";
import Navigation from "@/components/navigation";

interface MobileLayoutProps {
  children: ReactNode;
}

export default function MobileLayout({ children }: MobileLayoutProps) {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <Navigation />
      </div>

      {/* Mobile Navigation */}
      <MobileNavigation />

      {/* Main Content */}
      <main className="md:pt-0 pt-0 pb-20 md:pb-0">
        {children}
      </main>
    </div>
  );
}