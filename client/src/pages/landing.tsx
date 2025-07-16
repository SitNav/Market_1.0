import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Search, Home, Briefcase, Utensils, GraduationCap, Heart, HandHeart, Shield, Headphones, Lock } from "lucide-react";
import Logo from "@/components/logo";
import SEOHead from "@/components/seo-head";
import { trackEvent } from "@/lib/analytics";
import { useState } from "react";

const categories = [
  { id: 1, name: "Housing", icon: Home, color: "bg-secondary", count: 124 },
  { id: 2, name: "Employment", icon: Briefcase, color: "bg-accent", count: 89 },
  { id: 3, name: "Food & Essentials", icon: Utensils, color: "bg-green-600", count: 156 },
  { id: 4, name: "Education", icon: GraduationCap, color: "bg-blue-600", count: 67 },
  { id: 5, name: "Health & Wellness", icon: Heart, color: "bg-red-600", count: 43 },
  { id: 6, name: "Support Services", icon: HandHeart, color: "bg-purple-600", count: 91 },
];

const trustFeatures = [
  {
    icon: Shield,
    title: "Verified Users",
    description: "All users go through our verification process to ensure a safe community.",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "Our support team is available around the clock to help with any questions or concerns.",
  },
  {
    icon: Lock,
    title: "Secure Payments",
    description: "All transactions are protected with enterprise-grade security and encryption.",
  },
];

export default function Landing() {
  const [searchQuery, setSearchQuery] = useState("");

  const handleLogin = () => {
    // Track login attempt
    trackEvent('login_attempt', 'authentication', 'login_button_clicked');
    window.location.href = "/api/login";
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // Track search event
    trackEvent('search', 'engagement', 'landing_search', searchQuery.length);
    // Handle search functionality
    console.log("Search query:", searchQuery);
  };

  return (
    <div className="min-h-screen bg-warm-gray">
      <SEOHead
        title="Community Marketplace for Essential Resources"
        description="Find housing, employment, food, education, and support services in your community. Connect with others and access essential resources through TerraNav Solutions marketplace."
        keywords="community marketplace, housing assistance, employment opportunities, food resources, education support, community services, at-risk individuals"
        canonical={window.location.href}
      />
      {/* Hero Section */}
      <section className="terra-gradient text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Find What You Need to Move Forward
            </h1>
            <p className="text-xl mb-8 text-gray-100 max-w-2xl mx-auto">
              A trusted marketplace connecting individuals with essential items, housing, employment opportunities, and support resources.
            </p>
            
            {/* Search Bar */}
            <div className="max-w-2xl mx-auto">
              <form onSubmit={handleSearch} className="flex bg-white rounded-lg shadow-lg p-2">
                <Input
                  type="text"
                  placeholder="Search for items, housing, jobs, or resources..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="flex-1 border-0 focus:ring-0 text-gray-700"
                />
                <Button type="submit" className="bg-accent hover:bg-accent/90">
                  <Search className="h-4 w-4" />
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Category Navigation */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-primary mb-12">Browse by Category</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {categories.map((category) => {
              const IconComponent = category.icon;
              return (
                <Card key={category.id} className="hover:shadow-lg transition-shadow cursor-pointer">
                  <CardContent className="p-6 text-center">
                    <div className={`${category.color} w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3`}>
                      <IconComponent className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-semibold text-primary mb-1">{category.name}</h3>
                    <p className="text-sm text-neutral-gray">{category.count} items</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Trust & Safety */}
      <section className="py-16 bg-warm-gray">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center text-primary mb-12">Built on Trust & Safety</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {trustFeatures.map((feature, index) => {
              const IconComponent = feature.icon;
              return (
                <div key={index} className="text-center">
                  <div className="bg-secondary/10 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                    <IconComponent className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="text-xl font-semibold text-primary mb-2">{feature.title}</h3>
                  <p className="text-neutral-gray">{feature.description}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-primary text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">Ready to Get Started?</h2>
          <p className="text-xl mb-8 text-gray-200">
            Join our community of individuals helping each other move forward with trusted resources and support.
          </p>
          <Button size="lg" onClick={handleLogin} className="bg-secondary hover:bg-secondary/90 text-white">
            Sign In to Continue
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-primary text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <Logo className="h-8 w-8" />
                <h3 className="text-xl font-bold">TerraNav Solutions</h3>
              </div>
              <p className="text-gray-300">
                Helping individuals navigate forward with trusted marketplace solutions and support resources.
              </p>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#marketplace" className="hover:text-white">Browse Marketplace</a></li>
                <li><a href="#list" className="hover:text-white">List an Item</a></li>
                <li><a href="#resources" className="hover:text-white">Resources</a></li>
                <li><a href="#support" className="hover:text-white">Support</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Categories</h4>
              <ul className="space-y-2 text-gray-300">
                <li><a href="#housing" className="hover:text-white">Housing</a></li>
                <li><a href="#employment" className="hover:text-white">Employment</a></li>
                <li><a href="#essentials" className="hover:text-white">Essentials</a></li>
                <li><a href="#education" className="hover:text-white">Education</a></li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-lg font-semibold mb-4">Contact Us</h4>
              <div className="space-y-2 text-gray-300">
                <p>1-800-TERRA-NAV</p>
                <p>help@terranavs.com</p>
                <p>24/7 Support Available</p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-700 mt-8 pt-8 text-center text-gray-300">
            <p>&copy; 2024 TerraNav Solutions. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
