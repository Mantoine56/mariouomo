# High-Level Architecture & Technology Plan (Revised)

The following plan incorporates all finalized decisions about our technology stack and overall architecture for building the custom e-commerce platform for marioumo.com. It replaces the earlier version of **hlplan.md**.

---

## 1. Core Requirements

### 1.1 Admin Dashboard (Back-end)
- **User Management & Authentication**  
  - JWT-based Auth  
  - Role-based access (Owner, Manager, Customer Service)  
  - Manage user invitations and role assignments

- **Product Management**  
  - CRUD for products (title, description, pricing, categories, attributes)  
  - Inventory tracking (stock levels, restock alerts)  
  - Media uploads (images, potential videos)

- **Order Management**  
  - List/filter orders, fulfill, and manage refunds/returns  
  - Send automatic email notifications to customers

- **Customer Management**  
  - View registered customers, purchase history, and profile updates  
  - Manage addresses, account statuses

- **Discounts & Promotions**  
  - Create promotional codes (percentage/flat discount), set usage rules and expiration

- **Reporting & Analytics**  
  - Sales over time (daily/weekly/monthly)  
  - Popular products, inventory insights (fastest-sellers, low stock)  
  - Customer metrics (average order value, LTV)

- **Settings**  
  - Payment configurations (Stripe)  
  - Shipping/fulfillment aggregator integration  
  - Tax configurations

### 1.2 E-commerce Front-end
- **Product Catalog**  
  - Browse by category, filter, search (SQL-based full-text or ILIKE queries)  
  - Product detail pages with multiple images, reviews, and variants if needed

- **Shopping Cart & Checkout**  
  - Guest checkout or authenticated checkout  
  - Payment via Stripe  
  - Shipping methods selection from aggregator  
  - Order confirmation & notification

- **Customer Account**  
  - Register/login  
  - View past orders, manage addresses, track shipping

- **Responsive UI/UX**  
  - Mobile-friendly design  
  - SEO-optimized for organic traffic (Next.js for server-side rendering)

---

## 2. High-Level Architecture

```
 ┌─────────────────────────┐
 │   Next.js Storefront    │
 │   (Vercel Deploy)       │
 └─────────▲───────────────┘
           | (HTTPS, JSON)
           ▼
 ┌─────────────────────────┐
 │   NestJS API (Monolith) │   (Node.js)
 │   (AWS or other host)   │
 └─────────▲───────────────┘
           | (Database Queries)
           ▼
 ┌─────────────────────────┐
 │   PostgreSQL (Supabase) │
 │   (Relational DB)       │
 └─────────────────────────┘
           | (File storage, e.g. S3 or aggregator)
           ▼
 ┌────────────────────────────────┐
 │   Object Storage + CDN         │
 │   (Images / media)             │
 └────────────────────────────────┘
```

1. **Next.js** (Storefront) hosted on **Vercel** for server-side rendered pages, SSR, and SEO benefits.  
2. **NestJS** (Monolith) as the main API for both storefront and admin functionality, hosted on AWS or another provider.  
3. **PostgreSQL** via **Supabase** for relational data management.  
4. **Object Storage** (e.g., AWS S3 or similar) for images and media.  
5. **Aggregator** for shipping, integrated through the NestJS layer.

---

## 3. Suggested Technology Stack

### 3.1 Back-end (NestJS, Node.js)
- **NestJS** for a structured, scalable server application
- **JWT** for stateless authentication
- **ORM**: **Prisma** to interface with PostgreSQL (Supabase)
- **Stripe** for payment processing
- **Shipping Aggregator** (Shippo, EasyPost, etc.) for multi-carrier support
- **AI Assistant (optional extension)**  
  - LLM integration (OpenAI, etc.)  
  - Admin-only interface to query inventory, orders, or sales data  

### 3.2 Front-end Storefront (Next.js)
- **Next.js** deployed on **Vercel** for fast edge delivery and SSR
- **React** for building UI components
- **Styling** via TailwindCSS, Chakra UI, or preferred library
- **Global state** with React Context, Redux, or similar

### 3.3 Admin Dashboard
- **Separate Next.js/React App** (could also be hosted on Vercel or any other platform)  
- **Component Libraries** (e.g., Material-UI, Ant Design, or Chakra) for quick UI building
- **Integration** with the same NestJS API endpoints

### 3.4 Database
- **PostgreSQL** hosted on **Supabase**  
  - Provides management tools, automatic backups, and easy integration
- **Full-Text or ILIKE Queries** for search with indexing (on product name, description, etc.)

### 3.5 Deployment
- **Front-end** on Vercel for easy continuous deployment
- **Back-end** on AWS (Elastic Beanstalk, ECS, or a simple EC2) or similar
- **Database** on Supabase (managed PostgreSQL)

---

## 4. System Components & Considerations

### 4.1 Authentication & Security
- **JWT** for tokens, stored in secure HTTP-only cookies
- **Role-based Access** at the API layer (Owner, Manager, CS, plus standard “customer” role)
- SSL/TLS enforced (HTTPS)

### 4.2 Payments
- **Stripe** for seamless credit card processing
- Webhooks in NestJS to handle order/payment confirmations

### 4.3 Shipping & Fulfillment
- **Aggregator** (Shippo, EasyPost) to handle multiple carriers
- Automatic shipping label generation (if needed)
- Real-time shipping rates at checkout

### 4.4 AI “Assistant” for Admin
- **LLM-based**: The Admin dashboard will include an AI chat
- **Flow**:
  1. Admin enters natural-language questions (e.g., “How many orders were made last week?”).  
  2. The back-end interprets queries, fetches data, and provides structured answers.  
  3. LLM helps format and summarize results.

### 4.5 Monitoring & Logging
- **Initial**: Simple console logs + Vercel logs
- **Expansion**: Add Sentry for error tracking or an external logging service (Datadog, LogRocket, etc.) once traffic grows

### 4.6 Performance & Caching
- **CDN & HTTP Caching** for static assets and pages (Vercel handles much of this automatically)
- **Consider Redis** only if query performance becomes an issue

### 4.7 Internationalization (i18n)
- **DB** and front-end structured for multiple languages/currencies (potential future expansion)
- **Next.js** i18n routing for localized pages if needed

---

## 5. Data Model (High-Level)

1. **User**  
   - `id`, `email`, `password_hash` (hashed), `roles` (JSON or array), `created_at`, `updated_at`

2. **Product**  
   - `id`, `name`, `description`, `price`, `SKU`, `categories` (one-to-many), `attributes` (JSON or separate table), `images`, `created_at`, `updated_at`

3. **Inventory**  
   - Embedded in `Product` or a separate table referencing `product_id`, `quantity`, `warehouse_location`

4. **Order**  
   - `id`, `user_id`, `total_amount`, `status`, `payment_method`, `shipping_address`, `created_at`
   - **OrderItem**: `order_id`, `product_id`, `quantity`, `unit_price`

5. **Coupon/Promotion**  
   - `id`, `code`, `discount_type` (percentage/flat), `discount_value`, `usage_limit`, `expires_at`

6. **Analytics**  
   - Basic data points stored in primary DB. Summaries can be indexed or aggregated for quick admin queries.

---

## 6. Implementation Phases

1. **Phase 1: Setup & Core Architecture**  
   - Initialize NestJS, Next.js projects  
   - Configure Supabase for PostgreSQL  
   - Set up CI/CD for Vercel (front-end) and AWS or other platform (back-end)

2. **Phase 2: MVP E-commerce Features**  
   - User auth (JWT) + roles  
   - Product CRUD (NestJS API + Supabase)  
   - Basic order placement + Stripe integration (checkout flow)

3. **Phase 3: Admin Dashboard**  
   - Separate Next.js app for admin  
   - Features: product management, order management, user management  
   - Role-based access to admin routes

4. **Phase 4: Shipping & Fulfillment**  
   - Integrate aggregator for shipping rates  
   - Generate shipping labels or track shipments within the admin dashboard

5. **Phase 5: AI Assistant (Admin-Only)**  
   - Connect OpenAI (or similar) to interpret admin queries  
   - Securely fetch data from the DB  
   - Return summarized or direct data responses

6. **Phase 6: Optimization & Launch**  
   - Implement search improvements (ILIKE with indexes)  
   - Final load-testing with Locust or k6  
   - Deploy to production (Vercel + AWS + Supabase)  
   - Add minimal logging/monitoring solutions

---

## 7. Key Considerations & Assumptions

1. **Traffic Scale**: Currently ~200 visitors/day. The chosen architecture can handle significantly more before needing advanced caching/optimizations.  
2. **Security & Compliance**: Using Stripe ensures PCI compliance; store no raw credit card data.  
3. **Internationalization**: The system design (DB fields, front-end routing) will enable multi-language or multi-currency in the future.  
4. **Performance**: With ~500 products, a properly indexed DB plus basic caching will be sufficient.  
5. **AI Chat**: Must ensure only admins can access the AI queries to prevent data leakage. Potential “guard rails” or fine-tuned instructions needed.  
6. **Scaling**: Vercel can auto-scale the Next.js app, while AWS can scale the NestJS server. Supabase also scales Postgres as needed.

---

## 8. Summary

This revised plan provides a **monolithic** NestJS back-end with a **Next.js**-based storefront, both connected to a **PostgreSQL** (Supabase) database. We’ll use **JWT** for authentication and **Stripe** for payments. The shipping aggregator will handle multi-carrier support. We start with **console-based logging** and expand as traffic grows. We’ve also paved the way for future internationalization and advanced features like an **AI-powered internal assistant** to query e-commerce data quickly.

Overall, this updated plan balances **simplicity** for an MVP launch with **scalability** for future growth, ensuring marioumo.com can meet current needs while staying flexible to implement new features down the road.

---