# บทที่ 2: การออกแบบฐานข้อมูล

## 2.1 ภาพรวมของฐานข้อมูล

ระบบใช้ **PostgreSQL** เป็นระบบจัดการฐานข้อมูล และใช้ **Prisma ORM** เป็นตัวกลางในการเชื่อมต่อและจัดการข้อมูล

### จำนวนตารางทั้งหมด: 10 ตาราง

1. User - ข้อมูลผู้ใช้งาน
2. Room - ข้อมูลห้อง
3. Booking - การจองห้อง
4. RecurringBooking - การจองแบบประจำ
5. RoomMaintenance - การบำรุงรักษาห้อง
6. Semester - ภาคการศึกษา
7. SpecialDate - วันสำคัญ
8. Notification - การแจ้งเตือน
9. Announcement - ประกาศ

## 2.2 รายละเอียดตารางฐานข้อมูล

### 2.2.1 ตาราง User (ผู้ใช้งาน)

**วัตถุประสงค์**: เก็บข้อมูลผู้ใช้งานระบบทั้งหมด

| Field | Type | Description |
|-------|------|-------------|
| id | String (PK) | รหัสผู้ใช้ (CUID) |
| username | String (Unique) | ชื่อผู้ใช้สำหรับ Login |
| password | String | รหัสผ่านที่เข้ารหัสด้วย bcrypt |
| fullName | String | ชื่อ-นามสกุล |
| studentId | String? | รหัสนักศึกษา (ถ้าเป็นนักศึกษา) |
| teacherId | String? | รหัสอาจารย์ (ถ้าเป็นอาจารย์) |
| department | String? | ภาควิชา/หน่วยงาน |
| year | Int? | ชั้นปี (สำหรับนักศึกษา) |
| rmutiId | String? (Unique) | รหัสผู้ใช้จาก RMUTI SSO |
| email | String? | อีเมล @rmuti.ac.th |
| fullNameEn | String? | ชื่อ-สกุลภาษาอังกฤษ |
| faculty | String? | คณะ |
| program | String? | หลักสูตร/สาขาวิชา |
| degreeLevel | String? | ระดับการศึกษา |
| campus | String? | วิทยาเขต |
| phone | String? | เบอร์โทรศัพท์ |
| avatar | String? | URL รูปโปรไฟล์ |
| lastLoginAt | DateTime? | วันเวลาเข้าสู่ระบบล่าสุด |
| loginCount | Int | จำนวนครั้งที่เข้าสู่ระบบ |
| role | Role | บทบาท (STUDENT, TEACHER, STAFF, DEPARTMENT_HEAD) |
| isActive | Boolean | สถานะการใช้งาน |
| noShowCount | Int | จำนวนครั้งที่ไม่มาตามนัด |
| isSuspended | Boolean | สถานะถูกระงับการใช้งาน |
| suspendedUntil | DateTime? | ระงับการใช้งานจนถึงวันที่ |
| createdAt | DateTime | วันที่สร้างบัญชี |
| updatedAt | DateTime | วันที่อัปเดตข้อมูลล่าสุด |

**Relationships**:
- มีการจองหลายรายการ (bookings)
- มีการจองแบบประจำหลายรายการ (recurringBookings)
- มีการแจ้งเตือนหลายรายการ (notifications)
- สร้างประกาศได้หลายรายการ (announcements)

### 2.2.2 ตาราง Room (ห้อง)

**วัตถุประสงค์**: เก็บข้อมูลห้องเรียน/ห้องประชุมทั้งหมด

| Field | Type | Description |
|-------|------|-------------|
| id | String (PK) | รหัสห้อง (CUID) |
| name | String | ชื่อห้อง |
| type | RoomType | ประเภทห้อง |
| floor | Int? | ชั้น |
| building | String? | อาคาร |
| capacity | Int | ความจุ (จำนวนที่นั่ง) |
| equipment | Json? | รายการอุปกรณ์ (เก็บเป็น JSON) |
| description | String? | รายละเอียดเพิ่มเติม |
| openTime | String | เวลาเปิด (ค่าเริ่มต้น "08:00") |
| closeTime | String | เวลาปิด (ค่าเริ่มต้น "20:00") |
| isActive | Boolean | สถานะการใช้งาน |
| maxBookingHours | Int? | จองได้สูงสุดกี่ชั่วโมงต่อครั้ง |
| advanceBookingDays | Int? | จองล่วงหน้าได้กี่วัน |
| requireApproval | Boolean | ต้องการการอนุมัติหรือไม่ |

**Enum RoomType**:
- LECTURE - ห้องเรียน
- COMPUTER_LAB - ห้องปฏิบัติการคอมพิวเตอร์
- LABORATORY - ห้องปฏิบัติการ
- MEETING - ห้องประชุม
- STUDY - ห้องสมุดกลุ่ม

**Relationships**:
- มีการจองหลายรายการ (bookings)
- มีการจองแบบประจำหลายรายการ (recurringBookings)
- มีข้อมูลการบำรุงรักษาหลายรายการ (maintenances)

### 2.2.3 ตาราง Booking (การจองห้อง)

**วัตถุประสงค์**: เก็บข้อมูลการจองห้องแต่ละครั้ง

| Field | Type | Description |
|-------|------|-------------|
| id | String (PK) | รหัสการจอง (CUID) |
| userId | String (FK) | รหัสผู้จอง |
| roomId | String (FK) | รหัสห้องที่จอง |
| date | DateTime | วันที่จอง |
| startTime | DateTime | เวลาเริ่มต้น |
| endTime | DateTime | เวลาสิ้นสุด |
| purpose | String | วัตถุประสงค์การจอง |
| attendees | Int | จำนวนผู้เข้าร่วม |
| status | BookingStatus | สถานะการจอง |
| adminNote | String? | หมายเหตุจากผู้อนุมัติ |
| checkInTime | DateTime? | เวลาเช็คอิน |
| checkOutTime | DateTime? | เวลาเช็คเอาท์ |
| isNoShow | Boolean | ไม่มาตามนัด |
| recurringBookingId | String? (FK) | รหัสการจองแบบประจำ (ถ้ามี) |
| createdAt | DateTime | วันที่สร้างการจอง |
| updatedAt | DateTime | วันที่อัปเดตล่าสุด |

**Enum BookingStatus**:
- PENDING - รอการอนุมัติ
- APPROVED - อนุมัติแล้ว
- REJECTED - ปฏิเสธ
- CANCELLED - ยกเลิก

**Relationships**:
- เป็นของผู้ใช้คนหนึ่ง (user)
- จองห้องหนึ่ง (room)
- อาจเป็นส่วนหนึ่งของการจองแบบประจำ (recurringBooking)

### 2.2.4 ตาราง RecurringBooking (การจองแบบประจำ)

**วัตถุประสงค์**: เก็บข้อมูลการจองห้องแบบประจำ

| Field | Type | Description |
|-------|------|-------------|
| id | String (PK) | รหัสการจองแบบประจำ (CUID) |
| userId | String (FK) | รหัสผู้จอง |
| roomId | String (FK) | รหัสห้องที่จอง |
| semesterId | String? (FK) | รหัสภาคการศึกษา |
| startDate | DateTime | วันที่เริ่มต้น |
| endDate | DateTime? | วันที่สิ้นสุด |
| pattern | RecurringPattern | รูปแบบการทำซ้ำ |
| daysOfWeek | Json? | วันในสัปดาห์ที่จอง (เก็บเป็น JSON array) |
| startTime | String | เวลาเริ่มต้น |
| endTime | String | เวลาสิ้นสุด |
| purpose | String | วัตถุประสงค์การจอง |
| status | BookingStatus | สถานะการจอง |
| createdAt | DateTime | วันที่สร้างการจอง |

**Enum RecurringPattern**:
- DAILY - รายวัน
- WEEKLY - รายสัปดาห์
- CUSTOM - กำหนดเอง

**Relationships**:
- เป็นของผู้ใช้คนหนึ่ง (user)
- จองห้องหนึ่ง (room)
- เชื่อมโยงกับภาคการศึกษา (semester)
- สร้างการจองหลายรายการ (bookings)

### 2.2.5 ตาราง RoomMaintenance (การบำรุงรักษาห้อง)

**วัตถุประสงค์**: เก็บข้อมูลช่วงเวลาที่ห้องปิดบำรุง

| Field | Type | Description |
|-------|------|-------------|
| id | String (PK) | รหัส (CUID) |
| roomId | String (FK) | รหัสห้อง |
| startDate | DateTime | วันที่เริ่มปิดบำรุง |
| endDate | DateTime | วันที่เปิดใช้งานอีกครั้ง |
| reason | String | เหตุผลการปิดบำรุง |
| createdAt | DateTime | วันที่สร้างข้อมูล |

**Relationships**:
- เป็นของห้องหนึ่ง (room) - Cascade Delete

### 2.2.6 ตาราง Semester (ภาคการศึกษา)

**วัตถุประสงค์**: เก็บข้อมูลภาคการศึกษา

| Field | Type | Description |
|-------|------|-------------|
| id | String (PK) | รหัสภาคการศึกษา (CUID) |
| name | String | ชื่อภาคการศึกษา (เช่น "1/2567") |
| startDate | DateTime | วันที่เริ่มภาคการศึกษา |
| endDate | DateTime | วันที่สิ้นสุดภาคการศึกษา |
| isActive | Boolean | ภาคการศึกษาปัจจุบันหรือไม่ |
| createdAt | DateTime | วันที่สร้างข้อมูล |

**Relationships**:
- มีวันสำคัญหลายวัน (specialDates)
- มีการจองแบบประจำหลายรายการ (recurringBookings)

### 2.2.7 ตาราง SpecialDate (วันสำคัญ)

**วัตถุประสงค์**: เก็บข้อมูลวันหยุด วันสอบ และวันกิจกรรม

| Field | Type | Description |
|-------|------|-------------|
| id | String (PK) | รหัส (CUID) |
| name | String | ชื่อวันสำคัญ |
| date | DateTime | วันที่ |
| type | SpecialDateType | ประเภท |
| description | String? | รายละเอียด |
| semesterId | String? (FK) | รหัสภาคการศึกษา |

**Enum SpecialDateType**:
- HOLIDAY - วันหยุด
- EXAM - วันสอบ
- EVENT - วันกิจกรรม

**Relationships**:
- เป็นของภาคการศึกษาหนึ่ง (semester)

### 2.2.8 ตาราง Notification (การแจ้งเตือน)

**วัตถุประสงค์**: เก็บข้อมูลการแจ้งเตือนถึงผู้ใช้

| Field | Type | Description |
|-------|------|-------------|
| id | String (PK) | รหัสการแจ้งเตือน (CUID) |
| userId | String (FK) | รหัสผู้ใช้ที่จะได้รับการแจ้งเตือน |
| type | NotificationType | ประเภทการแจ้งเตือน |
| title | String | หัวข้อ |
| message | String | ข้อความ |
| isRead | Boolean | อ่านแล้วหรือยัง |
| createdAt | DateTime | วันที่สร้างการแจ้งเตือน |

**Enum NotificationType**:
- BOOKING_APPROVED - การจองได้รับการอนุมัติ
- BOOKING_REJECTED - การจองถูกปฏิเสธ
- BOOKING_REMINDER - เตือนการจองที่ใกล้ถึง
- BOOKING_CANCELLED - การจองถูกยกเลิก
- ROOM_MAINTENANCE - ห้องปิดบำรุงรักษา
- ANNOUNCEMENT - ประกาศจากระบบ

**Relationships**:
- ส่งถึงผู้ใช้คนหนึ่ง (user)

### 2.2.9 ตาราง Announcement (ประกาศ)

**วัตถุประสงค์**: เก็บข้อมูลประกาศจากระบบ

| Field | Type | Description |
|-------|------|-------------|
| id | String (PK) | รหัสประกาศ (CUID) |
| title | String | หัวข้อประกาศ |
| content | String | เนื้อหาประกาศ |
| type | AnnouncementType | ประเภทประกาศ |
| isPinned | Boolean | ปักหมุดหรือไม่ |
| publishDate | DateTime | วันที่เผยแพร่ |
| expiryDate | DateTime? | วันที่หมดอายุ |
| createdBy | String (FK) | รหัสผู้สร้าง |
| createdAt | DateTime | วันที่สร้าง |

**Enum AnnouncementType**:
- INFO - ข้อมูลทั่วไป
- WARNING - คำเตือน
- URGENT - ด่วนมาก

**Relationships**:
- สร้างโดยผู้ใช้คนหนึ่ง (creator)

## 2.3 ความสัมพันธ์ระหว่างตาราง (Entity Relationship)

### One-to-Many Relationships

1. **User → Booking** (1:N)
   - ผู้ใช้หนึ่งคนสามารถมีการจองได้หลายรายการ

2. **Room → Booking** (1:N)
   - ห้องหนึ่งสามารถถูกจองได้หลายครั้ง

3. **User → RecurringBooking** (1:N)
   - ผู้ใช้หนึ่งคนสามารถมีการจองแบบประจำได้หลายรายการ

4. **Room → RecurringBooking** (1:N)
   - ห้องหนึ่งสามารถมีการจองแบบประจำได้หลายรายการ

5. **RecurringBooking → Booking** (1:N)
   - การจองแบบประจำหนึ่งรายการสร้างการจองได้หลายครั้ง

6. **Semester → RecurringBooking** (1:N)
   - ภาคการศึกษาหนึ่งมีการจองแบบประจำได้หลายรายการ

7. **Semester → SpecialDate** (1:N)
   - ภาคการศึกษาหนึ่งมีวันสำคัญได้หลายวัน

8. **Room → RoomMaintenance** (1:N)
   - ห้องหนึ่งมีประวัติการบำรุงรักษาได้หลายครั้ง

9. **User → Notification** (1:N)
   - ผู้ใช้หนึ่งคนมีการแจ้งเตือนได้หลายรายการ

10. **User → Announcement** (1:N)
    - ผู้ใช้หนึ่งคนสร้างประกาศได้หลายรายการ

## 2.4 Database Indexes

เพื่อเพิ่มประสิทธิภาพในการค้นหา ควรสร้าง Index ดังนี้:

```sql
-- User table
CREATE INDEX idx_user_username ON "User"(username);
CREATE INDEX idx_user_rmuti_id ON "User"("rmutiId");
CREATE INDEX idx_user_role ON "User"(role);

-- Booking table
CREATE INDEX idx_booking_user_id ON "Booking"("userId");
CREATE INDEX idx_booking_room_id ON "Booking"("roomId");
CREATE INDEX idx_booking_date ON "Booking"(date);
CREATE INDEX idx_booking_status ON "Booking"(status);
CREATE INDEX idx_booking_date_room ON "Booking"(date, "roomId");

-- Room table
CREATE INDEX idx_room_type ON "Room"(type);
CREATE INDEX idx_room_is_active ON "Room"("isActive");

-- Notification table
CREATE INDEX idx_notification_user_id ON "Notification"("userId");
CREATE INDEX idx_notification_is_read ON "Notification"("isRead");
```

## 2.5 Data Validation Rules

### Business Rules ที่บังคับในระดับฐานข้อมูล

1. **Username และ rmutiId ต้องไม่ซ้ำ** (Unique constraint)
2. **การจองต้องมีผู้จองและห้อง** (Foreign key constraints)
3. **startTime ต้องน้อยกว่า endTime** (ตรวจสอบใน Application Layer)
4. **วันที่จองต้องไม่เป็นอดีต** (ตรวจสอบใน Application Layer)
5. **จำนวนผู้เข้าร่วมต้องไม่เกินความจุของห้อง** (ตรวจสอบใน Application Layer)

## 2.6 Database Migration Strategy

ใช้ Prisma Migrate สำหรับการจัดการ Database Schema:

```bash
# สร้าง migration ใหม่
npx prisma migrate dev --name description

# Deploy to production
npx prisma migrate deploy

# Reset database (development only)
npx prisma migrate reset
```

## 2.7 Data Seeding

มีไฟล์ `prisma/seed.ts` สำหรับสร้างข้อมูลทดสอบ:

```bash
npm run db:seed
```

ข้อมูลที่ seed:
- ผู้ใช้ตัวอย่าง (Admin, Teacher, Student)
- ห้องตัวอย่าง
- ภาคการศึกษาปัจจุบัน
