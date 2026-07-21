import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useParams } from "wouter";
import type { Resource } from "@pawpal/shared/schema";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ResourceCard } from "@/components/ui/resource-card";
import { DetailSkeleton } from "@/components/skeletons/page-skeletons";
import { readingTimeMinutes, toParagraphs } from "@/lib/resource-utils";
import { prefetchRoute } from "@/lib/route-imports";
import { ArrowLeft, ArrowRight, CalendarDays, Clock, Share2, Check } from "lucide-react";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1450778869180-41d0601e046e?ixlib=rb-4.0.3&auto=format&fit=crop&w=1200&q=70";

export default function ResourceDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [imageError, setImageError] = useState(false);
  const [copied, setCopied] = useState(false);

  // Fetch just this article. The old version pulled the entire library and
  // filtered client-side, which meant a bad id rendered "not found" only after
  // downloading every resource.
  const {
    data: resource,
    isLoading,
    isError,
  } = useQuery<Resource>({
    queryKey: [`/api/resources/${id}`],
    enabled: Boolean(id),
    retry: false,
  });

  // Related articles come from the cached list, so this costs nothing extra
  // once the index page has been visited.
  const { data: allResources } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
    enabled: Boolean(resource),
  });

  const related = useMemo(() => {
    if (!resource || !allResources) return [];
    const sameCategory = allResources.filter(
      (r) => r.id !== resource.id && r.category === resource.category,
    );
    const others = allResources.filter(
      (r) => r.id !== resource.id && r.category !== resource.category,
    );
    return [...sameCategory, ...others].slice(0, 3);
  }, [resource, allResources]);

  const paragraphs = useMemo(
    () => (resource ? toParagraphs(resource.content) : []),
    [resource],
  );

  const handleShare = async () => {
    const url = window.location.href;
    try {
      if (navigator.share) {
        await navigator.share({ title: resource?.title, text: resource?.summary, url });
        return;
      }
      await navigator.clipboard.writeText(url);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    } catch {
      // User dismissed the share sheet, or the clipboard was blocked. Nothing to do.
    }
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-background">
        <DetailSkeleton />
      </main>
    );
  }

  if (isError || !resource) {
    return (
      <main className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-16">
          <div className="mx-auto max-w-lg rounded-2xl border border-primary/10 bg-white p-8 text-center shadow-sm">
            <h1 className="mb-3 text-2xl font-bold">Resource not found</h1>
            <p className="mb-6 text-muted-foreground">
              This article doesn't exist or has been removed.
            </p>
            <Link href="/resources">
              <Button className="rounded-xl">
                <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                Back to resources
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const minutes = readingTimeMinutes(resource.content);
  const published = resource.createdAt
    ? new Date(resource.createdAt).toLocaleDateString(undefined, {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  return (
    <>
      <Helmet>
        <title>{resource.title} - PawPal Resources</title>
        <meta name="description" content={resource.summary} />
        <meta property="og:title" content={resource.title} />
        <meta property="og:description" content={resource.summary} />
        <meta property="og:type" content="article" />
        {resource.imageUrl && <meta property="og:image" content={resource.imageUrl} />}
      </Helmet>

      <main className="min-h-screen bg-background pb-4">
        <article>
          {/* Hero */}
          <div className="relative">
            <img
              src={imageError ? FALLBACK_IMAGE : resource.imageUrl}
              alt=""
              onError={() => setImageError(true)}
              className="h-56 w-full object-cover sm:h-72 lg:h-96"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-transparent" />

            <div className="absolute inset-x-0 bottom-0">
              <div className="container mx-auto px-4 pb-6 sm:pb-8">
                <Badge className="mb-3 rounded-full border border-white/50 bg-white/90 px-3 py-1 text-xs font-semibold text-primary hover:bg-white">
                  {resource.category}
                </Badge>
                <h1 className="max-w-3xl text-2xl font-bold leading-tight text-white sm:text-4xl">
                  {resource.title}
                </h1>
              </div>
            </div>
          </div>

          <div className="container mx-auto px-4">
            <nav aria-label="Breadcrumb" className="py-4 text-sm text-muted-foreground">
              <ol className="flex flex-wrap items-center gap-1.5">
                <li>
                  <Link href="/" className="rounded hover:text-primary hover:underline">
                    Home
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li>
                  <Link href="/resources" className="rounded hover:text-primary hover:underline">
                    Resources
                  </Link>
                </li>
                <li aria-hidden="true">/</li>
                <li className="truncate font-medium text-foreground" aria-current="page">
                  {resource.title}
                </li>
              </ol>
            </nav>

            <div className="mx-auto max-w-3xl pb-10">
              {/* Meta row */}
              <div className="mb-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-b border-primary/10 pb-5 text-sm text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-4 w-4" aria-hidden="true" />
                  {minutes} min read
                </span>
                {published && (
                  <span className="flex items-center gap-1.5">
                    <CalendarDays className="h-4 w-4" aria-hidden="true" />
                    <time dateTime={new Date(resource.createdAt!).toISOString()}>{published}</time>
                  </span>
                )}
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleShare}
                  className="ml-auto rounded-full text-primary hover:bg-primary/10 hover:text-primary"
                >
                  {copied ? (
                    <>
                      <Check className="mr-1.5 h-4 w-4" aria-hidden="true" />
                      Link copied
                    </>
                  ) : (
                    <>
                      <Share2 className="mr-1.5 h-4 w-4" aria-hidden="true" />
                      Share
                    </>
                  )}
                </Button>
              </div>

              {/* Summary lede */}
              <p className="mb-6 border-l-4 border-primary/40 pl-4 text-lg font-medium leading-relaxed text-foreground/90">
                {resource.summary}
              </p>

              {/* Body */}
              <div className="prose prose-neutral max-w-none prose-headings:font-bold prose-p:leading-relaxed prose-a:text-primary">
                {paragraphs.map((paragraph, index) => (
                  <p key={index}>{paragraph}</p>
                ))}
              </div>

              <div className="mt-10 flex flex-wrap gap-3">
                <Link href="/resources">
                  <Button variant="outline" className="rounded-xl">
                    <ArrowLeft className="mr-2 h-4 w-4" aria-hidden="true" />
                    All resources
                  </Button>
                </Link>
                <Link href="/appointments">
                  <Button className="rounded-xl">
                    Book a vet visit
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </article>

        {/* Related */}
        {related.length > 0 && (
          <section aria-labelledby="related-heading" className="border-t border-primary/10 py-10">
            <div className="container mx-auto px-4">
              <h2 id="related-heading" className="mb-6 text-2xl font-bold">
                Keep reading
              </h2>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <ResourceCard key={item.id} resource={item} />
                ))}
              </div>
              <div className="mt-8">
                <Link href="/resources" onPointerEnter={() => prefetchRoute("/resources")}>
                  <Button variant="outline" className="rounded-xl">
                    Browse all resources
                    <ArrowRight className="ml-2 h-4 w-4" aria-hidden="true" />
                  </Button>
                </Link>
              </div>
            </div>
          </section>
        )}
      </main>
    </>
  );
}
