import { useQuery } from "@tanstack/react-query";
import type { Testimonial } from "@pawpal/shared/schema";
import { TestimonialCard } from "@/components/ui/testimonial-card";
import { Skeleton } from "@/components/ui/skeleton";

export function Testimonials() {
  const { data: testimonials, isLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
  });

  const renderSkeletonCards = () => {
    return Array.from({ length: 3 }).map((_, index) => (
      <div key={index} className="bg-white p-6 rounded-xl shadow-md">
        <div className="flex items-center mb-4">
          <Skeleton className="h-5 w-24" />
        </div>
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-full mb-1" />
        <Skeleton className="h-4 w-3/4 mb-6" />
        <div className="flex items-center">
          <Skeleton className="w-12 h-12 rounded-full" />
          <div className="ml-3">
            <Skeleton className="h-5 w-24 mb-1" />
            <Skeleton className="h-4 w-32" />
          </div>
        </div>
      </div>
    ));
  };

  return (
    <section className="py-16 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-800 mb-2">Adoption Stories</h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Hear from families who found their perfect companions through PawPal.
          </p>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {renderSkeletonCards()}
          </div>
        ) : testimonials && testimonials.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.slice(0, 3).map((testimonial) => (
              <TestimonialCard key={testimonial.id} testimonial={testimonial} />
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p>No testimonials available yet. Be the first to share your adoption story!</p>
          </div>
        )}
      </div>
    </section>
  );
}
