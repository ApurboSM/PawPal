import { Link } from "wouter";
import { Button } from "@/components/ui/button";

interface HeroBannerProps {
  title: string;
  subtitle: string;
  backgroundImage: string;
}

export function HeroBanner({ title, subtitle, backgroundImage }: HeroBannerProps) {
  return (
    <section 
      className="relative bg-gray-900 text-white"
      style={{ 
        backgroundImage: `url(${backgroundImage})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundBlendMode: 'overlay'
      }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div className="max-w-xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
          <p className="text-xl mb-8">{subtitle}</p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/pets">
              <Button 
                className="px-6 py-6 bg-[#FF9166] text-white font-semibold rounded-lg text-center hover:bg-[#E57A53] transition-colors"
                size="lg"
              >
                Adopt a Pet
              </Button>
            </Link>
            <Link href="/appointments">
              <Button 
                variant="outline" 
                className="px-6 py-6 bg-white text-[#4A6FA5] font-semibold rounded-lg text-center hover:bg-neutral-200 transition-colors"
                size="lg"
              >
                Book a Visit
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
