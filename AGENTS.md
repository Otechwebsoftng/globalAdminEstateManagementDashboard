# Agent Instructions — Real Estate Management Dashboard

## Stack

- React 19 + TypeScript + Vite 6
- Tailwind CSS v4 (uses `@tailwindcss/vite` plugin, NOT PostCSS)
- react-router-dom v7, motion (framer-motion successor), recharts, lucide-react
- @google/genai for Gemini API
- @tanstack/react-query for server state caching
- Path alias: `@/` → project root (configured in vite.config.ts and tsconfig.json)

## Commands

```bash
npm run dev        # Vite dev server on port 3000
npm run build      # vite build
npm run lint       # tsc --noEmit (type checking only — no ESLint/Prettier configured)
npm run clean      # rm -rf dist server.js
```

No test runner is configured.

## Architecture

- Entry: `src/main.tsx` → `src/App.tsx`
- Auth-gated routing: unauthenticated → `/login`, authenticated → `/admin/dashboard`
- `AuthContext` manages auth state + JWT token storage
- Components in `src/components/` (estate subfolder for admin views)
- API service layer: `src/services/api.ts`
- API types: `src/types/api.ts`
- Tailwind theme vars defined in `src/index.css` (brand colors, fonts)
- Server state: `@tanstack/react-query` with `queryClient` in `src/lib/queryClient.ts`
- Error boundary: `src/components/ErrorBoundary.tsx` wraps authenticated routes

## Backend API

> **The route surface changed.** `/estate` was renamed `/estates`, `/suspend` was
> dropped on both admin types, and security-personnel, resident-assets and
> residents endpoints were added. The live OpenAPI spec is the source of truth:
>
> ```
> curl https://estatemanagementapiserver.onrender.com/api/v1-json
> ```
>
> Re-run the audit in `src/services/api.ts` against it before trusting any table
> below. Swagger UI is at `/api/v1`.

### Current endpoint groups (65 paths)

| Group | Notes |
|---|---|
| `auth` | global-admin, estate-admin, resident and security logins; shared `PATCH /auth/admin/verify-user` MFA |
| `estates` | list/detail/onboard/update, soft-delete, restore, delete, residents, estate-admin lookup |
| `global-admin`, `estate-admin` | list, onboard, update-role, soft-delete, restore, hard delete, password flows |
| `residents` | per-estate list, detail, update, remove-assignment, visitor codes, password flows |
| `security-personnel` | per-estate list/detail/onboard, update-profile, soft-delete, restore, remove, verify-code |
| `resident-assets` | per-estate properties: list/detail/create/update, soft-delete (reason), restore, delete, remove occupant |
| `role`, `permission`, `menu` | unchanged |

**Everything under residents, security-personnel and resident-assets is
estate-scoped.** Use `useEstateScope()` (`src/hooks/useEstateScope.ts`): estate
admins are pinned to `user.estateId`; global admins pick an estate.


Base URL: `VITE_API_BASE_URL` env var (set in `.env`)
Auth: JWT Bearer token in `Authorization` header
Token storage: `localStorage` keys `global_estates_token`, `global_estates_user`, `global_estates_mfa_token`

### API Service (`src/services/api.ts`)

All API functions are organized by domain:
- `authApi` — login, verify OTP, resend OTP, forgot/reset password
- `globalAdminApi` — dashboard, list/onboard/update/soft-delete/suspend admins
- `estateAdminApi` — estate admin CRUD (separate from global admin)
- `estateApi` — list/onboard/update estates, get per-estate residents
- `roleApi` — list/create/update/delete roles
- `permissionApi` — list permissions
- `menuApi` — list/create menu items

### Session Management

- `setOnSessionExpired(callback)` — registers a global 401/403 handler
- `request()` triggers `onSessionExpired()` when any API returns 401 or 403 (excluding OTP/MFA calls)
- `SessionExpiredGate` component wraps authenticated routes, shows a modal on session expiry
- `SessionExpiredModal` — full-screen overlay blocking all UI until re-login

### Auth Flow

1. `authApi.loginGlobalAdmin({ email, password })` → returns `{ mfaToken, email }`
2. Store MFA token via `auth.setMfaToken(token)`
3. `authApi.verifyOtp({ otpType: "ADMIN_LOGIN", otp, email })` → returns `{ accessToken, user }`
4. Call `auth.login(userData, accessToken)` to store JWT + user in context + localStorage

### Key Gotchas

- **Residents are per-estate only**: `GET /estates/{estateId}/residents`. There is also `GET /residents/estate/{estateId}`
- **Estate field mapping**: API returns `estateName`, `firstName`, `lastName` → frontend expects `name`, `owner` (mapped in `fetchEstates`)
- **Admin field mapping**: API returns `firstName`, `lastName`, `role.name` → frontend expects `name`, `role` (mapped in `fetchAdmins`)
- **OTP types**: `"ADMIN_LOGIN"`, `"SIGN_UP"`, `"CHANGE_PASSWORD"`, `"FORGOT_PASSWORD"`
- **Backend response shapes vary**: All fetch handlers use flexible multi-path extraction: `res?.data ?? res?.estates ?? res?.result ?? (Array.isArray(res) ? res : [])` — do NOT assume `{ success, data }` wrapper
- **Admin list endpoint needs explicit `userStatus`**: `GET /global-admin` without `userStatus` may only return `active` users. Use `fetchAllAdmins()` which tries unfiltered first, then falls back to 4 parallel status calls.
- **Admin onboard requires phone**: `CreateAdminDto` requires `countryCode`, `phoneNumber`, `roleId` (all non-empty strings)
- **Estate onboard requires 11 fields**: `estateName`, `firstName`, `lastName`, `cac`, `countryCode`, `phoneNumber`, `email`, `address`, `city`, `state`, `country`
- **Role DTOs require all fields**: Both `CreateRoleDto` and `UpdateRoleDto` require `{ name, description, permissionIds }` — empty `description` is allowed but must be present

### Admin List Fetching — How It Works and Why

**Problem (solved):** The `GET /global-admin` and `GET /estates-admin` endpoints accept an optional `userStatus` filter (`active`, `inactive`, `inactive`, `suspended`, `flagged`). Without it, the backend may only return `active` users. Newly onboarded admins who haven't verified OTP yet are `invisible`.

**Solution in `GlobalDashboard.tsx` (`fetchAllAdmins`):**
1. **Primary**: Single unfiltered `globalAdminApi.list()` call — returns all admins regardless of status
2. **Fallback**: If primary returns empty, fetches all 4 statuses in parallel via `Promise.allSettled`, deduplicates by `id`

**Solution in `EstateDetailView.tsx` (`fetchAllEstateAdmins`):**
- Uses the multi-status approach directly (4 parallel `estateAdminApi.list({ status })` calls), deduplicating by `id`

**Why not always use the multi-status fallback?**
- Silent error swallowing — `Promise.allSettled` ignores failed calls (e.g., backend rejects an unrecognized status)
- Pagination cap — `pageSize=500` per call; if any status exceeds that, results are silently dropped
- 4x network overhead — problematic on Render cold starts

**How to diagnose similar issues:**
1. Check the OpenAPI spec (`backend.json`) for query parameters on the list endpoint
2. Verify what the backend returns without filters vs. with explicit `userStatus` — use Network tab
3. Check response shape: `parseList()` searches multiple paths; add new keys if backend changes format
4. If items disappear after onboard, check the `status` field of newly created records

## Gotchas

- **Tailwind v4**: Uses `@theme` block in CSS, NOT `tailwind.config.js`. Custom colors: `--color-brand-primary`, `--color-brand-dark`, `--color-brand-accent`.
- **HMR disabled** when `DISABLE_HMR=true` env var is set (saves CPU during agent edits).
- **No ESLint/Prettier**: `lint` script is just type checking. No automated code formatting.
- **Dev server host**: Binds to `0.0.0.0` (all interfaces) when run via npm, but vite.config.ts sets `127.0.0.1`.
- **`@google/genai`**: Requires a `GEMINI_API_KEY` env var (not committed — see .env.example).
- **Render deployment**: Requires `static.json` in `public/` (copied to `dist/` at build time). Set `VITE_API_BASE_URL` in Render dashboard before build (not synced from `.env`).

## Integration Status

### Fully Integrated (API calls wired)

| Feature | Handler | API Call | Endpoint |
|---|---|---|---|
| Login + OTP verify | `EstateLogin.tsx` | `authApi.loginGlobalAdmin` + `authApi.verifyOtp` | `POST /auth/global-admin/login` + `PATCH /auth/admin/verify-user` |
| Forgot password | `EstateLogin.tsx` | `authApi.forgotPassword` + `verifyPasswordOtp` + `resetPassword` | `PATCH /global-admin/forgot-password`, etc. |
| Resend OTP | `EstateLogin.tsx` | `authApi.resendOtp()` | `PATCH /global-admin/resend-otp` |
| Dashboard stats | `fetchDashboard()` | `globalAdminApi.getDashboard()` | `GET /global-admin/dashboard` |
| Estate list | `fetchEstates()` | `estateApi.list()` | `GET /estates` |
| Estate onboard | `handleOnboardEstateSubmit` | `estateApi.onboard()` | `POST /estates/onboard-estate` |
| Estate edit | `handleEditEstateSubmit` | `estateApi.update()` | `PUT /estates/{estateId}` |
| Admin list | `fetchAllAdmins()` | `globalAdminApi.list()` (unfiltered, fallback: 4 status calls) | `GET /global-admin` |
| Admin onboard | `handleAddAdminSubmit` | `globalAdminApi.onboard()` | `POST /global-admin/onboard-admin` |
| Admin suspend | `handleAdminSuspend` | `globalAdminApi.suspend()` | `PATCH /global-admin/{id}/suspend` |
| Admin restore | `handleAdminRestore` | `globalAdminApi.restore()` | `PATCH /global-admin/{id}/restore` |
| Admin soft-delete | `handleAdminSoftDelete` | `globalAdminApi.softDelete()` | `PATCH /global-admin/{id}/soft-delete` |
| Admin update-role | `handleAdminUpdateRole` | `globalAdminApi.updateRole()` | `PUT /global-admin/{id}/update-role` |
| Admin MoreVertical dropdown | `renderAdminsView` | Change Role, Suspend, Restore, Delete | All wired to `globalAdminApi` |
| Roles list | `fetchRoles()` | `roleApi.list()` | `GET /role` |
| Role create | `handleCreateRole` | `roleApi.create()` | `POST /role` |
| Role update | `handleUpdateRole` | `roleApi.update()` | `PUT /role/{roleId}` |
| Role delete | `handleDeleteRole` | `roleApi.delete()` | `DELETE /role/{roleId}` |
| Permissions list | `fetchPermissions()` | `permissionApi.list()` | `GET /permission` |
| Role permissions checkboxes | Role modal | Select All / Deselect All toggle | Pre-selected on edit |
| Menu items | `fetchMenu()` | `menuApi.list()` | `GET /menu` |
| Estate residents (per-estate) | `fetchEstateResidents()` | `estateApi.getResidents()` | `GET /estates/{id}/residents` |
| Estate admins list | `fetchAllEstateAdmins()` | `estateAdminApi.list()` (4 parallel status calls) | `GET /estates-admin` |
| Estate admin suspend | `handleEstateAdminSuspend` | `estateAdminApi.suspend()` | `PATCH /estate-admin/{id}/suspend` |
| Estate admin restore | `handleEstateAdminRestore` | `estateAdminApi.restore()` | `PATCH /estate-admin/{id}/restore` |
| Estate admin soft-delete | `handleEstateAdminDelete` | `estateAdminApi.softDelete()` | `PATCH /estate-admin/{id}/soft-delete` |
| Estate admin onboard | `handleOnboardEstateAdmin` | `estateAdminApi.onboard()` | `POST /estate-admin/onboard-admin` |
| Estate admin update-role | `handleEstateAdminUpdateRole` | `estateAdminApi.updateRole()` | `PUT /estate-admin/{adminId}/update-role` |
| User name display | `useAuth().user.name` | — | Replaces hardcoded "Emmanuel Stark" |
| Session expired modal | `SessionExpiredGate` + `SessionExpiredModal` | 401/403 from any endpoint | Blocks UI, forces re-login |
| Toast notifications | `useToast()` from `Toast.tsx` | All error and success handlers | Auto-dismiss after 5s |
| Loading skeletons | `StatsCardSkeleton`, `TableSkeleton` | Dashboard KPIs, estates table, admins table | Shown while `is*Loading` is true |

### NOT Integrated (no UI needed or no backend endpoint)

| Feature | Current Behavior | Reason |
|---|---|---|
| `POST /auth/estate-admin/login` | Not wired | No separate estate-admin login UI |
| `PUT /global-admin/edit-profile` | Not wired | No profile edit UI |
| `GET /global-admin/{adminId}` | Not wired | Not needed (list endpoint provides data) |
| `GET /estates/{estateId}` | Not wired | Estate detail uses parent prop |
| `POST /menu`, `POST /menu/{id}/child-menu` | Not wired | No menu management UI |
| `GET /permission/slug` | Not wired | Not needed |
| `GET /role/{roleId}` | Not wired | Not needed (list provides data) |
| Estate admin password endpoints | Not wired | No password management UI for estate admins |
| Resident add/edit/suspend | Local state only | No `POST/PUT /residents` endpoint in backend |
| Staff (all) | Local state only | No staff endpoint in backend |
| Estate delete | Inert button removed | No DELETE endpoint in backend — button removed from UI |
| Revenue chart | Hardcoded data | No endpoint |
| System Health | Hardcoded data | No endpoint |
| Subscription plans | Hardcoded data | No endpoint |

### Dashboard KPI Data Sources

| KPI Card | Data Source | Fallback |
|---|---|---|
| Total Estates | `dashboardStats.totalEstates` | 0 |
| Active Residents | `dashboardStats.totalResidents` | 0 |
| MRR | `dashboardStats.revenue` | ₦0 |
| System Uptime | Hardcoded "1,234" | No backend field |
| Total Admin | `adminsList.length` | 0 |
| Super Admin | `adminsList.filter(role includes "Super").length` | 0 |
| Support Lead | `adminsList.filter(role includes "Support").length` | 0 |
| Active Now | `adminsList.filter(status === "active").length` | 0 |

### UI Action Buttons Per Table

| Table | Action Buttons | API Integration |
|---|---|---|
| **Estates** (`/admin/estates`) | Eye (view detail) + Edit (modal) | View navigates to `EstateDetailView`, Edit calls `estateApi.update()` |
| **Admins** (`/admin/admins`) | MoreVertical dropdown: Change Role, Suspend, Restore, Delete | All wired to `globalAdminApi` |
| **Residents** (`/admin/residents`) | Edit (modal) + UserX (dead) | Edit is local state, UserX has no backend endpoint |
| **Staff** (`/admin/staff`) | MoreVertical (dead) | No staff endpoints in backend |
| **Estate Admins** (detail view) | MoreVertical dropdown: Change Role, Suspend, Restore, Delete | All wired to `estateAdminApi` |
| **Estate Security** (detail view) | MoreVertical (dead) | No security staff endpoints |

### Response Shape Handling

All fetch handlers use flexible multi-path extraction to handle varying backend response shapes:
```ts
const raw = res?.data ?? res?.estates ?? res?.admins ?? res?.roles ?? res?.result ?? (Array.isArray(res) ? res : []);
```
This prevents silent failures when the backend wraps data differently than expected.

### Component Files

| File | Purpose |
|---|---|
| `src/main.tsx` | Entry point, wraps app with `ToastProvider` |
| `src/App.tsx` | Routes, wraps authenticated routes with `SessionExpiredGate` |
| `src/components/Toast.tsx` | Toast notification system (`useToast`, `ToastProvider`) |
| `src/components/Skeleton.tsx` | Loading skeleton components (`Skeleton`, `TableSkeleton`, `StatsCardSkeleton`, `CardSkeleton`) |
| `src/components/SessionExpiredModal.tsx` | Session expired overlay modal |
| `src/components/SessionExpiredGate.tsx` | Registers 401 handler, manages modal state |
| `src/components/estate/GlobalDashboard.tsx` | Main dashboard (3600+ lines): estates, admins, roles, permissions, residents, staff views |
| `src/components/estate/EstateDetailView.tsx` | Estate detail: residents, security, admins tabs |
| `src/components/estate/ResidentDetailView.tsx` | Resident detail: domestic staff, visitor codes |
| `src/components/estate/EstateLogin.tsx` | Login + OTP + forgot password flows |
