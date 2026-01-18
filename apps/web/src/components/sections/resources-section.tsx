import { useQuery } from "@tanstack/react-query";
import type { Resource } from "@pawpal/shared/schema";
import { ResourceCard } from "@/components/ui/resource-card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ChevronRight, Loader2 } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";

export function ResourcesSection() {
  const { data: resources, isLoading } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });

  const renderSkeletonCards = () => {
    return Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="bg-white rounded-xl shadow-md overflow-hidden">
        <Skeleton className="w-full h-48" />
        <div className="p-5">
          <Skeleton className="h-6 w-32 rounded-full" />
          <Skeleton className="h-7 w-full mt-3 mb-2" />
          <Skeleton className="h-4 w-full mb-1" />
          <Skeleton className="h-4 w-3/4 mb-4" />
          <Skeleton className="h-6 w-28" />
        </div>
      </div>
    ));
  };

  return (
    <section className="py-16 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-800 mb-2">Pet Care Resources</h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Learn more about pet care with our helpful guides and articles.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderSkeletonCards()}
          </div>
        ) : resources && resources.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resources.slice(0, 3).map((resource) => (
              <ResourceCard key={resource.id} resource={resource} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p>No resources are currently available. Please check back later.</p>
          </div>
        )}

        <div className="text-center mt-10">
          <Link href="/resources">
            <Button 
              className="inline-flex items-center px-6 py-3 bg-[#4A6FA5] text-white font-semibold rounded-lg hover:bg-[#3A5A87] transition-colors"
              size="lg"
            >
              View All Resources <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
