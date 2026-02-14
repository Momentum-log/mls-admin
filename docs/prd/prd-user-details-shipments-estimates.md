# User Details — Shipments & Estimates Enhancement

## Introduction / Overview

The admin **User Details** page currently only shows profile info and moderation controls. This PRD describes adding two new data sections — **Shipments** and **Shipping Estimates** — directly below the existing user profile card. Each section shows the user's first five records with a "See All" link that navigates to a dedicated sub-page with paginated results and a compact user header.

A key intelligence feature is **estimate-to-shipment correlation**: for each shipping estimate, the system determines whether it was later converted into an actual shipment by checking if a matching shipment exists (same pickup, dropoff, and package details). This lets admins quickly identify unconverted estimates and proactively follow up with users.

---

## Goals

1. Display the five most recent **shipments** for a user on their details page.
2. Display the five most recent **shipping estimates** for a user, each tagged with its conversion status ("Shipment Created" or "Shipping Estimate").
3. Provide "See All" sub-pages for both shipments and estimates, with pagination and a compact user info header.
4. Help admins identify users who generated estimates but never created a shipment, enabling outreach.

---

## User Stories

- **As an admin**, I want to see a user's recent shipments and estimates on their profile page so I can quickly assess their activity.
- **As an admin**, I want to know if a shipping estimate led to a real shipment so I can identify drop-off points in the conversion funnel.
- **As an admin**, I want to click "See All" and view the full paginated history of a user's shipments or estimates so I can investigate edge cases.
- **As an admin**, I want the "See All" page to show a compact user header so I always know whose data I'm viewing.

---

## Features / Tasks

### User Details Page — Data Sections

- **UD01**: Create a **"Recent Shipments"** card on the user details page showing the 5 most recent shipments (status, tracking number, carrier, date).
- **UD02**: Create a **"Recent Shipping Estimates"** card on the user details page showing the 5 most recent estimates (origin → destination, weight, date, conversion status).
- **UD03**: Implement **estimate-to-shipment correlation** logic:
  - If the backend returns a `converted` flag or `shipmentId` on an estimate, use it directly.
  - If not available, fall back to a **frontend best-effort match**: compare each estimate's pickup address, dropoff address, and package details against the user's shipments. If a match is found, mark the estimate as **"Shipment Created"**; otherwise, display **"Shipping Estimate"**.
- **UD04**: Add a "See All" link/button on each card that navigates to the dedicated sub-page.

---

### "See All" Shipments Sub-Page

- **SA01**: Create route `/dashboard/users/[id]/shipments`.
- **SA02**: Display a **compact user info header** at the top (name, email, userCode, status badge).
- **SA03**: Render a paginated table/list of all user shipments.
- **SA04**: Reuse existing shipment list patterns (status badges, tracking numbers, dates).

---

### "See All" Estimates Sub-Page

- **SE01**: Create route `/dashboard/users/[id]/estimates`.
- **SE02**: Display the same **compact user info header** as the shipments sub-page.
- **SE03**: Render a paginated table/list of all user shipping estimates with conversion status.
- **SE04**: Each estimate row shows: origin → destination summary, package weight, date, and a badge — **"Shipment Created"** (green) or **"Shipping Estimate"** (neutral/gray).

---

### Types & API Layer

- **TA01**: Define types for user shipments response and user estimates response in `types/`.
- **TA02**: Create API functions in `api/users/` to fetch user shipments and user estimates (both paginated).
- **TA03**: Create React Query hooks in `hooks/users/` for fetching user shipments and user estimates.

---

### Shared Components

- **SC01**: Extract a **`UserInfoHeader`** component (compact user bar) for reuse across the "See All" sub-pages and potentially the main detail page.
- **SC02**: Create a **`ConversionBadge`** component that renders "Shipment Created" (green) or "Shipping Estimate" (gray) based on conversion status.

---

## Non-Goals (Out of Scope)

- **Backend endpoint creation** — endpoints will be created separately; this PRD specs the frontend only.
- **Estimate detail view** — clicking into a single estimate is not in scope.
- **Shipment detail view** — clicking into a single shipment from this page is not in scope (the existing shipments page already handles this).
- **Real-time updates** — no WebSocket/SSE; data is fetched on page load.
- **Filtering / searching** within the "See All" pages (pagination only for now).

---

## Design Considerations

- **Layout**: Both new cards sit below the existing "User Profile" card in a 2-column grid on desktop, stacking vertically on mobile.
- **Style**: Flat, minimalist design using existing CSS variables only. No gradients. Consistent with the existing card-based design (`Card`, `CardHeader`, `CardContent` from shadcn).
- **Conversion badge colors**: Use `bg-green-100 text-green-800` (dark on light) for "Shipment Created", and `bg-gray-100 text-gray-800` for "Shipping Estimate" — or their closest CSS variable equivalents.
- **Empty states**: If a user has no shipments or estimates, show a centered message with an icon (e.g., Package or FileText).

---

## Technical Considerations

- **Correlation algorithm**: The frontend match compares stringified pickup/dropoff addresses + package weight/dimensions. This is a best-effort heuristic and should be clearly documented in code. The backend `converted` flag takes priority when available.
- **Query keys**: Use `["user-shipments", userCode, page]` and `["user-estimates", userCode, page]` to enable independent cache invalidation.
- **Compact user header**: The `UserInfoHeader` component should accept a `User` prop and render a single-line summary. It should be placed in `components/` for reuse.
- **Routing**: Sub-pages sit at `app/dashboard/users/[id]/shipments/page.tsx` and `app/dashboard/users/[id]/estimates/page.tsx`, inheriting the dashboard layout.

---

## Success Metrics

- Admin can view the 5 most recent shipments and estimates on any user's detail page.
- Admin can identify which estimates were converted into shipments vs. which remain unconverted.
- Admin can navigate to "See All" and browse full paginated history.
- "See All" pages always show the correct user's data with a visible user info header.

---

## Open Questions

1. What fields does the backend return for each shipping estimate in the user context? (e.g., does it include full pickup/dropoff addresses, or just summaries?)
2. Will the backend include a `converted` or `shipmentId` field on estimates, or should the frontend rely entirely on the best-effort match initially?
3. Desired page size for the "See All" pagination? (Default: 10)
