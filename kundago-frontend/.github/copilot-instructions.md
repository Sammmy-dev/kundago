# Product Requirements Document (PRD)
## FAR — Flavour Airhis Resources
### HR & Staffing Management Platform

---

**Version:** 1.0.0
**Date:** April 2026
**Status:** In Development
**Author:** FAR Internal

---

## Table of Contents

1. [Overview](#1-overview)
2. [Goals & Objectives](#2-goals--objectives)
3. [User Roles](#3-user-roles)
4. [System Architecture](#4-system-architecture)
5. [Feature Specifications](#5-feature-specifications)
   - 5.1 Public Landing Page
   - 5.2 Job Portal (Public)
   - 5.3 Admin Authentication
   - 5.4 Admin Dashboard
   - 5.5 Job Management
   - 5.6 Client Management
   - 5.7 Employee Management
6. [Data Models](#6-data-models)
7. [API Specification](#7-api-specification)
8. [Access Control Matrix](#8-access-control-matrix)
9. [Non-Functional Requirements](#9-non-functional-requirements)
10. [Tech Stack](#10-tech-stack)
11. [Project Structure](#11-project-structure)
12. [MVP Scope & Build Order](#12-mvp-scope--build-order)
13. [Future Enhancements](#13-future-enhancements)

---

## 1. Overview

**FAR (Flavour Airhis Resources)** is a Nigerian HR and staffing agency that recruits talent on behalf of client companies, then deploys those employees to work at client sites. This platform serves two distinct audiences:

- **Job Seekers (Public):** Browse available job openings posted by FAR and apply via contact details provided in each listing.
- **FAR Staff (Admin):** Manage the agency's full operational data — job postings, client companies, and deployed employees — through a secure internal dashboard.

The platform is a **Next.js 14 fullstack web application** with a public-facing site and a protected admin area, backed by **MongoDB** and served with **Cloudinary** for media storage.

---

## 2. Goals & Objectives

| # | Goal | Success Metric |
|---|------|---------------|
| 1 | Provide job seekers a clean, browsable portal of active positions | All visible jobs accessible without login |
| 2 | Allow FAR admins to manage job postings with full CRUD | Create, edit, toggle, delete jobs in < 3 clicks |
| 3 | Maintain a complete record of all client companies | Clients list with contact info always up to date |
| 4 | Track every deployed employee with their assignment and financials | Employee profiles editable by authorized staff |
| 5 | Protect sensitive financial data (salary, bank details) | Only SUPER_ADMIN role can view/edit financial fields |
| 6 | Present a professional public brand presence | Modern landing page with key sections |

---

## 3. User Roles

### 3.1 Visitor (Public / Job Seeker)
- No account required
- Can view the landing page, browse visible job listings, and view individual job detail pages
- Cannot access any admin area or data
- Applies for jobs via external channels (email, link) listed in the job description

### 3.2 STAFF (Admin — Standard)
- Authenticated FAR employee
- Full access to job, client, and employee management
- Cannot view or edit financial fields on employee records (salary, FAR fee, bank details)

### 3.3 SUPER_ADMIN (Admin — Elevated)
- All STAFF permissions
- Can view and edit employee financial fields: salary, FAR fee, bank name, account number, account name
- Typically the HR director or finance lead

---

## 4. System Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    Next.js 14 App                        │
│                                                         │
│  ┌──────────────────────┐  ┌──────────────────────────┐ │
│  │   Public Routes      │  │   Admin Routes (Auth)    │ │
│  │  /home               │  │  /dashboard              │ │
│  │  /jobs               │  │  /jobs                   │ │
│  │  /jobs/[id]          │  │  /clients                │ │
│  │                      │  │  /employees              │ │
│  └──────────────────────┘  └──────────────────────────┘ │
│                                                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │              API Routes (/api/*)                 │   │
│  │  /api/auth  /api/jobs  /api/clients  /api/employees│  │
│  │  /api/upload                                     │   │
│  └──────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
         │                          │
         ▼                          ▼
   MongoDB Atlas               Cloudinary
   (Data Storage)           (Media Storage)
```

**Route Groups:**
- `(public)` — No auth required. Navbar + Footer layout.
- `(admin)` — Auth required. Sidebar + Header layout. Redirects to `/login` if unauthenticated.

---

## 5. Feature Specifications

---

### 5.1 Public Landing Page

**Route:** `/home`

A modern, single-page marketing site for FAR with smooth scroll navigation to the following sections:

| Section | Content |
|---------|---------|
| **Hero** | FAR headline, tagline, CTA button linking to `/jobs` |
| **About** | Short description of what FAR does — recruit and deploy talent for client companies |
| **Services** | Cards describing FAR's core offerings (talent recruitment, workforce deployment, HR advisory) |
| **Featured Jobs** | A live grid of up to 6 recent visible job listings pulled from the database |
| **Clients** | Logo grid of FAR's client companies (logos served via Cloudinary) |
| **Contact** | FAR's contact details — phone, email, address |

**Acceptance Criteria:**
- Page is fully responsive (mobile, tablet, desktop)
- Navbar links scroll to sections smoothly
- Featured jobs section renders "No openings" gracefully if empty
- Client logos display with fallback if no logo uploaded

---

### 5.2 Job Portal (Public)

#### 5.2.1 Jobs Listing Page
**Route:** `/jobs`

- Displays a grid/list of all **visible** job postings
- Each card shows: Job Title, Client Name, Location, Job Type badge, Posted Date
- Clicking a card navigates to the job detail page
- Shows a friendly empty state when no jobs are visible

#### 5.2.2 Job Detail Page
**Route:** `/jobs/[id]`

- Displays full job information: title, client, location, job type, full description
- **How to Apply** section displays the `applyInfo` field (email address, external link, or instructions set by admin)
- If job `isVisible = false`, returns 404

---

### 5.3 Admin Authentication

**Route:** `/login`

- Email + password login for FAR staff
- Powered by **NextAuth.js v5** with JWT strategy
- On success, redirects to `/dashboard`
- On failure, shows inline error message
- All `/admin` routes are protected by middleware — unauthenticated users are redirected to `/login`

---

### 5.4 Admin Dashboard

**Route:** `/dashboard`

Overview stats page with the following counters:

- Total Clients
- Total Jobs
- Active (Visible) Job Listings
- Total Employees
- Active Employees

Stats are fetched server-side on page load.

---

### 5.5 Job Management

#### List View — `/jobs`
- Table of all jobs (including hidden ones), columns: Title, Client, Type, Location, Visibility, Created Date, Actions
- **Actions per row:**
  - **Toggle Visibility** — instantly shows/hides the job on the public portal (PATCH request, no page reload)
  - **Edit** — navigates to edit form
  - **Delete** — confirmation dialog, then permanently deletes

#### Create — `/jobs/new`
- Form fields:

| Field | Type | Required |
|-------|------|----------|
| Job Title | Text | ✅ |
| Client | Select (from clients list) | ✅ |
| Job Type | Select: Full Time / Part Time / Contract / Internship | ✅ |
| Location | Text | ❌ |
| Description | Textarea (rich text optional) | ✅ |
| How to Apply | Textarea (email, link, or instructions) | ✅ |
| Visible | Toggle (default: true) | ✅ |

#### Edit — `/jobs/[id]/edit`
- Same form pre-populated with existing data
- PATCH request on submit

---

### 5.6 Client Management

#### List View — `/clients`
- Table columns: Logo, Company Name, Industry, Contact Person, Contact Email, Actions
- **Actions:** Edit, Delete
- Delete removes the client and their Cloudinary logo asset

#### Create — `/clients/new`

| Field | Type | Required |
|-------|------|----------|
| Company Name | Text | ✅ |
| Industry | Text | ❌ |
| Contact Person | Text | ❌ |
| Contact Email | Email | ❌ |
| Contact Phone | Text | ❌ |
| Company Logo | Image upload (Cloudinary) | ❌ |
| Notes | Textarea | ❌ |

#### Edit — `/clients/[id]/edit`
- Same form pre-populated
- Logo replacement deletes old Cloudinary asset and uploads new one

---

### 5.7 Employee Management

#### List View — `/employees`
- Table columns: Photo, Name, Role, Deployed To (Client), Status badge, Start Date, Actions
- **Actions:** Edit, Delete
- STAFF role sees no financial columns
- SUPER_ADMIN sees additional columns: Salary, FAR Fee

#### Create — `/employees/new`

**General Info (all roles):**

| Field | Type | Required |
|-------|------|----------|
| Full Name | Text | ✅ |
| Role / Job Title | Text | ✅ |
| Deployed To (Client) | Select | ✅ |
| Start Date | Date | ✅ |
| Status | Select: Active / On Leave / Ended | ✅ |
| Phone | Text | ❌ |
| Email | Email | ❌ |
| Photo | Image upload (Cloudinary) | ❌ |

**Financial Info (SUPER_ADMIN only — conditionally rendered):**

| Field | Type | Required |
|-------|------|----------|
| Salary (₦) | Number | ❌ |
| FAR Fee (₦) | Number | ❌ |
| Bank Name | Text | ❌ |
| Account Number | Text | ❌ |
| Account Name | Text | ❌ |

#### Edit — `/employees/[id]/edit`
- Same form pre-populated
- Financial section only visible/submittable by SUPER_ADMIN
- Photo replacement handles Cloudinary cleanup

---

## 6. Data Models

### User
```
_id           ObjectId   (auto)
name          String     required
email         String     required, unique, lowercase
password      String     required, select: false (never returned in queries)
role          Enum       SUPER_ADMIN | STAFF  (default: STAFF)
createdAt     Date       auto
updatedAt     Date       auto
```

### Client
```
_id            ObjectId   (auto)
name           String     required
industry       String
contactPerson  String
contactEmail   String
contactPhone   String
logoUrl        String     (Cloudinary secure URL)
logoPublicId   String     (Cloudinary public_id for deletion)
notes          String
createdAt      Date       auto
updatedAt      Date       auto
```

### Job
```
_id          ObjectId   (auto)
title        String     required
description  String     required
location     String
type         Enum       FULL_TIME | PART_TIME | CONTRACT | INTERNSHIP
applyInfo    String     required  (email/link/instructions for applicants)
isVisible    Boolean    default: true
clientId     ObjectId   ref: Client, required
createdAt    Date       auto
updatedAt    Date       auto
```

### Employee
```
_id            ObjectId   (auto)
name           String     required
role           String     required
clientId       ObjectId   ref: Client, required
startDate      Date       required
status         Enum       ACTIVE | ON_LEAVE | ENDED  (default: ACTIVE)
phone          String
email          String
photoUrl       String     (Cloudinary secure URL)
photoPublicId  String     (Cloudinary public_id for deletion)

// Financial — select: false (excluded from all queries unless explicitly requested)
salary         Number
farFee         Number
bankName       String
accountNumber  String
accountName    String

createdAt      Date       auto
updatedAt      Date       auto
```

> **Security note:** Financial fields use Mongoose's `select: false` — they are never returned in query results unless explicitly included with `.select("+salary +farFee ...")`. This is enforced at the model level, not just at the API level.

---

## 7. API Specification

All admin endpoints require a valid session. Public endpoints are open.

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/signin` | Public | Login with email + password |
| POST | `/api/auth/signout` | Auth | Sign out |

### Jobs
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/jobs` | Public (visible only) / Admin (all) | List jobs |
| POST | `/api/jobs` | Admin | Create job |
| GET | `/api/jobs/[id]` | Public | Get single job |
| PATCH | `/api/jobs/[id]` | Admin | Update job (incl. toggle visibility) |
| DELETE | `/api/jobs/[id]` | Admin | Delete job |

### Clients
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/clients` | Admin | List all clients |
| POST | `/api/clients` | Admin | Create client |
| GET | `/api/clients/[id]` | Admin | Get single client |
| PATCH | `/api/clients/[id]` | Admin | Update client |
| DELETE | `/api/clients/[id]` | Admin | Delete client + logo |

### Employees
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/employees` | Admin | List employees (financials for SUPER_ADMIN) |
| POST | `/api/employees` | Admin | Create employee |
| GET | `/api/employees/[id]` | Admin | Get single employee |
| PATCH | `/api/employees/[id]` | Admin | Update employee |
| DELETE | `/api/employees/[id]` | Admin | Delete employee + photo |

### Upload
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/upload` | Admin | Upload image to Cloudinary, returns `{ url, publicId }` |

---

## 8. Access Control Matrix

| Feature | Visitor | STAFF | SUPER_ADMIN |
|---------|---------|-------|-------------|
| View landing page | ✅ | ✅ | ✅ |
| Browse public job portal | ✅ | ✅ | ✅ |
| View job detail | ✅ | ✅ | ✅ |
| Admin login | ❌ | ✅ | ✅ |
| View dashboard | ❌ | ✅ | ✅ |
| Create / Edit / Delete jobs | ❌ | ✅ | ✅ |
| Toggle job visibility | ❌ | ✅ | ✅ |
| Create / Edit / Delete clients | ❌ | ✅ | ✅ |
| View employee general info | ❌ | ✅ | ✅ |
| Create / Edit employees | ❌ | ✅ | ✅ |
| Delete employees | ❌ | ✅ | ✅ |
| View employee financial fields | ❌ | ❌ | ✅ |
| Edit employee financial fields | ❌ | ❌ | ✅ |

---

## 9. Non-Functional Requirements

### Performance
- Server components used for all data-fetching pages (no client-side waterfall)
- MongoDB queries use `.lean()` for plain objects, reducing overhead
- Cloudinary images served via CDN with auto-format and quality optimization

### Security
- All admin routes protected via NextAuth middleware
- Passwords hashed with **bcryptjs** (never stored in plaintext)
- Financial fields excluded at the database query level (`select: false`)
- API routes validate all input with **Zod** schemas before touching the database
- Environment variables never exposed to the client

### Responsiveness
- All pages fully responsive: mobile (320px+), tablet (768px+), desktop (1280px+)
- Admin sidebar collapses to a hamburger menu on mobile

### Reliability
- MongoDB connection cached across Next.js hot reloads (dev) and serverless invocations (prod)
- Cloudinary cleanup on delete — no orphaned assets

---

## 10. Tech Stack

Use pnpm for package management.

| Layer | Technology | Version |
|-------|-----------|---------|
| Framework | Next.js | 14.1 |
| Language | TypeScript | 5 |
| Styling | Tailwind CSS | 3.3 |
| Database | MongoDB Atlas | — |
| ODM | Mongoose | 8.x |
| Auth | NextAuth.js | v5 (beta) |
| Media | Cloudinary | v2 |
| Validation | Zod | 3.x |
| Notifications | react-hot-toast | 2.x |
| Hosting (recommended) | Vercel | — |

---

## 11. Project Structure

```
far-app/
├── public/
│   └── images/                    # Static assets (logo, favicon)
│
├── src/
│   ├── app/
│   │   ├── layout.tsx             # Root layout (fonts, toaster)
│   │   ├── globals.css
│   │   ├── page.tsx               # Redirects / → /home
│   │   ├── login/
│   │   │   └── page.tsx
│   │   │
│   │   ├── (public)/              # No auth required
│   │   │   ├── layout.tsx         # Navbar + Footer
│   │   │   ├── home/page.tsx      # Landing page
│   │   │   └── jobs/
│   │   │       ├── page.tsx       # Job listings
│   │   │       └── [id]/page.tsx  # Job detail
│   │   │
│   │   ├── (admin)/               # Auth required
│   │   │   ├── layout.tsx         # Sidebar + Header
│   │   │   ├── dashboard/page.tsx
│   │   │   ├── jobs/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   ├── clients/
│   │   │   │   ├── page.tsx
│   │   │   │   ├── new/page.tsx
│   │   │   │   └── [id]/edit/page.tsx
│   │   │   └── employees/
│   │   │       ├── page.tsx
│   │   │       ├── new/page.tsx
│   │   │       └── [id]/edit/page.tsx
│   │   │
│   │   └── api/
│   │       ├── auth/[...nextauth]/route.ts
│   │       ├── jobs/route.ts
│   │       ├── jobs/[id]/route.ts
│   │       ├── clients/route.ts
│   │       ├── clients/[id]/route.ts
│   │       ├── employees/route.ts
│   │       ├── employees/[id]/route.ts
│   │       └── upload/route.ts
│   │
│   ├── components/
│   │   ├── layout/
│   │   │   ├── Navbar.tsx         # Public navbar
│   │   │   └── Footer.tsx
│   │   ├── public/
│   │   │   ├── HeroSection.tsx
│   │   │   ├── AboutSection.tsx
│   │   │   ├── ServicesSection.tsx
│   │   │   ├── FeaturedJobs.tsx
│   │   │   ├── ClientsSection.tsx
│   │   │   ├── ContactSection.tsx
│   │   │   └── JobCard.tsx
│   │   ├── admin/
│   │   │   ├── AdminSidebar.tsx
│   │   │   ├── AdminHeader.tsx
│   │   │   ├── JobsTable.tsx
│   │   │   ├── JobForm.tsx
│   │   │   ├── ClientsTable.tsx
│   │   │   ├── ClientForm.tsx
│   │   │   ├── EmployeesTable.tsx
│   │   │   └── EmployeeForm.tsx
│   │   └── ui/
│   │       ├── Button.tsx
│   │       ├── Input.tsx
│   │       ├── Select.tsx
│   │       ├── Badge.tsx
│   │       ├── Modal.tsx
│   │       └── ImageUpload.tsx
│   │
│   ├── models/
│   │   ├── User.ts
│   │   ├── Client.ts
│   │   ├── Job.ts
│   │   └── Employee.ts
│   │
│   ├── lib/
│   │   ├── db.ts                  # MongoDB connection
│   │   ├── auth.ts                # NextAuth config
│   │   ├── cloudinary.ts          # Cloudinary helpers
│   │   ├── validations.ts         # Zod schemas
│   │   └── utils.ts               # cn() and helpers
│   │
│   ├── hooks/
│   │   └── useConfirm.ts          # Reusable confirm dialog hook
│   │
│   └── types/
│       └── index.ts               # Shared TypeScript types + NextAuth augmentation
│
├── .env.local                     # Environment variables (gitignored)
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## 12. MVP Scope & Build Order

The following is the recommended implementation sequence:

| Phase | Task | Priority |
|-------|------|----------|
| 1 | Project setup, env, DB connection, auth | 🔴 Critical |
| 2 | Mongoose models (User, Client, Job, Employee) | 🔴 Critical |
| 3 | API routes (all CRUD endpoints) | 🔴 Critical |
| 4 | Admin layout (sidebar, header, protected routes) | 🔴 Critical |
| 5 | Client management UI (list + form) | 🔴 Critical |
| 6 | Job management UI (list + form + toggle) | 🔴 Critical |
| 7 | Employee management UI (list + form) | 🔴 Critical |
| 8 | Public job portal (list + detail) | 🟠 High |
| 9 | Public landing page (all sections) | 🟠 High |
| 10 | Cloudinary image upload (logos + photos) | 🟠 High |
| 11 | Role-based financial field visibility | 🟠 High |
| 12 | Dashboard stats page | 🟡 Medium |
| 13 | Mobile responsiveness polish | 🟡 Medium |
| 14 | Empty states, loading skeletons, error handling | 🟡 Medium |

---

## 13. Future Enhancements

These are out of scope for MVP but worth tracking:

- **Application tracking** — store applicant records when job seekers apply (would require an apply form or email parsing integration)
- **Employee contract uploads** — attach PDF contracts to employee profiles via Cloudinary
- **Client portal** — read-only login for client companies to view their deployed employees
- **Payroll reports** — export salary/fee summaries as PDF or CSV per client per month
- **Audit log** — track who created/edited/deleted what and when
- **Search & filters** — filter jobs by type/location, filter employees by status/client
- **Notifications** — email alerts to FAR staff when a new application email is detected
- **Multi-language support** — English + Yoruba/Igbo/Hausa localisation

---

*This document is the single source of truth for the FAR platform MVP. Any changes to scope, models, or features should be reflected here before implementation.*
