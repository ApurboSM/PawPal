import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Terms of Service - PawPal</title>
        <meta
          name="description"
          content="Review PawPal's terms of service for platform use, user responsibilities, and service conditions."
        />
      </Helmet>

      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-6 sm:p-8">
          <h1 className="mb-4 text-3xl font-bold">Terms of Service</h1>
          <p className="mb-6 text-sm text-muted-foreground">Last updated: February 16, 2026</p>

          <div className="space-y-6 text-foreground">
            <section>
              <h2 className="mb-2 text-xl font-semibold">Use of PawPal</h2>
              <p>
                By using PawPal, you agree to use the platform lawfully and provide accurate
                information when creating accounts, listings, and applications.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold">User Responsibilities</h2>
              <p>
                Users are responsible for account security, respectful communication, and truthful pet
                and profile data. Misuse may result in account suspension.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold">Service Availability</h2>
              <p>
                We work to keep PawPal available and reliable, but we do not guarantee uninterrupted
                service at all times.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold">Contact</h2>
              <p>
                For terms-related questions, email <strong>info@pawpal.com</strong>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
