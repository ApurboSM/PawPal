import { Suspense, lazy } from "react";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroBanner } from "@/components/sections/hero-banner";
import { HowItWorks } from "@/components/sections/how-it-works";
import { PetCategories } from "@/components/sections/pet-categories";
import { LazyMount } from "@/components/layout/lazy-mount";
import { Helmet } from "react-helmet";
import { CardGridSkeleton, FormSkeleton } from "@/components/skeletons/page-skeletons";

const FeaturedPets = lazy(() =>
  import("@/components/sections/featured-pets").then((m) => ({
    default: m.FeaturedPets,
  })),
);
const ResourcesSection = lazy(() =>
  import("@/components/sections/resources-section").then((m) => ({
    default: m.ResourcesSection,
  })),
);
const AppointmentSection = lazy(() =>
  import("@/components/sections/appointment-section").then((m) => ({
    default: m.AppointmentSection,
  })),
);
const Testimonials = lazy(() =>
  import("@/components/sections/testimonials").then((m) => ({
    default: m.Testimonials,
  })),
);
const Newsletter = lazy(() =>
  import("@/components/sections/newsletter").then((m) => ({
    default: m.Newsletter,
  })),
);

export default function HomePage() {
  return (
    <>
      <Helmet>
        <title>PawPal - Pet Adoption & Care Platform</title>
        <meta name="description" content="Find your perfect companion at PawPal. Adopt, care, and connect with pets looking for their forever homes." />
      </Helmet>
      
      <Navbar />
      
      <main>
        <HeroBanner 
          title="Find Your Perfect Companion"
          subtitle="Adopt, care, and connect with pets looking for their forever homes."
          // External hero images are a common LCP bottleneck; keep the hero fast and clean.
          backgroundImage={undefined}
        />

        {/* Defer heavier sections until they are near the viewport */}
        <LazyMount
          rootMargin="900px"
          placeholder={
            <div className="py-16 bg-background">
              <div className="container mx-auto px-4">
                <CardGridSkeleton cards={4} />
              </div>
            </div>
          }
        >
          <Suspense
            fallback={
              <div className="py-16 bg-background">
                <div className="container mx-auto px-4">
                  <CardGridSkeleton cards={4} />
                </div>
              </div>
            }
          >
            <FeaturedPets />
          </Suspense>
        </LazyMount>

        <HowItWorks />
        
        <PetCategories />

        <LazyMount
          placeholder={
            <div className="py-16 bg-neutral-100">
              <div className="container mx-auto px-4">
                <CardGridSkeleton cards={3} />
              </div>
            </div>
          }
        >
          <Suspense
            fallback={
              <div className="py-16 bg-neutral-100">
                <div className="container mx-auto px-4">
                  <CardGridSkeleton cards={3} />
                </div>
              </div>
            }
          >
            <ResourcesSection />
          </Suspense>
        </LazyMount>

        <LazyMount
          placeholder={
            <div className="py-16 bg-white">
              <div className="container mx-auto px-4">
                <FormSkeleton />
              </div>
            </div>
          }
        >
          <Suspense
            fallback={
              <div className="py-16 bg-white">
                <div className="container mx-auto px-4">
                  <FormSkeleton />
                </div>
              </div>
            }
          >
            <AppointmentSection />
          </Suspense>
        </LazyMount>

        <LazyMount
          placeholder={
            <div className="py-16 bg-neutral-100">
              <div className="container mx-auto px-4">
                <CardGridSkeleton cards={2} />
              </div>
            </div>
          }
        >
          <Suspense
            fallback={
              <div className="py-16 bg-neutral-100">
                <div className="container mx-auto px-4">
                  <CardGridSkeleton cards={2} />
                </div>
              </div>
            }
          >
            <Testimonials />
          </Suspense>
        </LazyMount>

        <LazyMount
          placeholder={
            <div className="py-16 bg-background">
              <div className="container mx-auto px-4">
                <FormSkeleton />
              </div>
            </div>
          }
        >
          <Suspense
            fallback={
              <div className="py-16 bg-background">
                <div className="container mx-auto px-4">
                  <FormSkeleton />
                </div>
              </div>
            }
          >
            <Newsletter />
          </Suspense>
        </LazyMount>
      </main>
      
      <Footer />
    </>
  );
}
