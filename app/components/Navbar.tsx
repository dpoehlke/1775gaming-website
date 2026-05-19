"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/games", label: "Games" },
  { href: "/about", label: "About" },
  { href: "/blog", label: "Blog" },
  { href: "/beta", label: "Beta Test" },
];

export default function Navbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [logoError, setLogoError] = useState(false);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled
          ? "bg-marine-black/90 backdrop-blur-md shadow-lg shadow-black/20"
          : "bg-marine-black"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Left: Logo */}
          <Link href="/" className="flex-shrink-0">
            {logoError ? (
              <span className="font-heading text-2xl text-white tracking-widest">
                1775 GAMING
              </span>
            ) : (
              <Image
                src="/images/Logo.png"
                alt="1775 Gaming"
                width={160}
                height={50}
                className="h-10 w-auto"
                onError={() => setLogoError(true)}
                priority
              />
            )}
          </Link>

          {/* Center: Nav Links (desktop) */}
          <div className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-body text-sm uppercase tracking-wider text-silver hover:text-white transition-colors duration-200"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right: JOIN BETA + Hamburger */}
          <div className="flex items-center space-x-4">
            <Link
              href="/beta"
              className="hidden md:inline-flex items-center px-5 py-2 font-body text-sm font-semibold uppercase tracking-wider text-white bg-scarlet border border-gold hover:bg-scarlet/80 transition-colors duration-200"
            >
              Join Beta
            </Link>

            <button
              className="md:hidden p-2 text-silver hover:text-white transition-colors duration-200"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              aria-label="Toggle navigation menu"
              aria-expanded={isMenuOpen}
            >
              {isMenuOpen ? (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              ) : (
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <div
        className={`md:hidden overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
        }`}
      >
        <div className="bg-charcoal px-4 py-4 space-y-1 border-t border-charcoal">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="block font-body text-sm uppercase tracking-wider text-silver hover:text-white py-3 border-b border-marine-black/50 transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3">
            <Link
              href="/beta"
              className="block text-center font-body text-sm font-semibold uppercase tracking-wider text-white bg-scarlet border border-gold px-4 py-3 hover:bg-scarlet/80 transition-colors duration-200"
              onClick={() => setIsMenuOpen(false)}
            >
              Join Beta
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
