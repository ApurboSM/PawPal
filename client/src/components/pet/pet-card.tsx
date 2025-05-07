import { useState } from "react";
import { Link } from "wouter";
import { Pet } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useAuth } from "@/hooks/use-auth";

interface PetCardProps {
  pet: Pet;
}

const PetCard = ({ pet }: PetCardProps) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isFavorited, setIsFavorited] = useState(pet.isFavorited || false);

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("POST", `/api/pets/${pet.id}/favorite`, { favorited: !isFavorited });
    },
    onSuccess: () => {
      setIsFavorited(!isFavorited);
      queryClient.invalidateQueries({ queryKey: ["/api/pets/favorites"] });
      toast({
        title: isFavorited ? "Removed from favorites" : "Added to favorites",
        description: isFavorited ? `${pet.name} has been removed from your favorites.` : `${pet.name} has been added to your favorites.`,
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFavoriteClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast({
        title: "Authentication required",
        description: "Please log in to add pets to favorites.",
        variant: "destructive",
      });
      return;
    }
    
    toggleFavoriteMutation.mutate();
  };

  return (
    <Card className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden">
      <div className="relative">
        <img
          src={pet.imageUrl}
          alt={`${pet.name} - ${pet.breed}`}
          className="w-full h-48 object-cover"
        />
        <Badge className="absolute top-3 right-3 px-2 py-1 bg-accent text-white text-xs font-bold">
          {pet.status}
        </Badge>
      </div>
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-xl font-semibold text-neutral-800">{pet.name}</h3>
          <Badge variant="outline" className="bg-primary-light text-white text-xs px-2 py-1 rounded-full">
            {pet.species}
          </Badge>
        </div>
        <div className="flex items-center text-sm text-neutral-600 mb-3">
          <span className="flex items-center mr-3">🎂 {pet.age}</span>
          <span className="flex items-center mr-3">
            {pet.gender === "Male" ? "♂️" : "♀️"} {pet.gender}
          </span>
          <span className="flex items-center">📍 {pet.distance} miles</span>
        </div>
        <p className="text-neutral-700 mb-4 line-clamp-2">{pet.description}</p>
        <div className="flex justify-between items-center">
          <Link href={`/pet/${pet.id}`}>
            <Button variant="ghost" className="text-primary font-medium hover:text-primary/80 hover:bg-primary/5 transition-colors">
              View Details
            </Button>
          </Link>
          <Button
            onClick={handleFavoriteClick}
            className={`text-white ${
              isFavorited ? "bg-red-500 hover:bg-red-600" : "bg-secondary hover:bg-secondary/90"
            } px-3 py-1.5 rounded-lg text-sm font-medium transition-colors`}
            disabled={toggleFavoriteMutation.isPending}
          >
            <Heart className={`mr-1 h-4 w-4 ${isFavorited ? "fill-current" : ""}`} />
            {isFavorited ? "Favorited" : "Favorite"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default PetCard;
