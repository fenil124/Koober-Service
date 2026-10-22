import { useState, useEffect, useCallback, Suspense } from 'react';
import { Link } from 'react-router-dom';
import {
  Inbox,
  Clock,
  Car as CarIcon,
  MapPin,
  TrendingUp,
  ArrowRight,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { toast } from 'sonner';
import { DataStore } from '@/lib/data-store';
import { Inquiry, Car, Route, InquiryStatus } from '@/types';
import { InquiryStatusBadgeSelect } from '@/components/admin/InquiryStatusBadgeSelect';

// High-contrast custom Tooltip component adhering strictly to Section 4
function CustomChartTooltip({ active, payload, label }: any) {
  if (active && payload && payload.length) {
    const dataPoint = payload[0].payload;
    const value = payload[0].value;
    return (
      <div
        style={{
          backgroundColor: '#FFFFFF',
          borderColor: '#E2E8F0',
          color: '#14243A',
        }}
        className="px-4 py-3 rounded-xl border shadow-xl text-left select-none pointer-events-none z-50 min-w-[150px]"
      >
        <p className="text-[11px] font-bold text-[#64748B] uppercase tracking-wider mb-1.5">
          {dataPoint?.fullDateFormatted || label}
        </p>
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#0B2C50]" />
            <span className="text-xs font-semibold text-[#14243A]">Inquiries Created</span>
          </div>
          <span className="text-sm font-extrabold text-[#0B2C50]">{value}</span>
        </div>
      </div>
    );
  }
  return null;
}

function AdminDashboardOverview() {
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [cars, setCars] = useState<Car[]>([]);
  const [routes, setRoutes] = useState<Route[]>([]);
  const [dateRangeFilter, setDateRangeFilter] = useState<'7days' | '30days' | 'month' | 'all'>('30days');
  const [isLoading, setIsLoading] = useState(true);
  const [loadingStatusId, setLoadingStatusId] = useState<string | null>(null);

  // Client-computed chart and range states (computed inside useEffect to never trigger prerender Date warnings)
  const [chartData, setChartData] = useState<
    { date: string; fullDate: string; fullDateFormatted: string; inquiries: number }[]
  >([]);
  const [inRangeCount, setInRangeCount] = useState<number>(0);

  const loadData = useCallback(async () => {
    try {
      const [inqData, carsData, routesData] = await Promise.all([
        DataStore.getInquiries(),
        DataStore.getCars(),
        DataStore.getRoutes(),
      ]);
      setInquiries(inqData);
      setCars(carsData);
      setRoutes(routesData);
    } catch (err) {
      console.error('Error loading dashboard overview:', err);
    } finally {
      setIsLoading(false);
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

  // Defer all Date operations into useEffect so they never execute during pre-render / SSR
  useEffect(() => {
    const now = new Date();
    const end = new Date(now);
    end.setHours(23, 59, 59, 999);

    let start = new Date(now);
    if (dateRangeFilter === '7days') {
      start.setDate(now.getDate() - 6);
    } else if (dateRangeFilter === '30days') {
      start.setDate(now.getDate() - 29);
    } else if (dateRangeFilter === 'month') {
      start = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      if (inquiries.length > 0) {
        const earliest = inquiries.reduce((min, i) => {
          const d = new Date(i.created_at);
          return d < min ? d : min;
        }, new Date(now));
        start = new Date(earliest);
      } else {
        start.setDate(now.getDate() - 29);
      }
    }
    start.setHours(0, 0, 0, 0);

    // Compute inquiries in range
    const filteredInRange = inquiries.filter((i) => {
      if (!i.created_at) return false;
      const d = new Date(i.created_at);
      return d >= start && d <= end;
    });
    setInRangeCount(filteredInRange.length);

    // Build day map with zero-filled buckets for stable continuous timeline
    const dateMap = new Map<string, number>();
    const currentIter = new Date(start);

    while (currentIter <= end) {
      const key = currentIter.toISOString().split('T')[0];
      dateMap.set(key, 0);
      currentIter.setDate(currentIter.getDate() + 1);
    }

    // Populate counts from real inquiry records
    inquiries.forEach((inq) => {
      const inqDate = inq.created_at ? inq.created_at.split('T')[0] : '';
      if (dateMap.has(inqDate)) {
        dateMap.set(inqDate, (dateMap.get(inqDate) || 0) + 1);
      }
    });

    // Format for Recharts
    const result: { date: string; fullDate: string; fullDateFormatted: string; inquiries: number }[] = [];
    dateMap.forEach((count, dateStr) => {
      const d = new Date(dateStr + 'T12:00:00');
      const label = d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const fullFormatted = d.toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      });
      result.push({
        date: label,
        fullDate: dateStr,
        fullDateFormatted: fullFormatted,
        inquiries: count,
      });
    });

    setChartData(result);
  }, [inquiries, dateRangeFilter]);

  // Direct status update handler from the Recent Inquiries list
  const handleDirectStatusChange = async (inquiryId: string, newStatus: InquiryStatus) => {
    if (loadingStatusId) return;
    setLoadingStatusId(inquiryId);

    const prevInquiry = inquiries.find((i) => i.id === inquiryId);
    const prevStatus = prevInquiry?.status;

    try {
      const updated = await DataStore.updateInquiryStatus(inquiryId, newStatus);
      if (!updated) throw new Error('Inquiry not found');

      setInquiries((prev) =>
        prev.map((i) => (i.id === inquiryId ? { ...i, status: newStatus } : i))
      );
      toast.success(`Inquiry status updated to ${newStatus}`);
    } catch (err: any) {
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

  const totalInquiries = inquiries.length;
  const pendingInquiries = inquiries.filter(
    (i) => i.status === 'New' || i.status === 'Contacted' || i.status === 'Quotation Given'
  ).length;
  const totalCars = cars.filter((c) => c.is_active).length;
  const totalRoutes = routes.filter((r) => r.is_active).length;

  const recentInquiries = inquiries.slice(0, 5);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Page Title & Date Range Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2C50] tracking-tight">
            Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Real-time operations, fleet activity, and inquiries performance.
          </p>
        </div>

        {/* Date Filter Control */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          <div className="relative">
            <select
              value={dateRangeFilter}
              onChange={(e) => setDateRangeFilter(e.target.value as any)}
              className="appearance-none pl-8 pr-8 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs font-bold text-[#14243A] shadow-2xs hover:border-[#0B2C50] focus:outline-hidden cursor-pointer"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="month">This Month</option>
              <option value="all">All Time</option>
            </select>
            <Calendar className="w-3.5 h-3.5 text-[#0B2C50] absolute left-2.5 top-2.5 pointer-events-none" />
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2.5 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 4 Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
        {/* Card 1: Total Inquiries */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Total Inquiries
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0B2C50] flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0B2C50]">
              {totalInquiries}
            </span>
            <span className="ml-2 text-xs font-bold text-emerald-600">
              ({inRangeCount} in range)
            </span>
          </div>
        </div>

        {/* Card 2: Pending Inquiries */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Pending Inquiries
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0B2C50]">
              {pendingInquiries}
            </span>
            <span className="ml-2 text-xs font-medium text-amber-600">
              Needs attention
            </span>
          </div>
        </div>

        {/* Card 3: Total Cars */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Active Vehicles
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <CarIcon className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0B2C50]">
              {totalCars}
            </span>
            <span className="ml-2 text-xs font-medium text-emerald-600">
              Of {cars.length} total
            </span>
          </div>
        </div>

        {/* Card 4: Total Routes */}
        <div className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-2xs hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#64748B] uppercase tracking-wider">
              Active Routes
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <MapPin className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl sm:text-3xl font-extrabold text-[#0B2C50]">
              {totalRoutes}
            </span>
            <span className="ml-2 text-xs font-medium text-[#64748B]">
              Configured paths
            </span>
          </div>
        </div>
      </div>

      {/* Grid: Chart & Recent Inquiries */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Inquiries Overview Area Chart (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-4 sm:mb-6">
            <div>
              <h2 className="text-base font-bold text-[#0B2C50]">
                Inquiries Created
              </h2>
              <p className="text-xs text-[#64748B]">
                Chronological daily inquiries trend ({chartData.length} days plotted)
              </p>
            </div>
            <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Real DB Data</span>
            </div>
          </div>

          <div className="h-64 sm:h-72 w-full">
            {chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-xs text-[#64748B]">
                No inquiry data recorded for this time frame.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="inqGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0B2C50" stopOpacity={0.25} />
                      <stop offset="95%" stopColor="#0B2C50" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                  <XAxis
                    dataKey="date"
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    allowDecimals={false}
                    tick={{ fontSize: 11, fill: '#64748B' }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip
                    content={<CustomChartTooltip />}
                    wrapperStyle={{ outline: 'none', zIndex: 1000 }}
                    cursor={{ stroke: '#0B2C50', strokeWidth: 1.5, strokeDasharray: '3 3' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="inquiries"
                    stroke="#0B2C50"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#inqGrad)"
                    activeDot={{ r: 5, fill: '#0B2C50', stroke: '#FFFFFF', strokeWidth: 2 }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Right: Recent Inquiries List (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-[#E2E8F0] shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-base font-bold text-[#0B2C50]">
                  Recent Inquiries
                </h2>
                <p className="text-[11px] text-[#64748B]">
                  Manage incoming customer bookings and inquiries
                </p>
              </div>
              <Link
                to="/admin/inquiries"
                className="text-xs font-bold text-[#0B2C50] hover:text-[#F5B936] inline-flex items-center gap-1 transition-colors"
              >
                <span>View All</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="divide-y divide-[#F2F4F7]">
              {recentInquiries.length === 0 ? (
                <p className="py-6 text-center text-xs text-[#64748B]">
                  No recent inquiries recorded yet.
                </p>
              ) : (
                recentInquiries.map((inq) => (
                  <div key={inq.id} className="py-3 sm:py-3.5 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-9 h-9 rounded-full bg-slate-100 text-[#0B2C50] font-bold text-xs flex items-center justify-center shrink-0">
                        {inq.customer_name.charAt(0)}
                      </div>
                      <div className="min-w-0">
                        <span className="block text-xs font-bold text-[#14243A] truncate">
                          {inq.customer_name}
                        </span>
                        <span className="block text-[11px] text-[#64748B] truncate">
                          {inq.pickup_location} &rarr; {inq.destination}
                        </span>
                      </div>
                    </div>

                    <div className="shrink-0">
                      <InquiryStatusBadgeSelect
                        status={inq.status}
                        inquiryId={inq.id}
                        onStatusChange={(newStatus) => handleDirectStatusChange(inq.id, newStatus)}
                        isLoading={loadingStatusId === inq.id}
                        disabled={loadingStatusId !== null}
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="pt-4 border-t border-[#F2F4F7] mt-2">
            <Link
              to="/admin/inquiries"
              className="w-full py-2.5 rounded-xl bg-[#F5F8FC] hover:bg-slate-100 text-[#0B2C50] text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span>Manage All Inquiries ({inquiries.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-[350px]">
          <div className="w-8 h-8 border-3 border-[#0B2C50] border-t-[#F5B936] rounded-full animate-spin" />
        </div>
      }
    >
      <AdminDashboardOverview />
    </Suspense>
  );
}
