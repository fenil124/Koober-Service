'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  Search,
  Phone,
  MessageSquare,
  Edit,
  Trash2,
  Plus,
  X,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { toast } from 'sonner';
import { DataStore } from '@/lib/data-store';
import { Inquiry, InquiryStatus, Car } from '@/types';
import { formatDate, getTelUrl, getWhatsAppUrl } from '@/lib/utils';
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { InquiryStatusBadgeSelect } from '@/components/admin/InquiryStatusBadgeSelect';
import { ResponsiveModal } from '@/components/common/ResponsiveModal';

export default function AdminInquiriesPage() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<
    'All' | 'New' | 'Contacted' | 'Quotation Given' | 'Confirmed' | 'Completed' | 'Cancelled'
  >('All');
  const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Direct status update loading tracker
  const [loadingStatusId, setLoadingStatusId] = useState<string | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Inquiry | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Edit form state
  const [editStatus, setEditStatus] = useState<InquiryStatus>('New');
  const [editNotes, setEditNotes] = useState('');
  const [editPrice, setEditPrice] = useState<string>('');

  // Manual Add Form State
  const [newCustomerName, setNewCustomerName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newPickup, setNewPickup] = useState('Surat');
  const [newDestination, setNewDestination] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newCarName, setNewCarName] = useState('');
  const [newPassengers, setNewPassengers] = useState(4);
  const [newSource, setNewSource] = useState<'phone' | 'whatsapp' | 'website'>('phone');

  const loadData = useCallback(async () => {
    try {
      const [inqData, carsData] = await Promise.all([
        DataStore.getInquiries(),
        DataStore.getCars(),
      ]);
      setInquiries(inqData);
      setCars(carsData);
    } catch (err) {
      console.error('Error loading inquiries:', err);
    }
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

  // Tab counts
  const allCount = inquiries.length;
  const newCount = inquiries.filter((i) => i.status === 'New').length;
  const contactedCount = inquiries.filter((i) => i.status === 'Contacted').length;
  const quoteCount = inquiries.filter((i) => i.status === 'Quotation Given').length;
  const confirmedCount = inquiries.filter((i) => i.status === 'Confirmed').length;
  const completedCount = inquiries.filter((i) => i.status === 'Completed').length;
  const cancelledCount = inquiries.filter((i) => i.status === 'Cancelled').length;

  // Filtered inquiries
  const filtered = inquiries.filter((i) => {
    if (activeTab !== 'All' && i.status !== activeTab) return false;

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchName = i.customer_name.toLowerCase().includes(q);
      const matchPhone = i.phone.toLowerCase().includes(q);
      const matchDest = i.destination.toLowerCase().includes(q);
      const matchPickup = i.pickup_location.toLowerCase().includes(q);
      const matchCar = (i.car_name || '').toLowerCase().includes(q);
      return matchName || matchPhone || matchDest || matchPickup || matchCar;
    }
    return true;
  });

  // Direct status update handler from the table badge
  const handleDirectStatusChange = async (inquiryId: string, newStatus: InquiryStatus) => {
    if (loadingStatusId) return;
    setLoadingStatusId(inquiryId);

    const prevInquiry = inquiries.find((i) => i.id === inquiryId);
    const prevStatus = prevInquiry?.status;

    try {
      const updated = await DataStore.updateInquiryStatus(inquiryId, newStatus);
      if (!updated) throw new Error('Inquiry not found in database');

      // Update state immediately without moving scroll or resetting filters
      setInquiries((prev) =>
        prev.map((i) => (i.id === inquiryId ? { ...i, status: newStatus } : i))
      );
      toast.success(`Inquiry status updated to ${newStatus}`);
    } catch (err: any) {
      // Revert if database mutation failed
      if (prevStatus) {
        setInquiries((prev) =>
          prev.map((i) => (i.id === inquiryId ? { ...i, status: prevStatus } : i))
        );
      }
      toast.error(err?.message || 'Failed to update inquiry status');
    } finally {
      setLoadingStatusId(null);
    }
  };

  const handleOpenEdit = (inq: Inquiry) => {
    setSelectedInquiry(inq);
    setEditStatus(inq.status);
    setEditNotes(inq.internal_notes || '');
    setEditPrice(inq.agreed_price ? String(inq.agreed_price) : '');
    setErrorMessage(null);
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedInquiry) return;
    setIsSaving(true);
    setErrorMessage(null);

    try {
      await DataStore.updateInquiryStatus(
        selectedInquiry.id,
        editStatus,
        editNotes,
        editPrice ? Number(editPrice) : undefined
      );
      toast.success('Inquiry record updated successfully');
      setIsEditModalOpen(false);
      setSelectedInquiry(null);
      loadData();
    } catch (err: any) {
      const msg = err?.message || 'Failed to update inquiry status.';
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
      await DataStore.deleteInquiry(deleteTarget.id);
      toast.success('Inquiry record deleted successfully');
      setDeleteTarget(null);
      loadData();
    } catch (err: any) {
      console.error('Delete inquiry error:', err);
      toast.error(err?.message || 'Failed to delete inquiry');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleCreateManualInquiry = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCustomerName.trim() || !newPhone.trim() || !newDestination.trim() || !newDate) {
      setErrorMessage('Please fill all required fields');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      await DataStore.submitInquiry(
        {
          customer_name: newCustomerName.trim(),
          phone: newPhone.trim(),
          pickup_location: newPickup.trim(),
          destination: newDestination.trim(),
          travel_date: newDate,
          car_name: newCarName || undefined,
          passengers: newPassengers,
          trip_type: 'one-way',
        },
        newSource
      );

      toast.success('New inquiry recorded successfully');
      setIsAddModalOpen(false);
      setNewCustomerName('');
      setNewPhone('');
      setNewDestination('');
      setNewDate('');
      loadData();
    } catch (err: any) {
      const msg = err?.message || 'Failed to create inquiry record.';
      setErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2C50] tracking-tight">
            Inquiries
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Manage customer trip requests, change booking status directly, and coordinate rides.
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            setErrorMessage(null);
            setIsAddModalOpen(true);
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0B2C50] text-white text-xs font-bold hover:bg-[#071B30] transition-colors self-start sm:self-auto shadow-sm cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>New Inquiry</span>
        </button>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-1.5 p-1 bg-white border border-[#E2E8F0] rounded-xl self-start shadow-2xs">
          <button
            type="button"
            onClick={() => setActiveTab('All')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'All'
                ? 'bg-[#0B2C50] text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0B2C50]'
            }`}
          >
            All ({allCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('New')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'New'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0B2C50]'
            }`}
          >
            New ({newCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('Contacted')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'Contacted'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0B2C50]'
            }`}
          >
            Contacted ({contactedCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('Quotation Given')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'Quotation Given'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0B2C50]'
            }`}
          >
            Quote Given ({quoteCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('Confirmed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'Confirmed'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0B2C50]'
            }`}
          >
            Confirmed ({confirmedCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('Completed')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'Completed'
                ? 'bg-teal-600 text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0B2C50]'
            }`}
          >
            Completed ({completedCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('Cancelled')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'Cancelled'
                ? 'bg-red-600 text-white shadow-xs'
                : 'text-[#64748B] hover:text-[#0B2C50]'
            }`}
          >
            Cancelled ({cancelledCount})
          </button>
        </div>

        <div className="relative max-w-sm w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, phone, destination..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50] shadow-2xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Inquiries Table */}
      <div className="bg-white rounded-2xl border border-[#E2E8F0] overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#F8FAFC] border-b border-[#E2E8F0] text-[#64748B] font-bold uppercase tracking-wider text-[11px]">
              <tr>
                <th className="py-3.5 px-4">#</th>
                <th className="py-3.5 px-4">Customer</th>
                <th className="py-3.5 px-4">Phone</th>
                <th className="py-3.5 px-4">Travel Date</th>
                <th className="py-3.5 px-4">Route</th>
                <th className="py-3.5 px-4">Car</th>
                <th className="py-3.5 px-4">Status (Click to Change)</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E2E8F0]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-xs text-[#64748B]">
                    No inquiries found matching your filters.
                  </td>
                </tr>
              ) : (
                filtered.map((inq, idx) => (
                  <tr key={inq.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-bold text-slate-400">
                      {idx + 1}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-[#14243A]">
                        {inq.customer_name}
                      </div>
                      <div className="text-[11px] text-[#64748B]">
                        {inq.trip_type === 'round-trip' ? 'Round Trip' : 'One Way'} &bull; {inq.passengers} Pax
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#14243A] font-medium whitespace-nowrap">
                      {inq.phone}
                    </td>
                    <td className="py-3 px-4 text-[#64748B] whitespace-nowrap">
                      {formatDate(inq.travel_date)}
                    </td>
                    <td className="py-3 px-4 text-[#14243A]">
                      <span className="font-semibold">{inq.pickup_location}</span>
                      <span className="mx-1.5 text-slate-400">&rarr;</span>
                      <span className="font-semibold">{inq.destination}</span>
                    </td>
                    <td className="py-3 px-4 text-[#64748B] whitespace-nowrap">
                      {inq.car_name || 'Any Car'}
                    </td>
                    <td className="py-3 px-4">
                      {/* Direct status change select control right inside the table row */}
                      <InquiryStatusBadgeSelect
                        status={inq.status}
                        inquiryId={inq.id}
                        onStatusChange={(newStatus) => handleDirectStatusChange(inq.id, newStatus)}
                        isLoading={loadingStatusId === inq.id}
                        disabled={loadingStatusId !== null}
                      />
                    </td>
                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1.5">
                        <a
                          href={getTelUrl(inq.phone)}
                          className="p-1.5 text-slate-500 hover:text-[#0B2C50] hover:bg-slate-100 rounded-lg transition-colors"
                          title={`Call customer: ${inq.phone}`}
                        >
                          <Phone className="w-3.5 h-3.5" />
                        </a>
                        <a
                          href={getWhatsAppUrl(
                            inq.phone,
                            `Hello ${inq.customer_name}, greetings from Koober Services regarding your journey to ${inq.destination}...`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 text-[#00A859] hover:bg-emerald-50 rounded-lg transition-colors"
                          title={`Chat on WhatsApp: ${inq.phone}`}
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                        </a>
                        <button
                          type="button"
                          onClick={() => handleOpenEdit(inq)}
                          className="p-1.5 text-slate-500 hover:text-[#0B2C50] hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
                          title="Edit details and notes"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(inq)}
                          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="Delete inquiry"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Status & Notes Responsive Modal */}
      <ResponsiveModal
        isOpen={Boolean(isEditModalOpen && selectedInquiry)}
        onClose={() => !isSaving && setIsEditModalOpen(false)}
        title={selectedInquiry ? `Edit Inquiry #${selectedInquiry.id.slice(-4)}` : 'Edit Inquiry'}
        description={selectedInquiry ? `Customer: ${selectedInquiry.customer_name} (${selectedInquiry.phone})` : undefined}
        maxWidth="md"
        isSubmitting={isSaving}
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => setIsEditModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveEdit}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-[#0B2C50] text-white text-xs font-bold hover:bg-[#071B30] transition-colors cursor-pointer shadow-md disabled:opacity-50"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSaving ? 'Saving...' : 'Save Updates'}</span>
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

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#14243A] mb-1">
              Booking Status
            </label>
            <select
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value as InquiryStatus)}
              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
            >
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Quotation Given">Quotation Given</option>
              <option value="Confirmed">Confirmed</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-[#14243A] mb-1">
              Agreed Fare / Quote Price (₹)
            </label>
            <input
              type="number"
              value={editPrice}
              onChange={(e) => setEditPrice(e.target.value)}
              placeholder="e.g. 8500"
              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-[#14243A] mb-1">
              Internal Notes
            </label>
            <textarea
              rows={3}
              value={editNotes}
              onChange={(e) => setEditNotes(e.target.value)}
              placeholder="e.g. Flight delay mentioned, assigned driver Ramesh..."
              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50] resize-none"
            />
          </div>
        </div>
      </ResponsiveModal>

      {/* Manual Add Inquiry Responsive Modal */}
      <ResponsiveModal
        isOpen={isAddModalOpen}
        onClose={() => !isSaving && setIsAddModalOpen(false)}
        title="Record Manual Inquiry"
        description="Add a phone or walk-in customer booking inquiry"
        maxWidth="lg"
        isSubmitting={isSaving}
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              disabled={isSaving}
              onClick={() => setIsAddModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="manual-inquiry-form"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-[#0B2C50] text-white text-xs font-bold hover:bg-[#071B30] transition-colors cursor-pointer shadow-md disabled:opacity-50"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSaving ? 'Saving...' : 'Create Record'}</span>
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

        <form id="manual-inquiry-form" onSubmit={handleCreateManualInquiry} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#14243A] mb-1">
                Customer Name *
              </label>
              <input
                type="text"
                required
                value={newCustomerName}
                onChange={(e) => setNewCustomerName(e.target.value)}
                placeholder="Customer Name"
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#14243A] mb-1">
                Phone *
              </label>
              <input
                type="tel"
                required
                value={newPhone}
                onChange={(e) => setNewPhone(e.target.value)}
                placeholder="10-digit mobile"
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#14243A] mb-1">
                Pickup Location
              </label>
              <input
                type="text"
                value={newPickup}
                onChange={(e) => setNewPickup(e.target.value)}
                placeholder="Pickup city"
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#14243A] mb-1">
                Destination *
              </label>
              <input
                type="text"
                required
                value={newDestination}
                onChange={(e) => setNewDestination(e.target.value)}
                placeholder="Destination city"
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-[#14243A] mb-1">
                Travel Date *
              </label>
              <input
                type="date"
                required
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-[#14243A] mb-1">
                Vehicle Preference
              </label>
              <select
                value={newCarName}
                onChange={(e) => setNewCarName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
              >
                <option value="">Any Available</option>
                {cars.map((c) => (
                  <option key={c.id} value={c.name}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </form>
      </ResponsiveModal>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete inquiry record?"
        itemName={deleteTarget ? `${deleteTarget.customer_name} (${deleteTarget.destination})` : undefined}
        description="This inquiry will be permanently deleted from your records. This action cannot be undone."
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
