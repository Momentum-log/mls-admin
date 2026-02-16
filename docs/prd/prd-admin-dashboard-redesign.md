# PRD: Admin Dashboard Redesign

## 1. Introduction / Overview
The goal is to redesign the MLS Admin Dashboard to provide a more visually appealing, colorful, and information-rich experience for administrators. The current dashboard is a "plain white" interface. The new design will leverage the brand color palette and include a broader range of statistics and recent activities to give a comprehensive overview of the system at a glance.

## 2. Goals
- Transform the dashboard into a modern, colorful, and professional interface.
- Display key metrics: Shipments, Revenue, Total Users, Marketing Leads, and In Transit counts.
- Show recent activities: Latest Shipments, Recent Marketing Leads (Estimates), and Recent User Signups.
- Provide quick navigation/action buttons for each statistics card or activity section.
- Enhance visual hierarchy and readability using the brand color palette.

## 3. User Stories
- As an Admin, I want to see how much revenue the system is generating at a glance.
- As an Admin, I want to see how many new users have signed up recently so I can track growth.
- As an Admin, I want to see recent shipments so I can quickly check their status.
- As an Admin, I want to see recent marketing leads (shipping estimates) to follow up on potential customers.
- As an Admin, I want a colorful and premium-feeling interface that makes managing the platform more enjoyable.

## 4. Features / Tasks

### Dashboard UI (DU)
- DU01: Implement a new grid layout for statistics cards with colorful backgrounds or accents.
- DU02: Create cards for "Total Users", "Total Shipments", "Revenue", "In Transit", and "Marketing Leads".
- DU03: Add icons to all statistics cards using the brand color palette (Brand Blue, Yellow, Accent Dark/Light).
- DU04: Implement a "Recent Activity" section with tabs or separate blocks for Shipments, Leads, and Users.
- DU05: Add "View All" buttons to each section to navigate to their respective full pages.
- DU06: Ensure the dashboard is responsive and follows the "Flat, minimalist, modern" philosophy while being colorful.

### Data Layer (DL)
- DL01: Update [DashboardStats](file:///Users/adedotungabriel/work/me/mls/mls-admin/types/dashboard.ts#6-13) interface to include `totalLeads` and `recentSignupsCount` (if not already present).
- DL02: Update [useDashboardStats](file:///Users/adedotungabriel/work/me/mls/mls-admin/hooks/dashboard/use-dashboard.ts#4-15) hook to fetch these additional statistics.
- DL03: (Optional/Future) Update the backend API `/dashboard/stats` if it doesn't already provide these extra metrics. *Note: We will start by displaying what's available and fetching other lists (recent leads/shipments) separately if needed.*
- DL04: Fetch recent shipments, leads, and users using existing API hooks or creating new ones if necessary.

## 5. Non-Goals (Out of Scope)
- Real-time notifications (WebSockets) for new events (to be handled in a separate task).
- Complex data visualization charts (will focus on cards and lists for now).
- Dark mode specific polish (the app is currently light-themed focused).

## 6. Design Considerations
- **Colors**: Use `brand-blue`, `brand-yellow`, `accent-dark` (#8b5cf6), and `accent-light` (#c3b4fc) from [globals.css](file:///Users/adedotungabriel/work/me/mls/mls-admin/app/globals.css).
- **Backgrounds**: Use subtle gradients or solid color blocks for the stat cards to make them pop.
- **Typography**: Maintain Satoshi for body and WorkSans for headings.
- **Aesthetics**: "Wow" factor with micro-animations on hover and smooth transitions.

## 7. Technical Considerations
- Use existing Shadcn components (`Card`, `Button`, `Table`, etc.) and customize them.
- Leverage Lucide-react for icons.
- Use TanStack Query for data fetching and caching.

## 8. Success Metrics
- Improved user feedback on the dashboard aesthetics.
- Faster access to key system information for administrators.

## 9. Open Questions
- Does the `/dashboard/stats` endpoint already provide "totalLeads"? (I need to verify this or fetch the leads list and get the count).
- Should we show the most recent 5 or 10 items in the "Recent Activity" sections?
