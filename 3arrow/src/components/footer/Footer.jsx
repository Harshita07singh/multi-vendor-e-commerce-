import React from "react";
import { MapPin, Phone, Mail } from "lucide-react";
import Arrow from "../../assets/image.png";
import appstore from "../../assets/appstore.png";
import googleplay from "../../assets/googleplay.png";
import Facebook from "../../assets/facebook.png";
import Twitter from "../../assets/twitter.png";
import Instagram from "../../assets/instagram.png";
import Linkedin from "../../assets/linkedin.png";

export default function MarketProFooter() {
  const API_BASE_URL = import.meta.env.VITE_VENDOR_URL;
  return (
    <footer className="bg-white pt-16 pb-8">
      <div className="max-w-9xl mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-8 pb-12">
          {/* Company Info - Full width on mobile */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-36 h-14 mb-0 flex items-center justify-center">
                <img
                  src={Arrow}
                  alt=""
                  className="w-full h-full object-contain"
                />
              </div>
            </div>
            <p className="text-gray-600 text-sm mb-6">
              We're Grocery Shop, an innovative team of food supliers.
            </p>

            {/* Contact Info */}
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <MapPin className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm text-gray-700">
                  Janakpuri, New Delhi, India
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm text-gray-700 flex flex-wrap items-center gap-1">
                  <span>+00 123 456 789</span>
                  {/* <span className="text-gray-400">or</span>
                  <span>+00 987 654 012</span> */}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm text-gray-700 break-all">
                  support24@3arrow24x7.com
                </p>
              </div>
            </div>
          </div>

          {/* Information */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-900 mb-4">Information</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href={API_BASE_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-green-600 text-sm"
                >
                  Become a Vendor
                </a>
              </li>
              <li>
                <a
                  href="/refund-policy"
                  className="text-gray-600 hover:text-green-600 text-sm"
                >
                  Refund Policy
                </a>
              </li>
              <li>
                <a
                  href="/privacy-policy"
                  className="text-gray-600 hover:text-green-600 text-sm"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="/terms-and-conditions"
                  className="text-gray-600 hover:text-green-600 text-sm"
                >
                  Terms and Conditions
                </a>
              </li>
              <li>
                <a
                  href="/cancellation-policy"
                  className="text-gray-600 hover:text-green-600 text-sm"
                >
                  Cancellation Policy
                </a>
              </li>
              <li>
                <a
                  href="/shipping-policy"
                  className="text-gray-600 hover:text-green-600 text-sm"
                >
                  Shipping Policy
                </a>
              </li>
            </ul>
          </div>

          {/* Customer Support */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-900 mb-4">
              Customer Support
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-green-600 text-sm"
                >
                  Help Center
                </a>
              </li>
              <li>
                <a
                  href="/Contact"
                  className="text-gray-600 hover:text-green-600 text-sm"
                >
                  Contact Us
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-green-600 text-sm"
                >
                  Report Abuse
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-green-600 text-sm"
                >
                  Submit and Dispute
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-green-600 text-sm"
                >
                  Policies & Rules
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-green-600 text-sm"
                >
                  Online Shopping
                </a>
              </li>
            </ul>
          </div>

          {/* My Account */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-900 mb-4">My Account</h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="/profile"
                  className="text-gray-600 hover:text-green-600 text-sm"
                >
                  My Account
                </a>
              </li>
              <li>
                <a
                  href="/orders"
                  className="text-gray-600 hover:text-green-600 text-sm"
                >
                  Order History
                </a>
              </li>
              <li>
                <a
                  href="/cart"
                  className="text-gray-600 hover:text-green-600 text-sm"
                >
                  Shoping Cart
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-green-600 text-sm"
                >
                  Compare
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-green-600 text-sm"
                >
                  Help Ticket
                </a>
              </li>
              <li>
                <a
                  href="\wishlist"
                  className="text-gray-600 hover:text-green-600 text-sm"
                >
                  Wishlist
                </a>
              </li>
            </ul>
          </div>

          {/* Daily Groceries */}
          <div>
            {" "}
            <h3 className="font-semibold text-gray-900 mb-2">Shop now Go on</h3>
            <p className="text-gray-600 text-sm mb-4">
              3arrow App is available. Get it now
            </p>
            <img
              src={appstore}
              alt="Download on the App Store"
              className="h-15 mb-3 w-50 cursor-pointer hover:opacity-80 transition"
            />
            <img
              src={googleplay}
              alt="Get it on Google Play"
              className="h-15 w-50 mb-4 cursor-pointer hover:opacity-80 transition"
            />
            {/* Social Media Icons */}
            <div className="flex mt-1.5 flex-wrap gap-3">
              <a href="https://facebook.com">
                <img
                  className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center hover:bg-green-200 transition"
                  src={Facebook}
                  alt="Facebook"
                />
              </a>
              <a href="https://twitter.com">
                <img
                  className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center hover:bg-green-200 transition"
                  src={Twitter}
                  alt="twitter"
                />
              </a>
              <a href="https://instagram.com">
                <img
                  className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center hover:bg-green-200 transition"
                  src={Instagram}
                  alt="instagram"
                />
              </a>
              <a href="https://Linkedin.com">
                <img
                  className="w-6 h-6 rounded-full bg-green-100 flex items-center justify-center hover:bg-green-200 transition"
                  src={Linkedin}
                  alt="linkedin"
                />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-center items-center gap-4">
          <p className="text-gray-500 text-sm text-center">
            © {new Date().getFullYear()} 3arrow | All Rights Reserved
          </p>
        </div>
      </div>
    </footer>
  );
}
