# PRD: Admin Address Requests Management

## 1. Introduction / Overview

This feature adds a complete admin-side workflow to review user address verification submissions from the new **Address Requests** sidebar tab.

Users now submit address update requests with one proof-of-address file (PDF/PNG/JPG). Admins must review each request and choose to **approve** or **reject** it.

The goal is to provide an efficient, simplified, and high-quality admin experience that enables fast, accurate review decisions while preserving a full audit trail.

## 2. Goals

1. Enable admins to process address verification requests end-to-end from a single management area.
2. Reduce friction in review by supporting fast file access and clear request context.
3. Ensure every request action is traceable through a visible timeline (who did what, when, and why).
4. Maintain backend-compatible behavior for approval/rejection actions and concurrency handling.
5. Improve operational speed with a measurable review-time target.

## 3. User Stories

1. As an admin, I want to view all submitted address requests with status filters so I can quickly find requests that need action.
2. As an admin, I want to open proof files in a new browser tab so I can inspect documents at full size without losing workflow context.
3. As an admin, I want to approve valid requests and optionally include notes so decisions are documented.
4. As an admin, I want to reject invalid requests with mandatory notes so users receive clear feedback.
5. As an admin, I want to see a complete request timeline so I can audit submission, review, and decision events.
6. As an admin, I want reliable conflict handling when another admin has already processed a request so I do not make duplicate decisions.

## 4. Features / Tasks

- **Admin Navigation (AN)**
  - AN01: Add and expose the **Address Requests** tab in the admin sidebar navigation.
  - AN02: Wire tab routing to the address request management page in the dashboard area.

- **Request Listing (RL)**
  - RL01: Build a request list view that loads **all requests by default**.
  - RL02: Add status filter controls for `PENDING`, `APPROVED`, and `REJECTED`.
  - RL03: Add server-driven pagination controls for large result sets.
  - RL04: Display core columns: request ID, user identity, submitted date/time, status, and latest decision info.
  - RL05: Add loading, empty, and error states for list fetch operations.

- **Request Details (RD)**
  - RD01: Build a request details view/drawer/page for a selected request.
  - RD02: Show submitted address fields exactly as provided by the user.
  - RD03: Show current active user address context (if available from backend details endpoint).
  - RD04: Render current request metadata (status, createdAt, reviewedAt, reviewer).
  - RD05: Render latest admin feedback/notes when present.

- **Proof File Access (PF)**
  - PF01: Add a **View Proof** action on each request details view.
  - PF02: Implement proof viewing behavior to **open file in a new browser tab**.
  - PF03: Support both PDF and image proofs through backend inline streaming endpoint.
  - PF04: Handle unavailable/expired proof file responses with clear error messaging.

- **Decision Actions (DA)**
  - DA01: Add **Approve** action for pending requests.
  - DA02: Add **Reject** action for pending requests.
  - DA03: Enforce notes behavior: reject notes are **required**; approve notes are **optional**.
  - DA04: Validate required reject notes on client before API call.
  - DA05: Submit approve action through admin approve endpoint and refresh affected UI state.
  - DA06: Submit reject action through admin reject endpoint and refresh affected UI state.
  - DA07: Prevent duplicate clicks during in-flight decision actions.
  - DA08: Show success and failure toast/messages for decision outcomes.

- **Concurrency & Conflict Handling (CC)**
  - CC01: Implement first-action-wins UX handling for already-processed requests.
  - CC02: On conflict/error from backend (request already processed), show a clear message and auto-refresh request state.
  - CC03: Disable decision controls for non-pending requests after state refresh.

- **Timeline / Audit Visibility (TA)**
  - TA01: Render a full request timeline in details view.
  - TA02: Include key events: request submitted, reviewed, approved/rejected, actor identity, timestamps, and notes.
  - TA03: Ensure timeline updates immediately after decision actions complete.

- **API Integration (AI)**
  - AI01: Integrate list endpoint: `GET /api/admin/address-requests?status=&page=&limit=`.
  - AI02: Integrate details endpoint: `GET /api/admin/address-requests/:requestId`.
  - AI03: Integrate proof endpoint: `GET /api/admin/address-requests/:requestId/proof-file`.
  - AI04: Integrate approve endpoint: `POST /api/admin/address-requests/:requestId/approve`.
  - AI05: Integrate reject endpoint: `POST /api/admin/address-requests/:requestId/reject`.

- **Quality & Testing (QT)**
  - QT01: Add component-level tests for list filters, details rendering, and state transitions.
  - QT02: Add action tests for approve/reject validation behavior (reject notes required, approve notes optional).
  - QT03: Add integration tests for first-action-wins conflict handling.
  - QT04: Add manual QA checklist for file opening behavior in new tab (PDF and PNG/JPG).

## 5. Non-Goals (Out of Scope)

No explicit out-of-scope items were defined by stakeholder for this phase. This PRD intentionally does not restrict future enhancements unless they conflict with the goals above.

## 6. Design Considerations

1. The UI should prioritize speed and readability over visual complexity.
2. The list page should minimize clicks: filter quickly, select row, review, decide.
3. Use clear status badges and concise visual hierarchy for request urgency and state.
4. Keep decision actions prominent in the details view but safe against accidental action (confirmation step recommended).
5. For proof review, opening in new tab is the required baseline interaction.

## 7. Technical Considerations

1. Use existing admin API modules and hooks patterns already present in the codebase.
2. Reuse existing table, badge, modal/drawer, and toast components where possible for consistency.
3. Respect backend business rules from address verification flow:
   - One proof file per request.
   - Supported proof types are PDF/PNG/JPG.
   - Backend may delete proof files after final decision.
4. Frontend must handle proof endpoint failures gracefully (missing/deleted file scenarios).
5. Client-side state should always reconcile with backend source-of-truth after approve/reject actions.
6. Concurrency policy is first action wins; backend response must drive final UI state.

## 8. Success Metrics

1. Functional success: admins can process requests end-to-end (list, review proof, approve/reject with notes rule, timeline visibility) without blockers.
2. Speed success: median time from opening a request to final decision is **under 3 minutes** during normal operations.
3. Reliability success: 0 duplicate-processing outcomes from concurrent admin actions in production workflows (conflicts handled cleanly).

## 9. Open Questions

1. Should approve notes be displayed to users, or remain internal admin-only metadata?
2. Should request timeline include non-decision view events (for example, when admin opens details)?
3. Should the list default sort be newest-first, oldest-first, or status-priority-first?
4. Should there be a confirmation modal for both approve and reject, or reject only?
5. Should conflict refresh happen silently or with a mandatory alert acknowledgment?
