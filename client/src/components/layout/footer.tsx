import { Link } from "wouter";
import { PawPrint, MapPin, Phone, Mail, Clock, Facebook, Twitter, Instagram, Youtube } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-neutral-800 text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          {/* About */}
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="text-[#FF9166] text-2xl">
                <PawPrint />
              </div>
              <span className="text-xl font-bold text-white">PawPal</span>
            </div>
            <p className="text-neutral-300 mb-4">
              Connecting pets with loving homes since 2023. Our mission is to ensure every pet
              finds the care and love they deserve.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-neutral-300 hover:text-[#FF9166] transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-300 hover:text-[#FF9166] transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-300 hover:text-[#FF9166] transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-neutral-300 hover:text-[#FF9166] transition-colors">
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/" className="text-neutral-300 hover:text-[#FF9166] transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link href="/pets" className="text-neutral-300 hover:text-[#FF9166] transition-colors">
                  Adopt a Pet
                </Link>
              </li>
              <li>
                <Link href="/resources" className="text-neutral-300 hover:text-[#FF9166] transition-colors">
                  Pet Care Resources
                </Link>
              </li>
              <li>
                <Link href="/appointments" className="text-neutral-300 hover:text-[#FF9166] transition-colors">
                  Book Appointment
                </Link>
              </li>
              <li>
                <Link href="/contact" className="text-neutral-300 hover:text-[#FF9166] transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-2">
              <li className="flex items-start">
                <MapPin className="h-5 w-5 mt-1 mr-3 text-[#FF9166]" />
                <span className="text-neutral-300">123 Pet Street, Animal City, AC 12345</span>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-3 text-[#FF9166]" />
                <span className="text-neutral-300">(123) 456-7890</span>
              </li>
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-3 text-[#FF9166]" />
                <span className="text-neutral-300">info@pawpal.com</span>
              </li>
              <li className="flex items-center">
                <Clock className="h-5 w-5 mr-3 text-[#FF9166]" />
                <span className="text-neutral-300">Mon-Fri: 9AM-6PM, Sat: 10AM-4PM</span>
              </li>
            </ul>
          </div>

          {/* App Download */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Download Our App</h3>
            <p className="text-neutral-300 mb-4">
              Get the PawPal app for easy access to pet profiles, appointments, and more.
            </p>
            <div className="flex flex-col space-y-2">
              <a
                href="#"
                className="bg-neutral-700 text-white py-2 px-4 rounded-lg hover:bg-neutral-600 transition-colors flex items-center"
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
                href="#"
                className="bg-neutral-700 text-white py-2 px-4 rounded-lg hover:bg-neutral-600 transition-colors flex items-center"
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

        <div className="border-t border-neutral-700 pt-6 mt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-neutral-400 text-sm">
              &copy; {new Date().getFullYear()} PawPal. All rights reserved.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <a href="#" className="text-neutral-400 text-sm hover:text-[#FF9166] transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="text-neutral-400 text-sm hover:text-[#FF9166] transition-colors">
                Terms of Service
              </a>
              <a href="#" className="text-neutral-400 text-sm hover:text-[#FF9166] transition-colors">
                Cookie Policy
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
