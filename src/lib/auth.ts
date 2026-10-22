'use client';

export interface AdminUser {
  id?: string;
  email: string;
  fullName: string;
  role: string;
  avatar_url?: string | null;
}

const AUTH_STORAGE_KEY = 'rr_admin_auth';
const TOKEN_STORAGE_KEY = 'rr_token';

function getAuthHeaders(): Record<string, string> {
  if (typeof window === 'undefined') return {};
  const token = localStorage.getItem(TOKEN_STORAGE_KEY);
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const AuthService = {
  async getSession(): Promise<AdminUser | null> {
    if (typeof window === 'undefined') return null;

    try {
      const res = await fetch('/api/auth/session', {
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        credentials: 'include',
      });

      if (res.ok) {
        const data = await res.json();
        if (data?.user) {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));
          return data.user;
        } else {
          // Explicitly clear stale session cache when server has no active session
          localStorage.removeItem(AUTH_STORAGE_KEY);
          localStorage.removeItem(TOKEN_STORAGE_KEY);
          return null;
        }
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY);
        localStorage.removeItem(TOKEN_STORAGE_KEY);
        return null;
      }
    } catch (err) {
      console.warn('Backend session fetch error:', err);
      // DO NOT return stale cached user if backend cannot verify session
      return null;
    }
  },

  async login(email: string, password: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok || !data.success) {
        return { success: false, error: data.error || 'Invalid credentials' };
      }

      if (typeof window !== 'undefined') {
        if (data.token) {
          localStorage.setItem(TOKEN_STORAGE_KEY, data.token);
        }
        if (data.user) {
          localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));
        }
        document.cookie = `rr_admin_session=active; path=/; max-age=604800; SameSite=Lax`;
      }

      return { success: true };
    } catch (err: any) {
      console.error('Login request failed:', err);
      return { success: false, error: err?.message || 'Login connection failed' };
    }
  },

  async logout(): Promise<void> {
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        headers: { ...getAuthHeaders() },
        credentials: 'include',
      });
    } catch (err) {
      console.warn('Logout request warning:', err);
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(AUTH_STORAGE_KEY);
      document.cookie = `rr_admin_session=; path=/; max-age=0; SameSite=Lax`;
      window.dispatchEvent(new CustomEvent('rr_auth_expired'));
    }
  },

  async updatePassword(newPassword: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/auth/password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update password' };
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to update password' };
    }
  },

  async updateProfile(fullName: string): Promise<{ success: boolean; error?: string }> {
    try {
      const res = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders(),
        },
        credentials: 'include',
        body: JSON.stringify({ fullName }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        return { success: false, error: data.error || 'Failed to update profile' };
      }

      if (data?.user && typeof window !== 'undefined') {
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(data.user));
      }

      return { success: true };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to update profile' };
    }
  },
};
