import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ChevronRight } from "lucide-react";
import type { Resource } from "@pawpal/shared/schema";

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  return (
    <Card className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300 overflow-hidden h-full">
      <img 
        src={resource.imageUrl} 
        alt={resource.title} 
        className="w-full h-48 object-cover"
      />
      <CardContent className="p-5">
        <Badge 
          className="text-xs font-semibold text-[#4A6FA5] bg-[#4A6FA5] bg-opacity-10 rounded-full px-3 py-1"
        >
          {resource.category}
        </Badge>
        <h3 className="text-xl font-semibold text-neutral-800 mt-3 mb-2">
          {resource.title}
        </h3>
        <p className="text-neutral-600 mb-4">
          {resource.summary}
        </p>
        <Link 
          href={`/resources/${resource.id}`}
          className="text-[#4A6FA5] font-medium flex items-center hover:text-[#3A5A87] transition-colors"
        >
          Read More <ChevronRight className="ml-2 h-4 w-4" />
        </Link>
      </CardContent>
    </Card>
  );
}
