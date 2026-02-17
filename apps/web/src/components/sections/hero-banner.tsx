import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Heart, PawPrint } from "lucide-react";
import petHeroImage from "../../../../../assets/pet.png";

interface HeroBannerProps {
  title: string;
  subtitle: string;
  backgroundImage?: string;
}

export function HeroBanner({ title, subtitle, backgroundImage }: HeroBannerProps) {
  return (
    <section 
      className="relative overflow-hidden bg-primary/10 text-white hero-hover-effect transition-all-ease"
      style={{ 
        ...(backgroundImage
          ? {
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundBlendMode: "soft-light",
            }
          : {}),
      }}
    >
      {/* Color overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/75 to-secondary/70 opacity-65 transition-all-ease"></div>

      {/* Right-side pets image overlay */}
      <div
        className="pointer-events-none absolute inset-0 w-full bg-contain bg-right-bottom bg-no-repeat opacity-32 lg:inset-y-0 lg:left-auto lg:right-0 lg:w-1/2 lg:bg-center lg:bg-cover lg:opacity-55"
        style={{
          backgroundImage: `url(${petHeroImage})`,
        }}
        aria-hidden="true"
      ></div>
      
      {/* Main content */}
      <div className="container relative z-10 mx-auto px-4 py-14 sm:py-18 md:py-24 lg:py-32">
        <div className="max-w-xl lg:max-w-2xl">
          <div className="mb-5 inline-flex items-center rounded-full bg-white/20 px-3 py-2 backdrop-blur-sm transition-all-ease hover:bg-white/30 sm:px-4">
            <Heart className="mr-2 h-4 w-4 text-accent sm:h-5 sm:w-5" />
            <span className="text-xs font-medium sm:text-sm">Find your furry soulmate today</span>
          </div>
          
          <h1 className="mb-4 bg-gradient-to-r from-white to-accent bg-clip-text text-4xl font-bold leading-tight text-transparent drop-shadow-sm sm:text-5xl lg:text-6xl">{title}</h1>
          
          <p className="mb-7 max-w-lg text-lg text-white/90 sm:mb-8 sm:text-xl">{subtitle}</p>
          
          <div className="flex flex-col gap-3 sm:flex-row sm:gap-4">
            <Link href="/pets" className="w-full sm:w-auto">
              <Button 
                className="group min-h-12 w-full rounded-2xl bg-primary px-6 py-3 text-center font-semibold text-white shadow-lg transition-all duration-300 ease-in-out hover:-translate-y-[3px] hover:bg-primary/90 hover:shadow-xl sm:w-auto"
                size="lg"
              >
                <PawPrint className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                Adopt a Pet
              </Button>
            </Link>
            <Link href="/appointments" className="w-full sm:w-auto">
              <Button 
                variant="outline" 
                className="min-h-12 w-full rounded-2xl bg-white/80 px-6 py-3 text-center font-semibold text-primary shadow-lg transition-all duration-300 ease-in-out hover:-translate-y-[3px] hover:bg-white hover:shadow-xl sm:w-auto"
                size="lg"
              >
                Book a Visit
              </Button>
            </Link>
          </div>
          
          {/* Decorative paw prints */}
          <div className="hidden md:block absolute bottom-10 right-10 opacity-70">
            <div className="flex space-x-4">
              <PawPrint className="h-6 w-6 text-white transform rotate-45" />
              <PawPrint className="h-4 w-4 text-white transform -rotate-12" />
              <PawPrint className="h-5 w-5 text-white transform rotate-[30deg]" />
            </div>
          </div>
        </div>
      </div>
      
      {/* Rounded bottom corners for a cute look */}
      <div className="absolute -bottom-6 left-0 right-0 h-12 bg-background rounded-t-[50%] z-10"></div>
    </section>
  );
}
