import { useQuery } from "@tanstack/react-query";
import { Pet } from "@shared/schema";
import { PetCard } from "@/components/ui/pet-card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronRight, Heart, PawPrint } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function FeaturedPets() {
  const { data: pets, isLoading } = useQuery<Pet[]>({
    queryKey: ["/api/pets?status=available"],
  });

  const renderSkeletonCards = () => {
    return Array.from({ length: 4 }).map((_, index) => (
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
            {pets.slice(0, 4).map((pet) => (
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
