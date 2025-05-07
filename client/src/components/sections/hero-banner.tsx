import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Heart, PawPrint } from "lucide-react";

interface HeroBannerProps {
  title: string;
  subtitle: string;
  backgroundImage: string;
}

export function HeroBanner({ title, subtitle, backgroundImage }: HeroBannerProps) {
  return (
    <section 
      className="relative bg-primary/10 text-white hero-hover-effect transition-all-ease"
      style={{ 
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'soft-light'
      }}
    >
      {/* Color overlay with gradient */}
      <div className="absolute inset-0 bg-gradient-to-r from-primary/70 to-secondary/70 opacity-60 transition-all-ease"></div>
      
      {/* Main content */}
      <div className="container mx-auto px-4 py-24 md:py-36 relative z-10">
        <div className="max-w-xl">
          <div className="inline-flex items-center bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full mb-6 transition-all-ease hover:bg-white/30">
            <Heart className="h-5 w-5 mr-2 text-accent" />
            <span className="text-sm font-medium">Find your furry soulmate today</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold mb-4 bg-gradient-to-r from-white to-accent bg-clip-text text-transparent drop-shadow-sm">{title}</h1>
          
          <p className="text-xl mb-8 text-white/90">{subtitle}</p>
          
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/pets">
              <Button 
                className="px-6 py-6 bg-primary text-white font-semibold rounded-2xl text-center hover:bg-primary/90 shadow-lg hover:shadow-xl hover:translate-y-[-3px] transition-all duration-300 ease-in-out group"
                size="lg"
              >
                <PawPrint className="mr-2 h-5 w-5 group-hover:animate-bounce" />
                Adopt a Pet
              </Button>
            </Link>
            <Link href="/appointments">
              <Button 
                variant="outline" 
                className="px-6 py-6 bg-white/80 backdrop-blur-sm text-primary font-semibold rounded-2xl text-center hover:bg-white shadow-lg hover:shadow-xl hover:translate-y-[-3px] transition-all duration-300 ease-in-out"
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
