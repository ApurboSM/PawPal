import { useQuery } from "@tanstack/react-query";
import type { Resource } from "@pawpal/shared/schema";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Helmet } from "react-helmet";
import { Button } from "@/components/ui/button";
import { Loader2, ArrowLeft } from "lucide-react";
import { useLocation, useParams } from "wouter";

export default function ResourceDetailPage() {
  const [, setLocation] = useLocation();
  const { id } = useParams<{ id: string }>();
  
  // Fetch all resources
  const { data: resources, isLoading, isError } = useQuery<Resource[]>({
    queryKey: ["/api/resources"],
  });
  
  // Find the resource with the matching ID
  const resource = resources?.find(r => r.id === parseInt(id));
  
  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-neutral-100">
          <div className="container mx-auto px-4 py-12 flex items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-[#4A6FA5]" />
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  if (isError || !resource) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen bg-neutral-100">
          <div className="container mx-auto px-4 py-12">
            <div className="bg-white rounded-xl shadow-md p-8 text-center">
              <h2 className="text-2xl font-bold text-neutral-800 mb-4">Resource Not Found</h2>
              <p className="text-neutral-600 mb-6">
                The resource you're looking for doesn't exist or has been removed.
              </p>
              <Button 
                onClick={() => setLocation("/resources")}
                className="bg-[#4A6FA5] hover:bg-[#3A5A87]"
              >
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to Resources
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }
  
  return (
    <>
      <Helmet>
        <title>{resource.title} - PawPal Resources</title>
        <meta name="description" content={resource.summary} />
      </Helmet>
      
      <Navbar />
      
      <main className="min-h-screen bg-neutral-100">
        <div className="container mx-auto px-4 py-12">
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <img 
              src={resource.imageUrl} 
              alt={resource.title} 
              className="w-full h-64 object-cover"
            />
            <div className="p-8">
              <div className="mb-4">
                <span className="text-xs font-semibold text-[#4A6FA5] bg-[#4A6FA5] bg-opacity-10 rounded-full px-3 py-1">
                  {resource.category}
                </span>
              </div>
              <h1 className="text-3xl font-bold text-neutral-800 mb-4">{resource.title}</h1>
              <div className="prose max-w-none">
                <p className="text-neutral-600 mb-6">{resource.summary}</p>
                <div className="whitespace-pre-wrap text-neutral-600">
                  {resource.content}
                </div>
              </div>
              <div className="mt-8">
                <Button 
                  onClick={() => setLocation("/resources")}
                  className="bg-[#4A6FA5] hover:bg-[#3A5A87]"
                >
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Resources
                </Button>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}