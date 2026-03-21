# CCHOS — Children's Community Health Ordering System

An internal ordering and request management system for Intermountain Health's Children's Community Health team. Community organizations can request free education materials, safety devices, and event support through a public-facing form, while staff manage fulfillment through an admin dashboard.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to see the community request form.

## Demo Data

The app ships with a pre-seeded SQLite database containing **115 mock requests** and **10 staff members** — no setup required.

## Admin Dashboard

Go to [http://localhost:3000/admin](http://localhost:3000/admin) and log in:

- **Username:** `admin`
- **Password:** `admin123`

### Admin Features
- **Queue** — View, filter, and search all incoming requests
- **Detail View** — Update status, assign priority, assign staff, set fulfillment path
- **Staff** — View team members, roles, specialties, and assignment counts
- **Analytics** — Charts for request volume, status breakdown, event types, and service areas
- **Inventory** — Track education materials and safety device stock levels
- **Export** — Download request data as CSV
- **Settings** — Configure service areas and request handling rules

## Public Form Features
- English / Spanish language toggle
- Four request types: Mailing, In-Person Event, Virtual Presentation, Pickup
- Materials and safety device selection with quantity
- Service area validation (Utah counties within Intermountain Health's coverage)
- "I'm not a robot" verification
- Responsive, accessible design (WCAG)

## Tech Stack
- **Next.js 16** (App Router, React 19)
- **TypeScript**
- **Tailwind CSS v4** with Intermountain Health brand colors
- **SQLite** via better-sqlite3
- **Recharts** for analytics visualizations
