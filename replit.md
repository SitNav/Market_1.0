# Replit.md - Terra Marketplace Platform

## Overview

This is a full-stack web application built as a marketplace platform for community resources and services. The application uses a modern tech stack with React/TypeScript frontend, Express.js backend, and PostgreSQL database with Drizzle ORM. It's designed to help users share and find resources like housing, employment, food, education, and other community services.

## User Preferences

Preferred communication style: Simple, everyday language.
Skip Stripe payment integration until the end of the development process.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Routing**: Wouter for client-side routing
- **Styling**: Tailwind CSS with custom theme and shadcn/ui components
- **State Management**: React Query (@tanstack/react-query) for server state
- **Build Tool**: Vite for development and bundling
- **UI Components**: Radix UI primitives with custom styling

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database**: PostgreSQL with Drizzle ORM for type-safe queries
- **Authentication**: Replit's OpenID Connect (OIDC) authentication system
- **Session Management**: Express sessions with PostgreSQL storage
- **File Uploads**: Multer for handling image uploads
- **Development**: Hot module replacement via Vite middleware

## Key Components

### Database Schema
- **Users**: Stores user profiles with Replit auth integration
- **Categories**: Categorizes listings (housing, employment, food, etc.)
- **Listings**: Main marketplace items with pricing, descriptions, and images
- **Messages**: Communication between users about listings
- **Reports**: Content moderation system
- **Sessions**: Session storage for authentication

### Authentication System
- Replit OIDC integration with automatic user provisioning
- Session-based authentication with PostgreSQL storage
- Role-based access control (regular users vs admins)
- Profile management with phone verification

### File Management
- Local file storage in `/uploads` directory
- Image validation and processing
- File serving through Express static middleware

### API Structure
- RESTful API endpoints under `/api`
- Authentication middleware for protected routes
- Error handling with consistent JSON responses
- File upload endpoints for listing images

## Data Flow

1. **User Authentication**: Users authenticate via Replit OIDC, sessions stored in PostgreSQL
2. **Listing Creation**: Users create listings with categories, pricing, and image uploads
3. **Marketplace Browsing**: Real-time search and filtering of listings by category/location
4. **Messaging System**: Direct communication between users through the platform
5. **Admin Moderation**: Report system for content moderation with admin dashboard

## External Dependencies

### Core Dependencies
- **@neondatabase/serverless**: PostgreSQL database driver
- **drizzle-orm**: Type-safe ORM for database operations
- **@radix-ui/***: Headless UI components
- **@tanstack/react-query**: Server state management
- **multer**: File upload handling
- **passport**: Authentication middleware
- **openid-client**: OIDC authentication

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety across the stack
- **Tailwind CSS**: Utility-first styling
- **ESBuild**: Server-side bundling for production

## Deployment Strategy

### Development
- Vite dev server with hot module replacement
- Express server with middleware integration
- Database migrations via Drizzle Kit
- File uploads stored locally

### Production
- Static assets built and served by Express
- Server bundled with ESBuild
- Database migrations applied via `drizzle-kit push`
- Environment variables for database and session configuration

### Environment Configuration
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `REPLIT_DOMAINS`: Allowed domains for OIDC
- `ISSUER_URL`: OIDC issuer endpoint

The architecture emphasizes type safety, real-time updates, and a smooth user experience while maintaining security through proper authentication and session management.

## Mobile App Features

### PWA Capabilities
- **Progressive Web App**: Fully functional mobile app with offline capabilities
- **Service Worker**: Caches resources for offline usage and faster loading
- **App Manifest**: Configures app installation and appearance on mobile devices
- **Mobile-First Design**: Responsive layouts optimized for mobile screens

### Mobile Components
- **MobileLayout**: Wrapper component that provides mobile-specific layout structure
- **MobileNavigation**: Bottom navigation bar with touch-friendly tab navigation
- **MobileSearch**: Touch-optimized search interface with filters and location services
- **MobileProductCard**: Compact product cards designed for mobile browsing

### Mobile Features
- **Touch-Friendly Interface**: Optimized button sizes and touch targets
- **Responsive Grid System**: 2-column mobile grid for optimal product display
- **Mobile-Optimized Forms**: Touch-friendly form inputs and controls
- **Swipe Navigation**: Smooth mobile navigation between different sections

## Recent Changes

### July 16, 2025
- ✅ Fixed application startup and database connectivity issues
- ✅ Integrated TerraNav Services company logo throughout the application
- ✅ Resolved authentication system infinite loop issues
- ✅ Seeded database with essential categories (housing, food, employment, healthcare, education, transportation, legal aid, community services)
- ✅ Application successfully running with full marketplace functionality
- ✅ All core features operational: user auth, listings, search, admin dashboard
- ✅ **Mobile App Conversion**: Converted web application into fully functional mobile app with PWA capabilities
- ✅ **Mobile Components**: Created comprehensive mobile UI components including MobileLayout, MobileNavigation, MobileSearch, and MobileProductCard
- ✅ **PWA Features**: Implemented Progressive Web App features with manifest.json, service worker, and mobile-optimized meta tags
- ✅ **Responsive Design**: Added mobile-first responsive design with touch-friendly interfaces and optimized layouts
- ✅ **Mobile Navigation**: Bottom navigation bar for mobile devices with tab-based navigation system