import React from "react";
import {
  MapPin,
  Phone,
  Mail,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
} from "lucide-react";

export default function MarketProFooter() {
  return (
    <footer className="bg-white pt-16 pb-8">
      <div className="max-w-7xl mx-auto px-4">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-x-8 gap-y-8 pb-12">
          {/* Company Info - Full width on mobile */}
          <div className="col-span-2 lg:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 bg-green-600 rounded-lg flex items-center justify-center text-2xl">
                🛒
              </div>
              <span className="text-2xl font-bold text-green-600">
                Marketpro
              </span>
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
                  789 Inner Lane, Biyes park, California, USA
                </p>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Phone className="w-4 h-4 text-white" />
                </div>
                <div className="text-sm text-gray-700 flex flex-wrap items-center gap-1">
                  <span>+00 123 456 789</span>
                  <span className="text-gray-400">or</span>
                  <span>+00 987 654 012</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                  <Mail className="w-4 h-4 text-white" />
                </div>
                <p className="text-sm text-gray-700 break-all">
                  support24@marketpro.com
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
                  href="#"
                  className="text-gray-600 hover:text-green-600 text-sm"
                >
                  Become a Vendor
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-green-600 text-sm"
                >
                  Affiliate Program
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-green-600 text-sm"
                >
                  Privacy Policy
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-green-600 text-sm"
                >
                  Our Suppliers
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-green-600 text-sm"
                >
                  Extended Plan
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-green-600 text-sm"
                >
                  Community
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
                  href="#"
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
                  href="/login"
                  className="text-gray-600 hover:text-green-600 text-sm"
                >
                  My Account
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-green-600 text-sm"
                >
                  Order History
                </a>
              </li>
              <li>
                <a
                  href="#"
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
                  href="#"
                  className="text-gray-600 hover:text-green-600 text-sm"
                >
                  Wishlist
                </a>
              </li>
            </ul>
          </div>

          {/* Daily Groceries */}
          <div className="col-span-1">
            <h3 className="font-semibold text-gray-900 mb-4">
              Daily Groceries
            </h3>
            <ul className="space-y-3">
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-green-600 text-sm"
                >
                  Dairy & Eggs
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-green-600 text-sm"
                >
                  Meat & Seafood
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-green-600 text-sm"
                >
                  Breakfast Food
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-green-600 text-sm"
                >
                  Household Supplies
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-green-600 text-sm"
                >
                  Bread & Bakery
                </a>
              </li>
              <li>
                <a
                  href="#"
                  className="text-gray-600 hover:text-green-600 text-sm"
                >
                  Pantry Staples
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Shop on The Go Section */}
        <div className="border-t border-gray-200 pt-8 pb-8">
          <h3 className="font-semibold text-gray-900 mb-2">Shop on The Go</h3>
          <p className="text-gray-600 text-sm mb-4">
            Marketpro App is available. Get it now
          </p>
          <div className="flex flex-wrap gap-4 mb-6">
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/3/3c/Download_on_the_App_Store_Badge.svg/320px-Download_on_the_App_Store_Badge.svg.png"
              alt="Download on the App Store"
              className="h-11 cursor-pointer hover:opacity-80 transition"
            />
            <img
              src="https://upload.wikimedia.org/wikipedia/commons/thumb/7/78/Google_Play_Store_badge_EN.svg/320px-Google_Play_Store_badge_EN.svg.png"
              alt="Get it on Google Play"
              className="h-11 cursor-pointer hover:opacity-80 transition"
            />
          </div>

          {/* Social Media Icons */}
          <div className="flex flex-wrap gap-3">
            <a
              href="#"
              className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center hover:bg-green-200 transition"
            >
              <Facebook className="w-5 h-5 text-green-600" />
            </a>
            <a
              href="#"
              className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center hover:bg-green-200 transition"
            >
              <Twitter className="w-5 h-5 text-green-600" />
            </a>
            <a
              href="#"
              className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center hover:bg-green-200 transition"
            >
              <Instagram className="w-5 h-5 text-green-600" />
            </a>
            <a
              href="#"
              className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center hover:bg-green-200 transition"
            >
              <Linkedin className="w-5 h-5 text-green-600" />
            </a>
          </div>
        </div>

        {/* Bottom Footer - Copyright & Payment Methods */}
        <div className="border-t border-gray-200 pt-6 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-gray-500 text-sm text-center md:text-left">
            Marketpro eCommerce © 2024. All Rights Reserved
          </p>

          {/* Payment Methods */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            <span className="text-gray-700 text-sm font-medium">
              We Are Acepting
            </span>
            <img
              src="https://i.ibb.co/0BZfPq6/stripe-payment-card-icons-symbols-credit-debit-cards-logos-png.webp"
              alt="Payment Methods"
              className="h-8"
            />
          </div>
        </div>
      </div>
    </footer>
  );
}
