import { Link, useLocation } from 'react-router-dom';
import {
  LayoutDashboard,
  Inbox,
  Car,
  Map,
  Compass,
  Star,
  FileText,
  Settings,
  User,
  LogOut,
  ExternalLink,
} from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { AuthService } from '@/lib/auth';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Inquiries', href: '/admin/inquiries', icon: Inbox },
  { label: 'Cars', href: '/admin/cars', icon: Car },
  { label: 'Routes & Pricing', href: '/admin/routes', icon: Map },
  { label: 'Destinations', href: '/admin/destinations', icon: Compass },
  { label: 'Reviews', href: '/admin/reviews', icon: Star },
  { label: 'Home Content', href: '/admin/content', icon: FileText },
  { label: 'Settings', href: '/admin/settings', icon: Settings },
  { label: 'Profile', href: '/admin/profile', icon: User },
];

interface AdminSidebarProps {
  onCloseMobile?: () => void;
}

export function AdminSidebar({ onCloseMobile }: AdminSidebarProps) {
  const { pathname } = useLocation();

  const handleLogout = async () => {
    await AuthService.logout();
    window.location.href = '/admin/login';
  };

  return (
    <aside className="w-64 bg-[#071B30] text-slate-300 flex flex-col justify-between h-full border-r border-slate-800 shrink-0 select-none">
      <div>
        {/* Brand Logo */}
        <div className="px-6 py-5 border-b border-slate-800/80 flex items-center justify-center">
          <Link to="/admin" className="flex items-center">
            <Logo variant="dark" size="md" />
          </Link>
        </div>

        {/* Navigation Links with Active Highlighting */}
        <nav className="p-3.5 space-y-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                to={item.href}
                onClick={onCloseMobile}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 ${
                  isActive
                    ? 'bg-[#123F6B] text-white shadow-xs'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-[#F5B936]' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Bottom actions: Public Site link & Logout */}
      <div className="p-4 border-t border-slate-800/80 space-y-1.5">
        <Link
          to="/"
          target="_blank"
          className="flex items-center justify-between px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white hover:bg-slate-800/60 transition-colors"
        >
          <span className="flex items-center gap-2">
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Public Site</span>
          </span>
          <span className="text-[10px] text-[#F5B936] font-bold">LIVE</span>
        </Link>

        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-red-400 hover:text-red-300 hover:bg-red-950/30 transition-colors cursor-pointer"
        >
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
}
