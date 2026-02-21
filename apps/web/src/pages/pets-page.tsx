import { useState, useEffect, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation, useSearch } from "wouter";
import type { Pet } from "@pawpal/shared/schema";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PetCard } from "@/components/ui/pet-card";
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
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Accordion, 
  AccordionContent, 
  AccordionItem, 
  AccordionTrigger 
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Search } from "lucide-react";
import { CardGridSkeleton } from "@/components/skeletons/page-skeletons";
import { Separator } from "@/components/ui/separator";
import { getPetDisplayName } from "@/lib/pet-display";

export default function PetsPage() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(useSearch());
  
  // Get species from URL query parameters if present
  const speciesParam = searchParams.get("species") || "";
  
  // Filter states
  const [searchTerm, setSearchTerm] = useState("");
  const [species, setSpecies] = useState<string>(speciesParam);
  const [ageRange, setAgeRange] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [size, setSize] = useState<string>("");
  const [goodWith, setGoodWith] = useState<{
    kids: boolean;
    dogs: boolean;
    cats: boolean;
  }>({
    kids: false,
    dogs: false,
    cats: false
  });
  
  // Set species filter if it's passed in URL
  useEffect(() => {
    if (speciesParam) {
      setSpecies(speciesParam);
    }
  }, [speciesParam]);
  
  // Fetch pets data
  const { data: pets, isLoading, isError } = useQuery<Pet[]>({
    queryKey: ["/api/pets?status=available"],
  });
  
  const filteredPets = useMemo(() => {
    if (!pets) return [];

    return pets.filter((pet) => {
      const petDisplayName = getPetDisplayName(pet);

      // Search term filter (name or breed)
      if (
        searchTerm && 
        !petDisplayName.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !pet.breed.toLowerCase().includes(searchTerm.toLowerCase())
      ) {
        return false;
      }
      
      // Species filter
      if (species && pet.species !== species) {
        return false;
      }
      
      // Age range filter
      if (ageRange) {
        const age = pet.age; // Age in months
        
        if (ageRange === "puppy" && age >= 12) return false;
        if (ageRange === "young" && (age < 12 || age >= 36)) return false;
        if (ageRange === "adult" && (age < 36 || age >= 84)) return false;
        if (ageRange === "senior" && age < 84) return false;
      }
      
      // Gender filter
      if (gender && pet.gender !== gender) {
        return false;
      }
      
      // Size filter
      if (size && pet.size !== size) {
        return false;
      }
      
      // Good with filter
      if (goodWith.kids && !pet.goodWith.kids) return false;
      if (goodWith.dogs && !pet.goodWith.dogs) return false;
      if (goodWith.cats && !pet.goodWith.cats) return false;
      
      return true;
    });
  }, [pets, searchTerm, species, ageRange, gender, size, goodWith]);
  
  const resetFilters = () => {
    setSearchTerm("");
    setSpecies("");
    setAgeRange("");
    setGender("");
    setSize("");
    setGoodWith({ kids: false, dogs: false, cats: false });
    
    // Reset URL to remove query params
    setLocation("/pets");
  };
  
  return (
    <>
      <Helmet>
        <title>Adopt a Pet - PawPal</title>
        <meta name="description" content="Browse our available pets for adoption. Find dogs, cats, rabbits, birds and more looking for their forever homes." />
      </Helmet>
      
      <Navbar />
      
      <main className="bg-neutral-100 min-h-screen">
        {/* Page Header */}
        <div className="bg-[#4A6FA5] text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Adopt a Pet</h1>
            <p className="text-lg max-w-3xl">
              Browse our available pets and find your perfect companion. Each pet is unique and ready to find their forever home with a loving family.
            </p>
          </div>
        </div>
        
        {/* Content Area */}
        <div className="container mx-auto px-4 py-12">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Filters Sidebar */}
            <div className="w-full lg:w-1/4">
              <Card className="sticky top-24">
                <CardHeader>
                  <CardTitle className="text-xl flex justify-between items-center">
                    Filters
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={resetFilters}
                      className="text-sm"
                    >
                      Reset
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    {/* Search */}
                    <div>
                      <label htmlFor="search" className="text-sm font-medium block mb-2">
                        Search
                      </label>
                      <div className="relative">
                        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-neutral-500" />
                        <Input
                          id="search"
                          type="text"
                          placeholder="Search by name or breed"
                          value={searchTerm}
                          onChange={e => setSearchTerm(e.target.value)}
                          className="pl-8"
                        />
                      </div>
                    </div>
                    
                    <Separator />
                    
                    {/* Species filter */}
                    <div>
                      <label htmlFor="species" className="text-sm font-medium block mb-2">
                        Species
                      </label>
                      <Select value={species} onValueChange={setSpecies}>
                        <SelectTrigger id="species">
                          <SelectValue placeholder="All Species" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">All Species</SelectItem>
                          <SelectItem value="dog">Dogs</SelectItem>
                          <SelectItem value="cat">Cats</SelectItem>
                          <SelectItem value="rabbit">Rabbits</SelectItem>
                          <SelectItem value="bird">Birds</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Age filter */}
                    <div>
                      <label htmlFor="age" className="text-sm font-medium block mb-2">
                        Age
                      </label>
                      <Select value={ageRange} onValueChange={setAgeRange}>
                        <SelectTrigger id="age">
                          <SelectValue placeholder="Any Age" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any-age">Any Age</SelectItem>
                          <SelectItem value="puppy">Baby (0-1 year)</SelectItem>
                          <SelectItem value="young">Young (1-3 years)</SelectItem>
                          <SelectItem value="adult">Adult (3-7 years)</SelectItem>
                          <SelectItem value="senior">Senior (7+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Gender filter */}
                    <div>
                      <label htmlFor="gender" className="text-sm font-medium block mb-2">
                        Gender
                      </label>
                      <Select value={gender} onValueChange={setGender}>
                        <SelectTrigger id="gender">
                          <SelectValue placeholder="Any Gender" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any-gender">Any Gender</SelectItem>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Size filter */}
                    <div>
                      <label htmlFor="size" className="text-sm font-medium block mb-2">
                        Size
                      </label>
                      <Select value={size} onValueChange={setSize}>
                        <SelectTrigger id="size">
                          <SelectValue placeholder="Any Size" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="any-size">Any Size</SelectItem>
                          <SelectItem value="small">Small</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="large">Large</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    {/* Good with filter */}
                    <Accordion type="single" collapsible>
                      <AccordionItem value="good-with">
                        <AccordionTrigger className="text-sm font-medium">
                          Good With
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="space-y-2 pt-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="good-with-kids" 
                                checked={goodWith.kids} 
                                onCheckedChange={(checked) => 
                                  setGoodWith({...goodWith, kids: checked as boolean})
                                }
                              />
                              <label 
                                htmlFor="good-with-kids"
                                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Children
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="good-with-dogs" 
                                checked={goodWith.dogs} 
                                onCheckedChange={(checked) => 
                                  setGoodWith({...goodWith, dogs: checked as boolean})
                                }
                              />
                              <label 
                                htmlFor="good-with-dogs"
                                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Dogs
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox 
                                id="good-with-cats" 
                                checked={goodWith.cats} 
                                onCheckedChange={(checked) => 
                                  setGoodWith({...goodWith, cats: checked as boolean})
                                }
                              />
                              <label 
                                htmlFor="good-with-cats"
                                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                              >
                                Cats
                              </label>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Pets Grid */}
            <div className="w-full lg:w-3/4">
              {isLoading ? (
                <CardGridSkeleton cards={6} />
              ) : isError ? (
                <div className="text-center py-12">
                  <p className="text-red-500">Error loading pets. Please try again later.</p>
                </div>
              ) : filteredPets.length > 0 ? (
                <>
                  <div className="mb-6 flex justify-between items-center">
                    <h2 className="text-xl font-semibold">
                      {filteredPets.length} {filteredPets.length === 1 ? 'Pet' : 'Pets'} Available
                    </h2>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredPets.map(pet => (
                      <PetCard key={pet.id} pet={pet} />
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                  <h3 className="text-xl font-semibold mb-2">No Pets Found</h3>
                  <p className="text-neutral-600 mb-6">
                    We couldn't find any pets matching your filters. Try adjusting your search criteria.
                  </p>
                  <Button onClick={resetFilters}>Reset Filters</Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
