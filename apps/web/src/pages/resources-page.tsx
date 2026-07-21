import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Resource } from "@pawpal/shared/schema";
import { ResourceCard } from "@/components/ui/resource-card";
import { Helmet } from "react-helmet";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CardGridSkeleton } from "@/components/skeletons/page-skeletons";
import { cn } from "@/lib/utils";
import { BookOpen, Search, X } from "lucide-react";

/** Sentinel for "no category filter". Kept distinct from a real category name. */
const ALL_CATEGORIES = "__all__";

export default function ResourcesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState<string>(ALL_CATEGORIES);

  const { data: resources, isLoading, isError, refetch } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });

  const categories = useMemo(
    () => (resources ? [...new Set(resources.map((r) => r.category))].sort() : []),
    [resources],
  );

  const filteredResources = useMemo(() => {
    if (!resources) return [];
    const term = searchTerm.trim().toLowerCase();

    return resources.filter((resource) => {
      if (categoryFilter !== ALL_CATEGORIES && resource.category !== categoryFilter) {
        return false;
      }
      if (!term) return true;

      return (
        resource.title.toLowerCase().includes(term) ||
        resource.summary.toLowerCase().includes(term) ||
        resource.content.toLowerCase().includes(term) ||
        resource.category.toLowerCase().includes(term)
      );
    });
  }, [resources, searchTerm, categoryFilter]);

  const hasFilters = searchTerm.trim() !== "" || categoryFilter !== ALL_CATEGORIES;
  const clearFilters = () => {
    setSearchTerm("");
    setCategoryFilter(ALL_CATEGORIES);
  };

  return (
    <>
      <Helmet>
        <title>Pet Care Resources - PawPal</title>
        <meta
          name="description"
          content="Access our comprehensive pet care resources. Learn about nutrition, training, health, and more to ensure your pet's well-being."
        />
      </Helmet>

      <main className="min-h-screen bg-background">
        <header className="bg-gradient-to-br from-primary via-primary to-secondary py-12 text-primary-foreground sm:py-16">
          <div className="container mx-auto px-4">
            <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-3 py-1 text-sm font-medium">
              <BookOpen className="h-4 w-4" aria-hidden="true" />
              Pet care library
            </span>
            <h1 className="mb-3 text-3xl font-bold sm:text-4xl">Pet Care Resources</h1>
            <p className="max-w-3xl text-base leading-relaxed text-primary-foreground/95 sm:text-lg">
              Guides and articles to help you care for your furry, feathered, or scaly friends —
              from a first week at home to nutrition and emergencies.
            </p>
          </div>
        </header>

        <div className="container mx-auto px-4 py-8 sm:py-12">
          {/* Search */}
          <div className="mb-5 flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <Search
                className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                type="search"
                placeholder="Search resources…"
                aria-label="Search resources"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-11 w-full rounded-xl pl-9"
              />
            </div>
            {hasFilters && (
              <Button variant="outline" onClick={clearFilters} className="rounded-xl sm:w-auto">
                <X className="mr-1.5 h-4 w-4" aria-hidden="true" />
                Clear filters
              </Button>
            )}
          </div>

          {/* Category chips — easier to hit on mobile than a select, and shows
              the whole taxonomy at a glance. */}
          {categories.length > 0 && (
            <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter by category">
              {[ALL_CATEGORIES, ...categories].map((category) => {
                const isActive = categoryFilter === category;
                return (
                  <button
                    key={category}
                    type="button"
                    onClick={() => setCategoryFilter(category)}
                    aria-pressed={isActive}
                    className={cn(
                      "min-h-[40px] rounded-full border px-4 text-sm font-medium transition-colors duration-200",
                      "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2",
                      isActive
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-primary/20 bg-white text-foreground hover:border-primary/40 hover:text-primary",
                    )}
                  >
                    {category === ALL_CATEGORIES ? "All" : category}
                  </button>
                );
              })}
            </div>
          )}

          {isLoading ? (
            <CardGridSkeleton cards={6} />
          ) : isError ? (
            <div className="rounded-2xl border border-destructive/20 bg-white p-8 text-center">
              <h2 className="mb-2 text-xl font-semibold">Couldn't load resources</h2>
              <p className="mb-6 text-muted-foreground">
                Something went wrong fetching the library. Please try again.
              </p>
              <Button onClick={() => refetch()} className="rounded-xl">
                Retry
              </Button>
            </div>
          ) : filteredResources.length > 0 ? (
            <>
              <p className="mb-4 text-sm text-muted-foreground" aria-live="polite">
                {filteredResources.length}{" "}
                {filteredResources.length === 1 ? "resource" : "resources"}
                {categoryFilter !== ALL_CATEGORIES && ` in ${categoryFilter}`}
              </p>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredResources.map((resource) => (
                  <ResourceCard key={resource.id} resource={resource} />
                ))}
              </div>
            </>
          ) : (
            <div className="rounded-2xl border border-primary/10 bg-white p-8 text-center">
              <h2 className="mb-2 text-xl font-semibold">No resources found</h2>
              <p className="mb-6 text-muted-foreground">
                Nothing matches your search. Try a different term or clear the filters.
              </p>
              <Button onClick={clearFilters} className="rounded-xl">
                Clear filters
              </Button>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
