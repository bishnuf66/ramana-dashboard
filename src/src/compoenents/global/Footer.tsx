import { Phone, Mail, MapPin } from "lucide-react";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className=" py-8 px-4 md:px-8">
      <div className="max-w-6xl mx-auto grid grid-cols-2 lg:grid-cols-4 gap-8">
        <div className="w-40 h-40  ">
          <Image
            src="/images/fruit-store-logo.jpg"
            alt="Fruit Store Logo"
            width={160}
            height={160}
            className="object-cover "
          />
        </div>

        <div className="flex flex-col items-center">
          <h2 className="text-lg font-bold mb-4">ABOUT US</h2>
          <div className="space-y-2">
            <p className="flex items-center">
              <Phone className="mr-2 h-4 w-4" /> +9812354678
            </p>
            <p className="flex items-center">
              <Mail className="mr-2 h-4 w-4" /> contact@gmail.com
            </p>
            <p className="flex items-center">
              <MapPin className="mr-2 h-4 w-4" /> Kathmandu, Nepal
            </p>
          </div>
        </div>

        <div className="flex flex-col items-center ">
          <h2 className="text-lg font-bold mb-4">MY ACCOUNT</h2>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:underline">
                About Us
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Contact Us
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                My account
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Service
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Wishlist
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Privacy Policy
              </a>
            </li>
          </ul>
        </div>

        <div className="flex flex-col items-center ">
          <h2 className="text-lg font-bold mb-4">POLICIES</h2>
          <ul className="space-y-2">
            <li>
              <a href="#" className="hover:underline">
                Nutrition business
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Gift Vouchers
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Support Center
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Delivery Information
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Returns
              </a>
            </li>
            <li>
              <a href="#" className="hover:underline">
                Terms & Conditions
              </a>
            </li>
          </ul>
        </div>
      </div>
      <div className="mt-8 text-center text-sm">
        <p>Copyright © 2025 Bishnu Bishowkarma. All rights reserved.</p>
      </div>
    </footer>
  );
}
