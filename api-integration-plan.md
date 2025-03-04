# API Integration Plan: Connecting the Frontend Dashboard to Backend

## Overview

This document outlines the comprehensive plan for replacing mock data in the analytics dashboard with real data from the NestJS backend API. The plan covers authentication, API client implementation, data fetching strategies, error handling, and performance optimization.

## Current State Analysis

### Frontend (Next.js)
- Currently using mock data hardcoded in the dashboard components (`frontend/app/dashboard/analytics/page.tsx`)
- Export functionality working with mock data (CSV in `frontend/lib/csv-export.ts` and PDF in `frontend/lib/pdf-export.ts`)
- UI components implemented for displaying various analytics metrics
- Period selection implemented but not connected to real data
- Using Supabase for authentication (`frontend/lib/supabase.ts`) but not connecting to NestJS backend

### Backend (NestJS)
- Comprehensive analytics API available at `backend/src/modules/analytics/controllers/analytics.controller.ts` with endpoints:
  - Sales data (`/analytics/sales` with `startDate` and `endDate` parameters)
  - Inventory analytics (`/analytics/inventory` with `date` parameter)
  - Customer insights (`/analytics/customers` with `startDate` and `endDate` parameters)
  - Real-time dashboard data (`/analytics/realtime/dashboard`)
  - Product performance (`/analytics/products/performance` with `startDate` and `endDate` parameters)
  - Category performance (`/analytics/categories/performance` with `startDate` and `endDate` parameters)
  - Traffic sources (`/analytics/traffic-sources`)
- JWT authentication required for all endpoints via `JwtAuthGuard` and `RolesGuard` in `backend/src/modules/auth/guards/`
- All endpoints restricted to Admin role using `@Roles(Role.ADMIN)` decorator
- API responses from `AnalyticsQueryService` and `RealTimeTrackingService` in `backend/src/modules/analytics/services/`
- Database seed script created at `backend/src/seed/analytics-seed.ts` to generate test data for API integration testing

## Implementation Plan

### 1. Authentication Setup ✅

1. **Create Authentication Service** (New file) ✅
   Created: `frontend/lib/auth-service.ts`

2. **Add Authentication Guard for API Routes** (Completed) ✅
   Created: `frontend/middleware.ts`

### 2. API Client Implementation ✅

1. **Create Base API Client** (New file) ✅
   Created: `frontend/lib/api-client.ts`

2. **Create Analytics API Service** (New file) ✅
   Created: `frontend/lib/analytics-api.ts`

### 3. Period Selection to Date Conversion ✅

1. **Create Date Utility for Period Parsing** (New file) ✅
   Created: `frontend/lib/date-utils.ts`

### 4. Database Seeding for Testing 🆕

1. **Create Database Seed Script** (New file) ✅
   Created: `backend/src/seed/analytics-seed.ts`
   
2. **Run Seed Script to Generate Test Data** 🔄
   Command: `cd backend && pnpm run seed`
   
   This script generates:
   - 5 product categories
   - 25 products with variants and images
   - 100 user profiles
   - 500-1000 historical orders with varying statuses and dates
   
   The generated data provides realistic patterns for testing the analytics dashboard with real API endpoints.

### 5. Implementing Real Data in the Dashboard (In Progress - 50% Complete)

1. **Update Analytics Dashboard to Use Real Data** (In Progress) 🔄
   Modified: `frontend/app/dashboard/analytics/page.tsx`
   - ✅ Updated component to fetch real data from API services
   - ✅ Added loading states for better UX
   - ✅ Added error handling with retry functionality
   - ✅ Implemented data transformation for charts and metrics
   - ⏳ Testing with real backend data (blocked by empty database)

### 6. Data Transformation Utilities ✅

1. **Create Data Transformation Helper** (New file) ✅
   Created: `frontend/lib/analytics-transformers.ts`

### 7. Error Handling & Loading States ✅

1. **Create Loading Component** (New file) ✅
   Created: `frontend/components/ui/loading.tsx`

2. **Create Error Display Component** (New file) ✅
   Created: `frontend/components/ui/error-display.tsx`

### 8. Environment Configuration ✅

1. **Update Environment Variables** (Modified existing file) ✅
   Modified: `frontend/.env.local`

2. **Create Configuration File** (New file) ✅
   Created: `frontend/lib/config.ts`

## Implementation Timeline

1. **Week 1: Foundation** (Completed - 100%) ✅
   - ✅ Create API client and authentication setup
     - ✅ `frontend/lib/auth-service.ts`
     - ✅ `frontend/middleware.ts`
     - ✅ `frontend/lib/api-client.ts`
   - ✅ Implement date utilities and transformation helpers
     - ✅ `frontend/lib/date-utils.ts`
     - ✅ `frontend/lib/analytics-transformers.ts`
   - ✅ Set up environment configuration
     - ✅ `frontend/.env.local`
     - ✅ `frontend/lib/config.ts`
   - ✅ Add loading and error components
     - ✅ `frontend/components/ui/loading.tsx`
     - ✅ `frontend/components/ui/error-display.tsx`

2. **Week 2: Dashboard Integration** (In Progress - 50% Complete) 🔄
   - 🔄 Connect overview dashboard to real data
     - 🔄 Modified `frontend/app/dashboard/analytics/page.tsx`
   - ⏳ Implement real-time data polling
     - ⏳ Use `backend/src/modules/analytics/services/real-time-tracking.service.ts` endpoints
   - ⏳ Test and debug API integration
     - ⏳ Verify correct API calls to backend endpoints
   - ⏳ Handle error scenarios and edge cases

3. **Week 3: Export Integration & Optimization** (Not Started)
   - ⏳ Update export functionality to use real data
     - ⏳ Modify `frontend/components/analytics/analytics-export.tsx`
     - ⏳ Modify `frontend/components/analytics/export-button.tsx`
   - ⏳ Optimize data fetching and caching
     - ⏳ Implement caching strategies for API responses
   - ⏳ Add visual feedback for loading states
     - ⏳ Integrate loading components throughout the dashboard
   - ⏳ Implement comprehensive error handling
     - ⏳ Integrate error display components throughout the dashboard

## Testing Plan

1. **Unit Tests**
   - Test date utility functions (`frontend/lib/date-utils.ts`)
   - Test data transformation functions (`frontend/lib/analytics-transformers.ts`)
   - Test API client error handling (`frontend/lib/api-client.ts`)

2. **Integration Tests**
   - Test API service with mock responses (`frontend/lib/analytics-api.ts`)
   - Test dashboard data loading (`frontend/app/dashboard/analytics/page.tsx`)
   - Test period selection changes and corresponding API calls

3. **E2E Tests**
   - Test full dashboard loading and interaction
   - Test export functionality with real data
   - Test real-time updates and polling

## Challenges and Next Steps

1. **Current Challenges**
   - Empty database prevents meaningful testing with real data
   - Need to implement database seeding or create a mock API middleware

2. **Next Steps**
   - Create database seed script with realistic analytics data
   - Setup component tests with mock API responses
   - Complete the dashboard integration with real-time data polling
   - Update export functionality to use real data

## Current Progress (April 2023)

As of the current implementation:
- ✅ The foundation layer is complete with API client, authentication service, and utilities
- ✅ Data transformation functions are implemented for all data types
- ✅ Loading and error display components are ready for use
- ✅ Configuration is centralized and environment variables are set up
- 🔄 Analytics Dashboard has been updated to use real API data
- ⏳ Database seeding is required before testing to ensure proper data visualization

## Testing & Development Environment

### Database Seed Script
We've created a comprehensive database seed script for analytics testing. To populate your database with test data:

```bash
cd backend
pnpm install
pnpm run seed
```

The seed script generates:
- 25 products across 5 categories with variants
- 100 customer profiles
- 500-1000 historical orders across a 90-day period
- Realistic pricing, inventory, and order patterns

This data will provide meaningful patterns for all dashboard analytics components.

## API Endpoints

// ... existing code ... 