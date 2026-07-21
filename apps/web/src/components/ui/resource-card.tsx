import { useState } from "react";
import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowRight, Clock } from "lucide-react";
import { prefetchRoute } from "@/lib/route-imports";
import { readingTimeMinutes } from "@/lib/resource-utils";
import type { Resource } from "@pawpal/shared/schema";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1450778869180-41d0601e046e?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=60";

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const [imageError, setImageError] = useState(false);

  return (
    <Link
      href={`/resources/${resource.id}`}
      // Warm the detail chunk while the pointer is still on the card.
      onPointerEnter={() => prefetchRoute(`/resources/${resource.id}`)}
      className="group block h-full rounded-2xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2"
    >
      <Card className="flex h-full flex-col overflow-hidden rounded-2xl border-primary/10 bg-white shadow-sm transition-shadow duration-300 hover:shadow-lg">
        <div className="relative overflow-hidden">
          <img
            src={imageError ? FALLBACK_IMAGE : resource.imageUrl}
            alt=""
            loading="lazy"
            decoding="async"
            onError={() => setImageError(true)}
            className="h-48 w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <Badge className="absolute left-3 top-3 rounded-full border border-white/60 bg-white/90 px-3 py-1 text-xs font-semibold text-primary hover:bg-white">
            {resource.category}
          </Badge>
        </div>

        <CardContent className="flex flex-1 flex-col p-5">
          <h3 className="mb-2 line-clamp-2 text-lg font-bold text-foreground transition-colors group-hover:text-primary sm:text-xl">
            {resource.title}
          </h3>

          <p className="mb-4 line-clamp-3 text-sm leading-relaxed text-muted-foreground">
            {resource.summary}
          </p>

          <div className="mt-auto flex items-center justify-between gap-2 pt-1">
            <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {readingTimeMinutes(resource.content)} min read
            </span>
            <span className="flex items-center gap-1.5 text-sm font-semibold text-primary">
              Read more
              <ArrowRight
                className="h-4 w-4 transition-transform duration-200 group-hover:translate-x-1"
                aria-hidden="true"
              />
            </span>
          </div>
        </CardContent>
      </Card>
    </Link>
  );
}
