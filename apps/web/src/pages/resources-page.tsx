import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Resource } from "@pawpal/shared/schema";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { ResourceCard } from "@/components/ui/resource-card";
import { Helmet } from "react-helmet";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CardGridSkeleton } from "@/components/skeletons/page-skeletons";
import { useLocation } from "wouter";

export default function ResourcesPage() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  
  // Fetch resources
  const { data: resources, isLoading, isError } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });
  
  // Filter and search resources
  const filteredResources = resources?.filter(resource => {
    // Category filter
    if (categoryFilter && resource.category !== categoryFilter) {
      return false;
    }
    
    // Search term filter
    if (
      searchTerm && 
      !resource.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !resource.content.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false;
    }
    
    return true;
  });
  
  // Extract unique categories from resources
  const categories = resources 
    ? [...new Set(resources.map(resource => resource.category))]
    : [];
  
  return (
    <>
      <Helmet>
        <title>Pet Care Resources - PawPal</title>
        <meta name="description" content="Access our comprehensive pet care resources. Learn about nutrition, training, health, and more to ensure your pet's well-being." />
      </Helmet>
      
      <Navbar />
      
      <main className="min-h-screen bg-neutral-100">
        {/* Header */}
        <div className="bg-[#4A6FA5] text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Pet Care Resources</h1>
            <p className="text-lg max-w-3xl">
              Access our library of pet care articles and guides to help you provide the best care for your furry, feathered, or scaly friends.
            </p>
          </div>
        </div>
        
        {/* Content */}
        <div className="container mx-auto px-4 py-12">
          {/* Filters */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="md:flex-1">
              <Input
                type="text"
                placeholder="Search resources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
            <div className="md:w-64">
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            {(searchTerm || categoryFilter) && (
              <Button 
                variant="ghost" 
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("");
                }}
                className="md:w-auto"
              >
                Clear Filters
              </Button>
            )}
          </div>
          
          {/* Resources Grid */}
          {isLoading ? (
            <CardGridSkeleton cards={6} />
          ) : isError ? (
            <div className="text-center py-12">
              <p className="text-red-500">Error loading resources. Please try again later.</p>
            </div>
          ) : filteredResources && filteredResources.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredResources.map(resource => (
                <ResourceCard key={resource.id} resource={resource} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-white rounded-lg shadow-sm">
              <h3 className="text-xl font-semibold mb-2">No Resources Found</h3>
              <p className="text-neutral-600 mb-6">
                We couldn't find any resources matching your search criteria.
              </p>
              <Button 
                onClick={() => {
                  setSearchTerm("");
                  setCategoryFilter("");
                }}
              >
                Clear Filters
              </Button>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </>
  );
}
