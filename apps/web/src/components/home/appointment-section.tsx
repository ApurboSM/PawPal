import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { PawPrint, Stethoscope, Scissors } from "lucide-react";

const AppointmentSection = () => {
  const appointmentTypes = [
    {
      icon: <PawPrint className="h-5 w-5" />,
      title: "Meet & Greet",
      description: "Schedule a time to meet and interact with pets you're interested in adopting."
    },
    {
      icon: <Stethoscope className="h-5 w-5" />,
      title: "Veterinary Care",
      description: "Book routine check-ups, vaccinations, or other medical services for your pets."
    },
    {
      icon: <Scissors className="h-5 w-5" />,
      title: "Grooming Services",
      description: "Schedule grooming appointments to keep your pets clean and comfortable."
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="lg:flex items-center">
          <div className="lg:w-1/2 lg:pr-12 mb-8 lg:mb-0">
            <h2 className="text-3xl font-bold text-neutral-800 mb-4">Book a Visit or Veterinary Appointment</h2>
            <p className="text-lg text-neutral-600 mb-6">
              Schedule a time to meet our available pets or book veterinary services for your current furry friends. Our team is ready to help with whatever you need.
            </p>
            
            <div className="space-y-4 mb-8">
              {appointmentTypes.map((type, index) => (
                <div key={index} className="flex items-start">
                  <div className="flex-shrink-0 w-10 h-10 bg-accent rounded-full flex items-center justify-center text-white">
                    {type.icon}
                  </div>
                  <div className="ml-4">
                    <h3 className="text-lg font-semibold text-neutral-800">{type.title}</h3>
                    <p className="text-neutral-600">{type.description}</p>
                  </div>
                </div>
              ))}
            </div>
            
            <Link href="/appointment">
              <Button className="inline-flex items-center px-6 py-3 bg-secondary text-white font-semibold rounded-lg hover:bg-secondary/90 transition-colors">
                Book an Appointment <span className="ml-2">📅</span>
              </Button>
            </Link>
          </div>
          
          <div className="lg:w-1/2">
            <img 
              src="https://images.unsplash.com/photo-1583336663277-620dc1996580?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=800&h=600" 
              alt="Veterinarian examining a pet" 
              className="rounded-xl shadow-lg w-full h-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default AppointmentSection;
