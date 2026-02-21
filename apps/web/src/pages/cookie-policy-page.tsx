import { Helmet } from "react-helmet-async";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

export default function CookiePolicyPage() {
  return (
    <div className="min-h-screen bg-background">
      <Helmet>
        <title>Cookie Policy - PawPal</title>
        <meta
          name="description"
          content="Learn how PawPal uses cookies and similar technologies to improve functionality and user experience."
        />
      </Helmet>

      <Navbar />

      <main className="container mx-auto px-4 py-12">
        <div className="mx-auto max-w-3xl rounded-2xl border bg-white p-6 sm:p-8">
          <h1 className="mb-4 text-3xl font-bold">Cookie Policy</h1>
          <p className="mb-6 text-sm text-muted-foreground">Last updated: February 16, 2026</p>

          <div className="space-y-6 text-foreground">
            <section>
              <h2 className="mb-2 text-xl font-semibold">What Are Cookies?</h2>
              <p>
                Cookies are small text files stored on your device that help websites remember user
                preferences and support core functionality.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold">How PawPal Uses Cookies</h2>
              <p>
                We use cookies for login/session continuity, basic analytics, and performance
                improvements that make the platform faster and easier to use.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold">Managing Cookies</h2>
              <p>
                You can control cookies through your browser settings. Disabling some cookies may
                impact certain PawPal features.
              </p>
            </section>

            <section>
              <h2 className="mb-2 text-xl font-semibold">Contact</h2>
              <p>
                For cookie-policy questions, email <strong>info@pawpal.com</strong>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
