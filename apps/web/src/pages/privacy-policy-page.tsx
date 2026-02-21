import { Helmet } from "react-helmet-async";
import { Link } from "wouter";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldCheck, Database, Lock, Mail } from "lucide-react";

export default function PrivacyPolicyPage() {
  return (
    <>
      <Helmet>
        <title>Privacy Policy - PawPal</title>
        <meta
          name="description"
          content="Read PawPal's privacy policy to understand how we collect, use, and protect your personal information."
        />
      </Helmet>

      <Navbar />

      <main className="min-h-screen bg-neutral-100">
        <div className="bg-[#4A6FA5] py-12 text-white">
          <div className="container mx-auto px-4">
            <h1 className="mb-3 text-3xl font-bold md:text-4xl">Privacy Policy</h1>
            <p className="max-w-3xl text-lg text-white/95">
              Learn how PawPal collects, uses, and protects your information while you use our platform.
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
                  <Link href="/privacy-policy" className="block font-semibold text-[#4A6FA5]">Privacy Policy</Link>
                  <Link href="/terms-of-service" className="block text-neutral-600 hover:text-[#4A6FA5]">Terms of Service</Link>
                  <Link href="/cookie-policy" className="block text-neutral-600 hover:text-[#4A6FA5]">Cookie Policy</Link>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Need Help?</CardTitle>
                </CardHeader>
                <CardContent className="text-sm text-neutral-600">
                  Questions about your data? Contact us at <span className="font-medium text-[#4A6FA5]">info@pawpal.com</span>.
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6 lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Database className="h-5 w-5 text-[#4A6FA5]" />
                    Information We Collect
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-neutral-700">
                  We collect account details you provide (name, email, phone, profile data) and activity
                  data related to pet listings, applications, and appointments.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <ShieldCheck className="h-5 w-5 text-[#4A6FA5]" />
                    How We Use Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-neutral-700">
                  Your data helps us provide core functionality, improve the platform experience,
                  communicate service updates, and maintain account security.
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Lock className="h-5 w-5 text-[#4A6FA5]" />
                    Data Protection
                  </CardTitle>
                </CardHeader>
                <CardContent className="text-neutral-700">
                  We implement security controls to reduce unauthorized access, alteration, and disclosure
                  of personal data.
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
                  For privacy questions, reach us at <strong>info@pawpal.com</strong>. Last updated: February 16, 2026.
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
