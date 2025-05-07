import { CategoryCard } from "@/components/ui/category-card";

export function PetCategories() {
  const categories = [
    {
      name: "Dogs",
      image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1",
      href: "/pets?species=dog"
    },
    {
      name: "Cats",
      image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba",
      href: "/pets?species=cat"
    },
    {
      name: "Small Animals",
      image: "https://images.unsplash.com/photo-1591871937631-2f64059d234f",
      href: "/pets?species=rabbit"
    },
    {
      name: "Birds",
      image: "https://images.unsplash.com/photo-1551085254-e96b210db58a",
      href: "/pets?species=bird"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-neutral-800 mb-2">Find by Category</h2>
          <p className="text-lg text-neutral-600 max-w-2xl mx-auto">
            Looking for a specific type of pet? Browse by category to find your perfect match.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {categories.map((category, index) => (
            <CategoryCard
              key={index}
              name={category.name}
              image={category.image}
              href={category.href}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
