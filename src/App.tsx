import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

import HomePage from '@/app/page';
import VehicleDetailsPage from '@/app/fleet/VehicleDetailsPage';
import AdminLoginPage from '@/app/admin/login/page';
import AdminLayout from '@/app/admin/layout';
import AdminDashboardPage from '@/app/admin/page';
import CarsPage from '@/app/admin/cars/page';
import RoutesPage from '@/app/admin/routes/page';
import DestinationsPage from '@/app/admin/destinations/page';
import ReviewsPage from '@/app/admin/reviews/page';
import InquiriesPage from '@/app/admin/inquiries/page';
import ContentPage from '@/app/admin/content/page';
import SettingsPage from '@/app/admin/settings/page';
import ProfilePage from '@/app/admin/profile/page';

export function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<HomePage />} />
        <Route path="/fleet/:slug" element={<VehicleDetailsPage />} />
        <Route path="/fleet" element={<Navigate to="/#fleet" replace />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<AdminDashboardPage />} />
          <Route path="cars" element={<CarsPage />} />
          <Route path="routes" element={<RoutesPage />} />
          <Route path="destinations" element={<DestinationsPage />} />
          <Route path="reviews" element={<ReviewsPage />} />
          <Route path="inquiries" element={<InquiriesPage />} />
          <Route path="content" element={<ContentPage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Catch-all Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster position="top-right" richColors />
    </BrowserRouter>
  );
}

export default App;
