import { Search, ClipboardCheck, Home } from "lucide-react";

const HowItWorks = () => {
  const steps = [
    {
      icon: <Search className="h-6 w-6" />,
      title: "Browse & Select",
      description: "Explore our available pets and find one that matches your lifestyle and preferences."
    },
    {
      icon: <ClipboardCheck className="h-6 w-6" />,
      title: "Apply & Meet",
      description: "Complete an adoption application and schedule a meeting with your potential new companion."
    },
    {
      icon: <Home className="h-6 w-6" />,
      title: "Adopt & Take Home",
      description: "Finalize the adoption process and welcome your new family member to their forever home."
    }
  ];

  return (
    <section className="py-16 bg-neutral-100">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-800 mb-2">How Adoption Works</h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Our simple process helps connect pets with their forever families.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {steps.map((step, index) => (
            <div key={index} className="bg-white p-6 rounded-xl shadow-md text-center">
              <div className="w-16 h-16 bg-primary/80 rounded-full flex items-center justify-center text-white text-2xl mx-auto mb-4">
                {step.icon}
              </div>
              <h3 className="text-xl font-semibold text-neutral-800 mb-2">{step.title}</h3>
              <p className="text-neutral-600">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
