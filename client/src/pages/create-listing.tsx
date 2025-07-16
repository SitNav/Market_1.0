import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { trackEvent } from "@/lib/analytics";
import { Upload, X, Plus } from "lucide-react";
import type { Category } from "@shared/schema";

const createListingSchema = z.object({
  title: z.string().min(1, "Title is required").max(200, "Title must be less than 200 characters"),
  description: z.string().min(1, "Description is required"),
  categoryId: z.string().min(1, "Category is required"),
  price: z.string().optional(),
  priceType: z.enum(["fixed", "free", "negotiable"]),
  location: z.string().optional(),
});

type CreateListingData = z.infer<typeof createListingSchema>;

export default function CreateListing() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);

  const { data: categories = [] } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<CreateListingData>({
    resolver: zodResolver(createListingSchema),
    defaultValues: {
      title: "",
      description: "",
      categoryId: "",
      price: "",
      priceType: "fixed",
      location: "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: CreateListingData) => {
      const formData = new FormData();
      
      // Append form data
      Object.entries(data).forEach(([key, value]) => {
        if (value !== undefined) {
          formData.append(key, value);
        }
      });
      
      // Append images
      selectedImages.forEach((image) => {
        formData.append("images", image);
      });

      const response = await fetch("/api/listings", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error("Failed to create listing");
      }

      return response.json();
    },
    onSuccess: (data) => {
      // Track listing creation event
      trackEvent('create_listing', 'engagement', 'listing_created', 1);
      
      toast({
        title: "Success",
        description: "Your listing has been created successfully!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/listings"] });
      navigate("/marketplace");
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    const totalImages = selectedImages.length + files.length;
    
    if (totalImages > 5) {
      toast({
        title: "Too many images",
        description: "You can only upload up to 5 images.",
        variant: "destructive",
      });
      return;
    }

    setSelectedImages([...selectedImages, ...files]);
    
    // Create previews
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews(prev => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: CreateListingData) => {
    createMutation.mutate(data);
  };

  const watchPriceType = form.watch("priceType");

  return (
    <div className="min-h-screen bg-warm-gray py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl text-primary">Create New Listing</CardTitle>
            <p className="text-neutral-gray">Share items or services to help others in your community</p>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Basic Information */}
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter a descriptive title"
                  {...form.register("title")}
                  error={form.formState.errors.title?.message}
                />
              </div>

              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide details about your item or service..."
                  rows={4}
                  {...form.register("description")}
                  error={form.formState.errors.description?.message}
                />
              </div>

              <div>
                <Label htmlFor="categoryId">Category *</Label>
                <Select onValueChange={(value) => form.setValue("categoryId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.categoryId && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.categoryId.message}
                  </p>
                )}
              </div>

              {/* Pricing */}
              <div>
                <Label>Pricing *</Label>
                <RadioGroup
                  value={watchPriceType}
                  onValueChange={(value) => form.setValue("priceType", value as "fixed" | "free" | "negotiable")}
                  className="mt-2"
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="free" id="free" />
                    <Label htmlFor="free">Free</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="fixed" id="fixed" />
                    <Label htmlFor="fixed">Fixed Price</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="negotiable" id="negotiable" />
                    <Label htmlFor="negotiable">Negotiable</Label>
                  </div>
                </RadioGroup>
              </div>

              {watchPriceType !== "free" && (
                <div>
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    {...form.register("price")}
                  />
                </div>
              )}

              {/* Location */}
              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  placeholder="City, State or general area"
                  {...form.register("location")}
                />
              </div>

              {/* Images */}
              <div>
                <Label>Images (up to 5)</Label>
                <div className="mt-2">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative">
                        <img
                          src={preview}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          onClick={() => removeImage(index)}
                          className="absolute top-1 right-1 h-6 w-6 p-0"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                    
                    {selectedImages.length < 5 && (
                      <label className="flex flex-col items-center justify-center h-24 border-2 border-dashed border-neutral-gray rounded-lg cursor-pointer hover:bg-gray-50">
                        <Upload className="h-6 w-6 text-neutral-gray" />
                        <span className="text-xs text-neutral-gray mt-1">Add Image</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={handleImageSelect}
                          className="hidden"
                        />
                      </label>
                    )}
                  </div>
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/marketplace")}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={createMutation.isPending}
                  className="bg-primary hover:bg-primary/90"
                >
                  {createMutation.isPending ? "Creating..." : "Create Listing"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
