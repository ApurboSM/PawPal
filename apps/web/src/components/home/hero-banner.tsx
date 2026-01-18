import { Link } from "wouter";
import { Button } from "@/components/ui/button";

const HeroBanner = () => {
  return (
    <section 
      className="relative bg-gray-900 text-white" 
      style={{ 
        backgroundImage: "url('https://images.unsplash.com/photo-1560743641-3914f2c45636?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1920&h=800')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundBlendMode: "overlay"
      }}
    >
      <div className="absolute inset-0 bg-black opacity-50"></div>
      <div className="container mx-auto px-4 py-20 md:py-32 relative z-10">
        <div className="max-w-xl">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Find Your Perfect Companion</h1>
          <p className="text-xl mb-8">Adopt, care, and connect with pets looking for their forever homes.</p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
            <Link href="/adopt">
              <Button className="px-6 py-6 bg-secondary hover:bg-secondary/90 text-white font-semibold text-lg">
                Adopt a Pet
              </Button>
            </Link>
            <Link href="/appointment">
              <Button variant="outline" className="px-6 py-6 bg-white text-primary hover:bg-gray-100 font-semibold text-lg">
                Book a Visit
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroBanner;
