'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Link } from 'react-router-dom';
import Image from '@/components/common/Image';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Users,
  X,
  Upload,
  AlertCircle,
  Loader2,
  Power,
  Sparkles,
  ExternalLink,
  Check,
  Eye,
  Sliders,
  DollarSign,
  Image as ImageIcon,
  CheckSquare,
  Shield,
  Layers,
} from 'lucide-react';
import { toast } from 'sonner';
import { DataStore } from '@/lib/data-store';
import { Car } from '@/types';
import { DeleteConfirmDialog } from '@/components/common/DeleteConfirmDialog';
import { ImageManager } from '@/components/admin/ImageManager';
import { ResponsiveModal } from '@/components/common/ResponsiveModal';

const CANONICAL_HERO_SLOTS = [
  {
    id: 'c2222222-2222-2222-2222-222222222222',
    defaultName: 'Ertiga',
    defaultImage: '/images/cars/ertiga-transparent.png',
    label: 'Position 1 (Initial Active)',
  },
  {
    id: 'c1111111-1111-1111-1111-111111111111',
    defaultName: 'Innova',
    defaultImage: '/images/cars/innova-transparent.png',
    label: 'Position 2 (Supporting Right)',
  },
  {
    id: 'c3333333-3333-3333-3333-333333333333',
    defaultName: 'Swift Dzire',
    defaultImage: '/images/cars/swift-dzire-transparent.png',
    label: 'Position 3 (Supporting Left)',
  },
  {
    id: 'c4444444-4444-4444-4444-444444444444',
    defaultName: 'Urbania Traveller',
    defaultImage: '/images/cars/urbania-transparent.png',
    label: 'Position 4 (Far Supporting Right)',
  },
];

const STANDARD_AMENITIES = [
  'Captain Reclining Seats',
  'Dual Air Conditioning',
  'Fast USB Chargers',
  'Spacious Luggage Boot',
  'Professional Highway Chauffeur',
  'Automated Expressway Fastag',
  'Chilled Mineral Water',
  'Wi-Fi Onboard',
  'Reading Lamps',
  'Surround Audio System',
  'Plush Leatherette Interior',
  'First Aid Kit & Emergency Kit',
];

export default function AdminCarsPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Active' | 'Inactive'>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCar, setEditingCar] = useState<Car | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [loadingCarId, setLoadingCarId] = useState<string | null>(null);

  // Dedicated Hero Showcase Vehicle Edit Modal State
  const [isHeroModalOpen, setIsHeroModalOpen] = useState(false);
  const [editingHeroCar, setEditingHeroCar] = useState<Car | null>(null);
  const [heroFormName, setHeroFormName] = useState('');
  const [heroFormImageUrl, setHeroFormImageUrl] = useState('');
  const [heroFormPublicId, setHeroFormPublicId] = useState<string | null>(null);
  const [heroFormSyncFleet, setHeroFormSyncFleet] = useState(false);
  const [isSavingHero, setIsSavingHero] = useState(false);
  const [heroErrorMessage, setHeroErrorMessage] = useState<string | null>(null);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Car | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Modal active tab: 'basic' | 'specs' | 'pricing' | 'amenities' | 'image'
  const [modalTab, setModalTab] = useState<'basic' | 'specs' | 'pricing' | 'amenities' | 'image'>('basic');

  // Form Fields State
  // Basic info
  const [formName, setFormName] = useState('');
  const [formManufacturer, setFormManufacturer] = useState('');
  const [formModelName, setFormModelName] = useState('');
  const [formSlug, setFormSlug] = useState('');
  const [formType, setFormType] = useState('MPV');
  const [formCategoryBadge, setFormCategoryBadge] = useState('// MOST POPULAR');
  const [formTagline, setFormTagline] = useState('');
  const [formShortDesc, setFormShortDesc] = useState('');
  const [formFullDesc, setFormFullDesc] = useState('');
  const [formDisplayOrder, setFormDisplayOrder] = useState(1);
  const [formActive, setFormActive] = useState(true);
  const [formHeroFeatured, setFormHeroFeatured] = useState(false);

  // Specs
  const [formSeating, setFormSeating] = useState('7+1 Seating');
  const [formSeatsCount, setFormSeatsCount] = useState(7);
  const [formFuelType, setFormFuelType] = useState('DIESEL');
  const [formTransmission, setFormTransmission] = useState('AUTOMATIC / MANUAL');
  const [formEngine, setFormEngine] = useState('');
  const [formHorsepower, setFormHorsepower] = useState('');
  const [formTopSpeed, setFormTopSpeed] = useState('');
  const [formDriverOption, setFormDriverOption] = useState('Chauffeur Driven');
  const [formLuggageCapacity, setFormLuggageCapacity] = useState('3–4 Large Bags');

  // Pricing
  const [formOutstationRate, setFormOutstationRate] = useState<number>(18);
  const [formDailyPrice, setFormDailyPrice] = useState<number>(4500);
  const [formDailyPackageText, setFormDailyPackageText] = useState('8 Hours · 80 km included');
  const [formMinKmPerDay, setFormMinKmPerDay] = useState('Min. 250 km/day');
  const [formPackageHours, setFormPackageHours] = useState<number>(8);
  const [formPackageKm, setFormPackageKm] = useState<number>(80);
  const [formDriverAllowance, setFormDriverAllowance] = useState<number>(400);
  const [formExtraKmRate, setFormExtraKmRate] = useState<number>(18);
  const [formExtraHourRate, setFormExtraHourRate] = useState<number>(200);

  // Amenities & Highlights
  const [formAmenities, setFormAmenities] = useState<string[]>([]);
  const [formHighlightsText, setFormHighlightsText] = useState('');

  // Images
  const [formImageUrl, setFormImageUrl] = useState('/images/cars/innova-side.jpg');
  const [formHeroImageUrl, setFormHeroImageUrl] = useState('');
  const [formPublicId, setFormPublicId] = useState<string | null>(null);
  const [formGalleryUrls, setFormGalleryUrls] = useState<string[]>([]);
  const [newGalleryUrlInput, setNewGalleryUrlInput] = useState('');

  const loadCars = useCallback(async () => {
    const data = await DataStore.getCars();
    setCars(data);
  }, []);

  useEffect(() => {
    loadCars();
    const unsubscribe = DataStore.subscribe(() => {
      loadCars();
    });
    return () => unsubscribe();
  }, [loadCars]);

  const getHeroCar = (slot: typeof CANONICAL_HERO_SLOTS[0]): Car => {
    const found =
      cars.find((c) => c.id === slot.id) ||
      cars.find((c) => c.name.toLowerCase() === slot.defaultName.toLowerCase()) ||
      cars.find((c) => c.name.toLowerCase().includes(slot.defaultName.toLowerCase().split(' ')[0]));

    if (found) return found;

    return {
      id: slot.id,
      name: slot.defaultName,
      car_type:
        slot.defaultName === 'Urbania Traveller'
          ? 'Luxury Van'
          : slot.defaultName === 'Swift Dzire'
          ? 'Sedan'
          : 'MPV',
      seating_capacity:
        slot.defaultName === 'Urbania Traveller'
          ? '12+1 Seating'
          : slot.defaultName === 'Swift Dzire'
          ? '4+1 Seating'
          : slot.defaultName === 'Innova'
          ? '7+1 Seating'
          : '6+1 Seating',
      image_url: slot.defaultImage,
      hero_image_url: slot.defaultImage,
      is_active: true,
      is_hero_featured: true,
      display_order: 1,
    };
  };

  const handleOpenAdd = () => {
    setEditingCar(null);
    setFormName('');
    setFormManufacturer('TOYOTA');
    setFormModelName('');
    setFormSlug('');
    setFormType('MPV');
    setFormCategoryBadge('// MOST POPULAR');
    setFormTagline('');
    setFormShortDesc('');
    setFormFullDesc('');
    setFormDisplayOrder(cars.length + 1);
    setFormActive(true);
    setFormHeroFeatured(false);

    setFormSeating('7+1 Seating');
    setFormSeatsCount(7);
    setFormFuelType('DIESEL');
    setFormTransmission('AUTOMATIC / MANUAL');
    setFormEngine('2.4L GD Turbocharged Diesel');
    setFormHorsepower('150 HP @ 3400 RPM');
    setFormTopSpeed('180 km/h');
    setFormDriverOption('Chauffeur / Self-Drive');
    setFormLuggageCapacity('3–4 Large Bags');

    setFormOutstationRate(18);
    setFormDailyPrice(4500);
    setFormDailyPackageText('8 Hours · 80 km included');
    setFormMinKmPerDay('Min. 250 km/day');
    setFormPackageHours(8);
    setFormPackageKm(80);
    setFormDriverAllowance(400);
    setFormExtraKmRate(18);
    setFormExtraHourRate(200);

    setFormAmenities([
      'Captain Reclining Seats',
      'Dual Air Conditioning',
      'Fast USB Chargers',
      'Spacious Luggage Boot',
      'Professional Highway Chauffeur',
    ]);
    setFormHighlightsText(
      'Uniformed, commercial license verified highway chauffeur\nAutomated Expressway Fastag pass - Zero roadside stops\n100% Sanitized cabin · Chilled mineral water included'
    );

    setFormImageUrl('');
    setFormHeroImageUrl('');
    setFormPublicId(null);
    setFormGalleryUrls([]);
    setErrorMessage(null);
    setModalTab('basic');
    setIsModalOpen(true);
  };

  const handleOpenEdit = (car: Car) => {
    setEditingCar(car);
    setFormName(car.name);
    setFormManufacturer(car.manufacturer || (car.name.includes(' ') ? car.name.split(' ')[0].toUpperCase() : 'TOYOTA'));
    setFormModelName(car.model_name || car.name);
    setFormSlug(car.slug || car.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''));
    setFormType(car.car_type || 'MPV');
    setFormCategoryBadge(car.category_badge || `// ${car.car_type.toUpperCase()}`);
    setFormTagline(car.tagline || '');
    setFormShortDesc(car.short_description || '');
    setFormFullDesc(car.full_description || '');
    setFormDisplayOrder(car.display_order || 1);
    setFormActive(car.is_active ?? true);
    setFormHeroFeatured(car.is_hero_featured ?? false);

    setFormSeating(car.seating_capacity || '7+1 Seating');
    setFormSeatsCount(car.seats_count || 7);
    setFormFuelType(car.fuel_type || 'DIESEL');
    setFormTransmission(car.transmission || 'AUTOMATIC / MANUAL');
    setFormEngine(car.engine_powertrain || '');
    setFormHorsepower(car.horsepower || '');
    setFormTopSpeed(car.top_speed || '');
    setFormDriverOption(car.driver_option || 'Chauffeur Driven');
    setFormLuggageCapacity(car.luggage_capacity || '3–4 Large Bags');

    setFormOutstationRate(car.outstation_price_per_km || 18);
    setFormDailyPrice(car.daily_package_price || 4500);
    setFormDailyPackageText(car.daily_package_text || '8 Hours · 80 km included');
    setFormMinKmPerDay(typeof car.min_km_per_day === 'string' ? car.min_km_per_day : 'Min. 250 km/day');
    setFormPackageHours(car.package_duration_hours || 8);
    setFormPackageKm(car.package_included_km || 80);
    setFormDriverAllowance(car.driver_allowance || 400);
    setFormExtraKmRate(car.extra_km_rate || car.outstation_price_per_km || 18);
    setFormExtraHourRate(car.extra_hour_rate || 200);

    setFormAmenities(car.amenities && car.amenities.length > 0 ? car.amenities : [
      'Captain Reclining Seats',
      'Dual Air Conditioning',
      'Fast USB Chargers',
      'Spacious Luggage Boot',
      'Professional Highway Chauffeur',
    ]);
    setFormHighlightsText((car.highlights || [
      'Uniformed, commercial license verified highway chauffeur',
      'Automated Expressway Fastag pass - Zero roadside stops',
      '100% Sanitized cabin · Chilled mineral water included',
    ]).join('\n'));

    const validMainImg = car.image_url && !car.image_url.startsWith('/images/cars/') ? car.image_url : '';
    setFormImageUrl(validMainImg);
    setFormHeroImageUrl(car.hero_image_url && !car.hero_image_url.startsWith('/images/cars/') ? car.hero_image_url : '');
    setFormPublicId(car.cloudinary_public_id || null);

    const rawGallery = (
      car.gallery_images && car.gallery_images.length > 0
        ? car.gallery_images
        : (car as any).gallery && (car as any).gallery.length > 0
        ? (car as any).gallery
        : validMainImg ? [validMainImg] : []
    );
    const initialGallery = rawGallery.filter(
      (img: string) => typeof img === 'string' && img.trim() !== '' && !img.startsWith('/images/cars/')
    );
    setFormGalleryUrls(initialGallery);

    setErrorMessage(null);
    setModalTab('basic');
    setIsModalOpen(true);
  };

  // Hero modal handlers
  const handleOpenHeroEdit = (car: Car) => {
    setEditingHeroCar(car);
    setHeroFormName(car.name);
    setHeroFormImageUrl(car.hero_image_url || car.image_url);
    setHeroFormPublicId(car.cloudinary_public_id || null);
    setHeroFormSyncFleet(false);
    setHeroErrorMessage(null);
    setIsHeroModalOpen(true);
  };

  const handleSaveHero = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingHeroCar) return;

    if (!heroFormName.trim()) {
      setHeroErrorMessage('Car name is required');
      return;
    }

    if (!heroFormImageUrl.trim()) {
      setHeroErrorMessage('Please upload an image or provide an image URL');
      return;
    }

    setIsSavingHero(true);
    setHeroErrorMessage(null);

    try {
      const finalHeroImageUrl = heroFormImageUrl.trim();

      await DataStore.saveCar({
        ...editingHeroCar,
        name: heroFormName.trim(),
        hero_image_url: finalHeroImageUrl,
        cloudinary_public_id: heroFormPublicId || editingHeroCar.cloudinary_public_id || null,
        image_url: heroFormSyncFleet ? finalHeroImageUrl : editingHeroCar.image_url,
      });

      toast.success(`Hero vehicle "${heroFormName.trim()}" updated successfully!`);
      setIsHeroModalOpen(false);
      setEditingHeroCar(null);
      await loadCars();
    } catch (err: any) {
      console.error('Error saving hero vehicle:', err);
      const msg = err?.message || 'Failed to update hero vehicle.';
      setHeroErrorMessage(msg);
      toast.error(msg);
    } finally {
      setIsSavingHero(false);
    }
  };

  // Direct active/inactive status toggle without opening dialog
  const handleToggleCarActive = async (car: Car) => {
    if (loadingCarId) return;
    setLoadingCarId(car.id);
    const newActiveState = !car.is_active;
    try {
      await DataStore.saveCar({
        ...car,
        is_active: newActiveState,
      });
      setCars((prev) =>
        prev.map((c) => (c.id === car.id ? { ...c, is_active: newActiveState } : c))
      );
      toast.success(`${car.name} marked as ${newActiveState ? 'Published (Active)' : 'Unpublished (Draft)'}`);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update vehicle status');
    } finally {
      setLoadingCarId(null);
    }
  };

  const handleAddGalleryUrl = () => {
    if (!newGalleryUrlInput.trim()) return;
    setFormGalleryUrls((prev) => [...prev, newGalleryUrlInput.trim()]);
    setNewGalleryUrlInput('');
  };

  const handleRemoveGalleryImage = (index: number) => {
    setFormGalleryUrls((prev) => prev.filter((_, i) => i !== index));
  };

  const handleToggleAmenity = (amenity: string) => {
    setFormAmenities((prev) =>
      prev.includes(amenity) ? prev.filter((a) => a !== amenity) : [...prev, amenity]
    );
  };

  // Main vehicle form submission
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formName.trim()) {
      setErrorMessage('Vehicle name is required');
      setModalTab('basic');
      return;
    }

    if (!formImageUrl.trim()) {
      setErrorMessage('Please upload a vehicle image or provide an image URL');
      setModalTab('image');
      return;
    }

    setIsSaving(true);
    setErrorMessage(null);

    try {
      const finalImageUrl = formImageUrl.trim();

      const generatedSlug =
        formSlug.trim() ||
        formName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

      const highlightsArray = formHighlightsText
        .split('\n')
        .map((h) => h.trim())
        .filter(Boolean);

      const validGalleryUrls = formGalleryUrls.filter(
        (url) => typeof url === 'string' && url.trim() !== '' && !url.startsWith('/images/cars/')
      );
      const galleryList = Array.from(new Set([finalImageUrl, ...validGalleryUrls])).filter(
        (url) => url && !url.startsWith('/images/cars/')
      );

      const payload: Partial<Car> = {
        ...(editingCar ? { id: editingCar.id } : {}),
        name: formName.trim(),
        manufacturer: formManufacturer.trim().toUpperCase(),
        model_name: formModelName.trim() || formName.trim(),
        slug: generatedSlug,
        car_type: formType,
        category_badge: formCategoryBadge.trim(),
        tagline: formTagline.trim(),
        short_description: formShortDesc.trim(),
        full_description: formFullDesc.trim(),
        display_order: Number(formDisplayOrder) || 1,
        is_active: formActive,
        is_hero_featured: formHeroFeatured,

        seating_capacity: formSeating.trim(),
        seats_count: Number(formSeatsCount) || 7,
        fuel_type: formFuelType.trim().toUpperCase(),
        transmission: formTransmission.trim().toUpperCase(),
        engine_powertrain: formEngine.trim(),
        horsepower: formHorsepower.trim(),
        top_speed: formTopSpeed.trim(),
        driver_option: formDriverOption.trim(),
        luggage_capacity: formLuggageCapacity.trim(),

        outstation_price_per_km: Number(formOutstationRate) || 18,
        daily_package_price: Number(formDailyPrice) || 4500,
        daily_package_text: formDailyPackageText.trim(),
        min_km_per_day: formMinKmPerDay.trim(),
        package_duration_hours: Number(formPackageHours) || 8,
        package_included_km: Number(formPackageKm) || 80,
        driver_allowance: Number(formDriverAllowance) || 400,
        extra_km_rate: Number(formExtraKmRate) || 18,
        extra_hour_rate: Number(formExtraHourRate) || 200,

        amenities: formAmenities,
        highlights: highlightsArray,

        image_url: finalImageUrl,
        cloudinary_public_id: formPublicId || editingCar?.cloudinary_public_id || null,
        hero_image_url: formHeroImageUrl.trim() || finalImageUrl,
        gallery: galleryList,
        gallery_images: galleryList,
      };

      await DataStore.saveCar(payload);

      toast.success(
        editingCar
          ? `Vehicle "${formName}" updated successfully!`
          : `Vehicle "${formName}" added to fleet!`
      );
      setIsModalOpen(false);
      setEditingCar(null);
      await loadCars();
    } catch (err: any) {
      console.error('Error saving car:', err);
      const msg = err?.message || 'Failed to save vehicle details.';
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
      await DataStore.deleteCar(deleteTarget.id);
      toast.success(`${deleteTarget.name} removed from fleet`);
      setDeleteTarget(null);
      loadCars();
    } catch (err: any) {
      console.error('Delete error:', err);
      toast.error(err?.message || 'Failed to delete vehicle');
    } finally {
      setIsDeleting(false);
    }
  };

  const allCount = cars.length;
  const activeCount = cars.filter((c) => c.is_active).length;
  const inactiveCount = cars.filter((c) => !c.is_active).length;

  const filteredCars = cars.filter((c) => {
    if (statusFilter === 'Active' && !c.is_active) return false;
    if (statusFilter === 'Inactive' && c.is_active) return false;

    if (categoryFilter !== 'All') {
      const type = (c.car_type || '').toLowerCase();
      if (categoryFilter === 'MPV' && !type.includes('mpv')) return false;
      if (categoryFilter === 'Sedan' && !type.includes('sedan')) return false;
      if (categoryFilter === 'Luxury' && !type.includes('luxury')) return false;
      if (categoryFilter === 'SUV' && !type.includes('suv')) return false;
      if (categoryFilter === 'Tempo Traveller' && !type.includes('tempo') && !type.includes('van')) return false;
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        c.name.toLowerCase().includes(q) ||
        (c.model_name || '').toLowerCase().includes(q) ||
        (c.manufacturer || '').toLowerCase().includes(q) ||
        c.car_type.toLowerCase().includes(q) ||
        c.seating_capacity.toLowerCase().includes(q)
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
            Cars &amp; Fleet Management
          </h1>
          <p className="text-xs sm:text-sm text-[#64748B] mt-1">
            Manage your full fleet catalog, specifications, tariffs, gallery photos, and publication status.
          </p>
        </div>

        <button
          type="button"
          onClick={handleOpenAdd}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0B2C50] text-white text-xs font-bold hover:bg-[#071B30] transition-colors self-start sm:self-auto shadow-sm cursor-pointer active:scale-95"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Vehicle</span>
        </button>
      </div>

      {/* 1. Hero Animation Showcase Cars Section */}
      <div className="bg-gradient-to-br from-[#071A35] to-[#0A254A] rounded-2xl p-5 sm:p-6 text-white border border-[#1E3A5F] shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#F5B936]/20 border border-[#F5B936]/40 flex items-center justify-center text-[#F5B936]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
                  Hero Animation Showcase Vehicles
                </h2>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-[#F5B936] text-[#071A35]">
                  Homepage 2.5s Stage
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Manage the names and transparent cutout images displayed in the rotating hero animation on the homepage.
              </p>
            </div>
          </div>
        </div>

        {/* 4 Hero Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {CANONICAL_HERO_SLOTS.map((slot) => {
            const car = getHeroCar(slot);
            const currentImg = car.hero_image_url || car.image_url || slot.defaultImage;

            return (
              <div
                key={slot.id}
                className="bg-[#051428]/85 rounded-xl p-4 border border-white/10 hover:border-[#F5B936]/50 transition-all flex flex-col justify-between group shadow-sm"
              >
                <div>
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="text-[#F5B936] font-bold">{slot.label}</span>
                    <span className="text-slate-400 font-medium">{car.car_type}</span>
                  </div>

                  <div className="relative w-full h-32 rounded-lg bg-[#071A35] border border-white/10 overflow-hidden flex items-center justify-center p-2 mb-3">
                    <div className="absolute bottom-1 w-3/4 h-6 rounded-[100%] border border-[#F5B936]/30 pointer-events-none" />
                    <Image
                      src={currentImg}
                      alt={car.name}
                      fill
                      unoptimized={Boolean(currentImg?.startsWith('data:'))}
                      className="object-contain p-1"
                      sizes="(max-width: 640px) 100vw, 25vw"
                    />
                  </div>

                  <h3 className="text-sm font-bold text-white truncate mb-1">
                    {car.name}
                  </h3>
                  <span className="text-[11px] text-slate-400 block truncate mb-3">
                    {car.seating_capacity}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleOpenHeroEdit(car)}
                  className="w-full inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-lg bg-[#F5B936] hover:bg-[#E5A928] text-[#071A35] text-xs font-bold transition-colors cursor-pointer shadow-sm active:scale-95"
                >
                  <Edit className="w-3.5 h-3.5 stroke-[2.5]" />
                  <span>Edit Hero Stage</span>
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Filter Tabs & Search Bar for Fleet */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pt-2">
        <div className="flex flex-wrap items-center gap-2">
          {/* Status Tabs */}
          <div className="flex items-center gap-1 p-1 bg-white border border-[#E2E8F0] rounded-xl shadow-2xs">
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
              Published ({activeCount})
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
              Draft ({inactiveCount})
            </button>
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs font-bold text-[#14243A] shadow-2xs cursor-pointer focus:outline-hidden"
          >
            <option value="All">All Categories</option>
            <option value="MPV">MPV</option>
            <option value="Sedan">Sedan</option>
            <option value="Luxury">Luxury</option>
            <option value="SUV">SUV</option>
            <option value="Tempo Traveller">Tempo Traveller</option>
          </select>
        </div>

        <div className="relative max-w-sm w-full">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by model, brand, type..."
            className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50] shadow-2xs"
          />
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
        </div>
      </div>

      {/* Responsive Grid of Fleet Vehicles matching Admin Requirements */}
      {filteredCars.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-[#E2E8F0] text-xs text-[#64748B]">
          No fleet vehicles found matching your criteria.
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredCars.map((car) => {
            const outstationRate = car.outstation_price_per_km || 18;
            const dailyRate = car.daily_package_price ? `₹${car.daily_package_price.toLocaleString()}/day` : '₹4,500/day';
            const mfg = car.manufacturer || (car.name.includes(' ') ? car.name.split(' ')[0].toUpperCase() : 'KOOBER SERVICES');
            const model = car.model_name || car.name;

            return (
              <div
                key={car.id}
                className="bg-white rounded-2xl p-5 border border-[#E2E8F0] shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar: Order & Category Badge */}
                  <div className="flex items-center justify-between text-[11px] mb-2">
                    <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 font-bold uppercase">
                      {car.car_type}
                    </span>
                    <span className="text-[10px] text-slate-400 font-bold">
                      Order: #{car.display_order || 1}
                    </span>
                  </div>

                  {/* Image Preview Container */}
                  <div className="relative w-full h-40 bg-slate-50/80 rounded-xl mb-3 overflow-hidden flex items-center justify-center p-3 border border-slate-100">
                    <Image
                      src={car.image_url || '/images/cars/innova-side.jpg'}
                      alt={car.name}
                      fill
                      unoptimized={Boolean(
                        (car.image_url || '')?.startsWith('data:')
                      )}
                      className="object-contain p-2"
                      sizes="(max-width: 640px) 100vw, 300px"
                    />
                  </div>

                  {/* Manufacturer & Title */}
                  <div className="mb-2">
                    <div className="text-[9px] font-extrabold uppercase tracking-wider text-slate-400">
                      {mfg}
                    </div>
                    <h3 className="text-base font-extrabold text-[#14243A] truncate">
                      {model}
                    </h3>
                  </div>

                  {/* Seating & Tariffs */}
                  <div className="space-y-1.5 text-xs text-[#64748B] mb-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Seating:</span>
                      <span className="font-bold text-[#081A33]">{car.seating_capacity}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Outstation:</span>
                      <span className="font-bold text-[#081A33]">₹{outstationRate}/km</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Daily Package:</span>
                      <span className="font-bold text-[#081A33]">{dailyRate}</span>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="flex items-center gap-2 mb-4">
                    <button
                      type="button"
                      onClick={() => handleToggleCarActive(car)}
                      disabled={loadingCarId === car.id}
                      title="Click to toggle publication status"
                      className={`inline-flex items-center gap-1.5 text-[10px] font-bold px-2.5 py-0.5 rounded-full border transition-all cursor-pointer shadow-2xs hover:opacity-85 active:scale-95 ${
                        car.is_active
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      {loadingCarId === car.id ? (
                        <Loader2 className="w-3 h-3 animate-spin" />
                      ) : (
                        <Power className="w-2.5 h-2.5" />
                      )}
                      <span>{car.is_active ? 'Published' : 'Draft'}</span>
                    </button>

                    {car.is_hero_featured && (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
                        Hero Featured
                      </span>
                    )}
                  </div>
                </div>

                {/* Actions: Preview, Edit & Delete buttons */}
                <div className="flex items-center gap-2 pt-3 border-t border-slate-100">
                  {/* Public Preview Button */}
                  <Link
                    to={`/fleet/${car.slug || car.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl border border-slate-200 text-slate-600 hover:text-[#081A33] hover:bg-slate-50 transition-colors"
                    title={`Live preview of ${car.name} on website`}
                  >
                    <Eye className="w-4 h-4" />
                  </Link>

                  <button
                    type="button"
                    onClick={() => handleOpenEdit(car)}
                    className="flex-1 inline-flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl border border-[#E2E8F0] text-xs font-semibold text-[#14243A] hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                    <span>Edit Vehicle</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setDeleteTarget(car)}
                    className="inline-flex items-center justify-center p-2 rounded-xl border border-red-200 text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                    title={`Delete ${car.name}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Dedicated Hero Showcase Vehicle Edit Responsive Modal */}
      <ResponsiveModal
        isOpen={Boolean(isHeroModalOpen && editingHeroCar)}
        onClose={() => !isSavingHero && setIsHeroModalOpen(false)}
        title={
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-[#F5B936]/20 flex items-center justify-center text-[#D99A1C] shrink-0">
              <Sparkles className="w-4 h-4 stroke-[2.5]" />
            </div>
            <span className="truncate">Edit Hero Vehicle: {editingHeroCar?.name}</span>
          </div>
        }
        description="Homepage 2.5s rotating hero animation stage showcase"
        maxWidth="lg"
        isSubmitting={isSavingHero}
        footer={
          <div className="flex items-center justify-end gap-3 w-full">
            <button
              type="button"
              disabled={isSavingHero}
              onClick={() => setIsHeroModalOpen(false)}
              className="px-4 py-2 rounded-xl border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              form="hero-vehicle-form"
              disabled={isSavingHero}
              className="inline-flex items-center justify-center gap-2 px-5 py-2 rounded-xl bg-[#0B2C50] text-white text-xs font-bold hover:bg-[#071B30] transition-colors cursor-pointer shadow-md disabled:opacity-50"
            >
              {isSavingHero && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSavingHero ? 'Saving...' : 'Save Hero Vehicle'}</span>
            </button>
          </div>
        }
      >
        {heroErrorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{heroErrorMessage}</span>
          </div>
        )}

        <form id="hero-vehicle-form" onSubmit={handleSaveHero} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-[#14243A] mb-1">
              Hero Display Name *
            </label>
            <input
              type="text"
              required
              value={heroFormName}
              onChange={(e) => setHeroFormName(e.target.value)}
              placeholder="e.g. Swift Dzire, Innova, Ertiga"
              className="w-full px-3 py-2 rounded-xl border border-[#CBD5E1] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
            />
          </div>

          <ImageManager
            label="Hero Cutout Image (Transparent Background)"
            description="Transparent PNG cutout without background, displayed floating in the homepage top hero section."
            value={heroFormImageUrl}
            onChange={(newUrl: string, publicId?: string) => {
              setHeroFormImageUrl(newUrl);
              if (publicId) setHeroFormPublicId(publicId);
            }}
            folder="cars"
            aspectRatio="wide"
            recommendedSize="Recommended: 1200 × 600 px (Transparent PNG with shadows)"
            required
          />

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-[#14243A]">
                Hero Stage Live Preview
              </label>
              <span className="text-[10px] text-slate-400 font-medium">
                Dark stage simulation
              </span>
            </div>
            <div className="relative w-full h-44 rounded-xl overflow-hidden bg-[#071A35] border border-slate-700 flex items-center justify-center p-3">
              <div className="absolute bottom-2 w-4/5 h-8 rounded-[100%] border border-[#F5B936]/40 shadow-[0_0_15px_#F5B936] pointer-events-none" />

              {heroFormImageUrl ? (
                <Image
                  src={heroFormImageUrl}
                  alt="Hero vehicle preview"
                  fill
                  className="object-contain p-2 z-10"
                  sizes="(max-width: 640px) 100vw, 400px"
                />
              ) : (
                <span className="text-xs text-slate-400">No image selected</span>
              )}
            </div>
          </div>

          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200/70 flex items-center justify-between">
            <div>
              <span className="text-xs font-bold text-[#14243A] block">
                Also apply to Fleet card image
              </span>
              <span className="text-[11px] text-[#64748B]">
                Keep unchecked to manage hero image independently
              </span>
            </div>
            <input
              type="checkbox"
              checked={heroFormSyncFleet}
              onChange={(e) => setHeroFormSyncFleet(e.target.checked)}
              className="w-4 h-4 text-[#0B2C50] rounded cursor-pointer"
            />
          </div>
        </form>
      </ResponsiveModal>

      {/* Complete Vehicle Add / Edit Responsive Modal */}
      <ResponsiveModal
        isOpen={isModalOpen}
        onClose={() => !isSaving && setIsModalOpen(false)}
        title={editingCar ? `Edit: ${editingCar.name}` : 'Add New Vehicle to Fleet'}
        description="Configure complete vehicle details, rates, specifications, and gallery photos"
        maxWidth="3xl"
        isSubmitting={isSaving}
        headerExtras={
          editingCar && (
            <Link
              to={`/fleet/${editingCar.slug || editingCar.id}`}
              target="_blank"
              className="inline-flex items-center gap-1 text-xs font-bold text-[#0B2C50] hover:text-[#F5B936] underline shrink-0 mr-2"
            >
              <span className="hidden sm:inline">View Public Page</span>
              <span className="sm:hidden">View</span>
              <ExternalLink className="w-3 h-3" />
            </Link>
          )
        }
        footer={
          <div className="flex items-center justify-between w-full">
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
              form="vehicle-form"
              disabled={isSaving}
              className="inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-[#0B2C50] text-white text-xs font-bold hover:bg-[#071B30] transition-colors cursor-pointer shadow-md disabled:opacity-50"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{isSaving ? 'Saving Vehicle...' : 'Save All Vehicle Details'}</span>
            </button>
          </div>
        }
      >
        {/* Modal Tabs Bar - Sticky at top of scrollable area */}
        <div className="sticky -top-4 sm:-top-5 -mt-4 sm:-mt-5 pt-3 pb-2.5 bg-white/95 backdrop-blur-xs z-20 border-b border-slate-100 flex items-center gap-1.5 sm:gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setModalTab('basic')}
            className={`pb-2 px-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              modalTab === 'basic'
                ? 'border-[#0B2C50] text-[#0B2C50]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            1. Basic Info
          </button>
          <button
            type="button"
            onClick={() => setModalTab('specs')}
            className={`pb-2 px-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              modalTab === 'specs'
                ? 'border-[#0B2C50] text-[#0B2C50]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            2. Specs
          </button>
          <button
            type="button"
            onClick={() => setModalTab('pricing')}
            className={`pb-2 px-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              modalTab === 'pricing'
                ? 'border-[#0B2C50] text-[#0B2C50]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            3. Pricing
          </button>
          <button
            type="button"
            onClick={() => setModalTab('amenities')}
            className={`pb-2 px-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              modalTab === 'amenities'
                ? 'border-[#0B2C50] text-[#0B2C50]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            4. Amenities
          </button>
          <button
            type="button"
            onClick={() => setModalTab('image')}
            className={`pb-2 px-2 text-xs font-bold border-b-2 transition-all cursor-pointer whitespace-nowrap ${
              modalTab === 'image'
                ? 'border-[#0B2C50] text-[#0B2C50]'
                : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            5. Photos &amp; Gallery
          </button>
        </div>

        {errorMessage && (
          <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        <form id="vehicle-form" onSubmit={handleSave} className="py-3 space-y-4">
              {/* TAB 1: BASIC INFORMATION */}
              {modalTab === 'basic' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#14243A] mb-1">
                        Vehicle Name (Short) *
                      </label>
                      <input
                        type="text"
                        required
                        value={formName}
                        onChange={(e) => setFormName(e.target.value)}
                        placeholder="e.g. Innova, Urbania"
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#14243A] mb-1">
                        Full Model Name
                      </label>
                      <input
                        type="text"
                        value={formModelName}
                        onChange={(e) => setFormModelName(e.target.value)}
                        placeholder="e.g. Toyota Innova Crysta"
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#14243A] mb-1">
                        Manufacturer
                      </label>
                      <input
                        type="text"
                        value={formManufacturer}
                        onChange={(e) => setFormManufacturer(e.target.value)}
                        placeholder="e.g. TOYOTA, FORCE ATELIER"
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#14243A] mb-1">
                        Category Type
                      </label>
                      <select
                        value={formType}
                        onChange={(e) => setFormType(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
                      >
                        <option value="MPV">MPV</option>
                        <option value="Sedan">Sedan</option>
                        <option value="SUV">SUV</option>
                        <option value="Tempo Traveller">Tempo Traveller</option>
                        <option value="Luxury Van">Luxury Van</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#14243A] mb-1">
                        URL Slug
                      </label>
                      <input
                        type="text"
                        value={formSlug}
                        onChange={(e) => setFormSlug(e.target.value)}
                        placeholder="e.g. innova, ertiga, urbania"
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#14243A] mb-1">
                        Category Badge (Card Top)
                      </label>
                      <input
                        type="text"
                        value={formCategoryBadge}
                        onChange={(e) => setFormCategoryBadge(e.target.value)}
                        placeholder="e.g. // MOST POPULAR, // FAMILY FAVORITE"
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#14243A] mb-1">
                        Display Order #
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formDisplayOrder}
                        onChange={(e) => setFormDisplayOrder(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#14243A] mb-1">
                      Promotional Tagline / Route Highlight
                    </label>
                    <input
                      type="text"
                      value={formTagline}
                      onChange={(e) => setFormTagline(e.target.value)}
                      placeholder="e.g. Ideal for Surat - Mumbai & Udaipur road trips"
                      className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#14243A] mb-1">
                      Full Description
                    </label>
                    <textarea
                      rows={3}
                      value={formFullDesc}
                      onChange={(e) => setFormFullDesc(e.target.value)}
                      placeholder="Detailed overview for the vehicle details page..."
                      className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
                    />
                  </div>

                  {/* Checkboxes: Publication & Hero Inclusion */}
                  <div className="space-y-3 pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                      <div>
                        <span className="text-xs font-bold text-[#14243A] block">
                          Published Status (Active on Website)
                        </span>
                        <span className="text-[11px] text-[#64748B]">
                          Checked = Visible in public fleet &amp; details page. Unchecked = Draft.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={formActive}
                        onChange={(e) => setFormActive(e.target.checked)}
                        className="w-5 h-5 text-[#0B2C50] rounded cursor-pointer"
                      />
                    </div>

                    <div className="flex items-center justify-between p-3 bg-slate-50 rounded-xl border border-slate-200/70">
                      <div>
                        <span className="text-xs font-bold text-[#14243A] block">
                          Hero Showcase Featured
                        </span>
                        <span className="text-[11px] text-[#64748B]">
                          Include vehicle cutout in the homepage top hero carousel.
                        </span>
                      </div>
                      <input
                        type="checkbox"
                        checked={formHeroFeatured}
                        onChange={(e) => setFormHeroFeatured(e.target.checked)}
                        className="w-5 h-5 text-[#0B2C50] rounded cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: TECHNICAL SPECIFICATIONS */}
              {modalTab === 'specs' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#14243A] mb-1">
                        Seating Capacity Label *
                      </label>
                      <input
                        type="text"
                        required
                        value={formSeating}
                        onChange={(e) => setFormSeating(e.target.value)}
                        placeholder="e.g. 7+1 Seating, 16 Captain Seats"
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#14243A] mb-1">
                        Passenger Seats Count (Number)
                      </label>
                      <input
                        type="number"
                        min="1"
                        max="50"
                        value={formSeatsCount}
                        onChange={(e) => setFormSeatsCount(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#14243A] mb-1">
                        Fuel Type
                      </label>
                      <input
                        type="text"
                        value={formFuelType}
                        onChange={(e) => setFormFuelType(e.target.value)}
                        placeholder="e.g. DIESEL, PETROL / CNG, PETROL"
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#14243A] mb-1">
                        Transmission
                      </label>
                      <input
                        type="text"
                        value={formTransmission}
                        onChange={(e) => setFormTransmission(e.target.value)}
                        placeholder="e.g. AUTOMATIC / MANUAL, AUTOMATIC"
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#14243A] mb-1">
                        Engine &amp; Powertrain
                      </label>
                      <input
                        type="text"
                        value={formEngine}
                        onChange={(e) => setFormEngine(e.target.value)}
                        placeholder="e.g. 2.4L GD Turbocharged Diesel"
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#14243A] mb-1">
                        Horsepower Rating
                      </label>
                      <input
                        type="text"
                        value={formHorsepower}
                        onChange={(e) => setFormHorsepower(e.target.value)}
                        placeholder="e.g. High Output, 150 HP"
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#14243A] mb-1">
                        Maximum Speed
                      </label>
                      <input
                        type="text"
                        value={formTopSpeed}
                        onChange={(e) => setFormTopSpeed(e.target.value)}
                        placeholder="e.g. 240 km/h, 180 km/h"
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#14243A] mb-1">
                        Driver Option
                      </label>
                      <input
                        type="text"
                        value={formDriverOption}
                        onChange={(e) => setFormDriverOption(e.target.value)}
                        placeholder="e.g. Chauffeur / Self-Drive"
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#14243A] mb-1">
                        Luggage Capacity
                      </label>
                      <input
                        type="text"
                        value={formLuggageCapacity}
                        onChange={(e) => setFormLuggageCapacity(e.target.value)}
                        placeholder="e.g. 3–5 Large Trolleys"
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 3: TARIFFS & PRICING */}
              {modalTab === 'pricing' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#14243A] mb-1">
                        Outstation Price (₹ / km) *
                      </label>
                      <input
                        type="number"
                        min="1"
                        required
                        value={formOutstationRate}
                        onChange={(e) => setFormOutstationRate(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#14243A] mb-1">
                        City Daily Package (₹ / day) *
                      </label>
                      <input
                        type="number"
                        min="100"
                        required
                        value={formDailyPrice}
                        onChange={(e) => setFormDailyPrice(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#14243A] mb-1">
                        Minimum Distance Condition
                      </label>
                      <input
                        type="text"
                        value={formMinKmPerDay}
                        onChange={(e) => setFormMinKmPerDay(e.target.value)}
                        placeholder="e.g. Min. 250-300 km/day"
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#14243A] mb-1">
                        Daily Package Inclusions Text
                      </label>
                      <input
                        type="text"
                        value={formDailyPackageText}
                        onChange={(e) => setFormDailyPackageText(e.target.value)}
                        placeholder="e.g. 8 Hours · 80 km included"
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-bold text-[#14243A] mb-1">
                        Driver Allowance (₹/day)
                      </label>
                      <input
                        type="number"
                        value={formDriverAllowance}
                        onChange={(e) => setFormDriverAllowance(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#14243A] mb-1">
                        Extra KM Charge (₹)
                      </label>
                      <input
                        type="number"
                        value={formExtraKmRate}
                        onChange={(e) => setFormExtraKmRate(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-[#14243A] mb-1">
                        Extra Hour Charge (₹)
                      </label>
                      <input
                        type="number"
                        value={formExtraHourRate}
                        onChange={(e) => setFormExtraHourRate(Number(e.target.value))}
                        className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: AMENITIES & HIGHLIGHTS */}
              {modalTab === 'amenities' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#14243A] mb-2">
                      Configured Amenities (Check all that apply)
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto p-3 bg-slate-50 rounded-xl border border-slate-200">
                      {STANDARD_AMENITIES.map((amenity) => {
                        const isChecked = formAmenities.includes(amenity);
                        return (
                          <label
                            key={amenity}
                            className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors text-xs font-semibold ${
                              isChecked ? 'bg-emerald-50 text-emerald-800' : 'hover:bg-slate-100 text-slate-700'
                            }`}
                          >
                            <input
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => handleToggleAmenity(amenity)}
                              className="w-4 h-4 text-[#0B2C50] rounded cursor-pointer"
                            />
                            <span>{amenity}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#14243A] mb-1">
                      Key Service Highlights (One per line)
                    </label>
                    <textarea
                      rows={3}
                      value={formHighlightsText}
                      onChange={(e) => setFormHighlightsText(e.target.value)}
                      placeholder="Uniformed highway chauffeur&#10;Automated Fastag pass&#10;Sanitized cabin"
                      className="w-full px-3 py-2 rounded-xl border border-[#E2E8F0] text-xs text-[#14243A] focus:outline-hidden focus:border-[#0B2C50]"
                    />
                  </div>
                </div>
              )}

              {/* TAB 5: PHOTOS & GALLERY */}
              {modalTab === 'image' && (
                <div className="space-y-6">
                  {/* Primary Vehicle Image */}
                  <ImageManager
                    label="Primary Vehicle Image (Side profile recommended)"
                    description="Main vehicle card and fleet carousel side-profile photo."
                    value={formImageUrl}
                    onChange={(newUrl: string, publicId?: string) => {
                      setFormImageUrl(newUrl);
                      if (publicId) setFormPublicId(publicId);
                    }}
                    folder="cars"
                    aspectRatio="wide"
                    recommendedSize="Recommended: 1200 × 750 px (High contrast on light background)"
                    required
                  />

                  {/* Hero Showcase Cutout */}
                  <div className="pt-4 border-t border-slate-100">
                    <ImageManager
                      label="Hero Showcase Cutout (Transparent Background)"
                      description="Isolated PNG cutout without background, displayed floating in the homepage top hero section."
                      value={formHeroImageUrl}
                      onChange={(newUrl: string, publicId?: string) => {
                        setFormHeroImageUrl(newUrl);
                        if (publicId && !formPublicId) setFormPublicId(publicId);
                      }}
                      folder="cars"
                      aspectRatio="wide"
                      recommendedSize="Recommended: 1200 × 600 px (Transparent PNG with shadows)"
                    />
                  </div>

                  {/* Vehicle Detail Page Photo Gallery */}
                  <div className="pt-4 border-t border-slate-100 space-y-3">
                    <div>
                      <label className="block text-xs font-bold text-[#14243A]">
                        Vehicle Detail Page Photo Gallery ({formGalleryUrls.length} photos)
                      </label>
                      <p className="text-[11px] text-[#64748B]">
                        Interior, boot space, dashboard, and seating arrangement photos displayed in the vehicle details gallery.
                      </p>
                    </div>

                    {/* Add Gallery Photo using ImageManager */}
                    <div className="p-3 bg-slate-50 rounded-2xl border border-slate-200">
                      <span className="text-xs font-bold text-[#0B2C50] block mb-2">
                        + Add Photo to Gallery
                      </span>
                      <ImageManager
                        label="New Gallery Photo"
                        value={newGalleryUrlInput}
                        onChange={(newUrl: string) => {
                          const clean = typeof newUrl === 'string' ? newUrl.trim() : '';
                          if (clean && !clean.startsWith('/images/cars/')) {
                            setFormGalleryUrls((prev) => (prev.includes(clean) ? prev : [...prev, clean]));
                            setNewGalleryUrlInput('');
                            toast.success('Photo added to vehicle gallery!');
                          }
                        }}
                        folder="cars"
                        aspectRatio="video"
                        recommendedSize="Recommended: 1200 × 800 px"
                      />
                    </div>

                    {/* Gallery Thumbnails List */}
                    {formGalleryUrls.length > 0 && (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        {formGalleryUrls.map((url, i) => (
                          <div
                            key={i}
                            className="relative aspect-video rounded-xl overflow-hidden border border-slate-200 bg-slate-100 group shadow-2xs"
                          >
                            <Image src={url} alt="" fill className="object-cover" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleRemoveGalleryImage(i)}
                                title="Remove photo"
                                className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <span className="absolute bottom-1 left-1.5 px-1.5 py-0.5 rounded text-[9px] font-bold bg-black/60 text-white">
                              #{i + 1}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

        </form>
      </ResponsiveModal>

      {/* Delete Confirmation Dialog */}
      <DeleteConfirmDialog
        open={Boolean(deleteTarget)}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete this vehicle from fleet?"
        itemName={deleteTarget ? deleteTarget.name : undefined}
        description="This vehicle will be permanently removed from your active fleet and booking options. Booking history records will be preserved."
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />
    </div>
  );
}
