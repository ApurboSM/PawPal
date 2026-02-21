import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, Shield, Gavel, Mail } from "lucide-react";

export default function TermsOfServicePage() {
  return (
    <>
      <Helmet>
        <title>Terms of Service - PawPal</title>
        <meta
          name="description"
          content="Review PawPal's terms of service for platform use, user responsibilities, and service conditions."
        />
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-neutral-100">
        <div className="bg-[#4A6FA5] py-12 text-white">
          <div className="container mx-auto px-4">
            <h1 className="mb-3 text-3xl font-bold md:text-4xl">Terms of Service</h1>
            <p className="max-w-3xl text-lg text-white/95">
              These terms define platform usage, responsibilities, and service conditions for PawPal users.
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
                  <Link href="/terms-of-service" className="block font-semibold text-[#4A6FA5]">Terms of Service</Link>
                  <Link href="/cookie-policy" className="block text-neutral-600 hover:text-[#4A6FA5]">Cookie Policy</Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Support</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-neutral-600">
                  For terms-related questions, email <span className="font-medium text-[#4A6FA5]">info@pawpal.com</span>.
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <FileText className="h-5 w-5 text-[#4A6FA5]" />
                    Use of PawPal
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-neutral-700">
                  By using PawPal, you agree to provide accurate information and use the platform in a
                  lawful, respectful, and responsible way.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Shield className="h-5 w-5 text-[#4A6FA5]" />
                    User Responsibilities
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-neutral-700">
                  Users are responsible for account security, truthful content, and respectful conduct.
                  Violations may result in account restrictions.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Gavel className="h-5 w-5 text-[#4A6FA5]" />
                    Service Availability
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-neutral-700">
                  We strive to keep services reliable and available, but uninterrupted access cannot be
                  guaranteed in all circumstances.
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
                  Questions about these terms? Email <strong>info@pawpal.com</strong>. Last updated: February 16, 2026.
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
