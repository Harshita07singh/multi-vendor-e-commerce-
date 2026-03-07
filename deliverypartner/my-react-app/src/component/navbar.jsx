import React, { useState } from "react";
import { Link } from "react-router-dom";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="w-full fixed top-0 h-15 left-0 bg-[#299E60]  text-white shadow-md z-50">
      <div className="max-w-7xl mx-auto px-6 md:px-16 py-3 flex justify-between items-center">
        {/* Logo */}
        <div className="text-2xl font-bold">
          seller hub <span className="text-lg  font-extrabold">by 3arrow</span>
        </div>

        {/* Desktop Menu */}
        <ul className="hidden md:flex gap-8 text-lg font-medium">
          <li className="hover:underline cursor-pointer">
            <Link to="/">Home</Link>
          </li>
          {/* <li className="hover:underline cursor-pointer">
            <Link to="/dashboard">Dashboard</Link>
          </li> */}
          <li className="hover:underline cursor-pointer">
            <Link to="/about">About</Link>
          </li>
          <li className="hover:underline cursor-pointer">
            <Link to="/careers">Careers</Link>
          </li>
          <li className="hover:underline cursor-pointer">
            <Link to="/partner">Partner</Link>
          </li>
          <li className="hover:underline cursor-pointer">
            <Link to="/blog">Blog</Link>
          </li>
        </ul>

        {/* Mobile Hamburger */}
        <div
          className="md:hidden cursor-pointer"
          onClick={() => setIsOpen(!isOpen)}
        >
          ☰
        </div>
      </div>

      {/* Mobile Menu */}
      {isOpen && (
        <ul className="md:hidden bg-green-600 px-6 pb-4 space-y-3 font-medium">
          <li>
            <Link to="/" onClick={() => setIsOpen(false)}>
              Home
            </Link>
          </li>
          <li>
            <Link to="/dashboard" onClick={() => setIsOpen(false)}>
              Dashboard
            </Link>
          </li>
          <li>
            <Link to="/about" onClick={() => setIsOpen(false)}>
              About
            </Link>
          </li>
          <li>
            <Link to="/careers" onClick={() => setIsOpen(false)}>
              Careers
            </Link>
          </li>
          <li>
            <Link to="/partner" onClick={() => setIsOpen(false)}>
              Partner
            </Link>
          </li>
          <li>
            <Link to="/blog" onClick={() => setIsOpen(false)}>
              Blog
            </Link>
          </li>
        </ul>
      )}
    </nav>
  );
};

export default Navbar;
