import { Link } from "wouter";

const PetCategories = () => {
  const categories = [
    {
      name: "Dogs",
      image: "https://images.unsplash.com/photo-1543466835-00a7907e9de1?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=500",
      path: "/adopt?species=dog"
    },
    {
      name: "Cats",
      image: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=500",
      path: "/adopt?species=cat"
    },
    {
      name: "Small Animals",
      image: "https://images.unsplash.com/photo-1591871937631-2f64059d234f?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=500",
      path: "/adopt?species=small"
    },
    {
      name: "Birds",
      image: "https://images.unsplash.com/photo-1551085254-e96b210db58a?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=500&h=500",
      path: "/adopt?species=bird"
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
            <Link key={index} href={category.path}>
              <a className="group">
                <div className="bg-neutral-100 rounded-xl overflow-hidden transition-transform group-hover:scale-105 duration-300">
                  <img 
                    src={category.image} 
                    alt={category.name} 
                    className="w-full h-48 object-cover"
                  />
                  <div className="p-4 bg-white">
                    <h3 className="text-lg font-semibold text-center text-neutral-800 group-hover:text-primary transition-colors">
                      {category.name}
                    </h3>
                  </div>
                </div>
              </a>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PetCategories;
