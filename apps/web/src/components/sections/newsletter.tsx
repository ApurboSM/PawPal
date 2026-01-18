import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";

const newsletterSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type NewsletterData = z.infer<typeof newsletterSchema>;

export function Newsletter() {
  const { toast } = useToast();
  const [isSuccess, setIsSuccess] = useState(false);
  
  const form = useForm<NewsletterData>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: "",
    },
  });
  
  const { formState: { isSubmitting } } = form;

  const onSubmit = async (data: NewsletterData) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setIsSuccess(true);
      toast({
        title: "Success!",
        description: "You've been subscribed to our newsletter.",
      });
      form.reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to subscribe to the newsletter. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <section className="py-12 bg-[#4A6FA5]">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Join Our Newsletter</h2>
          <p className="text-blue-100 mb-6">
            Stay updated with new pets, care tips, and special events.
          </p>
          
          {isSuccess ? (
            <div className="bg-white/10 p-4 rounded-lg text-white">
              Thank you for subscribing! You'll start receiving our newsletter soon.
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem className="flex-1">
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="Your email address"
                          className="px-4 py-3 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF9166] border-0"
                          disabled={isSubmitting}
                        />
                      </FormControl>
                      <FormMessage className="text-white text-sm mt-1" />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="px-6 py-3 bg-[#FF9166] text-white font-semibold rounded-lg hover:bg-[#E57A53] transition-colors"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Subscribing..." : "Subscribe"}
                </Button>
              </form>
            </Form>
          )}
          
          <p className="text-xs text-blue-100 mt-3">
            We respect your privacy and will never share your information.
          </p>
        </div>
      </div>
    </section>
  );
}
