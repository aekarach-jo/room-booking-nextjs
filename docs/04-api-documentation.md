# บทที่ 4: การออกแบบ API

## 4.1 ภาพรวม API

ระบบใช้ **RESTful API** ที่พัฒนาด้วย Next.js API Routes  
Base URL: `http://localhost:3000/api`

### หลักการออกแบบ
- ใช้ HTTP Methods ตามมาตรฐาน REST
- Response format เป็น JSON
- Authentication ด้วย JWT (HTTP-only cookie)
- Error handling แบบ consistent

## 4.2 Authentication Endpoints

### 4.2.1 POST /api/auth/register
ลงทะเบียนผู้ใช้ใหม่

**Request Body:**
```json
{
  "username": "student001",
  "password": "password123",
  "fullName": "สมชาย ใจดี",
  "studentId": "6501234567",
  "department": "วิศวกรรมคอมพิวเตอร์",
  "year": 3,
  "role": "STUDENT"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "username": "student001",
    "fullName": "สมชาย ใจดี",
    "role": "STUDENT"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": {
    "code": "USERNAME_EXISTS",
    "message": "ชื่อผู้ใช้นี้ถูกใช้งานแล้ว"
  }
}
```

### 4.2.2 POST /api/auth/login
เข้าสู่ระบบ

**Request Body:**
```json
{
  "username": "student001",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clxxx...",
      "username": "student001",
      "fullName": "สมชาย ใจดี",
      "role": "STUDENT",
      "department": "วิศวกรรมคอมพิวเตอร์"
    }
  }
}
```
*Note: JWT token จะถูกส่งผ่าน HTTP-only cookie*

**Error Response (401):**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_CREDENTIALS",
    "message": "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง"
  }
}
```

### 4.2.3 GET /api/auth/me
ดึงข้อมูลผู้ใช้ปัจจุบัน

**Headers:**
```
Cookie: token=<jwt_token>
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "username": "student001",
    "fullName": "สมชาย ใจดี",
    "role": "STUDENT",
    "email": "student001@rmuti.ac.th",
    "department": "วิศวกรรมคอมพิวเตอร์"
  }
}
```

### 4.2.4 GET /api/auth/rmuti
เริ่มต้น RMUTI SSO Authentication

**Response (302):**
Redirect ไปยัง RMUTI OAuth endpoint

### 4.2.5 GET /api/auth/rmuti/callback
Callback จาก RMUTI SSO

**Query Parameters:**
- `code`: Authorization code จาก RMUTI

**Response (302):**
Redirect ไปยัง dashboard พร้อม set cookie

## 4.3 Room Endpoints

### 4.3.1 GET /api/rooms
ดึงรายการห้องทั้งหมด

**Query Parameters:**
- `type` (optional): LECTURE, COMPUTER_LAB, LABORATORY, MEETING, STUDY
- `building` (optional): ชื่ออาคาร
- `minCapacity` (optional): ความจุขั้นต่ำ
- `isActive` (optional): true/false

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxx...",
      "name": "ห้อง 301",
      "type": "LECTURE",
      "floor": 3,
      "building": "อาคาร 1",
      "capacity": 50,
      "equipment": ["โปรเจคเตอร์", "ไมค์", "แอร์"],
      "openTime": "08:00",
      "closeTime": "20:00",
      "isActive": true
    }
  ]
}
```

### 4.3.2 GET /api/rooms/[id]
ดึงข้อมูลห้องเฉพาะ

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "name": "ห้อง 301",
    "type": "LECTURE",
    "floor": 3,
    "building": "อาคาร 1",
    "capacity": 50,
    "equipment": ["โปรเจคเตอร์", "ไมค์", "แอร์"],
    "description": "ห้องเรียนขนาดใหญ่",
    "openTime": "08:00",
    "closeTime": "20:00",
    "maxBookingHours": 3,
    "advanceBookingDays": 7,
    "requireApproval": true,
    "isActive": true
  }
}
```

### 4.3.3 POST /api/rooms
สร้างห้องใหม่ (STAFF, DEPARTMENT_HEAD only)

**Request Body:**
```json
{
  "name": "ห้อง 301",
  "type": "LECTURE",
  "floor": 3,
  "building": "อาคาร 1",
  "capacity": 50,
  "equipment": ["โปรเจคเตอร์", "ไมค์", "แอร์"],
  "description": "ห้องเรียนขนาดใหญ่",
  "openTime": "08:00",
  "closeTime": "20:00",
  "maxBookingHours": 3,
  "advanceBookingDays": 7,
  "requireApproval": true
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "name": "ห้อง 301",
    ...
  }
}
```

### 4.3.4 PATCH /api/rooms/[id]
แก้ไขข้อมูลห้อง (STAFF, DEPARTMENT_HEAD only)

**Request Body:**
```json
{
  "capacity": 60,
  "equipment": ["โปรเจคเตอร์", "ไมค์", "แอร์", "เครื่องเสียง"]
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "name": "ห้อง 301",
    "capacity": 60,
    ...
  }
}
```

### 4.3.5 DELETE /api/rooms/[id]
ลบห้อง (STAFF, DEPARTMENT_HEAD only)

**Response (200):**
```json
{
  "success": true,
  "message": "ลบห้องเรียบร้อยแล้ว"
}
```

### 4.3.6 GET /api/rooms/[id]/availability
ตรวจสอบห้องว่าง

**Query Parameters:**
- `date`: วันที่ (YYYY-MM-DD)
- `startTime`: เวลาเริ่มต้น (HH:MM)
- `endTime`: เวลาสิ้นสุด (HH:MM)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "available": false,
    "conflicts": [
      {
        "id": "booking_xxx",
        "startTime": "13:00",
        "endTime": "15:00",
        "purpose": "การประชุม"
      }
    ]
  }
}
```

## 4.4 Booking Endpoints

### 4.4.1 GET /api/bookings
ดึงรายการการจองทั้งหมด (STAFF, DEPARTMENT_HEAD only)

**Query Parameters:**
- `status`: PENDING, APPROVED, REJECTED, CANCELLED
- `roomId`: กรองตามห้อง
- `date`: กรองตามวันที่
- `page`: หน้าที่ต้องการ (default: 1)
- `limit`: จำนวนต่อหน้า (default: 20)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "bookings": [
      {
        "id": "clxxx...",
        "user": {
          "id": "user_xxx",
          "fullName": "สมชาย ใจดี"
        },
        "room": {
          "id": "room_xxx",
          "name": "ห้อง 301"
        },
        "date": "2024-03-15T00:00:00.000Z",
        "startTime": "2024-03-15T13:00:00.000Z",
        "endTime": "2024-03-15T15:00:00.000Z",
        "purpose": "ติวเสริม",
        "attendees": 30,
        "status": "PENDING",
        "createdAt": "2024-03-10T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 20,
      "total": 45,
      "totalPages": 3
    }
  }
}
```

### 4.4.2 GET /api/bookings/my
ดึงรายการการจองของตัวเอง

**Query Parameters:**
- `status`: PENDING, APPROVED, REJECTED, CANCELLED
- `upcoming`: true (เฉพาะการจองในอนาคต)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxx...",
      "room": {
        "id": "room_xxx",
        "name": "ห้อง 301",
        "building": "อาคาร 1"
      },
      "date": "2024-03-15T00:00:00.000Z",
      "startTime": "2024-03-15T13:00:00.000Z",
      "endTime": "2024-03-15T15:00:00.000Z",
      "purpose": "ติวเสริม",
      "attendees": 30,
      "status": "APPROVED"
    }
  ]
}
```

### 4.4.3 GET /api/bookings/pending
ดึงรายการการจองที่รออนุมัติ (STAFF, DEPARTMENT_HEAD only)

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxx...",
      "user": {
        "fullName": "สมชาย ใจดี",
        "studentId": "6501234567"
      },
      "room": {
        "name": "ห้อง 301"
      },
      "date": "2024-03-15T00:00:00.000Z",
      "startTime": "2024-03-15T13:00:00.000Z",
      "endTime": "2024-03-15T15:00:00.000Z",
      "purpose": "ติวเสริม",
      "attendees": 30,
      "createdAt": "2024-03-10T10:00:00.000Z"
    }
  ]
}
```

### 4.4.4 POST /api/bookings
สร้างการจองใหม่

**Request Body:**
```json
{
  "roomId": "clxxx...",
  "date": "2024-03-15",
  "startTime": "13:00",
  "endTime": "15:00",
  "purpose": "ติวเสริม",
  "attendees": 30
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "roomId": "room_xxx",
    "date": "2024-03-15T00:00:00.000Z",
    "startTime": "2024-03-15T13:00:00.000Z",
    "endTime": "2024-03-15T15:00:00.000Z",
    "status": "PENDING",
    "createdAt": "2024-03-10T10:00:00.000Z"
  },
  "message": "สร้างการจองเรียบร้อย รอการอนุมัติ"
}
```

**Error Response (409):**
```json
{
  "success": false,
  "error": {
    "code": "BOOKING_CONFLICT",
    "message": "ห้องถูกจองในช่วงเวลานี้แล้ว"
  }
}
```

### 4.4.5 PATCH /api/bookings/[id]/approve
อนุมัติการจอง (STAFF, DEPARTMENT_HEAD only)

**Request Body (optional):**
```json
{
  "adminNote": "อนุมัติแล้ว"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "status": "APPROVED",
    "adminNote": "อนุมัติแล้ว"
  }
}
```

### 4.4.6 PATCH /api/bookings/[id]/reject
ปฏิเสธการจอง (STAFF, DEPARTMENT_HEAD only)

**Request Body:**
```json
{
  "adminNote": "ห้องมีกิจกรรมแล้ว"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "status": "REJECTED",
    "adminNote": "ห้องมีกิจกรรมแล้ว"
  }
}
```

### 4.4.7 PATCH /api/bookings/[id]/check-in
เช็คอิน (เฉพาะผู้จองหรือ STAFF)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "checkInTime": "2024-03-15T13:05:00.000Z"
  }
}
```

### 4.4.8 PATCH /api/bookings/[id]/check-out
เช็คเอาท์ (เฉพาะผู้จองหรือ STAFF)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "checkOutTime": "2024-03-15T14:55:00.000Z"
  }
}
```

### 4.4.9 DELETE /api/bookings/[id]
ยกเลิกการจอง

**Response (200):**
```json
{
  "success": true,
  "message": "ยกเลิกการจองเรียบร้อยแล้ว"
}
```

## 4.5 Recurring Booking Endpoints

### 4.5.1 GET /api/recurring-bookings/my
ดึงรายการการจองแบบประจำของตัวเอง

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxx...",
      "room": {
        "name": "ห้อง 301"
      },
      "startDate": "2024-03-01T00:00:00.000Z",
      "endDate": "2024-06-30T00:00:00.000Z",
      "pattern": "WEEKLY",
      "daysOfWeek": [1, 3, 5],
      "startTime": "13:00",
      "endTime": "15:00",
      "purpose": "สอนวิชา Data Structure",
      "status": "APPROVED"
    }
  ]
}
```

### 4.5.2 POST /api/recurring-bookings
สร้างการจองแบบประจำ (TEACHER, STAFF, DEPARTMENT_HEAD only)

**Request Body:**
```json
{
  "roomId": "clxxx...",
  "semesterId": "semester_xxx",
  "startDate": "2024-03-01",
  "endDate": "2024-06-30",
  "pattern": "WEEKLY",
  "daysOfWeek": [1, 3, 5],
  "startTime": "13:00",
  "endTime": "15:00",
  "purpose": "สอนวิชา Data Structure"
}
```

**Response (201):**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "roomId": "room_xxx",
    "pattern": "WEEKLY",
    "status": "PENDING",
    "createdBookingsCount": 45
  },
  "message": "สร้างการจองแบบประจำเรียบร้อย สร้างการจอง 45 ครั้ง"
}
```

## 4.6 User Endpoints

### 4.6.1 GET /api/users
ดึงรายการผู้ใช้ทั้งหมด (STAFF, DEPARTMENT_HEAD only)

**Query Parameters:**
- `role`: STUDENT, TEACHER, STAFF, DEPARTMENT_HEAD
- `isActive`: true/false
- `search`: ค้นหาจากชื่อหรือ username

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxx...",
      "username": "student001",
      "fullName": "สมชาย ใจดี",
      "role": "STUDENT",
      "department": "วิศวกรรมคอมพิวเตอร์",
      "isActive": true,
      "noShowCount": 0
    }
  ]
}
```

### 4.6.2 PATCH /api/users/[id]
แก้ไขข้อมูลผู้ใช้ (STAFF, DEPARTMENT_HEAD only)

**Request Body:**
```json
{
  "role": "TEACHER",
  "isSuspended": true,
  "suspendedUntil": "2024-04-01"
}
```

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "role": "TEACHER",
    "isSuspended": true
  }
}
```

## 4.7 Semester Endpoints

### 4.7.1 GET /api/semesters
ดึงรายการภาคการศึกษา

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxx...",
      "name": "1/2567",
      "startDate": "2024-06-01T00:00:00.000Z",
      "endDate": "2024-10-31T00:00:00.000Z",
      "isActive": true
    }
  ]
}
```

### 4.7.2 GET /api/semesters/current
ดึงข้อมูลภาคการศึกษาปัจจุบัน

**Response (200):**
```json
{
  "success": true,
  "data": {
    "id": "clxxx...",
    "name": "1/2567",
    "startDate": "2024-06-01T00:00:00.000Z",
    "endDate": "2024-10-31T00:00:00.000Z",
    "isActive": true
  }
}
```

### 4.7.3 POST /api/semesters
สร้างภาคการศึกษาใหม่ (STAFF, DEPARTMENT_HEAD only)

**Request Body:**
```json
{
  "name": "1/2567",
  "startDate": "2024-06-01",
  "endDate": "2024-10-31",
  "isActive": true
}
```

## 4.8 Notification Endpoints

### 4.8.1 GET /api/notifications
ดึงรายการแจ้งเตือน

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "id": "clxxx...",
      "type": "BOOKING_APPROVED",
      "title": "การจองได้รับการอนุมัติ",
      "message": "การจองห้อง 301 วันที่ 15 มีนาคม ได้รับการอนุมัติแล้ว",
      "isRead": false,
      "createdAt": "2024-03-10T10:00:00.000Z"
    }
  ]
}
```

### 4.8.2 GET /api/notifications/unread-count
นับจำนวนการแจ้งเตือนที่ยังไม่อ่าน

**Response (200):**
```json
{
  "success": true,
  "data": {
    "count": 5
  }
}
```

### 4.8.3 PATCH /api/notifications/mark-all-read
ทำเครื่องหมายอ่านทั้งหมด

**Response (200):**
```json
{
  "success": true,
  "message": "ทำเครื่องหมายอ่านทั้งหมดแล้ว"
}
```

## 4.9 Analytics Endpoints

### 4.9.1 GET /api/analytics/overview
สถิติภาพรวม (STAFF, DEPARTMENT_HEAD only)

**Response (200):**
```json
{
  "success": true,
  "data": {
    "totalBookings": 450,
    "totalUsers": 120,
    "totalRooms": 25,
    "pendingBookings": 8,
    "todayBookings": 15
  }
}
```

### 4.9.2 GET /api/analytics/room-usage
สถิติการใช้งานห้อง

**Query Parameters:**
- `startDate`: วันที่เริ่มต้น
- `endDate`: วันที่สิ้นสุด

**Response (200):**
```json
{
  "success": true,
  "data": [
    {
      "roomId": "clxxx...",
      "roomName": "ห้อง 301",
      "bookingCount": 45,
      "totalHours": 135,
      "utilizationRate": 75.5
    }
  ]
}
```

## 4.10 Error Codes Summary

| Code | HTTP Status | Description |
|------|-------------|-------------|
| INVALID_CREDENTIALS | 401 | ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง |
| UNAUTHORIZED | 401 | ไม่ได้เข้าสู่ระบบ |
| FORBIDDEN | 403 | ไม่มีสิทธิ์เข้าถึง |
| NOT_FOUND | 404 | ไม่พบข้อมูล |
| USERNAME_EXISTS | 400 | ชื่อผู้ใช้ซ้ำ |
| BOOKING_CONFLICT | 409 | ห้องถูกจองแล้ว |
| VALIDATION_ERROR | 400 | ข้อมูลไม่ถูกต้อง |
| DATABASE_ERROR | 500 | ข้อผิดพลาดฐานข้อมูล |
| INTERNAL_ERROR | 500 | ข้อผิดพลาดภายใน |
