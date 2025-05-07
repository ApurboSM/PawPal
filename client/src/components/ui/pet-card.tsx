import { Link } from "wouter";
import { 
  Card, 
  CardContent, 
  CardFooter 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { 
  Cake, 
  MapPin, 
  Heart 
} from "lucide-react";
import { Pet } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";

interface PetCardProps {
  pet: Pet;
}

export function PetCard({ pet }: PetCardProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isFavorited, setIsFavorited] = useState(false);

  const handleFavorite = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Login Required",
        description: "Please login to favorite pets.",
        variant: "destructive"
      });
      return;
    }
    
    setIsFavorited(!isFavorited);
    toast({
      title: isFavorited ? "Removed from favorites" : "Added to favorites",
      description: isFavorited 
        ? `${pet.name} has been removed from your favorites.` 
        : `${pet.name} has been added to your favorites.`
    });
  };

  // Helper function to format pet age
  const formatAge = (ageInMonths: number) => {
    if (ageInMonths < 12) {
      return `${ageInMonths} month${ageInMonths !== 1 ? 's' : ''}`;
    } else {
      const years = Math.floor(ageInMonths / 12);
      const months = ageInMonths % 12;
      if (months === 0) {
        return `${years} year${years !== 1 ? 's' : ''}`;
      }
      return `${years} year${years !== 1 ? 's' : ''}, ${months} month${months !== 1 ? 's' : ''}`;
    }
  };

  return (
    <Card className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden h-full">
      <div className="relative">
        <img 
          src={pet.imageUrl} 
          alt={`${pet.name} - ${pet.breed}`} 
          className="w-full h-48 object-cover"
        />
        <Badge 
          className="absolute top-3 right-3 bg-[#47B881] hover:bg-[#3A9268] text-white font-bold text-xs"
        >
          {pet.status === "available" ? "Available" : pet.status}
        </Badge>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-neutral-800">{pet.name}</h3>
          <Badge 
            className="bg-[#6B8DB9] hover:bg-[#4A6FA5] text-white text-xs"
          >
            {pet.species.charAt(0).toUpperCase() + pet.species.slice(1)}
          </Badge>
        </div>
        <div className="flex flex-wrap items-center text-sm text-neutral-600 mb-3">
          <span className="flex items-center mr-3 mb-1">
            <Cake className="h-4 w-4 mr-1" /> {formatAge(pet.age)}
          </span>
          <span className="flex items-center mr-3 mb-1">
            {pet.gender === "male" ? (
              <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M17 17L7 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            ) : (
              <svg className="h-4 w-4 mr-1" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M12 22V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 17H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M9 14L15 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M15 14L9 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            )}
            {pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1)}
          </span>
          <span className="flex items-center mb-1">
            <MapPin className="h-4 w-4 mr-1" /> {pet.location}
          </span>
        </div>
        <p className="text-neutral-700 mb-4 line-clamp-2">{pet.description}</p>
      </CardContent>
      <CardFooter className="flex justify-between items-center p-4 pt-0">
        <Link href={`/pets/${pet.id}`}>
          <Button variant="ghost" className="text-[#4A6FA5] font-medium hover:text-[#3A5A87]">
            View Details
          </Button>
        </Link>
        <Button 
          variant="secondary"
          className={`text-white ${isFavorited ? 'bg-[#E57A53]' : 'bg-[#FF9166]'} hover:bg-[#E57A53] px-3 py-1.5 rounded-lg text-sm font-medium transition-colors`}
          onClick={handleFavorite}
        >
          <Heart className={`h-4 w-4 mr-1 ${isFavorited ? 'fill-current' : ''}`} />
          {isFavorited ? 'Favorited' : 'Favorite'}
        </Button>
      </CardFooter>
    </Card>
  );
}
