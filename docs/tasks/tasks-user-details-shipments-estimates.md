# Tasks — User Details Shipments & Estimates Enhancement

## Relevant Files

- `types/shipment.ts` - Added `UserShipmentFilter` interface.
- `types/leads.ts` - Added `converted` field to `Lead`, added `UserLeadFilter` interface.
- `api/shipments/index.ts` - Added `getUserShipments` API function.
- `api/leads/index.ts` - Added `getUserLeads` API function.
- `hooks/shipments/use-shipments.ts` - Added `useUserShipments` React Query hook.
- `hooks/leads/use-leads.ts` - Added `useUserLeads` React Query hook.
- `components/users/user-info-header.tsx` - New compact header for user sub-pages.
- `components/ui/conversion-badge.tsx` - New badge for estimate conversion status.
- `app/dashboard/users/[id]/page.tsx` - Updated with Recent Shipments + Estimates cards.
- `app/dashboard/users/[id]/shipments/page.tsx` - New paginated shipments sub-page.
- `app/dashboard/users/[id]/estimates/page.tsx` - New paginated estimates sub-page.

### Notes

- Use the `@/` alias for all local imports.
- Ensure all new components follow the minimalist, flat design (no gradients).
- Correlation logic uses backend `converted` flag when available.
- "See All" pages leverage standard `Table` and `Badge` components.

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

### Foundation & API

- [x] FD01: Define TypeScript interfaces and API functions
  - [x] Define `UserShipmentFilter` in `types/shipment.ts`
  - [x] Define `UserLeadFilter` in `types/leads.ts`
  - [x] Add `converted` field to `Lead` type
  - [x] Add `getUserShipments` to `api/shipments/index.ts` (accepts userId + params)
  - [x] Add `getUserLeads` to `api/leads/index.ts` (accepts userId + params)
- [x] FD02: Implement React Query hooks for user shipments and estimates
  - [x] Create `useUserShipments` in `hooks/shipments/use-shipments.ts`
  - [x] Create `useUserLeads` in `hooks/leads/use-leads.ts`

### Components & Logic

- [x] CL00: Create shared UI components
  - [x] Implement `UserInfoHeader` in `components/users/user-info-header.tsx`
  - [x] Implement `ConversionBadge` in `components/ui/conversion-badge.tsx`
- [x] CL01: Implement estimate-to-shipment correlation logic
  - [x] Backend provides `converted` boolean on each lead — used directly via `ConversionBadge`

### User Details Page

- [x] UD00: Implement "Recent Shipments" card
  - [x] Add "Recent Shipments" section to `app/dashboard/users/[id]/page.tsx`
  - [x] Render top 5 shipments from the user
  - [x] Added empty state handling
- [x] UD01: Implement "Recent Shipping Estimates" card
  - [x] Add "Recent Shipping Estimates" section to `app/dashboard/users/[id]/page.tsx`
  - [x] Render top 5 estimates with ConversionBadge status
  - [x] Added empty state handling
- [x] UD02: Integrate "See All" navigation
  - [x] Add "See All" links on both cards
  - [x] Navigation works correctly with `userCode`

### Paginated Sub-Pages

- [x] SP00: Implement "See All" Shipments sub-page
  - [x] Create route `app/dashboard/users/[id]/shipments/page.tsx`
  - [x] Built table layout with pagination controls
  - [x] Fixed compact UserInfoHeader at the top
- [x] SP01: Implement "See All" Estimates sub-page
  - [x] Create route `app/dashboard/users/[id]/estimates/page.tsx`
  - [x] Built table layout with pagination controls
  - [x] Integrated `ConversionBadge` for each row

### Verification & Documentation

- [x] VD00: Verify implementation and manual testing
  - [x] `bunx tsc --noEmit` — zero errors
- [x] VD01: Update documentation and changelog
  - [x] Updated `changelog.md` with v0.4.0 entry
  - [x] Updated `package.json` version to 0.4.0
