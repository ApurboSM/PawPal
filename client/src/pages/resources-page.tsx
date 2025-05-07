import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Resource } from "@shared/schema";
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
import { Loader2 } from "lucide-react";
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
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#4A6FA5]" />
            </div>
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
          
          {/* Resource Detail (For demonstration) */}
          {resources && resources.length > 0 && (
            <div className="mt-12 pt-8 border-t border-neutral-200">
              <div className="bg-white rounded-xl shadow-md overflow-hidden">
                <img 
                  src={resources[0].imageUrl} 
                  alt={resources[0].title} 
                  className="w-full h-64 object-cover"
                />
                <div className="p-8">
                  <div className="mb-4">
                    <span className="text-xs font-semibold text-[#4A6FA5] bg-[#4A6FA5] bg-opacity-10 rounded-full px-3 py-1">
                      {resources[0].category}
                    </span>
                  </div>
                  <h2 className="text-2xl font-bold text-neutral-800 mb-4">{resources[0].title}</h2>
                  <div className="prose max-w-none">
                    <p className="text-neutral-600 mb-4">{resources[0].content}</p>
                    <p className="text-neutral-600 mb-4">
                      When bringing a new pet home, it's important to be prepared with all the essential supplies and knowledge to make their transition smooth and comfortable. This checklist covers everything you need for your new furry, feathered, or scaly family member.
                    </p>
                    <h3 className="text-xl font-semibold mt-6 mb-3">Essential Supplies</h3>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                      <li>Food and water bowls (appropriate for your pet's size and species)</li>
                      <li>High-quality pet food recommended by your veterinarian</li>
                      <li>Comfortable bedding or habitat setup</li>
                      <li>Appropriate toys for mental stimulation and exercise</li>
                      <li>Grooming supplies (brushes, combs, nail clippers, etc.)</li>
                      <li>Collar or harness with ID tags</li>
                      <li>Leash for dogs or carriers for smaller pets</li>
                      <li>Cleaning supplies (pet-safe disinfectants, odor removers)</li>
                    </ul>
                    <h3 className="text-xl font-semibold mt-6 mb-3">Preparing Your Home</h3>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                      <li>Secure your home by removing hazardous items and plants</li>
                      <li>Block off areas where your pet shouldn't go</li>
                      <li>Hide or secure electrical cords</li>
                      <li>Set up a quiet space where your pet can retreat</li>
                      <li>Install baby gates if needed for puppies or kittens</li>
                    </ul>
                    <h3 className="text-xl font-semibold mt-6 mb-3">First Veterinary Visit</h3>
                    <p className="text-neutral-600 mb-4">
                      Schedule a veterinary visit within the first week of bringing your pet home. The vet will:
                    </p>
                    <ul className="list-disc pl-5 mb-4 space-y-1">
                      <li>Conduct a thorough health check</li>
                      <li>Administer necessary vaccinations</li>
                      <li>Discuss spaying/neutering if applicable</li>
                      <li>Provide guidance on nutrition and care specific to your pet</li>
                      <li>Answer any questions you might have</li>
                    </ul>
                    <p className="text-neutral-600 mt-6">
                      Remember, bringing a new pet home is a big adjustment for both you and your pet. Be patient, provide lots of love and positive reinforcement, and soon your new companion will be a well-adjusted member of your family.
                    </p>
                  </div>
                  <div className="mt-8">
                    <Button 
                      onClick={() => setLocation("/resources")}
                      className="bg-[#4A6FA5] hover:bg-[#3A5A87]"
                    >
                      Back to Resources
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </>
  );
}
