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
  Heart,
  PawPrint,
  ArrowRight
} from "lucide-react";
import type { Pet } from "@pawpal/shared/schema";
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

  // Fallback image handling
  const getFallbackImage = (species: string) => {
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
    
    return fallbackImages[species] || 'https://images.unsplash.com/photo-1535930891776-0c2dfb7fda1a?ixlib=rb-4.0.3&auto=format&fit=crop&w=600&q=60';
  };
  
  const [imageError, setImageError] = useState(false);
  
  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <Card className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-md hover:shadow-xl transition-all-ease overflow-hidden h-full group">
      <div className="relative overflow-hidden">
        <img 
          src={imageError ? getFallbackImage(pet.species) : pet.imageUrl} 
          alt={`${pet.name} - ${pet.breed}`} 
          className="w-full h-52 object-cover transition-all duration-500 group-hover:scale-110"
          onError={handleImageError}
          loading="lazy"
          decoding="async"
        />
        {/* Image overlay gradient on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-300"></div>
        
        <Badge 
          className="absolute top-3 right-3 bg-accent hover:bg-accent/90 text-white font-medium text-xs px-3 py-1 rounded-full shadow-md"
        >
          {pet.status === "available" ? "Available" : pet.status}
        </Badge>
        
        {/* Pop-up view details button on hover */}
        <div className="absolute bottom-4 left-0 right-0 flex justify-center opacity-0 transform translate-y-4 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-300">
          <Link href={`/pets/${pet.id}`}>
            <Button 
              variant="default"
              className="bg-white text-primary hover:bg-white/90 rounded-full shadow-lg"
              size="sm"
            >
              <ArrowRight className="h-4 w-4 mr-1" />
              View Details
            </Button>
          </Link>
        </div>
      </div>
      
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-3">
          <h3 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">{pet.name}</h3>
          <Badge 
            className="bg-primary/10 text-primary text-xs rounded-full border border-primary/20"
          >
            {pet.species.charAt(0).toUpperCase() + pet.species.slice(1)}
          </Badge>
        </div>
        
        <div className="flex flex-wrap items-center text-sm text-foreground/70 mb-4 space-y-2">
          <div className="flex flex-wrap w-full">
            <span className="flex items-center mr-3 mb-1 bg-primary/5 px-2 py-1 rounded-full">
              <Cake className="h-3.5 w-3.5 mr-1 text-primary/70" /> {formatAge(pet.age)}
            </span>
            <span className="flex items-center mr-3 mb-1 bg-primary/5 px-2 py-1 rounded-full">
              {pet.gender === "male" ? (
                <svg className="h-3.5 w-3.5 mr-1 text-primary/70" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 22V12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M17 17L7 17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              ) : (
                <svg className="h-3.5 w-3.5 mr-1 text-primary/70" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M12 12C14.7614 12 17 9.76142 17 7C17 4.23858 14.7614 2 12 2C9.23858 2 7 4.23858 7 7C7 9.76142 9.23858 12 12 12Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M12 22V17" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 17H15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M9 14L15 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  <path d="M15 14L9 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              )}
              {pet.gender.charAt(0).toUpperCase() + pet.gender.slice(1)}
            </span>
          </div>
          <span className="flex items-center mb-1 w-full">
            <MapPin className="h-3.5 w-3.5 mr-1 text-primary/70" /> {pet.location}
          </span>
        </div>
        
        <p className="text-foreground mb-4 line-clamp-2 text-sm">{pet.description}</p>
      </CardContent>
      
      <CardFooter className="flex justify-between items-center p-6 pt-0 border-t border-primary/5">
        {/* Desktop View Details */}
        <div className="hidden md:block">
          <Link href={`/pets/${pet.id}`}>
            <Button 
              variant="ghost" 
              className="text-primary font-medium hover:text-primary/80 hover:bg-primary/5 rounded-full group transition-all duration-300"
            >
              <PawPrint className="h-4 w-4 mr-1.5 group-hover:rotate-12 transition-transform duration-300" />
              Details
            </Button>
          </Link>
        </div>
        
        {/* Mobile - show smaller pawprint button on mobile */}
        <div className="md:hidden">
          <Link href={`/pets/${pet.id}`}>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-9 w-9 rounded-full text-primary hover:text-primary/80 hover:bg-primary/5"
            >
              <PawPrint className="h-5 w-5" />
            </Button>
          </Link>
        </div>
        
        <Button 
          variant={isFavorited ? "default" : "outline"}
          className={`
            rounded-full transition-all duration-300 
            ${isFavorited 
              ? 'bg-primary text-white hover:bg-primary/90' 
              : 'border-primary/20 text-primary hover:border-primary hover:bg-primary/5'
            }
          `}
          onClick={handleFavorite}
          size="sm"
        >
          <Heart className={`h-4 w-4 mr-1.5 ${isFavorited ? 'fill-current animate-pulse' : ''}`} />
          {isFavorited ? 'Favorited' : 'Favorite'}
        </Button>
      </CardFooter>
    </Card>
  );
}
