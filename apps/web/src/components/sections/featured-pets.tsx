import { useQuery } from "@tanstack/react-query";
import type { Pet } from "@pawpal/shared/schema";
import { PetCard } from "@/components/ui/pet-card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronRight, Heart, PawPrint } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function FeaturedPets() {
  const { data: pets, isLoading } = useQuery<Pet[]>({
    queryKey: ["/api/pets?status=available"],
  });

  // Ensure we display a diverse set of pet types with priority to include all animal varieties
  const getFilteredPets = () => {
    if (!pets || pets.length === 0) return [];
    
    // First, find Buddy and Luna to place at the top
    const buddyAndLuna: Pet[] = [];
    const dogLuna = pets.filter(pet => pet.name === "Buddy" || pet.name === "Luna");
    if (dogLuna.length > 0) {
      buddyAndLuna.push(...dogLuna);
    }
    
    // Get remaining pets excluding Buddy and Luna
    const remainingPetsPool = pets.filter(pet => pet.name !== "Buddy" && pet.name !== "Luna");
    
    // Prioritize species we want to ensure are included
    const targetSpecies = ["guinea_pig", "fish", "parrot", "rabbit", "hamster", "bird"];
    const petsBySpecies: Record<string, Pet[]> = {};
    
    // Group remaining pets by species
    remainingPetsPool.forEach(pet => {
      if (!petsBySpecies[pet.species]) {
        petsBySpecies[pet.species] = [];
      }
      petsBySpecies[pet.species].push(pet);
    });
    
    // Select one from each target species if available (excluding dog and cat since we prioritized Buddy and Luna)
    const featuredPets: Pet[] = [...buddyAndLuna];
    targetSpecies.forEach(species => {
      if (petsBySpecies[species]?.length > 0) {
        // Ensure all pets have valid image URLs
        const petsWithImages = petsBySpecies[species].filter(pet => 
          pet.imageUrl && pet.imageUrl.trim() !== '' && !pet.imageUrl.includes('undefined')
        );
        
        if (petsWithImages.length > 0) {
          featuredPets.push(petsWithImages[0]);
          // Remove the selected pet from the pool
          petsBySpecies[species] = petsBySpecies[species].filter(p => p.id !== petsWithImages[0].id);
        } else if (petsBySpecies[species].length > 0) {
          // If no pets with valid images, still include one but fix its image later
          featuredPets.push(petsBySpecies[species][0]);
          petsBySpecies[species] = petsBySpecies[species].slice(1);
        }
      }
    });
    
    // Then fill remaining slots with other pets to reach 8 total if possible
    const remainingPets = Object.values(petsBySpecies).flat();
    while (featuredPets.length < 8 && remainingPets.length > 0) {
      featuredPets.push(remainingPets.shift()!);
    }
    
    // Ensure all pets have valid image URLs (fallback to default images if needed)
    return featuredPets.map(pet => {
      // If image URL is missing or invalid, provide a fallback based on species
      if (!pet.imageUrl || pet.imageUrl.trim() === '' || pet.imageUrl.includes('undefined')) {
        const fallbackImages: Record<string, string> = {
          'dog': 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
          'cat': 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
          'rabbit': 'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
          'bird': 'https://images.unsplash.com/photo-1444464666168-49d633b86797?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
          'guinea_pig': 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
          'fish': 'https://images.unsplash.com/photo-1522720833375-9c27ffb02a5e?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
          'parrot': 'https://images.unsplash.com/photo-1552728089-57bdde30beb3?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60',
          'hamster': 'https://images.unsplash.com/photo-1425082661705-1834bfd09dca?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60'
        };
        
        return {
          ...pet,
          imageUrl: fallbackImages[pet.species] || 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60'
        };
      }
      return pet;
    });
  };

  const renderSkeletonCards = () => {
    return Array.from({ length: 8 }).map((_, index) => (
      <div key={index} className="bg-white/50 backdrop-blur-sm rounded-3xl shadow-md overflow-hidden transition-all-ease">
        <Skeleton className="w-full h-52 bg-primary/5" />
        <div className="p-6">
          <div className="flex justify-between items-start mb-3">
            <Skeleton className="h-6 w-24 bg-primary/10" />
            <Skeleton className="h-5 w-16 rounded-full bg-primary/10" />
          </div>
          <div className="flex items-center text-sm text-neutral-600 mb-4">
            <Skeleton className="h-4 w-20 mr-3 bg-primary/10" />
            <Skeleton className="h-4 w-16 mr-3 bg-primary/10" />
            <Skeleton className="h-4 w-24 bg-primary/10" />
          </div>
          <Skeleton className="h-4 w-full mb-2 bg-primary/10" />
          <Skeleton className="h-4 w-3/4 mb-6 bg-primary/10" />
          <div className="flex justify-between items-center">
            <Skeleton className="h-9 w-28 rounded-full bg-primary/10" />
            <Skeleton className="h-9 w-32 rounded-full bg-primary/10" />
          </div>
        </div>
      </div>
    ));
  };

  return (
    <section className="py-20 bg-gradient-to-b from-background to-primary/5 relative">
      {/* Decorative elements */}
      <div className="absolute top-12 left-6 opacity-5">
        <PawPrint className="h-36 w-36 text-primary rotate-12" />
      </div>
      <div className="absolute bottom-24 right-6 opacity-5">
        <PawPrint className="h-24 w-24 text-primary -rotate-12" />
      </div>
      
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center bg-primary/10 backdrop-blur-sm px-4 py-2 rounded-full mb-4 transition-all-ease">
            <Heart className="h-4 w-4 mr-2 text-accent" />
            <span className="text-sm font-medium text-foreground">Find Your Perfect Match</span>
          </div>
          
          <h2 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-4">
            Featured Furry Friends
          </h2>
          
          <p className="text-lg text-foreground/80 max-w-2xl mx-auto">
            Meet our adorable companions waiting for their forever homes. Each one has a unique personality and lots of love to give.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {renderSkeletonCards()}
          </div>
        ) : pets && pets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {getFilteredPets().map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-primary/5 rounded-3xl">
            <div className="flex flex-col items-center">
              <PawPrint className="h-16 w-16 text-primary/30 mb-4" />
              <p className="text-foreground text-lg">No pets are currently available for adoption. Please check back later.</p>
            </div>
          </div>
        )}

        <div className="text-center mt-12">
          <Link href="/pets">
            <Button 
              className="inline-flex items-center px-8 py-6 bg-primary text-white font-semibold rounded-full hover:bg-primary/90 shadow-lg hover:shadow-xl hover:translate-y-[-3px] transition-all duration-300 group"
              size="lg"
            >
              View All Pets <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform duration-300" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
