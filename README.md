# Room Booking System

ระบบจองห้องเรียน/ห้องประชุม พัฒนาด้วย Next.js 16, Prisma และ PostgreSQL

## Tech Stack

- **Framework:** Next.js 16 (App Router)
- **Database:** PostgreSQL + Prisma ORM
- **Authentication:** JWT (jose)
- **UI:** Tailwind CSS, Radix UI, shadcn/ui
- **Form:** React Hook Form + Zod

## Prerequisites

ก่อนเริ่มต้น ตรวจสอบว่าติดตั้งสิ่งเหล่านี้แล้ว:

- [Node.js](https://nodejs.org/) v18 หรือใหม่กว่า
- [PostgreSQL](https://www.postgresql.org/) v14 หรือใหม่กว่า
- npm, yarn, pnpm หรือ bun

## Installation

### 1. Clone โปรเจค

```bash
git clone <repository-url>
cd room-booking-nextjs
```

### 2. ติดตั้ง Dependencies

```bash
npm install
# หรือ
yarn install
# หรือ
pnpm install
```

### 3. ตั้งค่า Environment Variables

สร้างไฟล์ `.env` ที่ root ของโปรเจค:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/classroom_booking"

# JWT
JWT_SECRET="your-secret-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NODE_ENV="development"
```

> **หมายเหตุ:** แก้ไข `user`, `password` และชื่อ database ให้ตรงกับ PostgreSQL ของคุณ

### 4. สร้าง Database

สร้าง database ใน PostgreSQL:

```sql
CREATE DATABASE classroom_booking;
```

### 5. รัน Prisma Migration

```bash
# สร้าง Prisma Client
npx prisma generate

# รัน migration เพื่อสร้างตาราง
npx prisma migrate dev --name init

# (Optional) ดูข้อมูลใน database ผ่าน Prisma Studio
npx prisma studio
```

## Running the Project

### Development Mode

```bash
npm run dev
```

เปิด [http://localhost:3000](http://localhost:3000) ในเบราว์เซอร์

### Production Mode

```bash
# Build
npm run build

# Start
npm start
```

### Other Commands

```bash
# Lint code
npm run lint

# Reset database และรัน migration ใหม่
npx prisma migrate reset

# อัปเดต Prisma Client หลังแก้ไข schema
npx prisma generate
```

## Project Structure

```
room-booking-nextjs/
├── prisma/
│   └── schema.prisma    # Database schema
├── src/
│   ├── app/
│   │   ├── (auth)/      # หน้า login, register
│   │   ├── (dashboard)/ # หน้า dashboard
│   │   └── api/         # API routes
│   ├── components/      # React components
│   ├── context/         # React context
│   ├── lib/             # Utilities, helpers
│   └── types/           # TypeScript types
├── .env                 # Environment variables
└── package.json
```

## Database Schema

โปรเจคนี้มี models หลักดังนี้:

- **User** - ผู้ใช้งาน (นักศึกษา, อาจารย์, เจ้าหน้าที่)
- **Room** - ห้องเรียน/ห้องประชุม
- **Booking** - การจองห้อง
- **RecurringBooking** - การจองแบบประจำ
- **Semester** - ภาคการศึกษา
- **Notification** - การแจ้งเตือน
- **Announcement** - ประกาศ

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [shadcn/ui](https://ui.shadcn.com/)
# room-booking-nextjs
