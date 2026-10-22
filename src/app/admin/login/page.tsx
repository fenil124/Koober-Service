import React, { useState } from 'react';
import Image from '@/components/common/Image';
import { useNavigate } from 'react-router-dom';
import { Lock, Mail, Eye, EyeOff } from 'lucide-react';
import { Logo } from '@/components/common/Logo';
import { AuthService } from '@/lib/auth';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('admin@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    const result = await AuthService.login(email, password);
    setIsLoading(false);

    if (result.success) {
      navigate('/admin');
    } else {
      setErrorMsg(result.error || 'Failed to sign in');
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-[#071A2D]">
      {/* Background Scenic Road & Car Image matching Reference 3 */}
      <div className="absolute inset-0 z-0">
        <Image
          src="/images/hero-bg.jpg"
          alt="Scenic Travel Road"
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-[#071A2D]/50 backdrop-blur-[2px]" />
      </div>

      {/* Centered White Card matching Reference 3 (Panel 1) */}
      <div className="relative z-10 w-full max-w-sm sm:max-w-md bg-white rounded-2xl shadow-2xl p-7 sm:p-9 border border-slate-100">
        {/* Brand Logo Header */}
        <div className="text-center mb-6">
          <div className="flex justify-center mb-4">
            <Logo variant="light" size="lg" />
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-[#071A35] tracking-tight">
            Admin Login
          </h1>
          <p className="text-xs text-[#5A6A80] mt-1">
            Access your dashboard
          </p>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs text-center font-medium">
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#344054] mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <input
                type="email"
                required
                autoComplete="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#D0D5DD] text-xs sm:text-sm text-[#071A35] focus:outline-hidden focus:border-[#082B50] focus:ring-1 focus:ring-[#082B50] transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#344054] mb-1.5">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-3.5 pr-10 py-2.5 rounded-lg border border-[#D0D5DD] text-xs sm:text-sm text-[#071A35] focus:outline-hidden focus:border-[#082B50] focus:ring-1 focus:ring-[#082B50] transition-colors"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 rounded-lg bg-[#0E3A68] text-white text-xs sm:text-sm font-bold hover:bg-[#071A35] active:scale-[0.99] transition-all duration-150 flex items-center justify-center cursor-pointer disabled:opacity-60 shadow-sm"
            >
              {isLoading ? 'Signing In...' : 'Login'}
            </button>
          </div>
        </form>

        <div className="mt-7 pt-4 border-t border-slate-100 text-center">
          <p className="text-[11px] text-[#667085]">
            Koober Services | Admin Panel
          </p>
        </div>
      </div>
    </div>
  );
}
