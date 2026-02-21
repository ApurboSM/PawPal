import { Link } from "wouter";
import { 
  PawPrint, MapPin, Phone, Mail, Clock, Facebook, 
  Twitter, Instagram, Youtube, Heart, Cat
} from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-primary/5 to-primary/20 pt-16 pb-8 relative">
      {/* Top curved border */}
      <div className="absolute -top-6 left-0 right-0 h-12 bg-background rounded-b-[50%] z-10"></div>
      
      {/* Paw print decorations */}
      <div className="absolute top-12 left-6 opacity-10">
        <PawPrint className="h-24 w-24 text-primary rotate-12" />
      </div>
      <div className="absolute bottom-24 right-6 opacity-10">
        <PawPrint className="h-16 w-16 text-primary -rotate-12" />
      </div>
      
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-12">
          {/* About */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center justify-center bg-primary/20 rounded-full p-2">
                <PawPrint className="h-6 w-6 text-primary" />
              </div>
              <div className="flex flex-col">
                <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">PawPal</span>
                <span className="text-xs text-muted-foreground -mt-1">Where Every Tail Finds a Tale</span>
              </div>
            </div>
            <p className="text-foreground mb-4">
              Connecting pets with loving homes since 2023. Our mission is to ensure every pet
              finds the care and love they deserve.
            </p>
            <div className="flex space-x-4">
              <a
                href="https://www.facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="PawPal on Facebook"
                className="text-primary/70 hover:text-primary transition-all-ease p-2 bg-primary/5 rounded-full hover:bg-primary/10"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://x.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="PawPal on X"
                className="text-primary/70 hover:text-primary transition-all-ease p-2 bg-primary/5 rounded-full hover:bg-primary/10"
              >
                <Twitter className="h-5 w-5" />
              </a>
              <a
                href="https://www.instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="PawPal on Instagram"
                className="text-primary/70 hover:text-primary transition-all-ease p-2 bg-primary/5 rounded-full hover:bg-primary/10"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://www.youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="PawPal on YouTube"
                className="text-primary/70 hover:text-primary transition-all-ease p-2 bg-primary/5 rounded-full hover:bg-primary/10"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground relative inline-block">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Quick Links</span>
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary"></span>
            </h3>
            <ul className="space-y-3">
              <li>
                <Link href="/" className="text-foreground hover:text-primary transition-all-ease flex items-center group">
                  <PawPrint className="h-4 w-4 mr-2 text-primary/70 group-hover:text-primary transition-all-ease" />
                  <span>Home</span>
                </Link>
              </li>
              <li>
                <Link href="/pets" className="text-foreground hover:text-primary transition-all-ease flex items-center group">
                  <PawPrint className="h-4 w-4 mr-2 text-primary/70 group-hover:text-primary transition-all-ease" />
                  <span>Adopt a Pet</span>
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-foreground hover:text-primary transition-all-ease flex items-center group">
                  <PawPrint className="h-4 w-4 mr-2 text-primary/70 group-hover:text-primary transition-all-ease" />
                  <span>Pet Care Resources</span>
                </Link>
              </li>
              <li>
                <Link href="/appointments" className="text-foreground hover:text-primary transition-all-ease flex items-center group">
                  <PawPrint className="h-4 w-4 mr-2 text-primary/70 group-hover:text-primary transition-all-ease" />
                  <span>Book Appointment</span>
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-foreground hover:text-primary transition-all-ease flex items-center group">
                  <PawPrint className="h-4 w-4 mr-2 text-primary/70 group-hover:text-primary transition-all-ease" />
                  <span>Contact</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground relative inline-block">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Contact Us</span>
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary"></span>
            </h3>
            <ul className="space-y-3">
              <li className="flex items-start group">
                <div className="p-2 bg-primary/10 rounded-full mr-3 group-hover:bg-primary/20 transition-all-ease">
                  <MapPin className="h-4 w-4 text-primary" />
                </div>
                <span className="text-foreground pt-1">Mirpur, Dhaka, Bangladesh</span>
              </li>
              <li className="flex items-center group">
                <div className="p-2 bg-primary/10 rounded-full mr-3 group-hover:bg-primary/20 transition-all-ease">
                  <Phone className="h-4 w-4 text-primary" />
                </div>
                <span className="text-foreground">+8801712345678</span>
              </li>
              <li className="flex items-center group">
                <div className="p-2 bg-primary/10 rounded-full mr-3 group-hover:bg-primary/20 transition-all-ease">
                  <Mail className="h-4 w-4 text-primary" />
                </div>
                <span className="text-foreground">info@pawpal.com</span>
              </li>
              <li className="flex items-center group">
                <div className="p-2 bg-primary/10 rounded-full mr-3 group-hover:bg-primary/20 transition-all-ease">
                  <Clock className="h-4 w-4 text-primary" />
                </div>
                <span className="text-foreground">Mon-Fri: 9AM-6PM, Sat: 10AM-4PM</span>
              </li>
            </ul>
          </div>

          {/* App Download */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-foreground relative inline-block">
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">Download Our App</span>
              <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-primary to-secondary"></span>
            </h3>
            <p className="text-foreground mb-4">
              Get the PawPal app for easy access to pet profiles, appointments, and more.
            </p>
            <div className="flex flex-col space-y-3">
              <a
                href="https://www.apple.com/app-store/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary/90 text-white py-3 px-4 rounded-full hover:bg-primary transition-all duration-300 flex items-center shadow-md hover:shadow-lg"
              >
                <svg
                  className="w-6 h-6 mr-3"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.09 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
                </svg>
                <div>
                  <div className="text-xs">Download on the</div>
                  <div className="font-semibold">App Store</div>
                </div>
              </a>
              <a
                href="https://play.google.com/store"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-secondary/90 text-white py-3 px-4 rounded-full hover:bg-secondary transition-all duration-300 flex items-center shadow-md hover:shadow-lg"
              >
                <svg
                  className="w-6 h-6 mr-3"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path d="M3.18 20.82C3.49 21.07 3.91 21.11 4.26 20.92L12 16.77L19.74 20.92C20.09 21.11 20.51 21.07 20.82 20.82C21.11 20.56 21.25 20.12 21.1 19.73L17.19 6.46C17.02 6.02 16.61 5.75 16.16 5.75H7.84C7.39 5.75 6.98 6.02 6.81 6.46L2.9 19.73C2.75 20.12 2.89 20.56 3.18 20.82Z" />
                  <path d="M12 4.75C13.1 4.75 14 3.85 14 2.75C14 1.65 13.1 0.75 12 0.75C10.9 0.75 10 1.65 10 2.75C10 3.85 10.9 4.75 12 4.75Z" />
                </svg>
                <div>
                  <div className="text-xs">Get it on</div>
                  <div className="font-semibold">Google Play</div>
                </div>
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-primary/10 pt-6 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-muted-foreground text-sm flex items-center">
              <Heart className="h-3 w-3 mr-1 text-primary" />
              &copy; {new Date().getFullYear()} PawPal. All rights reserved.
            </p>
            <div className="flex space-x-6 mt-4 md:mt-0">
              <Link href="/privacy-policy" className="text-muted-foreground text-sm hover:text-primary transition-all-ease">
                Privacy Policy
              </Link>
              <Link href="/terms-of-service" className="text-muted-foreground text-sm hover:text-primary transition-all-ease">
                Terms of Service
              </Link>
              <Link href="/cookie-policy" className="text-muted-foreground text-sm hover:text-primary transition-all-ease">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
