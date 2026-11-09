# EMS Frontend (JavaScript)

React + Vite frontend for the NestJS EMS backend. This project intentionally uses JavaScript and JSX only.

## Setup

```bash
npm install
cp .env.example .env
npm run dev
```

Set `VITE_API_BASE_URL` to the backend origin. The supplied NestJS backend does not configure a global `/api` prefix, so the default is `http://localhost:3000`.

## Data and API architecture

- `src/api/axiosInterceptor.js`: public and protected Axios instances, JWT request interceptor, unauthorized-session handling, and normalized backend error messages.
- `src/hooks/useAxiosPublic.js`: public Axios hook, used by registration/login flows.
- `src/hooks/useAxiosSecure.js`: protected Axios hook, used by TanStack Query hooks; attaches the current JWT through the shared interceptor.
- `src/hooks/useEMSQueries.js`: TanStack Query read hooks for dashboards, employees, departments, attendance, payroll, payslips, and work policy.
- `src/hooks/queryKeys.js`: centralized query keys.
- `src/providers/QueryProvider.jsx`: QueryClient defaults, caching, retry policy, and refetch-on-focus/reconnect behavior.

After successful writes, screens invalidate the affected query keys so cached data is refetched without a browser reload. Queries also refetch when the window regains focus after their cached data becomes stale.

## API errors

NestJS `message` values are surfaced to the form/page. For example, duplicate registration displays `An account with this email already exists.` for HTTP 409. Client-side code does not `console.log` request errors. The browser's Network panel can still show the HTTP 409 response because that is the actual server response.

## Notes

- Password reset is not implemented because the supplied backend has no reset endpoint.
- Payslip printing uses the browser print dialog; no backend PDF endpoint exists.
- No TypeScript files or TypeScript build step are used.
