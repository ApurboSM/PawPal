import { useQuery } from "@tanstack/react-query";
import type { Testimonial } from "@pawpal/shared/schema";
import { Skeleton } from "@/components/ui/skeleton";
import { Star } from "lucide-react";

const Testimonials = () => {
  const { data: testimonials, isLoading } = useQuery<Testimonial[]>({
    queryKey: ["/api/testimonials"],
  });

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
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-xl shadow-md">
                <Skeleton className="h-5 w-32 mb-4" />
                <Skeleton className="h-24 w-full mb-6" />
                <div className="flex items-center">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="ml-3">
                    <Skeleton className="h-5 w-24 mb-1" />
                    <Skeleton className="h-4 w-40" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials && testimonials.length > 0 ? (
              testimonials.map((testimonial) => (
                <div key={testimonial.id} className="bg-white p-6 rounded-xl shadow-md">
                  <div className="flex items-center mb-4">
                    <div className="text-yellow-400 flex">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`h-5 w-5 ${i < testimonial.rating ? "fill-current" : ""}`}
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-neutral-700 mb-6 italic">{testimonial.content}</p>
                  <div className="flex items-center">
                    <img
                      src={testimonial.imageUrl ?? "https://placehold.co/48x48"}
                      alt={testimonial.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    <div className="ml-3">
                      <h4 className="font-semibold text-neutral-800">{testimonial.name}</h4>
                      <p className="text-sm text-neutral-600">Adopted {testimonial.petName} ({testimonial.petType})</p>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full text-center py-10">
                <p className="text-lg text-neutral-600">No testimonials available at the moment.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default Testimonials;
