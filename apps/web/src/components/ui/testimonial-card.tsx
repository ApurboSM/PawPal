import { Card, CardContent } from "@/components/ui/card";
import { Star, StarHalf } from "lucide-react";
import type { Testimonial } from "@pawpal/shared/schema";

interface TestimonialCardProps {
  testimonial: Testimonial;
}

export function TestimonialCard({ testimonial }: TestimonialCardProps) {
  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    return (
      <div className="flex items-center mb-4">
        <div className="text-yellow-400 text-xl flex">
          {[...Array(fullStars)].map((_, i) => (
            <Star key={i} className="fill-current" />
          ))}
          {hasHalfStar && <StarHalf className="fill-current" />}
        </div>
      </div>
    );
  };

  return (
    <Card className="bg-white p-6 rounded-xl shadow-md">
      {renderStars(testimonial.rating)}
      <p className="text-neutral-700 mb-6 italic">
        "{testimonial.content}"
      </p>
      <div className="flex items-center">
        {testimonial.imageUrl ? (
          <img 
            src={testimonial.imageUrl} 
            alt={testimonial.name} 
            className="w-12 h-12 rounded-full object-cover"
          />
        ) : (
          <div className="w-12 h-12 rounded-full bg-[#4A6FA5] text-white flex items-center justify-center text-lg font-semibold">
            {testimonial.name.charAt(0)}
          </div>
        )}
        <div className="ml-3">
          <h4 className="font-semibold text-neutral-800">{testimonial.name}</h4>
          <p className="text-sm text-neutral-600">
            Adopted {testimonial.petName} ({testimonial.petType})
          </p>
        </div>
      </div>
    </Card>
  );
}
