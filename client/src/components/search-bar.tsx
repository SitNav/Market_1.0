import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, X } from "lucide-react";
import { useLocation } from "wouter";

interface SearchBarProps {
  initialQuery?: string;
  onSearch?: (query: string) => void;
  placeholder?: string;
  className?: string;
}

export default function SearchBar({ 
  initialQuery = "", 
  onSearch,
  placeholder = "Search for items, housing, jobs, or resources...",
  className = ""
}: SearchBarProps) {
  const [, navigate] = useLocation();
  const [query, setQuery] = useState(initialQuery);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onSearch) {
      onSearch(query);
    } else {
      // Navigate to marketplace with search query
      const searchParams = new URLSearchParams();
      if (query.trim()) {
        searchParams.set("search", query.trim());
      }
      navigate(`/marketplace?${searchParams.toString()}`);
    }
  };

  const handleClear = () => {
    setQuery("");
    if (onSearch) {
      onSearch("");
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`relative ${className}`}>
      <div className="flex bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="relative flex-1">
          <Input
            type="text"
            placeholder={placeholder}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="border-0 focus:ring-0 text-gray-700 pr-10"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button 
          type="submit" 
          className="bg-accent hover:bg-accent/90 text-white px-6 rounded-none"
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>
    </form>
  );
}
