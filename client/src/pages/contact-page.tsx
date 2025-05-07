import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Helmet } from "react-helmet";
import { 
  Card, 
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { 
  Form, 
  FormControl, 
  FormDescription, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { 
  Select, 
  SelectContent, 
  SelectItem,
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { MapPin, Phone, Mail, Clock, Loader2, CheckCircle } from "lucide-react";

// Form schema
const contactFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().optional(),
  subject: z.string().min(1, "Subject is required"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

type ContactFormValues = z.infer<typeof contactFormSchema>;

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Initialize form
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      subject: "",
      message: "",
    },
  });
  
  // Handle form submission
  const onSubmit = async (data: ContactFormValues) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    setIsSubmitted(true);
    
    toast({
      title: "Message Sent",
      description: "Thank you for contacting us. We'll get back to you soon!",
    });
    
    form.reset();
  };

  return (
    <>
      <Helmet>
        <title>Contact Us - PawPal</title>
        <meta name="description" content="Get in touch with PawPal for questions about pet adoption, pet care, appointments, or general inquiries. We're here to help with your pet needs." />
      </Helmet>
      
      <Navbar />
      
      <main className="min-h-screen bg-neutral-100">
        {/* Header */}
        <div className="bg-[#4A6FA5] text-white py-12">
          <div className="container mx-auto px-4">
            <h1 className="text-3xl md:text-4xl font-bold mb-4">Contact Us</h1>
            <p className="text-lg max-w-3xl">
              Have questions about adopting a pet or need assistance with pet care? Our team is here to help. Reach out to us using any of the methods below.
            </p>
          </div>
        </div>
        
        {/* Contact Content */}
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Contact Information */}
            <div>
              <h2 className="text-2xl font-bold mb-6">Get In Touch</h2>
              
              <div className="space-y-6">
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-[#4A6FA5]/10 p-3 rounded-full mr-4">
                        <MapPin className="h-6 w-6 text-[#4A6FA5]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Our Location</h3>
                        <p className="text-neutral-600 mt-1">
                          123 Pet Street<br />
                          Animal City, AC 12345<br />
                          United States
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-[#4A6FA5]/10 p-3 rounded-full mr-4">
                        <Phone className="h-6 w-6 text-[#4A6FA5]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Phone Number</h3>
                        <p className="text-neutral-600 mt-1">
                          Main Office: (123) 456-7890<br />
                          Adoption Inquiries: (123) 456-7891<br />
                          Veterinary Services: (123) 456-7892
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-[#4A6FA5]/10 p-3 rounded-full mr-4">
                        <Mail className="h-6 w-6 text-[#4A6FA5]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Email Address</h3>
                        <p className="text-neutral-600 mt-1">
                          General Inquiries: info@pawpal.com<br />
                          Adoption Team: adopt@pawpal.com<br />
                          Support: support@pawpal.com
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="pt-6">
                    <div className="flex items-start">
                      <div className="flex-shrink-0 bg-[#4A6FA5]/10 p-3 rounded-full mr-4">
                        <Clock className="h-6 w-6 text-[#4A6FA5]" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">Business Hours</h3>
                        <div className="text-neutral-600 mt-1 space-y-1">
                          <div className="flex justify-between">
                            <span>Monday - Friday:</span>
                            <span>9AM - 6PM</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Saturday:</span>
                            <span>10AM - 4PM</span>
                          </div>
                          <div className="flex justify-between">
                            <span>Sunday:</span>
                            <span>Closed</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
            
            {/* Contact Form */}
            <div className="lg:col-span-2">
              <Card className="w-full">
                <CardHeader>
                  <CardTitle>Send Us a Message</CardTitle>
                  <CardDescription>
                    Fill out the form below and we'll get back to you as soon as possible.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {isSubmitted ? (
                    <div className="text-center py-8">
                      <div className="bg-green-100 text-green-700 rounded-full p-3 mx-auto w-16 h-16 flex items-center justify-center mb-4">
                        <CheckCircle className="h-8 w-8" />
                      </div>
                      <h3 className="text-2xl font-semibold mb-2">Message Sent!</h3>
                      <p className="text-neutral-600 mb-6">
                        Thank you for contacting us. We've received your message and will respond shortly.
                      </p>
                      <Button 
                        onClick={() => setIsSubmitted(false)}
                        className="bg-[#4A6FA5] hover:bg-[#3A5A87]"
                      >
                        Send Another Message
                      </Button>
                    </div>
                  ) : (
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your full name" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input type="email" placeholder="Your email address" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <FormField
                            control={form.control}
                            name="phone"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Phone (Optional)</FormLabel>
                                <FormControl>
                                  <Input placeholder="Your phone number" {...field} />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="subject"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Subject</FormLabel>
                                <Select 
                                  onValueChange={field.onChange} 
                                  defaultValue={field.value}
                                >
                                  <FormControl>
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a subject" />
                                    </SelectTrigger>
                                  </FormControl>
                                  <SelectContent>
                                    <SelectItem value="General Inquiry">General Inquiry</SelectItem>
                                    <SelectItem value="Adoption Information">Adoption Information</SelectItem>
                                    <SelectItem value="Veterinary Services">Veterinary Services</SelectItem>
                                    <SelectItem value="Volunteer Opportunities">Volunteer Opportunities</SelectItem>
                                    <SelectItem value="Donation Information">Donation Information</SelectItem>
                                    <SelectItem value="Other">Other</SelectItem>
                                  </SelectContent>
                                </Select>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="message"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Message</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="How can we help you?" 
                                  className="min-h-[150px]" 
                                  {...field} 
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <Button 
                          type="submit" 
                          className="w-full bg-[#4A6FA5] hover:bg-[#3A5A87]"
                          disabled={isLoading}
                        >
                          {isLoading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending Message...</>
                          ) : (
                            'Send Message'
                          )}
                        </Button>
                      </form>
                    </Form>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Map Section */}
          <div className="mt-12">
            <h2 className="text-2xl font-bold mb-6">Find Us on the Map</h2>
            <div className="w-full h-96 rounded-lg overflow-hidden border border-neutral-200 bg-neutral-100 relative">
              {/* Placeholder for map */}
              <div className="absolute inset-0 flex items-center justify-center flex-col">
                <p className="text-neutral-500 mb-2">Interactive map unavailable in this preview</p>
                <p className="text-sm text-neutral-400">123 Pet Street, Animal City, AC 12345</p>
              </div>
            </div>
          </div>
          
          {/* FAQ Section */}
          <div className="mt-16">
            <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">What are your adoption fees?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600">
                    Our adoption fees vary by animal type and age. Dogs typically range from $150-$300, cats from $75-$150, and small animals from $25-$75. All fees include spay/neuter, initial vaccinations, and microchipping.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How long does the adoption process take?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600">
                    The adoption process typically takes 1-5 days, depending on the completeness of your application and the availability of our staff to conduct any necessary home visits or interviews.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Do you offer foster opportunities?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600">
                    Yes! We're always looking for caring individuals to foster animals. Fostering is a wonderful way to help animals in need without the long-term commitment of adoption. We provide training and supplies.
                  </p>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">How can I donate to support your mission?</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-neutral-600">
                    We accept donations through our website, by mail, or in person. You can donate money, supplies, or your time as a volunteer. All donations are tax-deductible and go directly to supporting our animals.
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </>
  );
}
