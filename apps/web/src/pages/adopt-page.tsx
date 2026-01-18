import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import type { Pet } from "@pawpal/shared/schema";
import PetCard from "@/components/pet/pet-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue, 
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Heart, Search, SlidersHorizontal, Loader2 } from "lucide-react";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

interface FilterOptions {
  species?: string;
  age?: string;
  gender?: string;
  size?: string;
  distance?: number;
  goodWith?: string[];
}

const AdoptPage = () => {
  useLocation(); // keep hook for navigation elsewhere if needed
  const urlParams = new URLSearchParams(window.location.search);
  const initialSpecies = urlParams.get("species") || undefined;
  
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<FilterOptions>({
    species: initialSpecies,
    distance: 50,
    goodWith: [],
  });

  // Update the query based on filters
  const buildQueryString = () => {
    const queryParams = new URLSearchParams();
    
    if (searchTerm) {
      queryParams.append("search", searchTerm);
    }
    
    if (filters.species) {
      queryParams.append("species", filters.species);
    }
    
    if (filters.age) {
      queryParams.append("age", filters.age);
    }
    
    if (filters.gender) {
      queryParams.append("gender", filters.gender);
    }
    
    if (filters.size) {
      queryParams.append("size", filters.size);
    }
    
    if (filters.distance) {
      queryParams.append("distance", filters.distance.toString());
    }
    
    if (filters.goodWith && filters.goodWith.length > 0) {
      filters.goodWith.forEach(item => {
        queryParams.append("goodWith", item);
      });
    }
    
    return queryParams.toString();
  };

  type PetWithUi = Pet & { distance?: number | string };
  const { data: pets, isLoading, isError } = useQuery<PetWithUi[]>({
    queryKey: [`/api/pets?${buildQueryString()}`],
  });

  const handleFilterChange = (key: keyof FilterOptions, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleGoodWithChange = (value: string) => {
    setFilters(prev => {
      const currentGoodWith = prev.goodWith || [];
      
      if (currentGoodWith.includes(value)) {
        return {
          ...prev,
          goodWith: currentGoodWith.filter(item => item !== value)
        };
      } else {
        return {
          ...prev,
          goodWith: [...currentGoodWith, value]
        };
      }
    });
  };

  const clearFilters = () => {
    setFilters({
      distance: 50,
      goodWith: [],
    });
    setSearchTerm("");
  };

  return (
    <div className="bg-neutral-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-neutral-800 mb-2">Find Your Perfect Pet</h1>
          <p className="text-neutral-600">Browse our available pets and filter based on your preferences.</p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-8">
          <div className="flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
            <div className="relative flex-grow">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400" />
              <Input
                type="text"
                placeholder="Search by name, breed, etc."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            
            <div className="flex space-x-3">
              <Select 
                value={filters.species} 
                onValueChange={(value) => handleFilterChange("species", value)}
              >
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Pet Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="dog">Dogs</SelectItem>
                  <SelectItem value="cat">Cats</SelectItem>
                  <SelectItem value="small">Small Animals</SelectItem>
                  <SelectItem value="bird">Birds</SelectItem>
                </SelectContent>
              </Select>

              {/* Mobile Filter Button */}
              <Sheet>
                <SheetTrigger asChild>
                  <Button variant="outline" className="md:hidden">
                    <SlidersHorizontal className="h-4 w-4 mr-2" />
                    Filters
                  </Button>
                </SheetTrigger>
                <SheetContent>
                  <SheetHeader>
                    <SheetTitle>Filter Pets</SheetTitle>
                    <SheetDescription>
                      Customize your search to find your perfect match
                    </SheetDescription>
                  </SheetHeader>
                  <div className="mt-4 space-y-6">
                    {/* Mobile Filters */}
                    <div>
                      <h3 className="text-sm font-medium mb-2">Age</h3>
                      <Select 
                        value={filters.age} 
                        onValueChange={(value) => handleFilterChange("age", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any Age" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="baby">Baby</SelectItem>
                          <SelectItem value="young">Young</SelectItem>
                          <SelectItem value="adult">Adult</SelectItem>
                          <SelectItem value="senior">Senior</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Gender</h3>
                      <Select 
                        value={filters.gender} 
                        onValueChange={(value) => handleFilterChange("gender", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Size</h3>
                      <Select 
                        value={filters.size} 
                        onValueChange={(value) => handleFilterChange("size", value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Any Size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                          <SelectItem value="xlarge">Extra Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-2">Distance (miles): {filters.distance}</h3>
                      <Slider
                        value={[filters.distance || 50]}
                        min={1}
                        max={100}
                        step={1}
                        onValueChange={(value) => handleFilterChange("distance", value[0])}
                      />
                    </div>
                    
                    <div>
                      <h3 className="text-sm font-medium mb-3">Good With</h3>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="mobile-children" 
                            checked={filters.goodWith?.includes("children")}
                            onCheckedChange={() => handleGoodWithChange("children")}
                          />
                          <Label htmlFor="mobile-children">Children</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="mobile-dogs" 
                            checked={filters.goodWith?.includes("dogs")}
                            onCheckedChange={() => handleGoodWithChange("dogs")}
                          />
                          <Label htmlFor="mobile-dogs">Dogs</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Checkbox 
                            id="mobile-cats" 
                            checked={filters.goodWith?.includes("cats")}
                            onCheckedChange={() => handleGoodWithChange("cats")}
                          />
                          <Label htmlFor="mobile-cats">Cats</Label>
                        </div>
                      </div>
                    </div>
                    
                    <Button 
                      variant="outline" 
                      onClick={clearFilters}
                      className="w-full"
                    >
                      Clear All Filters
                    </Button>
                  </div>
                </SheetContent>
              </Sheet>
              
              <Button onClick={clearFilters} variant="ghost" size="sm">
                Clear
              </Button>
            </div>
          </div>
          
          {/* Desktop Filters */}
          <div className="hidden md:flex mt-4 space-x-6">
            <div>
              <Select 
                value={filters.age} 
                onValueChange={(value) => handleFilterChange("age", value)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Age" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="baby">Baby</SelectItem>
                  <SelectItem value="young">Young</SelectItem>
                  <SelectItem value="adult">Adult</SelectItem>
                  <SelectItem value="senior">Senior</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select 
                value={filters.gender} 
                onValueChange={(value) => handleFilterChange("gender", value)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Select 
                value={filters.size} 
                onValueChange={(value) => handleFilterChange("size", value)}
              >
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Size" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="small">Small</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="large">Large</SelectItem>
                  <SelectItem value="xlarge">Extra Large</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-neutral-600">Distance: {filters.distance} miles</span>
              <div className="w-40">
                <Slider
                  value={[filters.distance || 50]}
                  min={1}
                  max={100}
                  step={1}
                  onValueChange={(value) => handleFilterChange("distance", value[0])}
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <span className="text-sm text-neutral-600">Good with:</span>
              <div className="flex space-x-3">
                <div className="flex items-center space-x-1">
                  <Checkbox 
                    id="children" 
                    checked={filters.goodWith?.includes("children")}
                    onCheckedChange={() => handleGoodWithChange("children")}
                  />
                  <Label htmlFor="children" className="text-sm">Children</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <Checkbox 
                    id="dogs" 
                    checked={filters.goodWith?.includes("dogs")}
                    onCheckedChange={() => handleGoodWithChange("dogs")}
                  />
                  <Label htmlFor="dogs" className="text-sm">Dogs</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <Checkbox 
                    id="cats" 
                    checked={filters.goodWith?.includes("cats")}
                    onCheckedChange={() => handleGoodWithChange("cats")}
                  />
                  <Label htmlFor="cats" className="text-sm">Cats</Label>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Pet Listings */}
        <Tabs defaultValue="grid" className="mb-4">
          <div className="flex justify-between items-center">
            <div className="text-neutral-600">
              {isLoading ? (
                <span>Loading pets...</span>
              ) : pets && pets.length > 0 ? (
                <span>Showing {pets.length} pets</span>
              ) : (
                <span>No pets found with the current filters</span>
              )}
            </div>
            <TabsList>
              <TabsTrigger value="grid">Grid</TabsTrigger>
              <TabsTrigger value="list">List</TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="grid" className="mt-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : pets && pets.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {pets.map((pet) => (
                  <PetCard key={pet.id} pet={pet} />
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                <div className="mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1543852786-1cf6624b9987?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300" 
                    alt="No pets found" 
                    className="w-32 h-32 object-cover rounded-full mx-auto"
                  />
                </div>
                <h3 className="text-2xl font-semibold text-neutral-800 mb-2">No Pets Found</h3>
                <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                  We couldn't find any pets matching your search criteria. Try adjusting your filters or check back later for new additions.
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear All Filters
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="list" className="mt-6">
            {isLoading ? (
              <div className="flex justify-center items-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-primary" />
              </div>
            ) : pets && pets.length > 0 ? (
              <div className="space-y-4">
                {pets.map((pet) => (
                  <div key={pet.id} className="flex flex-col sm:flex-row bg-white rounded-xl shadow-sm overflow-hidden">
                    <div className="sm:w-1/4">
                      <img 
                        src={pet.imageUrl} 
                        alt={pet.name} 
                        className="w-full h-48 sm:h-full object-cover"
                      />
                    </div>
                    <div className="p-4 sm:w-3/4 flex flex-col justify-between">
                      <div>
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="text-xl font-semibold text-neutral-800">{pet.name}</h3>
                          <div className="flex space-x-2">
                            <div className="bg-primary-light text-white text-xs px-2 py-1 rounded-full">
                              {pet.species}
                            </div>
                            <div className="bg-accent text-white text-xs px-2 py-1 rounded-full">
                              {pet.status}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center text-sm text-neutral-600 mb-3">
                          <span className="flex items-center mr-3">🎂 {pet.age}</span>
                          <span className="flex items-center mr-3">
                            {pet.gender === "Male" ? "♂️" : "♀️"} {pet.gender}
                          </span>
                          <span className="flex items-center">📍 {pet.distance} miles</span>
                        </div>
                        <p className="text-neutral-700 mb-4">{pet.description}</p>
                      </div>
                      <div className="flex justify-between items-center">
                        <Button variant="ghost" className="text-primary font-medium hover:text-primary/80 hover:bg-primary/5 transition-colors">
                          View Details
                        </Button>
                        <Button className="text-white bg-secondary hover:bg-secondary/90 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors">
                          <Heart className="mr-1 h-4 w-4" />
                          Favorite
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-20 bg-white rounded-xl shadow-sm">
                <div className="mb-4">
                  <img 
                    src="https://images.unsplash.com/photo-1543852786-1cf6624b9987?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=300&h=300" 
                    alt="No pets found" 
                    className="w-32 h-32 object-cover rounded-full mx-auto"
                  />
                </div>
                <h3 className="text-2xl font-semibold text-neutral-800 mb-2">No Pets Found</h3>
                <p className="text-neutral-600 mb-6 max-w-md mx-auto">
                  We couldn't find any pets matching your search criteria. Try adjusting your filters or check back later for new additions.
                </p>
                <Button onClick={clearFilters} variant="outline">
                  Clear All Filters
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdoptPage;
