'use client';

import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, ArrowRight } from 'lucide-react';
import { Logo } from '@/components/common/Logo';

interface HeaderProps {
  onOpenInquiry?: () => void;
  onOpenBooking?: () => void;
}

export function Header({ onOpenInquiry, onOpenBooking }: HeaderProps) {
  const location = useLocation();
  const isHomePage = location.pathname === '/' || location.pathname === '';

  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 30);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Home', href: isHomePage ? '#home' : '/#home' },
    { label: 'About Us', href: isHomePage ? '#about' : '/#about' },
    { label: 'Our Fleet', href: isHomePage ? '#fleet' : '/#fleet' },
    { label: 'Popular Routes', href: isHomePage ? '#routes' : '/#routes' },
    { label: 'Destinations', href: isHomePage ? '#destinations' : '/#destinations' },
    { label: 'Reviews', href: isHomePage ? '#reviews' : '/#reviews' },
    { label: 'Contact', href: isHomePage ? '#contact' : '/#contact' },
  ];

  // On non-homepage views (e.g. /fleet/:slug), always keep solid dark navy brand background
  const showSolidBackground = isScrolled || !isHomePage;

  const handleBookingClick = onOpenBooking || onOpenInquiry;

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 select-none ${
        showSolidBackground
          ? 'bg-[#071A35]/98 backdrop-blur-md border-b border-white/10 shadow-xl py-3'
          : 'bg-transparent py-4 sm:py-5'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-12">
          {/* Logo on the left */}
          <Link to="/" className="flex items-center group shrink-0">
            <Logo variant="dark" height={62} width={78} />
          </Link>

          {/* Navigation links in the center */}
          <nav className="hidden lg:flex items-center gap-7 text-sm font-semibold text-white/90">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="hover:text-[#F5B936] transition-colors py-1 text-slate-200"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Action buttons on the right: Inquiry Now and Book Now */}
          <div className="hidden sm:flex items-center gap-2.5">
            <button
              type="button"
              onClick={onOpenInquiry}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-white/20 hover:border-[#F5B936] text-white hover:text-[#F5B936] bg-white/5 hover:bg-white/10 text-xs font-bold transition-all duration-200 cursor-pointer active:scale-95"
            >
              <span>Inquiry Now</span>
            </button>
            <button
              type="button"
              onClick={handleBookingClick}
              className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-full bg-[#F5B936] hover:bg-[#E5A928] text-[#071A35] text-xs font-extrabold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all duration-200 cursor-pointer"
            >
              <span>Book Now</span>
              <ArrowRight className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>

          {/* Mobile menu toggle */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <button
              type="button"
              onClick={onOpenInquiry}
              className="sm:hidden px-2.5 py-1.5 rounded-full border border-white/20 text-white text-[11px] font-bold hover:border-[#F5B936] transition-colors"
            >
              Inquiry Now
            </button>
            <button
              type="button"
              onClick={handleBookingClick}
              className="sm:hidden px-3 py-1.5 rounded-full bg-[#F5B936] text-[#071A35] text-[11px] font-extrabold"
            >
              Book Now
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-1.5 text-white bg-white/10 hover:bg-white/20 rounded-lg transition-colors cursor-pointer ml-0.5"
              aria-label="Toggle Navigation"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#071A35]/98 backdrop-blur-xl border-b border-white/10 px-6 py-5 space-y-4 max-h-[calc(100vh-4rem)] max-h-[calc(100dvh-4rem)] overflow-y-auto overscroll-contain animate-in slide-in-from-top-2 duration-200">
          <div className="flex flex-col space-y-2 text-sm font-semibold text-white">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-slate-200 hover:text-[#F5B936] border-b border-white/5 transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (onOpenInquiry) onOpenInquiry();
              }}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-full border border-white/20 text-white hover:text-[#F5B936] text-xs font-bold transition-all"
            >
              <span>Inquiry Now</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                if (handleBookingClick) handleBookingClick();
              }}
              className="w-full flex items-center justify-center gap-2 py-3 rounded-full bg-[#F5B936] hover:bg-[#E5A928] text-[#071A35] text-xs font-extrabold shadow-lg transition-all"
            >
              <span>Book Now</span>
              <ArrowRight className="w-4 h-4 stroke-[2.5]" />
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

export default Header;
