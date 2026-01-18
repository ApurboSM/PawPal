import { Link } from "wouter";

interface CategoryCardProps {
  name: string;
  image: string;
  href: string;
}

export function CategoryCard({ name, image, href }: CategoryCardProps) {
  return (
    <Link href={href} className="group">
      <div className="bg-neutral-100 rounded-xl overflow-hidden transition-transform group-hover:scale-105 duration-300">
        <img 
          src={image} 
          alt={name} 
          className="w-full h-48 object-cover"
        />
        <div className="p-4 bg-white">
          <h3 className="text-lg font-semibold text-center text-neutral-800 group-hover:text-[#4A6FA5] transition-colors">
            {name}
          </h3>
        </div>
      </div>
    </Link>
  );
}
