import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { HeroBanner } from "@/components/sections/hero-banner";
import { FeaturedPets } from "@/components/sections/featured-pets";
import { HowItWorks } from "@/components/sections/how-it-works";
import { PetCategories } from "@/components/sections/pet-categories";
import { ResourcesSection } from "@/components/sections/resources-section";
import { AppointmentSection } from "@/components/sections/appointment-section";
import { Testimonials } from "@/components/sections/testimonials";
import { Newsletter } from "@/components/sections/newsletter";
import { Helmet } from "react-helmet";

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
          backgroundImage="https://images.unsplash.com/photo-1560743641-3914f2c45636?ixlib=rb-4.0.3"
        />
        
        <FeaturedPets />
        
        <HowItWorks />
        
        <PetCategories />
        
        <ResourcesSection />
        
        <AppointmentSection />
        
        <Testimonials />
        
        <Newsletter />
      </main>
      
      <Footer />
    </>
  );
}
