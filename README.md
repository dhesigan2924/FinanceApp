# FinanceApp

A bilingual (English/Tamil) finance management web application built with React, TypeScript, and Vite. Designed for managing borrowers, collections, and capital injections with role-based access for Financiers and Admins.

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