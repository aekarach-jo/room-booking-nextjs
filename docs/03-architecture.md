# บทที่ 3: สถาปัตยกรรมและการออกแบบระบบ

## 3.1 สถาปัตยกรรมระบบโดยรวม

ระบบใช้สถาปัตยกรรมแบบ **Full-Stack Monolithic Application** โดยใช้ Next.js Framework

### ภาพรวมสถาปัตยกรรม

```
┌─────────────────────────────────────────────────────────────┐
│                      Client Layer                            │
│  (Web Browser - Desktop/Tablet/Mobile Responsive)           │
└──────────────────────┬──────────────────────────────────────┘
                       │ HTTPS
                       ↓
┌─────────────────────────────────────────────────────────────┐
│                  Next.js Application                         │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Presentation Layer (React)                   │   │
│  │  - Pages (App Router)                                │   │
│  │  - Components (UI/Layout/Feature)                    │   │
│  │  - Context (State Management)                        │   │
│  └──────────────────────────────────────────────────────┘   │
│                       ↓                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Business Logic Layer (API Routes)            │   │
│  │  - Authentication & Authorization                     │   │
│  │  - Room Management                                    │   │
│  │  - Booking Management                                │   │
│  │  - User Management                                   │   │
│  │  - Analytics & Reporting                             │   │
│  └──────────────────────────────────────────────────────┘   │
│                       ↓                                      │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Data Access Layer (Prisma ORM)              │   │
│  │  - Query Builder                                     │   │
│  │  - Type-safe Database Access                         │   │
│  │  - Migration Management                              │   │
│  └──────────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────────┘
                       │ TCP/IP
                       ↓
┌─────────────────────────────────────────────────────────────┐
│              Database Layer (PostgreSQL)                     │
│  - Data Storage                                             │
│  - Transaction Management                                    │
│  - Data Integrity                                           │
└─────────────────────────────────────────────────────────────┘

External Integration:
┌─────────────────────────┐
│    RMUTI SSO System     │
│  - OAuth Authentication │
│  - User Profile Data    │
└─────────────────────────┘
```

## 3.2 Architectural Patterns

### 3.2.1 Layered Architecture

ระบบแบ่งเป็น 4 ชั้นหลัก:

#### 1. Presentation Layer (Client Side)
- **ความรับผิดชอบ**: แสดงผล UI และรับ Input จากผู้ใช้
- **เทคโนโลยี**: React, TypeScript, Tailwind CSS
- **ไฟล์หลัก**:
  - `/src/app` - Pages และ Layouts
  - `/src/components` - Reusable Components
  - `/src/context` - Global State Management

#### 2. Application Layer (API Routes)
- **ความรับผิดชอบ**: จัดการ Business Logic และ Workflow
- **เทคโนโลยี**: Next.js API Routes
- **ไฟล์หลัก**: `/src/app/api/**/route.ts`

#### 3. Data Access Layer
- **ความรับผิดชอบ**: เชื่อมต่อกับฐานข้อมูล
- **เทคโนโลยี**: Prisma ORM
- **ไฟล์หลัก**:
  - `/prisma/schema.prisma` - Database Schema
  - `/src/lib/prisma.ts` - Prisma Client Instance

#### 4. Database Layer
- **ความรับผิดชอบ**: จัดเก็บข้อมูลถาวร
- **เทคโนโลยี**: PostgreSQL

### 3.2.2 Model-View-Controller (MVC) Pattern

แม้จะไม่ใช่ MVC แบบดั้งเดิม แต่ Next.js ใช้แนวคิดคล้ายกัน:

- **Model**: Prisma Schema และ TypeScript Types
- **View**: React Components และ Pages
- **Controller**: API Routes และ Server Actions

## 3.3 โครงสร้างโฟลเดอร์โปรเจกต์

```
room-booking-nextjs/
├── prisma/
│   ├── schema.prisma          # Database schema definition
│   └── seed.ts                # Database seeding script
│
├── public/                    # Static assets
│   ├── images/
│   └── icons/
│
├── src/
│   ├── app/                   # Next.js App Router
│   │   ├── (auth)/           # Auth pages group
│   │   │   ├── login/
│   │   │   └── register/
│   │   │
│   │   ├── (dashboard)/      # Dashboard pages group
│   │   │   ├── page.tsx      # Dashboard home
│   │   │   ├── bookings/     # Booking pages
│   │   │   ├── rooms/        # Room pages
│   │   │   ├── recurring/    # Recurring booking pages
│   │   │   └── ...
│   │   │
│   │   ├── api/              # API routes
│   │   │   ├── auth/         # Authentication endpoints
│   │   │   ├── bookings/     # Booking endpoints
│   │   │   ├── rooms/        # Room endpoints
│   │   │   ├── users/        # User endpoints
│   │   │   └── ...
│   │   │
│   │   ├── layout.tsx        # Root layout
│   │   └── globals.css       # Global styles
│   │
│   ├── components/           # React components
│   │   ├── ui/              # Shadcn UI components
│   │   ├── layout/          # Layout components (Header, Sidebar)
│   │   ├── auth/            # Auth components
│   │   └── ...
│   │
│   ├── context/             # React Context providers
│   │   ├── AuthContext.tsx  # Authentication state
│   │   └── LanguageContext.tsx
│   │
│   ├── lib/                 # Utility functions
│   │   ├── prisma.ts        # Prisma client instance
│   │   ├── auth.ts          # Auth utilities
│   │   ├── utils.ts         # General utilities
│   │   └── validators.ts    # Zod schemas
│   │
│   ├── types/               # TypeScript type definitions
│   │   ├── index.ts
│   │   └── api.ts
│   │
│   ├── i18n/                # Internationalization
│   │   ├── en.json
│   │   └── th.json
│   │
│   └── middleware.ts        # Next.js middleware
│
├── docs/                    # Documentation (this folder)
│
├── .env                     # Environment variables
├── .env.example             # Environment variables template
├── .gitignore
├── package.json
├── tsconfig.json
├── next.config.ts
├── tailwind.config.ts
└── README.md
```

## 3.4 Component Architecture

### 3.4.1 Component Hierarchy

```
App
├── RootLayout
│   ├── ThemeProvider
│   ├── AuthProvider
│   └── LanguageProvider
│       └── Page Content
│           ├── AuthLayout (for auth pages)
│           │   └── LoginForm / RegisterForm
│           │
│           └── DashboardLayout (for dashboard pages)
│               ├── Header
│               │   ├── UserMenu
│               │   ├── NotificationBell
│               │   └── LanguageSwitcher
│               │
│               ├── Sidebar
│               │   └── Navigation Links
│               │
│               └── Main Content
│                   ├── BookingPage
│                   ├── RoomPage
│                   ├── AnalyticsPage
│                   └── ...
```

### 3.4.2 Component Categories

#### 1. UI Components (`/src/components/ui`)
- **วัตถุประสงค์**: Reusable UI primitives
- **ตัวอย่าง**: Button, Input, Dialog, Card, Table
- **Library**: shadcn/ui (based on Radix UI)

#### 2. Layout Components (`/src/components/layout`)
- **วัตถุประสงค์**: Page structure และ navigation
- **ตัวอย่าง**: Header, Sidebar, Footer
- **ลักษณะ**: Persistent across pages

#### 3. Feature Components (`/src/components/*`)
- **วัตถุประสงค์**: Business-specific components
- **ตัวอย่าง**: BookingForm, RoomCard, UserProfile
- **ลักษณะ**: Contain business logic

## 3.5 State Management Strategy

### 3.5.1 Local State
- ใช้ `useState` สำหรับ component state
- เหมาะสำหรับ UI state (form inputs, toggles, etc.)

### 3.5.2 Global State
- ใช้ React Context API
- **AuthContext**: จัดการ authentication state
- **LanguageContext**: จัดการภาษา (TH/EN)

### 3.5.3 Server State
- ใช้ React Server Components และ `fetch` API
- Data fetching ใน Server Components
- Automatic revalidation

### 3.5.4 Form State
- ใช้ React Hook Form
- Validation ด้วย Zod schema
- Type-safe forms

## 3.6 Authentication & Authorization

### 3.6.1 Authentication Flow

```
User Login
    ↓
Credentials → API /api/auth/login
    ↓
Verify Username/Password (bcrypt)
    ↓
Generate JWT Token (jose)
    ↓
Set HTTP-Only Cookie
    ↓
Return User Data
    ↓
Store in AuthContext
    ↓
Redirect to Dashboard
```

### 3.6.2 RMUTI SSO Integration Flow

```
User Clicks "Login with RMUTI"
    ↓
Redirect to RMUTI OAuth
    ↓
User Authenticates on RMUTI
    ↓
Redirect back with Auth Code
    ↓
API /api/auth/rmuti/callback
    ↓
Exchange Code for Token
    ↓
Fetch User Profile from RMUTI
    ↓
Create/Update User in Database
    ↓
Generate JWT Token
    ↓
Set HTTP-Only Cookie
    ↓
Redirect to Dashboard
```

### 3.6.3 Authorization Middleware

```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')
  
  // Check if user is authenticated
  if (!token && isProtectedRoute(request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  
  // Check user role and permissions
  const user = verifyToken(token)
  if (!hasPermission(user.role, request.nextUrl.pathname)) {
    return NextResponse.redirect(new URL('/unauthorized', request.url))
  }
  
  return NextResponse.next()
}
```

### 3.6.4 Role-Based Access Control (RBAC)

| Feature | STUDENT | TEACHER | STAFF | DEPT_HEAD |
|---------|---------|---------|-------|-----------|
| View Rooms | ✓ | ✓ | ✓ | ✓ |
| Create Booking | ✓ | ✓ | ✓ | ✓ |
| View Own Bookings | ✓ | ✓ | ✓ | ✓ |
| Create Recurring Booking | ✗ | ✓ | ✓ | ✓ |
| Approve Bookings | ✗ | ✗ | ✓ | ✓ |
| Manage Rooms | ✗ | ✗ | ✓ | ✓ |
| Manage Users | ✗ | ✗ | ✓ | ✓ |
| View Analytics | ✗ | ✗ | ✓ | ✓ |
| Manage Semesters | ✗ | ✗ | ✓ | ✓ |
| Create Announcements | ✗ | ✗ | ✓ | ✓ |

## 3.7 Data Flow Architecture

### 3.7.1 การจองห้องแบบครั้งเดียว (Single Booking)

```
1. User fills booking form
   ↓
2. Frontend validation (React Hook Form + Zod)
   ↓
3. POST /api/bookings
   ↓
4. Backend validation
   - ตรวจสอบห้องว่าง
   - ตรวจสอบสิทธิ์ผู้ใช้
   - ตรวจสอบ business rules
   ↓
5. Create booking in database (Prisma)
   ↓
6. Create notification
   ↓
7. Return booking data
   ↓
8. Update UI
   ↓
9. (If requires approval) Staff approves/rejects
   ↓
10. Send notification to user
```

### 3.7.2 การจองห้องแบบประจำ (Recurring Booking)

```
1. User fills recurring booking form
   ↓
2. Select pattern (Daily/Weekly/Custom)
   ↓
3. POST /api/recurring-bookings
   ↓
4. Backend calculates occurrence dates
   ↓
5. Check room availability for all dates
   ↓
6. Create RecurringBooking record
   ↓
7. Generate individual Booking records
   ↓
8. Create notifications
   ↓
9. Return data
```

## 3.8 Caching Strategy

### 3.8.1 Server-Side Caching
- ใช้ Next.js `fetch` cache
- ใช้ `revalidate` option สำหรับ stale-while-revalidate

```typescript
// Cache for 60 seconds
fetch('/api/rooms', { next: { revalidate: 60 } })
```

### 3.8.2 Client-Side Caching
- React Query / SWR pattern
- Automatic background revalidation
- Optimistic updates

## 3.9 Error Handling Strategy

### 3.9.1 API Error Response Format

```typescript
{
  success: false,
  error: {
    code: 'BOOKING_CONFLICT',
    message: 'ห้องถูกจองในช่วงเวลานี้แล้ว',
    details: {
      conflictingBookingId: 'xxx'
    }
  }
}
```

### 3.9.2 Error Types

1. **Validation Errors**: ข้อมูล input ไม่ถูกต้อง
2. **Business Logic Errors**: ฝ่าฝืน business rules
3. **Authentication Errors**: ไม่ได้ login หรือ token หมดอายุ
4. **Authorization Errors**: ไม่มีสิทธิ์เข้าถึง
5. **Database Errors**: ปัญหาการเชื่อมต่อหรือ query
6. **External Service Errors**: RMUTI SSO ไม่สามารถเชื่อมต่อได้

## 3.10 Performance Optimization

### 3.10.1 Frontend Optimizations

1. **Code Splitting**: ใช้ Dynamic Import
2. **Image Optimization**: Next.js Image component
3. **Font Optimization**: next/font
4. **CSS Optimization**: Tailwind CSS purge
5. **Bundle Size**: Tree shaking

### 3.10.2 Backend Optimizations

1. **Database Indexing**: Index ตาม query patterns
2. **Query Optimization**: Select เฉพาะ fields ที่ใช้
3. **Connection Pooling**: Prisma connection pool
4. **Caching**: ใช้ Next.js cache

### 3.10.3 Database Optimizations

1. **Proper Indexing**: ดูรายละเอียดใน Chapter 2
2. **Query Optimization**: Avoid N+1 queries
3. **Batch Operations**: ใช้ createMany, updateMany
4. **Pagination**: Cursor-based pagination

## 3.11 Security Architecture

### 3.11.1 Security Measures

1. **Authentication**: JWT tokens in HTTP-only cookies
2. **Password Hashing**: bcrypt with salt rounds
3. **SQL Injection Prevention**: Prisma parameterized queries
4. **XSS Prevention**: React automatic escaping
5. **CSRF Protection**: SameSite cookie attribute
6. **Input Validation**: Zod schema validation
7. **Rate Limiting**: API rate limiting (if deployed)
8. **HTTPS**: SSL/TLS encryption in production

### 3.11.2 Data Privacy

1. **Sensitive Data**: Password เก็บแบบ hashed เท่านั้น
2. **Access Control**: RBAC ตาม role
3. **Audit Trail**: createdAt, updatedAt timestamps
4. **Data Retention**: ไม่ลบข้อมูลจริง แต่ mark isActive = false

## 3.12 Scalability Considerations

### ปัจจุบัน (Monolithic)
- เหมาะสำหรับ small to medium scale
- รองรับผู้ใช้พร้อมกัน ~100-1000 users

### อนาคต (Microservices - ถ้าต้องการ scale)
- แยก Auth Service
- แยก Booking Service
- แยก Notification Service
- ใช้ Message Queue (RabbitMQ, Kafka)
- ใช้ Redis สำหรับ caching
- ใช้ CDN สำหรับ static assets

## 3.13 Deployment Architecture

```
┌─────────────────────────────────────┐
│          Load Balancer              │
└───────────┬─────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│     Next.js Server (Node.js)        │
│  - Serve SSR pages                  │
│  - Handle API requests              │
└───────────┬─────────────────────────┘
            ↓
┌─────────────────────────────────────┐
│      PostgreSQL Database            │
│  - Primary instance                 │
│  - Read replicas (optional)         │
└─────────────────────────────────────┘

Static Assets → CDN (optional)
```

### Recommended Deployment Platforms

1. **Vercel** (แนะนำ): Native Next.js support
2. **Railway**: Easy deployment with PostgreSQL
3. **DigitalOcean App Platform**: Full control
4. **AWS**: EC2 + RDS
5. **Self-hosted**: Docker + Docker Compose
