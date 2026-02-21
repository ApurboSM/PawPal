import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Privacy Policy - PawPal</title>
        <meta
          name="description"
          content="Read PawPal's privacy policy to understand how we collect, use, and protect your personal information."
        />
      </Helmet>

      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-6 sm:p-8">
          <h1 className="mb-4 text-3xl font-bold">Privacy Policy</h1>
          <p className="mb-6 text-sm text-muted-foreground">Last updated: February 16, 2026</p>

          <div className="space-y-6 text-foreground">
            <section>
              <h2 className="mb-2 text-xl font-semibold">Information We Collect</h2>
              <p>
                We collect account information you provide directly, such as your name, email, phone
                number, and profile details. We also collect data related to pet listings, applications,
                and appointments to provide core platform services.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold">How We Use Information</h2>
              <p>
                We use your information to operate PawPal features, communicate important account
                updates, improve user experience, and maintain platform safety and security.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold">Data Protection</h2>
              <p>
                We apply technical and organizational safeguards to protect personal information from
                unauthorized access, alteration, or disclosure.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold">Contact</h2>
              <p>
                For privacy questions, contact us at <strong>info@pawpal.com</strong>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
