import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Cookie, SlidersHorizontal, Shield, Mail } from "lucide-react";

export default function CookiePolicyPage() {
  return (
    <>
      <Helmet>
        <title>Cookie Policy - PawPal</title>
        <meta
          name="description"
          content="Learn how PawPal uses cookies and similar technologies to improve functionality and user experience."
        />
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-neutral-100">
        <div className="bg-[#4A6FA5] py-12 text-white">
          <div className="container mx-auto px-4">
            <h1 className="mb-3 text-3xl font-bold md:text-4xl">Cookie Policy</h1>
            <p className="max-w-3xl text-lg text-white/95">
              Understand how PawPal uses cookies and similar technologies to improve your experience.
            </p>
          </div>
        </div>

        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Legal Pages</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <Link href="/privacy-policy" className="block text-neutral-600 hover:text-[#4A6FA5]">Privacy Policy</Link>
                  <Link href="/terms-of-service" className="block text-neutral-600 hover:text-[#4A6FA5]">Terms of Service</Link>
                  <Link href="/cookie-policy" className="block font-semibold text-[#4A6FA5]">Cookie Policy</Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Cookie Questions</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-neutral-600">
                  Need more details? Contact <span className="font-medium text-[#4A6FA5]">info@pawpal.com</span>.
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Cookie className="h-5 w-5 text-[#4A6FA5]" />
                    What Are Cookies?
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-neutral-700">
                  Cookies are small text files stored on your device that help the website remember
                  preferences and support core functionality.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Shield className="h-5 w-5 text-[#4A6FA5]" />
                    How PawPal Uses Cookies
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-neutral-700">
                  We use cookies to keep sessions active, improve reliability, and understand how users
                  interact with the platform.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <SlidersHorizontal className="h-5 w-5 text-[#4A6FA5]" />
                    Managing Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-neutral-700">
                  You can manage cookies through browser settings. Disabling some cookies may reduce
                  feature availability.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Mail className="h-5 w-5 text-[#4A6FA5]" />
                    Contact
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-neutral-700">
                  For cookie-policy questions, contact <strong>info@pawpal.com</strong>. Last updated: February 16, 2026.
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
