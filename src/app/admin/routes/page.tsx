'use client';

import { useState, useEffect, useCallback } from 'react';
import Image from '@/components/common/Image';
import { Search, Plus, Edit, Trash2, X, AlertCircle, Loader2, Power } from 'lucide-react';
import { toast } from 'sonner';
import { DataStore } from '@/lib/data-store';
import { Route, Car } from '@/types';
import { formatINR } from '@/lib/utils';
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { ImageManager } from '@/components/admin/ImageManager';
import { ResponsiveModal } from '@/components/common/ResponsiveModal';

export default function AdminRoutesPage() {
  const [routes, setRoutes] = useState<Route[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRoute, setEditingRoute] = useState<Route | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingRouteId, setLoadingRouteId] = useState<string | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Route | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Form state
  const [formOrigin, setFormOrigin] = useState('Surat');
  const [formDestination, setFormDestination] = useState('');
  const [formPrice, setFormPrice] = useState('8000');
  const [formImageUrl, setFormImageUrl] = useState('');
  const [formPublicId, setFormPublicId] = useState<string | null>(null);
  const [formActive, setFormActive] = useState(true);

  const loadData = useCallback(async () => {
    const [routesData, carsData] = await Promise.all([
      DataStore.getRoutes(),
      DataStore.getCars(),
    ]);
    setRoutes(routesData);
    setCars(carsData);
  }, []);

  useEffect(() => {
    loadData();

    const unsubscribe = DataStore.subscribe(() => {
      loadData();
    });

    return () => {
      unsubscribe();
    };
  }, [loadData]);

  const handleOpenAdd = () => {
    setEditingRoute(null);
    setFormOrigin('Surat');
    setFormDestination('');
    setFormPrice('8000');
    setFormImageUrl('');
    setFormPublicId(null);
    setFormActive(true);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (route: Route) => {
    setEditingRoute(route);
    setFormOrigin(route.origin);
    setFormDestination(route.destination);
    const p = route.prices && route.prices.length > 0 ? route.prices[0].price : null;
    setFormPrice(p !== null && p !== undefined ? String(p) : '');
    setFormImageUrl(route.image_url || '');
    setFormPublicId(route.cloudinary_public_id || null);
    setFormActive(route.is_active);
    setErrorMessage(null);
    setIsModalOpen(true);
  };

  // Direct route active toggle
  const handleToggleRouteActive = async (route: Route) => {
    if (loadingRouteId) return;
    setLoadingRouteId(route.id);

    const newActiveState = !route.is_active;
    try {
      await DataStore.saveRoute({
        ...route,
        is_active: newActiveState,
      });
      setRoutes((prev) =>
        prev.map((r) => (r.id === route.id ? { ...r, is_active: newActiveState } : r))
      );
      toast.success(
        `Route ${route.origin} → ${route.destination} marked as ${
          newActiveState ? 'Active' : 'Inactive'
        }`
      );
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update route status');
    } finally {
      setLoadingRouteId(null);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formOrigin.trim() || !formDestination.trim()) {
      setErrorMessage('Origin and Destination are required');
      return;
    }

    const numericPrice = formPrice.trim() !== '' ? Number(formPrice) : null;
    if (numericPrice !== null && (isNaN(numericPrice) || numericPrice < 0)) {
      setErrorMessage('Fare must be a valid non-negative number');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await DataStore.saveRoute({
        id: editingRoute ? editingRoute.id : undefined,
        origin: formOrigin.trim(),
        destination: formDestination.trim(),
        image_url: formImageUrl.trim() || null,
        cloudinary_public_id: formPublicId || editingRoute?.cloudinary_public_id || null,
        is_active: formActive,
        is_featured: true,
        prices: [
          {
            id: 'rp_' + Date.now(),
            route_id: editingRoute ? editingRoute.id : 'rt_temp',
            car_id: cars[0]?.id || 'c1',
            price: numericPrice,
          },
        ],
      });

      toast.success(editingRoute ? 'Route updated successfully' : 'New route created');
      setIsModalOpen(false);
      loadData();
    } catch (err: any) {
      const msg = err?.message || 'Failed to save route.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      await DataStore.deleteRoute(deleteTarget.id);
      toast.success(`Route ${deleteTarget.origin} → ${deleteTarget.destination} deleted`);
      setDeleteTarget(null);
      loadData();
    } catch (err: any) {
      console.error('Delete route error:', err);
      toast.error(err?.message || 'Failed to delete route');
    } finally {
      setIsDeleting(false);
    }
  };

  const allCount = routes.length;
  const activeCount = routes.filter((r) => r.is_active).length;
  const inactiveCount = routes.filter((r) => !r.is_active).length;

  const filtered = routes.filter((r) => {
    if (statusFilter === 'Active' && !r.is_active) return false;
    if (statusFilter === 'Inactive' && r.is_active) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        r.origin.toLowerCase().includes(q) ||
        r.destination.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2C50] tracking-tight">
            Routes &amp; Pricing
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Configure popular travel routes, transparent standard fares, and booking availability.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B2C50] text-white text-xs font-bold hover:bg-[#071B30] transition-colors self-start sm:self-auto shadow-sm cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add Route</span>
        </button>
      </div>

      {/* Mobile Controls (Search Row 1, Status Dropdown Row 2) */}
      <div className="flex flex-col gap-3 md:hidden">
        {/* Row 1: Full-width search */}
        <div className="relative w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by origin or destination..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-[#E2E8F0] text-xs text-[#14243A] placeholder:text-slate-400 focus:outline-hidden focus:border-[#0B2C50] shadow-2xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
        </div>

        {/* Row 2: Status Dropdown */}
        <div className="relative w-full">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as any)}
            className="w-full px-3 py-2.5 rounded-xl bg-white border border-[#E2E8F0] text-xs font-bold text-[#14243A] focus:outline-hidden focus:border-[#0B2C50] shadow-2xs cursor-pointer truncate"
          >
            <option value="All">All Statuses ({allCount})</option>
            <option value="Active">Active Routes ({activeCount})</option>
            <option value="Inactive">Inactive Routes ({inactiveCount})</option>
          </select>
        </div>
      </div>

      {/* Desktop Controls (Tabs on Left, Search on Right) */}
      <div className="hidden md:flex md:items-center justify-between gap-4">
        <div className="flex items-center gap-1.5 p-1 bg-white border border-[#E2E8F0] rounded-xl self-start shadow-2xs">
          <button
            type="button"
            onClick={() => setStatusFilter('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'All'
                ? 'bg-[#0B2C50] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0B2C50]'
            }`}
          >
            All ({allCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'Active'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0B2C50]'
            }`}
          >
            Active ({activeCount})
          </button>
          <button
            type="button"
            onClick={() => setStatusFilter('Inactive')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              statusFilter === 'Inactive'
                ? 'bg-slate-700 text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0B2C50]'
            }`}
          >
            Inactive ({inactiveCount})
          </button>
        </div>

        <div className="relative max-w-sm w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by origin or destination..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50] shadow-2xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Routes Content (Mobile Cards on md:hidden, Full Table on hidden md:block) */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-2xs">
        {/* Mobile Route Cards */}
        <div className="md:hidden divide-y divide-[#E2E8F0]">
          {filtered.length === 0 ? (
            <div className="py-12 px-4 text-center text-xs text-[#64748B]">
              No routes found matching your criteria.
            </div>
          ) : (
            filtered.map((route, idx) => {
              const displayPrice =
                route.prices && route.prices.length > 0 ? route.prices[0].price : null;

              return (
                <div key={route.id} className="p-4 space-y-3 hover:bg-slate-50/70 transition-colors">
                  {/* Origin to Destination Header with Status Toggle */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-extrabold text-sm text-[#0B2C50]">
                          {route.origin}
                        </span>
                        <span className="text-slate-400 font-bold">&rarr;</span>
                        <span className="font-extrabold text-sm text-[#0B2C50]">
                          {route.destination}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#64748B] mt-0.5">
                        Route #{idx + 1}
                      </div>
                    </div>

                    {/* Active/Inactive Status Toggle */}
                    <div className="shrink-0">
                      <button
                        type="button"
                        onClick={() => handleToggleRouteActive(route)}
                        disabled={loadingRouteId === route.id}
                        title="Click to toggle availability"
                        className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer shadow-2xs hover:opacity-85 active:scale-95 ${
                          route.is_active
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-slate-100 text-slate-500 border-slate-200'
                        }`}
                      >
                        {loadingRouteId === route.id ? (
                          <Loader2 className="w-3 h-3 animate-spin" />
                        ) : (
                          <Power className="w-2.5 h-2.5" />
                        )}
                        <span>{route.is_active ? 'Active' : 'Inactive'}</span>
                      </button>
                    </div>
                  </div>

                  {/* Standard Fare Capsule */}
                  <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-medium">Standard Fare:</span>
                    <span className="font-extrabold text-[#0B2C50] text-sm">
                      {displayPrice !== null && displayPrice !== undefined && displayPrice > 0
                        ? formatINR(displayPrice)
                        : 'Get a Quote'}
                    </span>
                  </div>

                  {/* Actions Row */}
                  <div className="flex items-center justify-end gap-2 pt-0.5">
                    <button
                      type="button"
                      onClick={() => handleOpenEdit(route)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:text-[#0B2C50] hover:bg-slate-100 rounded-lg transition-colors border border-slate-200 bg-white cursor-pointer"
                      title="Edit Route"
                    >
                      <Edit className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeleteTarget(route)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors border border-red-200 bg-white cursor-pointer"
                      title="Delete Route"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete</span>
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Desktop Table (hidden md:block) */}
        <div className="hidden md:block overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4">From</th>
                <th className="py-3.5 px-4">To</th>
                <th className="py-3.5 px-4">Standard Fare</th>
                <th className="py-3.5 px-4">Status (Click to Toggle)</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-xs text-[#64748B]">
                    No routes found matching your criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((route, idx) => {
                  const displayPrice =
                    route.prices && route.prices.length > 0 ? route.prices[0].price : null;
                  return (
                    <tr key={route.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-slate-400">
                        {idx + 1}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#14243A]">
                        {route.origin}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#14243A]">
                        {route.destination}
                      </td>
                      <td className="py-3.5 px-4 font-bold text-[#0B2C50]">
                        {displayPrice !== null && displayPrice !== undefined && displayPrice > 0
                          ? formatINR(displayPrice)
                          : 'Get a Quote'}
                      </td>
                      <td className="py-3.5 px-4">
                        <button
                          type="button"
                          onClick={() => handleToggleRouteActive(route)}
                          disabled={loadingRouteId === route.id}
                          title="Click to toggle availability"
                          className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-1 rounded-full border transition-all cursor-pointer shadow-2xs hover:opacity-85 active:scale-95 ${
                            route.is_active
                              ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                              : 'bg-slate-100 text-slate-500 border-slate-200'
                          }`}
                        >
                          {loadingRouteId === route.id ? (
                            <Loader2 className="w-3 h-3 animate-spin" />
                          ) : (
                            <Power className="w-2.5 h-2.5" />
                          )}
                          <span>{route.is_active ? 'Active' : 'Inactive'}</span>
                        </button>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleOpenEdit(route)}
                            className="p-1.5 text-slate-500 hover:text-[#0B2C50] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                            title="Edit Route"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteTarget(route)}
                            className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                            title="Delete Route"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Responsive Modal */}
      <ResponsiveModal
        isOpen={isModalOpen}
        onClose={() => !isSaving && setIsModalOpen(false)}
        title={editingRoute ? 'Edit Route' : 'Add New Route'}
        description="Configure route origins, destinations, pricing, and scenic banner image"
        maxWidth="lg"
        isSubmitting={isSaving}
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => setIsModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="route-form"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-[#0B2C50] text-white text-xs font-bold hover:bg-[#071B30] transition-colors cursor-pointer shadow-md disabled:opacity-50"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSaving ? 'Saving...' : 'Save Route'}</span>
            </button>
          </div>
        }
      >
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form id="route-form" onSubmit={handleSave} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#14243A] mb-1">
                Origin (Pickup) *
              </label>
              <input
                type="text"
                required
                value={formOrigin}
                onChange={(e) => setFormOrigin(e.target.value)}
                placeholder="e.g. Surat"
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-[#14243A] mb-1">
                Destination (Drop) *
              </label>
              <input
                type="text"
                required
                value={formDestination}
                onChange={(e) => setFormDestination(e.target.value)}
                placeholder="e.g. Mumbai Airport"
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#14243A] mb-1">
              Standard Fare (₹) - Leave empty for &ldquo;Get a Quote&rdquo;
            </label>
            <input
              type="number"
              min="0"
              value={formPrice}
              onChange={(e) => setFormPrice(e.target.value)}
              placeholder="e.g. 8000"
              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
            />
          </div>

          {/* Universal ImageManager */}
          <ImageManager
            label="Route Scenic Backdrop / Thumbnail"
            description="Optional scenic route photo or airport banner for the Popular Routes section."
            value={formImageUrl}
            onChange={(newUrl: string, publicId?: string) => {
              setFormImageUrl(newUrl);
              if (publicId) setFormPublicId(publicId);
            }}
            folder="routes"
            aspectRatio="video"
            recommendedSize="Recommended: 1200 × 800 px (Landscape orientation)"
          />

          <div className="pt-2 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#14243A] block">
                Active Route
              </span>
              <span className="text-[11px] text-[#64748B]">
                Publish on public Popular Routes section
              </span>
            </div>
            <input
              type="checkbox"
              checked={formActive}
              onChange={(e) => setFormActive(e.target.checked)}
              className="w-4 h-4 text-[#0B2C50] rounded cursor-pointer"
            />
          </div>
        </form>
      </ResponsiveModal>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this route?"
        itemName={deleteTarget ? `${deleteTarget.origin} → ${deleteTarget.destination}` : undefined}
        description="This will remove the route from the popular routes list. Historical bookings on this route will remain intact."
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
