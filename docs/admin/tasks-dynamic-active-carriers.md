## Relevant Files

- `prisma/schema.prisma` - Contains the `Carrier` model which needs to be updated with `isActive` and `slug` fields.
- `src/controllers/shipment.controller.ts` - Contains the logic for `getShippingEstimate`, which needs to query the database instead of using the environment variable.
- `src/controllers/carriers.controller.ts` - Contains the admin routes for creating and updating carriers; needs validation for the new fields.
- `src/services/pricing.service.ts` - Contains logic that looks up carriers; should probably be evaluated to query by slug instead of name if possible, or left alone if name remains a unique identifier visually, but `slug` is better.
- `src/config/env.ts` - Contains `ACTIVE_CARRIERS` check that needs to be removed.
- `.env.example` - Documentation of environment variables that needs cleanup.
- `docs/setup-instructions.md` - Documentation that may reference the old environment variable and needs the post-deployment note about setting up existing carriers.

### Notes

- Ensure trailing commas and strict types are respected where appropriate.
- After PRISMA updates, remember to mention running `npx prisma generate` in instructions if the user executes it outside of the `migrate dev` command.

## Instructions for Completing Tasks

**IMPORTANT:** As you complete each task, you must check it off in this markdown file by changing `- [ ]` to `- [x]`. This helps track progress and ensures you don't skip any steps.

Example:

- `- [ ] <PREFIX>00: <Parent Task Title>` → `- [x] <PREFIX>00: <Parent Task Title>` (after completing)

Update the file after completing each sub-task, not just after completing an entire parent task.

## Tasks

### Database Schema Updates

- [ ] DB00: Update Carrier schema and run migrations
  - [ ] DB01: In `prisma/schema.prisma`, add `isActive Boolean @default(true)` to the `Carrier` model.
  - [ ] DB02: In `prisma/schema.prisma`, add `slug String @unique` to the `Carrier` model (can use `slug String? @unique` initially if there's old data, or enforce string and run a custom migration if doing a fresh wipe/re-seed isn't an issue. Since it's neon staging/prod, making it optional or providing a default like 'pending' then updating manually is safer). _Recommendation: Add `slug String @unique @default("fedex")` or similar if Prisma requires a default for existing rows._
  - [ ] DB03: Instruct the user to run `npx prisma migrate dev --name add_carrier_slug_and_active_status`.

### Shipping Estimate Controller (Backend)

- [ ] SE00: Refactor `getShippingEstimate` to use database dynamic carriers
  - [ ] SE01: Open `src/controllers/shipment.controller.ts`.
  - [ ] SE02: Remove the `getActiveCarriers()` function and its usage.
  - [ ] SE03: Modify `getShippingEstimate` to `await prisma.carrier.findMany({ where: { isActive: true } })`.
  - [ ] SE04: Add error handling to return `400` with message "No shipping methods are currently available" if the returned array is empty.
  - [ ] SE05: Update the logic to loop through the active carriers (e.g., `for (const carrier of activeCarriers)`) and use a `switch(carrier.slug)` to call the corresponding adapter (currently just `case 'fedex':`).
  - [ ] SE06: Ensure the `results` mapping injects the `carrier.name` correctly as the display name instead of hardcoded strings.

### Pricing Service Updates

- [ ] PS00: Ensure reliable pricing lookup
  - [ ] PS01: Open `src/services/pricing.service.ts`.
  - [ ] PS02: Ensure `calculateActualPrice` uses the passed identifier (name or slug) reliably. It currently uses `name`. Update it to accept and query by `slug` if possible, as looking up by `name` is prone to typos if the admin renamed it. **Note:** Be careful here as existing frontend might expect `name`. Proceed with caution and document.

### Carrier Management Controller (Admin API)

- [ ] CA00: Update Carrier management routes to accept new fields
  - [ ] CA01: Open `src/controllers/carriers.controller.ts`.
  - [ ] CA02: Update validation schemas (like `CreateCarrierSchema` and `UpdateCarrierSchema`) to include `slug` (`z.enum(["fedex"])` or standard string) and `isActive` (`z.boolean().optional()`).
  - [ ] CA03: Ensure the `createCarrier` and `updateCarrier` database mutations push `slug` and `isActive` to Prisma.

### Environment Cleanup

- [ ] EN00: Remove `ACTIVE_CARRIERS` references and clean up configs
  - [ ] EN01: Open `src/config/env.ts` and delete the `ACTIVE_CARRIERS` key from the Zod schema.
  - [ ] EN02: Open `.env.example` and `.env` and remove `ACTIVE_CARRIERS`.
  - [ ] EN03: Update `docs/setup-instructions.md` (or `changelog.md`) noting that `ACTIVE_CARRIERS` is deprecated. Add a huge bold note: **"BREAKING: Admins must delete the old FedEx DB record and recreate it with the slug 'fedex' for estimates to work post-deployment."**
