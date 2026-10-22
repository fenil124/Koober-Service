'use client';

import { useState, useEffect } from 'react';
import { User, Lock, CheckCircle2 } from 'lucide-react';
import { AuthService, AdminUser } from '@/lib/auth';

export default function AdminProfilePage() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [fullName, setFullName] = useState('Admin');
  const [email, setEmail] = useState('admin@gmail.com');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [statusMsg, setStatusMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    async function load() {
      const session = await AuthService.getSession();
      if (session) {
        setUser(session);
        setFullName(session.fullName || 'Admin');
        setEmail(session.email || 'admin@gmail.com');
      }
    }
    load();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatusMsg(null);
    setIsUpdating(true);

    if (newPassword) {
      if (newPassword !== confirmPassword) {
        setStatusMsg({ type: 'error', text: 'New password and confirm password do not match.' });
        setIsUpdating(false);
        return;
      }
      if (newPassword.length < 6) {
        setStatusMsg({ type: 'error', text: 'Password must be at least 6 characters long.' });
        setIsUpdating(false);
        return;
      }
      await AuthService.updatePassword(newPassword);
    }

    await AuthService.updateProfile(fullName);
    setIsUpdating(false);
    setStatusMsg({ type: 'success', text: 'Profile updated successfully.' });
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6">
      {/* Header matching panel 11 */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#082B50] tracking-tight">
          Admin Profile
        </h1>
        <p className="text-xs sm:text-sm text-[#667085] mt-1">
          Update your profile information and credentials.
        </p>
      </div>

      <div className="bg-white rounded-2xl border border-[#E4E7EC] p-6 sm:p-8 shadow-2xs max-w-2xl">
        {statusMsg && (
          <div
            className={`mb-6 p-3 rounded-xl text-xs font-bold flex items-center gap-2 ${
              statusMsg.type === 'success'
                ? 'bg-emerald-50 border border-emerald-200 text-emerald-700'
                : 'bg-red-50 border border-red-200 text-red-700'
            }`}
          >
            {statusMsg.type === 'success' && <CheckCircle2 className="w-4 h-4" />}
            <span>{statusMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleUpdate} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#344054] mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] text-xs text-[#101828] focus:outline-hidden focus:border-[#082B50]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#344054] mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                disabled
                value={email}
                className="w-full px-3.5 py-2.5 rounded-xl border border-[#E4E7EC] bg-slate-50 text-xs text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100">
            <h3 className="text-xs font-bold text-[#082B50] uppercase tracking-wider mb-3">
              Change Password
            </h3>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-bold text-[#344054] mb-1">
                  Current Password
                </label>
                <input
                  type="password"
                  autoComplete="current-password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Enter current password"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] text-xs text-[#101828] focus:outline-hidden focus:border-[#082B50]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1">
                    New Password
                  </label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] text-xs text-[#101828] focus:outline-hidden focus:border-[#082B50]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#344054] mb-1">
                    Confirm New Password
                  </label>
                  <input
                    type="password"
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-[#D0D5DD] text-xs text-[#101828] focus:outline-hidden focus:border-[#082B50]"
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              disabled={isUpdating}
              className="px-6 py-2.5 rounded-xl bg-[#082B50] text-white text-xs font-bold hover:bg-[#071A2D] transition-colors cursor-pointer shadow-md disabled:opacity-60"
            >
              {isUpdating ? 'Updating...' : 'Update Profile'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
