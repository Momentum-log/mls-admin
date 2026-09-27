# MLS Admin Dashboard

A comprehensive, enterprise-grade admin dashboard built with [Next.js](https://nextjs.org) and [TypeScript](https://www.typescriptlang.org/) for managing Multi-List Service (MLS) operations. The application provides a full-featured administrative interface for user management, staff administration, carrier management, shipment tracking, commission management, and role-based access control.

## Table of Contents

- [Project Overview](#project-overview)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Running the Application](#running-the-application)
- [Available Commands](#available-commands)
- [Core Features Documentation](#core-features-documentation)
- [API Routes](#api-routes)
- [Configuration](#configuration)
- [Environment Setup](#environment-setup)
- [Development Guidelines](#development-guidelines)
- [Testing & Quality](#testing--quality)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [Resources](#resources)

## Project Overview

MLS Admin is a sophisticated administrative platform designed to manage complex shipping and logistics operations. It serves as a centralized hub for administrators to oversee users, staff members, carriers, shipments, commissions, and security policies. The dashboard features role-based access control (RBAC), ensuring that different user roles have appropriate permissions and visibility into system operations.

**Status**: Production-Ready Admin Dashboard  
**Framework**: Next.js 14+ with App Router  
**Language**: TypeScript  
**Styling**: Tailwind CSS with shadcn/ui Components  
**Package Manager**: Bun

## Features

### Core Administrative Features

- **Authentication & Authorization**
  - Secure login system with session management
  - Role-based access control (RBAC) with customizable permissions
  - Permission guards and protected routes
  - Multi-level user authentication

- **User Management**
  - Comprehensive user directory with search and filtering
  - User profile management with detailed information
  - User shipment history and tracking
  - Shipping estimate management per user
  - Bulk user operations and management tools
  - User activity auditing

- **Staff Management**
  - Complete staff directory with role assignments
  - Staff profile management
  - Role-based staff organization
  - Staff detail sheets for comprehensive information
  - Staff activity tracking and logs

- **Carrier Management**
  - Dynamic carrier listing and configuration
  - Carrier detail management
  - Commission and threshold configuration per carrier
  - Global commission settings
  - Carrier-specific commission editor
  - Threshold-based rate management

- **Shipment Management**
  - Complete shipment lifecycle management
  - Shipment status override capabilities
  - Payment bypass options for shipments
  - Shipment detail views with comprehensive information
  - Shipment history and tracking
  - Estimate detail management
  - Bulk operations on shipments
  - Status tracking and modifications

- **Commission Management**
  - Per-carrier commission configuration
  - Global commission settings and templates
  - Commission editor interface
  - Threshold-based commission tiers
  - Commission reporting and tracking
  - PayU activity integration for payment tracking

- **Address Management**
  - Address request management and review
  - Address verification and validation
  - Bulk address operations
  - Address request status tracking

- **Dashboard & Analytics**
  - Customizable admin dashboard
  - Real-time statistics and metrics
  - Quick access to key operations
  - Dashboard redesign and polish features

- **Security**
  - Security settings and policies
  - Password rotation requirements
  - Security event logging
  - Audit trails for admin activities
  - Permission-based access controls

- **Admin Profile Management**
  - Comprehensive admin profile information
  - Password change and security settings
  - Activity logs for audit purposes
  - Documentation viewer
  - Profile detail management

- **Leads Management**
  - Marketing leads tracking
  - Lead status management
  - Lead conversion tracking
  - Bulk lead operations

- **Settings Management**
  - System-wide configuration
  - User preferences
  - Notification settings
  - API integration settings

## Tech Stack

### Frontend
- **Framework**: [Next.js 14+](https://nextjs.org) with App Router
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **State Management**: React Hooks with custom hooks
- **API Client**: Built-in Next.js API integration

### Backend
- **Runtime**: Node.js (via Next.js API Routes)
- **API Framework**: Next.js API Routes
- **Database Communication**: API routes with external backend integration

### Development Tools
- **Package Manager**: [Bun](https://bun.sh/)
- **Linter**: ESLint with TypeScript support
- **Build Tool**: Next.js built-in bundler
- **Code Formatting**: Configured via ESLint config

### Core Dependencies
- React 18+
- Next.js 14+
- TypeScript
- Tailwind CSS
- shadcn/ui Components
- React Hot Toast (notifications)
- Middleware integration for auth

## Project Structure

```
mls-admin/
├── .agent/                          # Agent rules and instructions
│   └── rules/
│       ├── api-integration-guide.md
│       └── instruction.md
├── api/                             # Backend API routes
│   ├── admin/                       # Admin-specific endpoints
│   │   ├── address-requests/
│   │   └── security/
│   ├── auth/                        # Authentication endpoints
│   ├── carriers/                    # Carrier management endpoints
│   ├── dashboard/                   # Dashboard data endpoints
│   ├── leads/                       # Leads management endpoints
│   ├── profile/                     # Admin profile endpoints
│   ├── settings/                    # Settings endpoints
│   ├── shipments/                   # Shipment management endpoints
│   ├── shipping/                    # Shipping estimate endpoints
│   ├── staff/                       # Staff management endpoints
│   ├── users/                       # User management endpoints
│   └── index.ts                     # API base exports
├── app/                             # Next.js app directory
│   ├── dashboard/                   # Main dashboard layout
│   │   ├── address-requests/        # Address request page
│   │   ├── carriers/                # Carrier management page
│   │   ├── denied/                  # Access denied page
│   │   ├── leads/                   # Leads management page
│   │   ├── security/                # Security settings page
│   │   ├── shipments/               # Shipment management pages
│   │   │   ├── new/                 # New shipment creation
│   │   │   └── page.tsx
│   │   ├── staff/                   # Staff management pages
│   │   │   ├── roles-table.tsx
│   │   │   └── staff-table.tsx
│   │   ├── users/                   # User management pages
│   │   │   ├── [id]/                # User detail pages
│   │   │   │   ├── estimates/
│   │   │   │   ├── shipments/
│   │   │   │   └── page.tsx
│   │   │   └── page.tsx
│   │   ├── layout.tsx               # Dashboard layout wrapper
│   │   └── page.tsx                 # Dashboard home page
│   ├── login/                       # Login page
│   ├── globals.css                  # Global styles
│   ├── layout.tsx                   # Root layout
│   └── page.tsx                     # Home page
├── components/                      # React components
│   ├── admin/                       # Admin-specific components
│   │   └── bulk-delete-bar.tsx
│   ├── admin-profile/               # Admin profile components
│   │   ├── ActivityLogs.tsx
│   │   ├── AdminProfileDrawer.tsx
│   │   ├── DocsViewer.tsx
│   │   ├── PasswordChange.tsx
│   │   └── ProfileDetails.tsx
│   ├── carriers/                    # Carrier components
│   │   ├── carrier-detail-sheet.tsx
│   │   ├── commission-editor.tsx
│   │   ├── global-commission-sheet.tsx
│   │   └── threshold-editor.tsx
│   ├── shipments/                   # Shipment components
│   │   ├── bypass-payment-modal.tsx
│   │   ├── estimate-detail-sheet.tsx
│   │   ├── override-status-modal.tsx
│   │   └── shipment-detail-sheet.tsx
│   ├── staff/                       # Staff components
│   │   └── staff-detail-sheet.tsx
│   ├── ui/                          # Shared UI components (shadcn/ui)
│   │   ├── accordion.tsx
│   │   ├── alert-dialog.tsx
│   │   ├── avatar.tsx
│   │   ├── badge.tsx
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── checkbox.tsx
│   │   ├── confirm-dialog.tsx
│   │   ├── conversion-badge.tsx
│   │   ├── copy-button.tsx
│   │   ├── dialog.tsx
│   │   ├── dropdown-menu.tsx
│   │   ├── form.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   ├── permission-selector.tsx
│   │   ├── scroll-area.tsx
│   │   ├── select.tsx
│   │   ├── separator.tsx
│   │   ├── sheet.tsx
│   │   ├── switch.tsx
│   │   ├── table.tsx
│   │   ├── tabs.tsx
│   │   └── textarea.tsx
│   ├── users/                       # User components
│   │   └── user-info-header.tsx
│   ├── admin-sidebar.tsx            # Main sidebar navigation
│   ├── admin-topbar.tsx             # Top navigation bar
│   ├── login-background.tsx         # Login page background
│   ├── permission-guard.tsx         # Permission verification component
│   └── providers.tsx                # Context providers and setup
├── hooks/                           # Custom React hooks
│   ├── admin/                       # Admin-related hooks
│   │   ├── use-address-requests.ts
│   │   └── use-security.ts
│   ├── admin-profile/               # Admin profile hooks
│   │   └── use-admin-profile.ts
│   ├── auth/                        # Authentication hooks
│   │   └── use-auth.ts
│   ├── carriers/                    # Carrier management hooks
│   │   └── use-carriers.ts
│   ├── dashboard/                   # Dashboard hooks
│   │   └── use-dashboard.ts
│   ├── leads/                       # Leads management hooks
│   │   └── use-leads.ts
│   ├── settings/                    # Settings hooks
│   │   └── use-settings.ts
│   ├── shipments/                   # Shipment hooks
│   │   └── use-shipments.ts
│   ├── shipping/                    # Shipping estimates hooks
│   │   └── use-shipping.ts
│   ├── staff/                       # Staff management hooks
│   │   └── use-staff.ts
│   ├── users/                       # User management hooks
│   │   └── use-users.ts
│   ├── use-debounce.ts              # Debounce utility hook
│   └── use-permissions.ts           # Permission checking hook
├── lib/                             # Utility libraries
│   └── utils.ts                     # Common utility functions
├── types/                           # TypeScript type definitions
│   ├── address-request.ts
│   ├── admin-user-resources.ts
│   ├── auth.ts
│   ├── carriers.ts
│   ├── dashboard.ts
│   ├── leads.ts
│   ├── profile.ts
│   ├── settings.ts
│   ├── shipment.ts
│   ├── shipping-estimate.ts
│   ├── staff.ts
│   └── user.ts
├── utils/                           # Utility functions
│   ├── estimate-shipment-correlation.ts
│   ├── format-currency.ts
│   ├── format-date.ts
│   └── format-phone.ts
├── public/                          # Static assets
│   ├── fonts/                       # Custom fonts (Satoshi, Work Sans)
│   ├── images/                      # Brand images and logos
│   └── favicon.svg
├── docs/                            # Comprehensive documentation
│   ├── admin/                       # Admin feature documentation
│   │   ├── admin-comprehensive-guide.md
│   │   ├── admin.openapi.json
│   │   ├── environment-setup-guide.md
│   │   ├── marketing-leads-guide.md
│   │   ├── permissions.ts
│   │   ├── prd-admin-rbac-management.md
│   │   ├── prd-dynamic-active-carriers.md
│   │   ├── rbac-client-integration-guide.md
│   │   ├── rbac-guide.md
│   │   ├── role-management-guide.md
│   │   ├── shipment-management-guide.md
│   │   ├── staff-management-guide.md
│   │   ├── tasks-admin-rbac.md
│   │   ├── tasks-dynamic-active-carriers.md
│   │   └── user-management-guide.md
│   ├── prd/                         # Product requirement documents
│   │   ├── prd-admin-address-requests-management.md
│   │   ├── prd-admin-basic-setup.md
│   │   ├── prd-admin-dashboard-redesign.md
│   │   ├── prd-admin-dynamic-carriers.md
│   │   ├── prd-admin-profile-documentation.md
│   │   ├── prd-admin-rbac-management-ui.md
│   │   ├── prd-carrier-commission-management.md
│   │   ├── prd-commission-and-admin-profile.md
│   │   ├── prd-dashboard-polish-admin-features.md
│   │   ├── prd-login-toast-redesign.md
│   │   ├── prd-super-admin-password-rotation.md
│   │   └── prd-user-details-shipments-estimates.md
│   ├── tasks/                       # Task tracking and implementation guides
│   │   ├── tasks-admin-profile-documentation.md
│   │   ├── tasks-admin-rbac-management-ui.md
│   │   ├── tasks-carrier-commission-management.md
│   │   ├── tasks-dashboard-polish-admin-features.md
│   │   └── tasks-user-details-shipments-estimates.md
│   ├── review/                      # Code review documentation
│   │   └── code-cleanup-2026-02-24-admin-dashboard-cleanup-1.md
│   ├── address-verification-client-integration-guide.md
│   ├── admin-client-integration-guide.md
│   ├── admin-comprehensive-spec.md
│   ├── admin-implementation-guide.md
│   ├── admin-workflow.md
│   ├── client-integration-guide-v2.md
│   ├── client-side-user-resources-implementation.md
│   ├── commission-management-guide.md
│   ├── commission-payu-activity-guide.md
│   ├── commission-system-guide.md
│   ├── prd-admin-user-resources-v2.md
│   ├── prd-staff-and-carrier-management.md
│   └── react-hot-toast-docs.md
├── middleware.ts                    # Next.js middleware for auth/routing
├── next.config.ts                   # Next.js configuration
├── tsconfig.json                    # TypeScript configuration
├── package.json                     # Project dependencies
├── postcss.config.mjs               # PostCSS configuration for Tailwind
├── components.json                  # shadcn/ui configuration
├── eslint.config.mjs                # ESLint configuration
├── changelog.md                     # Project changelog
├── vercel.json                      # Vercel deployment configuration
└── README.md                        # This file
```

## Prerequisites

Before setting up the project, ensure you have the following installed:

- **Node.js**: v18.0 or higher (LTS recommended)
- **Bun**: Latest version ([Install Bun](https://bun.sh))
- **Git**: For version control
- **A Modern Code Editor**: VS Code recommended with TypeScript support

### System Requirements
- RAM: 2GB minimum, 4GB+ recommended
- Storage: 500MB for node_modules
- OS: macOS, Linux, or Windows (with WSL2 recommended)

## Installation

### 1. Clone the Repository
```bash
git clone https://github.com/your-org/mls-admin.git
cd mls-admin
```

### 2. Install Dependencies
Using Bun (recommended):
```bash
bun install
```

Or using npm:
```bash
npm install
```

Or using yarn:
```bash
yarn install
```

### 3. Configure Environment Variables
Create a `.env.local` file in the project root:
```bash
cp .env.example .env.local  # if available
# or create it manually with required variables
```

Required environment variables:
```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=http://localhost:3000/api

# Authentication
NEXT_PUBLIC_AUTH_URL=http://localhost:3000

# Database (if applicable)
DATABASE_URL=your_database_url

# Third-party Services
NEXT_PUBLIC_THIRD_PARTY_API_KEY=your_key

# Feature Flags
NEXT_PUBLIC_ENABLE_FEATURE_X=true
```

## Running the Application

### Development Mode
```bash
# Using Bun (recommended)
bun run dev

# Using npm
npm run dev

# Using yarn
yarn dev

# Using pnpm
pnpm dev
```

The application will be available at **[http://localhost:3000](http://localhost:3000)**

### Production Build
```bash
# Build the application
bun run build
# or
npm run build

# Run production server
bun run start
# or
npm run start
```

### Debug Mode
```bash
# Run with verbose logging
DEBUG=* bun run dev
```

## Available Commands

### Development
- `bun run dev` - Start development server with hot reload
- `bun run build` - Create optimized production build
- `bun run start` - Start production server
- `bun run lint` - Run ESLint to check code quality

### Code Quality
- `bun run lint` - Check TypeScript and ESLint issues
- `bun run lint:fix` - Auto-fix linting issues
- `bun run type-check` - Run TypeScript type checking

### Build & Deployment
- `bun run build` - Build for production
- `bun run start` - Start production server
- `bun run preview` - Preview production build locally

### Testing (if configured)
- `bun run test` - Run test suite
- `bun run test:watch` - Run tests in watch mode

## Core Features Documentation

### Authentication & Authorization
Comprehensive authentication system with session management and role-based access control. See [docs/admin/rbac-guide.md](docs/admin/rbac-guide.md) for detailed information.

### User Management
Complete user lifecycle management from creation to tracking shipments. Documentation: [docs/admin/user-management-guide.md](docs/admin/user-management-guide.md)

### Staff Management
Administrative staff organization with role assignments. Reference: [docs/admin/staff-management-guide.md](docs/admin/staff-management-guide.md)

### Carrier Management
Dynamic carrier configuration and management. See: [docs/admin/prd-dynamic-active-carriers.md](docs/admin/prd-dynamic-active-carriers.md)

### Commission Management
Sophisticated commission system with per-carrier and global settings. Details: [docs/commission-management-guide.md](docs/commission-management-guide.md)

### Shipment Management
End-to-end shipment lifecycle tracking and management. Guide: [docs/admin/shipment-management-guide.md](docs/admin/shipment-management-guide.md)

### Dashboard & Analytics
Real-time dashboard with key metrics and quick actions. See: [docs/prd/prd-admin-dashboard-redesign.md](docs/prd/prd-admin-dashboard-redesign.md)

For comprehensive feature documentation, refer to the [docs/](docs/) directory.

## API Routes

The application provides a complete REST API through Next.js API routes:

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `GET /api/auth/session` - Get current session

### Users
- `GET /api/users` - List all users
- `GET /api/users/[id]` - Get user details
- `POST /api/users` - Create new user
- `PUT /api/users/[id]` - Update user
- `DELETE /api/users/[id]` - Delete user

### Staff
- `GET /api/staff` - List all staff
- `GET /api/staff/[id]` - Get staff details
- `POST /api/staff` - Create new staff member
- `PUT /api/staff/[id]` - Update staff
- `DELETE /api/staff/[id]` - Delete staff member

### Carriers
- `GET /api/carriers` - List all carriers
- `GET /api/carriers/[id]` - Get carrier details
- `POST /api/carriers` - Create new carrier
- `PUT /api/carriers/[id]` - Update carrier
- `DELETE /api/carriers/[id]` - Delete carrier

### Shipments
- `GET /api/shipments` - List all shipments
- `GET /api/shipments/[id]` - Get shipment details
- `POST /api/shipments` - Create new shipment
- `PUT /api/shipments/[id]` - Update shipment status
- `DELETE /api/shipments/[id]` - Cancel shipment

### Dashboard
- `GET /api/dashboard` - Get dashboard metrics and data

### Admin Functions
- `GET /api/admin/security` - Get security settings
- `POST /api/admin/security` - Update security settings
- `GET /api/admin/address-requests` - List address requests
- `PUT /api/admin/address-requests/[id]` - Update address request

For the complete OpenAPI specification, see [docs/admin/admin.openapi.json](docs/admin/admin.openapi.json)

## Configuration

### TypeScript Configuration
The project uses a strict TypeScript configuration. See [tsconfig.json](tsconfig.json) for details.

### Styling Configuration
- **CSS Framework**: Tailwind CSS configured in [postcss.config.mjs](postcss.config.mjs)
- **UI Components**: shadcn/ui configuration in [components.json](components.json)
- **Custom Fonts**: Satoshi and Work Sans fonts included in [public/fonts/](public/fonts/)

### ESLint Configuration
Code quality rules are defined in [eslint.config.mjs](eslint.config.mjs). Run `npm run lint` to check for issues.

### Next.js Configuration
Server and build settings in [next.config.ts](next.config.ts)

### Middleware
Custom middleware for authentication and routing in [middleware.ts](middleware.ts)

## Environment Setup

### Development Environment
1. Install Node.js 18+ and Bun
2. Clone the repository
3. Run `bun install`
4. Create `.env.local` with appropriate variables
5. Run `bun run dev`

### Production Environment
1. Set up a secure hosting environment (Vercel recommended)
2. Configure environment variables on the hosting platform
3. Run `bun run build` to create optimized build
4. Deploy using `bun run start` or platform-specific deployment

### Docker Setup (Optional)
If containerization is needed, add Dockerfile and docker-compose.yml:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package.json bun.lock ./
RUN npm install -g bun && bun install
COPY . .
RUN bun run build
EXPOSE 3000
CMD ["bun", "run", "start"]
```

## Development Guidelines

### Code Style
- **Language**: TypeScript with strict mode enabled
- **Formatting**: Follow ESLint rules
- **Naming**: Use camelCase for variables, PascalCase for components
- **Component Structure**: Functional components with hooks

### Component Creation
1. Create component in appropriate `/components` subdirectory
2. Use TypeScript interfaces for props
3. Export component as default export
4. Create stories if using Storybook

### Hook Development
1. Place hooks in `/hooks` with appropriate subfolder
2. Prefix with `use-` following React conventions
3. Document with JSDoc comments
4. Handle error states and loading states

### API Route Development
1. Create routes in `/api` matching feature structure
2. Implement proper error handling
3. Add type safety with TypeScript
4. Include appropriate HTTP status codes

### State Management
- Use React Context + Hooks for global state
- Use custom hooks for feature-specific state
- Consider async operations with proper loading/error handling

### Testing Best Practices
- Write unit tests for utilities and hooks
- Create integration tests for critical flows
- Test API routes independently
- Mock external API calls

## Testing & Quality

### Code Quality Checks
```bash
# Run ESLint
bun run lint

# Run TypeScript type checking
bun run type-check

# Fix linting issues
bun run lint:fix
```

### Testing
```bash
# Run test suite (when configured)
bun run test

# Run tests in watch mode
bun run test:watch

# Generate coverage report
bun run test:coverage
```

## Deployment

### Vercel (Recommended)
The project includes `vercel.json` for optimal Vercel deployment:

```bash
# Deploy using Vercel CLI
vercel deploy

# Deploy to production
vercel deploy --prod
```

Vercel automatically:
- Builds the Next.js application
- Sets environment variables
- Configures serverless functions
- Manages CDN and caching

### Manual Deployment
```bash
# Build
bun run build

# Set environment variables on your server
export NODE_ENV=production
export NEXT_PUBLIC_API_BASE_URL=https://your-domain.com

# Start server
bun run start
```

### Docker Deployment
```bash
# Build Docker image
docker build -t mls-admin:latest .

# Run container
docker run -p 3000:3000 -e NODE_ENV=production mls-admin:latest
```

### Performance Optimization
- Next.js automatically optimizes bundle size
- Images are optimized using Next Image
- CSS is minified and tree-shaken
- JavaScript code splitting is automatic

## Contributing

### Development Workflow
1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make your changes with atomic commits
3. Push to your branch: `git push origin feature/your-feature`
4. Create a Pull Request with detailed description
5. Ensure all checks pass (linting, types, tests)

### Code Review
- All PRs require code review
- Follow the existing code style and patterns
- Update tests and documentation as needed
- Keep commits atomic and meaningful

### Commit Messages
Follow conventional commits:
- `feat: Add new feature`
- `fix: Fix bug in component`
- `docs: Update documentation`
- `refactor: Improve code structure`
- `test: Add or update tests`

## Resources

### Official Documentation
- [Next.js Documentation](https://nextjs.org/docs)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev)
- [shadcn/ui Components](https://ui.shadcn.com/)

### Project Documentation
- [Admin Comprehensive Guide](docs/admin/admin-comprehensive-guide.md)
- [Environment Setup Guide](docs/admin/environment-setup-guide.md)
- [RBAC Implementation](docs/admin/rbac-guide.md)
- [API Integration Guide](.agent/rules/api-integration-guide.md)

### Related Guides
- [Commission Management](docs/commission-management-guide.md)
- [Shipment Management](docs/admin/shipment-management-guide.md)
- [Staff Management](docs/admin/staff-management-guide.md)
- [User Management](docs/admin/user-management-guide.md)

### Useful Tools
- [Vercel Platform](https://vercel.com)
- [Next.js CLI](https://nextjs.org/docs/app/api-reference/cli)
- [TypeScript Compiler](https://www.typescriptlang.org/download)
- [ESLint](https://eslint.org/)

### Performance & Monitoring
- Monitor application performance in production
- Set up error tracking (Sentry recommended)
- Monitor API response times
- Track user analytics

## Troubleshooting

### Common Issues

**Port 3000 already in use**
```bash
# Kill the process using port 3000
lsof -ti:3000 | xargs kill -9

# Or specify a different port
PORT=3001 bun run dev
```

**Dependencies not installing**
```bash
# Clear Bun cache
bun run install --force

# Or reinstall from scratch
rm -rf node_modules bun.lock
bun install
```

**TypeScript errors after pulling changes**
```bash
# Rebuild TypeScript types
bun run type-check

# Clear Next.js cache
rm -rf .next
bun run build
```

**Environment variables not loading**
- Ensure `.env.local` file exists in project root
- Verify variable names match exactly
- Restart development server after changes
- Check for typos in variable names

## Project Changelog

See [changelog.md](changelog.md) for detailed version history and updates.

## License

This project is proprietary software. All rights reserved.

---

**Last Updated**: May 18, 2026  
**Current Version**: Refer to [changelog.md](changelog.md) for version information  
**Maintained By**: MLS Admin Team
