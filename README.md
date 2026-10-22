# Koober Travels / Koober Services — Premium Chauffeur-Driven Travel Agency & Admin Dashboard

A production-quality web application built for **Koober Travels** (Koober Services), designed as an executive demo for travel agency owners and clients. The application features a luxury customer-facing website with an automatic arrow-free vehicle showcase, transparent route pricing, real-time inquiry booking, and a complete authenticated Admin Dashboard.

---

## 🌟 Highlights & Features

### Customer-Facing Experience
- **Cinematic Hero Showcase**: Automatic, smooth vehicle transitions showcasing **Innova**, **Ertiga**, **Swift Dzire**, and **Urbania Traveller** on a lighted platform without navigation arrows.
- **Our Fleet**: Clean 4-column responsive grid displaying active vehicles and passenger capacities without carousels.
- **Fixed Price Routes**: Displays verified rates such as **Surat → Mumbai Airport** (Swift Dzire ₹7,000, Ertiga ₹8,000, Innova ₹13,000, Urbania "Get a Quote").
- **Popular Destinations**: Photographic showcase of Mumbai, Lonavala, Nashik, Statue of Unity, Somnath, and Diu with instant booking links.
- **Interactive Inquiries**: Validated form with Indian phone number format checking, passenger counts, and vehicle preselection.
- **Direct Channels**: Working `tel:` click-to-call and WhatsApp click-to-chat links with prefilled templates.

### Admin Dashboard (`/admin`)
- **Executive Login (`/admin/login`)**: Secure JWT Auth via Express backend (`admin@royalrides.com` / `admin@royalrides123`).
- **Dashboard Overview (`/admin`)**: Metric cards (Total Inquiries, Pending, Total Cars, Total Routes), Recharts inquiries-over-time trend, and recent inquiries list.
- **Inquiries Management (`/admin/inquiries`)**: Status workflow (`New` → `Contacted` → `Quotation Given` → `Confirmed` → `Completed` → `Cancelled`), phone/WhatsApp quick actions, agreed price recording, internal notes, and manual booking creation.
- **Realtime Sync**: Submissions on the public site appear immediately in the admin dashboard via BroadcastChannel without manual refresh.
- **Fleet Management (`/admin/cars`)**: Full CRUD operations with category, seating, active toggle, and hero featured switches.
- **Routes & Pricing (`/admin/routes`)**: Route pricing management in INR.
- **Destinations (`/admin/destinations`)**: Photo destination catalog management.
- **Reviews (`/admin/reviews`)**: Testimonial management with star ratings and demo tags.
- **Content CMS (`/admin/content`)**: Dynamic editing of hero headlines, subtitles, badges, and company story.
- **Settings (`/admin/settings`)**: Agency branding, phone numbers, WhatsApp lines, and SEO metadata.
- **Admin Profile (`/admin/profile`)**: Name and password updates.

---

## 🛠 Technology Stack

- **Frontend Framework**: React 19 + Vite
- **Backend Framework**: Node.js + Express 5
- **Language**: TypeScript (strict type checking)
- **Styling**: Tailwind CSS v4 & custom design tokens
- **Animations**: Framer Motion (Motion for React)
- **Icons**: Lucide React
- **Forms & Validation**: React Hook Form & Zod
- **Database**: MongoDB Atlas via Mongoose
- **Media & File Storage**: Cloudinary via multer & Cloudinary SDK
- **Authentication**: JWT & bcrypt
- **Charts**: Recharts
- **Notifications**: Sonner

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+ (Tested on Node.js v24.19)
- npm or pnpm

### 2. Installation
```bash
npm install
```

### 3. Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

Default configuration:
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
VITE_DEMO_MODE=false

DEMO_ADMIN_EMAIL=admin@royalrides.com
DEMO_ADMIN_PASSWORD=admin@royalrides123

MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/royalrides
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
JWT_SECRET=your_super_secret_jwt_key
```

### 4. Running the Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

- Customer Website: `http://localhost:3000`
- Admin Dashboard: `http://localhost:3000/admin` (Login: `admin@royalrides.com` / `admin@royalrides123`)

---

## 🗄 Database & Media Architecture (MongoDB Atlas & Cloudinary)

Koober Services uses **MongoDB Atlas** for document persistence and **Cloudinary** for image/media storage and CDN delivery.

### 1. MongoDB Atlas Setup
- Ensure your MongoDB Atlas cluster is created and your connection string is set in `.env`:
  ```env
  MONGODB_URI=mongodb+srv://<username>:<password>@cluster0.example.mongodb.net/royalrides
  ```
- The backend automatically connects via Mongoose and initializes collections (`users`, `cars`, `routes`, `destinations`, `reviews`, `inquiries`, `homepagesections`, `sitesettings`).

### 2. Cloudinary Setup
- Configure your Cloudinary cloud credentials in `.env`:
  ```env
  CLOUDINARY_CLOUD_NAME=your_cloud_name
  CLOUDINARY_API_KEY=your_api_key
  CLOUDINARY_API_SECRET=your_api_secret
  ```
- All admin image uploads (car photos, transparent cutouts, hero banners, destination showcases) are uploaded to Cloudinary through the Express backend `/api/upload` endpoint.

### 3. Backend Authentication
- Set `JWT_SECRET` in `.env` to sign and verify administrative session tokens.
- Default admin credentials: `admin@royalrides.com` / `admin@royalrides123`.

---

## 🧪 Testing Checklist

- [x] **Customer Navigation**: Smooth scrolling to `#fleet`, `#routes`, `#destinations`, `#about`, `#reviews`, `#inquiry`.
- [x] **Hero Car Showcase**: Automatically advances between Innova, Ertiga, Swift Dzire, and Urbania every 4.5 seconds without arrows.
- [x] **Fleet Listing**: 4-column responsive grid without carousel.
- [x] **Fixed Pricing**: Surat → Mumbai Airport verified rates displayed accurately.
- [x] **Inquiry Submission**: Validated via Zod; saves to store and confirms to user.
- [x] **Admin Authentication**: Route guarding redirects unauthenticated visitors to `/admin/login`.
- [x] **Live Inquiries**: Real-time cross-tab updates appear in the admin panel upon customer submission.
- [x] **Full CRUD Operations**: Tested on Cars, Routes, Destinations, Reviews, and Content.
- [x] **Responsive Layouts**: Tested on mobile (360px), tablet (768px), and desktop (1440px).
