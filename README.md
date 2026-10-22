# FinanceApp

A bilingual (English/Tamil) finance management web application built with React, TypeScript, and Vite. Designed for managing borrowers, collections, and capital injections with role-based access for Financiers and Admins.

## About

FinanceApp is a private, single-family finance tracker built to replace the spreadsheets and paper ledgers used to run a micro-lending business. It models the business as a set of **borrowers**, each with one or more **loans**, and a stream of **transactions** (disbursements, repayments, and collections) recorded against those loans and against the capital that funds them.

**Who it is for**

- **Financier ("Dad")** — the person who lends the money. Tracks borrowers, records loans and repayments, and follows what is due today, this week, and over time.
- **Admin ("Son")** — the person who operates the business. Sees the whole portfolio, manages user accounts, injects or removes capital, and can correct any record the Financier entered.

**What it solves**

- Know exactly how much money is out, how much is coming back, and who is overdue — without doing arithmetic by hand.
- Keep principal, interest, and collections separated so profit and capital flow are never confused.
- Run the same app in Tamil or English, on a phone, on a tablet, or on a desktop, with or without an internet connection.
- Give the Admin a single place to audit every user, borrower, and transaction.

**How it works**

1. A role is chosen at the landing screen (`/`), which routes into the Financier or Admin area.
2. Borrowers are created with their loan details; each loan generates a collection schedule.
3. Repayments and collections are logged as transactions and reflected immediately on both dashboards.
4. The Admin can inject capital into the business, which is tracked as a separate company-capital borrower so funds are never lost in borrower totals.
5. All data lives in Supabase (PostgreSQL) and is streamed to the browser in real time, so both roles always see the same numbers.

**Design goals**

- Mobile-first and touch-friendly, since most data entry happens on a phone.
- Offline-capable PWA with a persistent language and theme preference.
- No data entry duplication — every figure shown is derived from the transaction ledger.

## Features

- **Role-Based Access**
  - **Financier (Dad)**: Dashboard, Borrowers management, Collections tracking
  - **Admin (Son)**: Full admin dashboard, Users CRM, Transactions, Borrowers oversight

- **Bilingual Support**: English & Tamil (தமிழ்) with persistent language selection
- **Dark/Light Mode**: Theme switching with system preference detection
- **PWA Ready**: Offline-capable with service worker via `vite-plugin-pwa`
- **Supabase Backend**: Real-time database with authentication-ready structure

## Tech Stack

| Category | Technology |
|----------|------------|
| Framework | React 19 + TypeScript |
| Build Tool | Vite 8 |
| Routing | React Router DOM 7 |
| Styling | Tailwind CSS 4 + PostCSS |
| Icons | Lucide React |
| Database | Supabase (PostgreSQL) |
| Linting | Oxlint |
| PWA | vite-plugin-pwa |

## Project Structure

```
src/
├── App.tsx                 # Main app with routing & layouts
├── main.tsx               # Entry point
├── LanguageContext.tsx    # i18n context (EN/TA)
├── ThemeContext.tsx       # Dark/light theme context
├── lib/
│   ├── supabase.ts        # Supabase client
│   └── dateUtils.ts       # Date formatting utilities
└── pages/
    ├── admin/
    │   ├── Dashboard.tsx     # Admin overview
    │   ├── Users.tsx         # Users CRM
    │   ├── UserForm.tsx      # Create/edit users
    │   └── Transactions.tsx  # Transaction history
    ├── financier/
    │   ├── Dashboard.tsx     # Financier overview
    │   ├── Borrowers.tsx     # Borrower list
    │   ├── AddBorrower.tsx   # Add new borrower
    │   ├── BorrowerDetails.tsx # Borrower profile & loans
    │   └── Collections.tsx   # Collection tracking
    ├── DatabaseReset.tsx     # DB reset utility
    └── InjectCapital.tsx     # Capital injection
```

## Getting Started

### Prerequisites
- Node.js 18+
- npm/pnpm/yarn
- Supabase project (for backend)

### Installation

```bash
# Clone the repository
git clone https://github.com/dhesigan2924/FinanceApp.git
cd FinanceApp

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env  # Add your Supabase credentials
```

### Environment Variables

Create a `.env` file with:

```env
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Development

```bash
npm run dev        # Start dev server (accessible on network via --host)
npm run build      # Production build
npm run preview    # Preview production build
npm run lint       # Run Oxlint
```

## Deployment

The app is configured for static hosting (Vercel, Netlify, Render, etc.). Build output goes to `dist/`.

```bash
npm run build
# Deploy the dist/ folder
```

## Scripts Reference

The root contains numerous utility scripts (`fix_*.js`, `patch_*.js`, `update_*.js`) for database migrations, data cleanup, and schema fixes. These are development/maintenance tools, not part of the runtime app.

## License

Private project - all rights reserved.