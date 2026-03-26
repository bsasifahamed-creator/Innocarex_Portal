"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { label: "About", href: "#about" },
  { label: "How We Work", href: "#how-we-work" },
  { label: "Solutions", href: "#solutions" },
  { label: "Partners", href: "#partners" },
];

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <header className="fixed top-0 w-full z-50 px-4 md:px-6 py-3">
      <nav className="max-w-7xl mx-auto bg-white/90 backdrop-blur-xl border border-white/40 shadow-lg shadow-slate-200/20 rounded-2xl px-6 py-3 flex items-center justify-between">
        
        {/* Logo */}
        <div className="h-10 md:h-12">
          <Image
            src="/Logo.png"
            alt="InnoCare X"
            width={200}
            height={72}
            className="h-10 md:h-12 w-auto"
            priority
          />
        </div>

        {/* Desktop nav links */}
        <div className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              className="relative text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors group"
            >
              {link.label}
              <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-brand-blue opacity-0 group-hover:w-full group-hover:opacity-100 transition-all duration-300" />
            </Link>
          ))}
        </div>

        {/* Desktop CTA */}
        <div className="hidden md:flex items-center gap-4">
          <Link
            href="/login"
            className="text-sm font-medium text-slate-600 hover:text-brand-blue transition-colors"
          >
            Portal
          </Link>
          <Link
            href="#contact"
            className="px-6 py-2.5 bg-slate-900 text-white text-sm font-semibold rounded-xl hover:bg-primary shadow-lg shadow-slate-900/20 hover:shadow-primary/40 hover:-translate-y-0.5 transition-all duration-300"
          >
            Get in Touch
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="md:hidden w-10 h-10 rounded-xl bg-slate-50 flex flex-col items-center justify-center gap-1.5"
          aria-label="Toggle menu"
        >
          <span
            className={`block w-5 h-0.5 bg-slate-700 transition-all duration-300 ${
              menuOpen ? "rotate-45 translate-y-2" : ""
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-slate-700 transition-all duration-300 ${
              menuOpen ? "opacity-0" : ""
            }`}
          />
          <span
            className={`block w-5 h-0.5 bg-slate-700 transition-all duration-300 ${
              menuOpen ? "-rotate-45 -translate-y-2" : ""
            }`}
          />
        </button>
      </nav>

      {/* Mobile menu dropdown */}
      {menuOpen && (
        <div className="md:hidden mt-2 mx-0 bg-white/95 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl px-6 py-4 flex flex-col gap-4">
          {navLinks.map((link) => (
            <Link
              key={link.label}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className="text-sm font-medium text-slate-700 hover:text-brand-blue transition-colors py-1"
            >
              {link.label}
            </Link>
          ))}
          <Link
            href="/login"
            onClick={() => setMenuOpen(false)}
            className="text-sm font-medium text-slate-700 hover:text-brand-blue py-1"
          >
            Partner portal
          </Link>
          <Link
            href="#contact"
            onClick={() => setMenuOpen(false)}
            className="mt-2 px-6 py-3 bg-slate-900 text-white text-sm font-semibold rounded-xl text-center hover:bg-primary transition-colors"
          >
            Get in Touch
          </Link>
        </div>
      )}
    </header>
  );
}
