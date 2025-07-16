import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { BookOpen, ExternalLink, Users, Phone, MapPin } from "lucide-react";
import { Link } from "wouter";

const resourcesData = [
  {
    id: 1,
    title: "Emergency Housing Assistance",
    description: "24/7 support for those in need of immediate shelter and housing assistance.",
    category: "Housing",
    contact: "(555) 123-4567",
    location: "Downtown Community Center",
    status: "Available",
  },
  {
    id: 2,
    title: "Food Bank Network",
    description: "Free food distribution and meal programs for individuals and families.",
    category: "Food",
    contact: "(555) 234-5678",
    location: "Multiple Locations",
    status: "Available",
  },
  {
    id: 3,
    title: "Job Training Programs",
    description: "Skills training and job placement assistance for employment opportunities.",
    category: "Employment",
    contact: "(555) 345-6789",
    location: "Workforce Development Center",
    status: "Available",
  },
  {
    id: 4,
    title: "Mental Health Support",
    description: "Counseling services and mental health resources for community members.",
    category: "Healthcare",
    contact: "(555) 456-7890",
    location: "Community Health Center",
    status: "Available",
  },
  {
    id: 5,
    title: "Legal Aid Services",
    description: "Free legal consultation and assistance for various legal matters.",
    category: "Legal",
    contact: "(555) 567-8901",
    location: "Legal Aid Office",
    status: "Limited",
  },
  {
    id: 6,
    title: "Transportation Assistance",
    description: "Free transportation services for medical appointments and job interviews.",
    category: "Transportation",
    contact: "(555) 678-9012",
    location: "Transportation Hub",
    status: "Available",
  },
];

export default function Resources() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Community Resources
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Essential services and support programs available in your community
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {resourcesData.map((resource) => (
            <Card key={resource.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg text-gray-900 dark:text-white mb-1">
                      {resource.title}
                    </CardTitle>
                    <Badge 
                      variant={resource.status === "Available" ? "default" : "secondary"}
                      className={resource.status === "Available" ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" : ""}
                    >
                      {resource.status}
                    </Badge>
                  </div>
                  <BookOpen className="h-6 w-6 text-primary" />
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-gray-600 dark:text-gray-300 text-sm">
                  {resource.description}
                </p>
                
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Users className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      Category: {resource.category}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {resource.contact}
                    </span>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <MapPin className="h-4 w-4 text-gray-500" />
                    <span className="text-sm text-gray-600 dark:text-gray-300">
                      {resource.location}
                    </span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-2">
                  <Button variant="outline" size="sm">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Learn More
                  </Button>
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    Get Help
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
        <div className="mt-12 text-center">
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                Need Additional Support?
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-6">
                If you can't find what you're looking for, our community coordinators are here to help connect you with the right resources.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button className="bg-primary hover:bg-primary/90">
                  <Phone className="h-4 w-4 mr-2" />
                  Call Support: (555) 000-0000
                </Button>
                <Link href="/forum">
                  <Button variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Ask Community
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}