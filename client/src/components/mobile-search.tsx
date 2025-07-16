import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Search, Filter, MapPin, X } from "lucide-react";

interface MobileSearchProps {
  search: string;
  onSearchChange: (value: string) => void;
  selectedCategory: string;
  onCategoryChange: (value: string) => void;
  priceRange: { min: string; max: string };
  onPriceRangeChange: (range: { min: string; max: string }) => void;
  condition: string;
  onConditionChange: (value: string) => void;
  brand: string;
  onBrandChange: (value: string) => void;
  size: string;
  onSizeChange: (value: string) => void;
  color: string;
  onColorChange: (value: string) => void;
  location: {
    city: string;
    state: string;
    zipCode: string;
    radius: string;
  };
  onLocationChange: (location: any) => void;
  categories: any[];
  onClearFilters: () => void;
  onGetLocation: () => void;
}

export default function MobileSearch({
  search,
  onSearchChange,
  selectedCategory,
  onCategoryChange,
  priceRange,
  onPriceRangeChange,
  condition,
  onConditionChange,
  brand,
  onBrandChange,
  size,
  onSizeChange,
  color,
  onColorChange,
  location,
  onLocationChange,
  categories,
  onClearFilters,
  onGetLocation,
}: MobileSearchProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [priceSlider, setPriceSlider] = useState([0, 1000]);

  const activeFiltersCount = [
    selectedCategory && selectedCategory !== "all",
    condition && condition !== "any",
    brand,
    size && size !== "any",
    color,
    priceRange.min || priceRange.max,
    location.city || location.state || location.zipCode,
  ].filter(Boolean).length;

  const handlePriceSliderChange = (values: number[]) => {
    setPriceSlider(values);
    onPriceRangeChange({
      min: values[0] > 0 ? values[0].toString() : "",
      max: values[1] < 1000 ? values[1].toString() : "",
    });
  };

  return (
    <div className="md:hidden">
      {/* Mobile Search Bar */}
      <div className="p-4 bg-white border-b">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search products..."
              value={search}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
          <Sheet open={isOpen} onOpenChange={setIsOpen}>
            <SheetTrigger asChild>
              <Button variant="outline" size="sm" className="relative">
                <Filter className="h-4 w-4" />
                {activeFiltersCount > 0 && (
                  <Badge
                    variant="destructive"
                    className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                  >
                    {activeFiltersCount}
                  </Badge>
                )}
              </Button>
            </SheetTrigger>
            <SheetContent side="bottom" className="h-[80vh] overflow-y-auto">
              <SheetHeader>
                <SheetTitle>Filter Results</SheetTitle>
              </SheetHeader>
              
              <div className="space-y-6 py-4">
                {/* Category Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <Select value={selectedCategory} onValueChange={onCategoryChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="All Categories" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Categories</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id.toString()}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Range Slider */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Price Range</label>
                  <div className="px-2">
                    <Slider
                      value={priceSlider}
                      onValueChange={handlePriceSliderChange}
                      max={1000}
                      min={0}
                      step={10}
                      className="w-full"
                    />
                    <div className="flex justify-between text-sm text-gray-500 mt-1">
                      <span>${priceSlider[0]}</span>
                      <span>${priceSlider[1]}</span>
                    </div>
                  </div>
                </div>

                {/* Condition Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Condition</label>
                  <Select value={condition} onValueChange={onConditionChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any condition</SelectItem>
                      <SelectItem value="new">New</SelectItem>
                      <SelectItem value="like_new">Like New</SelectItem>
                      <SelectItem value="good">Good</SelectItem>
                      <SelectItem value="fair">Fair</SelectItem>
                      <SelectItem value="poor">Poor</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Brand Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Brand</label>
                  <Input
                    placeholder="Enter brand name"
                    value={brand}
                    onChange={(e) => onBrandChange(e.target.value)}
                  />
                </div>

                {/* Size Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Size</label>
                  <Select value={size} onValueChange={onSizeChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Any size" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="any">Any size</SelectItem>
                      <SelectItem value="xs">XS</SelectItem>
                      <SelectItem value="s">S</SelectItem>
                      <SelectItem value="m">M</SelectItem>
                      <SelectItem value="l">L</SelectItem>
                      <SelectItem value="xl">XL</SelectItem>
                      <SelectItem value="xxl">XXL</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Color Filter */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Color</label>
                  <Input
                    placeholder="Enter color"
                    value={color}
                    onChange={(e) => onColorChange(e.target.value)}
                  />
                </div>

                {/* Location Filters */}
                <div className="space-y-4 border-t pt-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium">Location</label>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onGetLocation}
                    >
                      <MapPin className="h-4 w-4 mr-2" />
                      Use My Location
                    </Button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-medium">City</label>
                      <Input
                        placeholder="Enter city"
                        value={location.city}
                        onChange={(e) => onLocationChange(prev => ({ ...prev, city: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium">State</label>
                      <Input
                        placeholder="Enter state"
                        value={location.state}
                        onChange={(e) => onLocationChange(prev => ({ ...prev, state: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium">ZIP Code</label>
                      <Input
                        placeholder="Enter ZIP"
                        value={location.zipCode}
                        onChange={(e) => onLocationChange(prev => ({ ...prev, zipCode: e.target.value }))}
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-medium">Radius</label>
                      <Select value={location.radius} onValueChange={(value) => onLocationChange(prev => ({ ...prev, radius: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="5">5 miles</SelectItem>
                          <SelectItem value="10">10 miles</SelectItem>
                          <SelectItem value="25">25 miles</SelectItem>
                          <SelectItem value="50">50 miles</SelectItem>
                          <SelectItem value="100">100 miles</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>

                {/* Filter Actions */}
                <div className="flex gap-4 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => {
                      onClearFilters();
                      setPriceSlider([0, 1000]);
                    }}
                    className="flex-1"
                  >
                    Clear All
                  </Button>
                  <Button
                    onClick={() => setIsOpen(false)}
                    className="flex-1"
                  >
                    Apply Filters
                  </Button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </div>
  );
}