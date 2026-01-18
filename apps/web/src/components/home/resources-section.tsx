import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useQuery } from "@tanstack/react-query";
import type { Resource } from "@pawpal/shared/schema";
import { Skeleton } from "@/components/ui/skeleton";

const ResourcesSection = () => {
  const { data: resources, isLoading } = useQuery<Resource[]>({
    queryKey: ["/api/resources/featured"],
  });

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
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl shadow-md overflow-hidden">
                <Skeleton className="w-full h-48" />
                <div className="p-5">
                  <Skeleton className="h-4 w-24 mb-3" />
                  <Skeleton className="h-6 w-3/4 mb-2" />
                  <Skeleton className="h-4 w-full mb-4" />
                  <Skeleton className="h-4 w-32" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {resources && resources.length > 0 ? (
              resources.map((resource) => (
                <div key={resource.id} className="bg-white rounded-xl shadow-md overflow-hidden">
                  <img 
                    src={resource.imageUrl} 
                    alt={resource.title} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-5">
                    <span className="text-xs font-semibold text-primary bg-primary bg-opacity-10 rounded-full px-3 py-1">
                      {resource.category}
                    </span>
                    <h3 className="text-xl font-semibold text-neutral-800 mt-3 mb-2">{resource.title}</h3>
                    <p className="text-neutral-600 mb-4">{resource.summary}</p>
                    <Link href={`/resources/${resource.id}`}>
                      <a className="text-primary font-medium flex items-center hover:text-primary/80 transition-colors">
                        Read More <span className="ml-2">→</span>
                      </a>
                    </Link>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-lg text-neutral-600">No resources available at the moment.</p>
              </div>
            )}
          </div>
        )}

        <div className="text-center mt-10">
          <Link href="/resources">
            <Button className="inline-flex items-center px-6 py-3 bg-primary text-white font-semibold rounded-lg hover:bg-primary/90 transition-colors">
              View All Resources <span className="ml-2">→</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default ResourcesSection;
