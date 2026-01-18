import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Skeleton } from "@/components/ui/skeleton";
import PetCard from "../pet/pet-card";
import type { Pet } from "@pawpal/shared/schema";

const FeaturedPets = () => {
  const { data: pets, isLoading } = useQuery<Pet[]>({
    queryKey: ["/api/pets/featured"],
  });

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
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden">
                <Skeleton className="w-full h-48" />
                <div className="p-4">
                  <Skeleton className="h-6 w-2/3 mb-2" />
                  <Skeleton className="h-4 w-full mb-3" />
                  <Skeleton className="h-4 w-3/4 mb-4" />
                  <div className="flex justify-between">
                    <Skeleton className="h-8 w-1/3" />
                    <Skeleton className="h-8 w-1/3" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {pets && pets.length > 0 ? (
              pets.map((pet) => <PetCard key={pet.id} pet={pet} />)
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-lg text-neutral-600">No featured pets available at the moment.</p>
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-10">
          <Link href="/adopt">
            <Button className="inline-flex items-center px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors">
              View All Pets <span className="ml-2">→</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedPets;
