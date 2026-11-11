# Employee Management System

A web app for a small Employee Management System: employee sign-up and profile, clock in/out, payslips, and an admin side for approvals, payroll structures and payroll runs.

Live Link: [https://ems-sh.netlify.app](https://ems-sh.netlify.app)

Backend Repository: [ems-backend](https://github.com/Shahriar-Hossain-Alvi/ems-backend).

## Features

- **Everyone:** Log In and Sign Up
- **Employee:** Dashboard (clock in/out), My Attendance, Payslips, Payslip Detail (printable), My Profile (edit profile, change password)
- **Admin:** Dashboard, Employees (search, approve or reject, assign structure), Attendance Records (with correction), Payroll Structures (create heads, add heads to structures), Run Payroll (preview, generate drafts, publish), Work Policy and Settings (attendance rules, departments)

`DEMO_ADMIN` can open the admin screens but all write actions are disabled.

## Tech stack

- React.JS,
- React Router,
- Axios,
- TanStack Query,
- lucide-react,
- CSS
- HTML

## Getting started

Requirements: Node.js 20+ and the backend running.

```bash
pnpm install        # or npm install
cp .env.example .env
pnpm run dev        # or npm run dev
```

`.env`:

```bash
VITE_API_BASE_URL=http://localhost:3000
```

Other scripts: `pnpm run build`, `pnpm run preview`.
