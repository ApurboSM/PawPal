import { useQuery } from "@tanstack/react-query";
import { Pet } from "@shared/schema";
import { PetCard } from "@/components/ui/pet-card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronRight, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function FeaturedPets() {
  const { data: pets, isLoading } = useQuery<Pet[]>({
    queryKey: ["/api/pets?status=available"],
  });

  const renderSkeletonCards = () => {
    return Array.from({ length: 4 }).map((_, index) => (
      <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
        <Skeleton className="w-full h-48" />
        <div className="p-4">
          <div className="flex justify-between items-start mb-2">
            <Skeleton className="h-6 w-24" />
            <Skeleton className="h-5 w-16 rounded-full" />
          </div>
          <div className="flex items-center text-sm text-neutral-600 mb-3">
            <Skeleton className="h-4 w-20 mr-3" />
            <Skeleton className="h-4 w-16 mr-3" />
            <Skeleton className="h-4 w-24" />
          </div>
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-3/4 mb-4" />
          <div className="flex justify-between items-center">
            <Skeleton className="h-8 w-24" />
            <Skeleton className="h-8 w-28" />
          </div>
        </div>
      </div>
    ));
  };

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-800 mb-2">Featured Pets</h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Meet our adorable friends waiting for their forever homes. Each one has a unique personality and lots of love to give.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {renderSkeletonCards()}
          </div>
        ) : pets && pets.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pets.slice(0, 4).map((pet) => (
              <PetCard key={pet.id} pet={pet} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p>No pets are currently available for adoption. Please check back later.</p>
          </div>
        )}

        <div className="text-center mt-10">
          <Link href="/pets">
            <Button 
              className="inline-flex items-center px-6 py-3 bg-[#4A6FA5] text-white font-semibold rounded-lg hover:bg-[#3A5A87] transition-colors"
              size="lg"
            >
              View All Pets <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
