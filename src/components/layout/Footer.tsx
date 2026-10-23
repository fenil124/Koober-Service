import { Link } from 'react-router-dom';
import { MapPin, Phone, MessageSquare, Mail } from 'lucide-react';
import { SiteSettings } from '@/types';
import { Logo } from '@/components/common/Logo';
import { getWhatsAppUrl, getTelUrl } from '@/lib/utils';

// Inline social SVGs (clean and independent of external icon versions)
function FacebookIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

function InstagramIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

function YoutubeIcon({ className = 'w-3.5 h-3.5' }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

interface FooterProps {
  settings?: SiteSettings;
}

export function Footer({ settings }: FooterProps) {
  const phone = settings?.phone || '+91 98765 43210';
  const whatsapp = settings?.whatsapp || '+91 98765 43210';
  const address = settings?.address || 'Surat, Gujarat';
  const email = settings?.email || 'contact@kooberservices.com';

  return (
    <footer id="contact" className="bg-[#071A35] text-white border-t border-white/10 select-none">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
        <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
          {/* Left: Brand Logo + Divider + Quick Contact Info matching Reference 2 */}
          <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-6">
            <Link to="/" className="shrink-0">
              <Logo variant="dark" size="md" />
            </Link>

            {/* Subtle Vertical Divider on Desktop */}
            <div className="hidden sm:block w-px h-10 bg-white/20" />

            {/* Location, Phone, WhatsApp */}
            <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 text-xs text-slate-300">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#F5B936]" />
                <span>{address}</span>
              </div>

              <a
                href={getTelUrl(phone)}
                className="flex items-center gap-1.5 hover:text-[#F5B936] transition-colors"
              >
                <Phone className="w-3.5 h-3.5 text-[#F5B936]" />
                <span>{phone}</span>
              </a>

              <a
                href={getWhatsAppUrl(whatsapp)}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 hover:text-[#F5B936] transition-colors"
              >
                <MessageSquare className="w-3.5 h-3.5 text-[#00A859]" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Right: Inline Navigation Links & Social Icons */}
          <div className="flex flex-col sm:flex-row items-center gap-5 sm:gap-7">
            {/* Nav Links */}
            <nav className="flex flex-wrap items-center justify-center gap-4 text-xs font-medium text-slate-300">
              <a href="#home" className="hover:text-white transition-colors">
                Home
              </a>
              <a href="#about" className="hover:text-white transition-colors">
                About Us
              </a>
              <a href="#fleet" className="hover:text-white transition-colors">
                Our Fleet
              </a>
              <a href="#routes" className="hover:text-white transition-colors">
                Popular Routes
              </a>
              <a href="#destinations" className="hover:text-white transition-colors">
                Destinations
              </a>
              <a href="#reviews" className="hover:text-white transition-colors">
                Reviews
              </a>
              <a href="#inquiry" className="hover:text-white transition-colors">
                Contact
              </a>
            </nav>

            {/* Circular Social Icons */}
            <div className="flex items-center gap-2">
              <a
                href={settings?.facebook_url || 'https://facebook.com'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-[#F5B936] hover:text-[#071A35] flex items-center justify-center text-white transition-colors"
              >
                <FacebookIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href={settings?.instagram_url || 'https://instagram.com'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-[#F5B936] hover:text-[#071A35] flex items-center justify-center text-white transition-colors"
              >
                <InstagramIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href={settings?.youtube_url || 'https://youtube.com'}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="YouTube"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-[#F5B936] hover:text-[#071A35] flex items-center justify-center text-white transition-colors"
              >
                <YoutubeIcon className="w-3.5 h-3.5" />
              </a>
              <a
                href={`mailto:${email}`}
                aria-label="Email"
                className="w-7 h-7 rounded-full bg-white/10 hover:bg-[#F5B936] hover:text-[#071A35] flex items-center justify-center text-white transition-colors"
              >
                <Mail className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
