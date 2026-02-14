# บทที่ 5: การออกแบบ User Interface

## 5.1 หลักการออกแบบ UI/UX

### 5.1.1 Design Principles

ระบบออกแบบโดยยึดหลักการดังนี้:

1. **User-Centered Design**
   - ออกแบบโดยคำนึงถึงผู้ใช้เป็นหลัก
   - ทำความเข้าใจ User Persona และ Use Cases
   - ลดขั้นตอนการทำงานให้น้อยที่สุด

2. **Consistency (ความสม่ำเสมอ)**
   - ใช้ Design System เดียวกันทั้งระบบ
   - สี, ฟอนต์, spacing ที่เป็นมาตรฐาน
   - Pattern การใช้งานที่คล้ายกันในทุกหน้า

3. **Accessibility (การเข้าถึง)**
   - Responsive Design รองรับทุกขนาดหน้าจอ
   - สีที่มี Contrast ratio เพียงพอ
   - รองรับ Keyboard Navigation

4. **Feedback (การตอบสนอง)**
   - แจ้งเตือนเมื่อทำงานสำเร็จหรือผิดพลาด
   - Loading states ขณะรอข้อมูล
   - Validation messages ที่ชัดเจน

5. **Simplicity (ความเรียบง่าย)**
   - หน้าจอไม่ซับซ้อน ข้อมูลจัดเรียงเป็นหมวดหมู่
   - ใช้ Icon ประกอบคำอธิบาย
   - Navigation ที่ชัดเจน

## 5.2 Color Scheme และ Typography

### 5.2.1 Color Palette

```css
/* Primary Colors */
--primary: #3B82F6        /* Blue - ใช้สำหรับ CTA หลัก */
--primary-hover: #2563EB
--primary-light: #DBEAFE

/* Secondary Colors */
--secondary: #64748B      /* Slate Gray */

/* Status Colors */
--success: #10B981        /* Green - อนุมัติ, สำเร็จ */
--warning: #F59E0B        /* Amber - รอการอนุมัติ, คำเตือน */
--error: #EF4444          /* Red - ปฏิเสธ, ผิดพลาด */
--info: #3B82F6           /* Blue - ข้อมูลทั่วไป */

/* Neutral Colors */
--background: #FFFFFF
--surface: #F9FAFB
--border: #E5E7EB
--text: #1F2937
--text-secondary: #6B7280
```

### 5.2.2 Typography

```css
/* Font Family */
font-family: 'Inter', 'Noto Sans Thai', sans-serif;

/* Font Sizes */
--text-xs: 0.75rem    /* 12px - คำอธิบายเล็กๆ */
--text-sm: 0.875rem   /* 14px - ข้อความทั่วไป */
--text-base: 1rem     /* 16px - ข้อความหลัก */
--text-lg: 1.125rem   /* 18px - หัวข้อย่อย */
--text-xl: 1.25rem    /* 20px */
--text-2xl: 1.5rem    /* 24px - หัวข้อหลัก */
--text-3xl: 1.875rem  /* 30px - Page title */
--text-4xl: 2.25rem   /* 36px */
```

## 5.3 Layout และ Navigation

### 5.3.1 Overall Layout Structure

```
┌─────────────────────────────────────────────────────┐
│                     Header                           │
│  [Logo] [User Menu] [Notifications] [Lang] [Avatar] │
├──────────┬──────────────────────────────────────────┤
│          │                                           │
│          │                                           │
│ Sidebar  │          Main Content                    │
│          │                                           │
│ - Home   │  [Breadcrumb]                            │
│ - Rooms  │                                           │
│ - Book   │  [Page Title]                            │
│ - My     │                                           │
│ - Admin  │  [Content Area]                          │
│          │                                           │
│          │                                           │
└──────────┴──────────────────────────────────────────┘
```

### 5.3.2 Navigation Menu

#### สำหรับนักศึกษา
- 🏠 หน้าหลัก (Dashboard)
- 🏢 ห้องทั้งหมด (Rooms)
- ➕ จองห้อง (New Booking)
- 📋 การจองของฉัน (My Bookings)
- 🔔 การแจ้งเตือน (Notifications)

#### สำหรับอาจารย์ (เพิ่มจากนักศึกษา)
- 🔄 จองแบบประจำ (Recurring Bookings)

#### สำหรับเจ้าหน้าที่ (เพิ่มเติม)
- 👥 จัดการผู้ใช้ (Users)
- ✅ อนุมัติการจอง (Approvals)
- 🏢 จัดการห้อง (Room Management)
- 📅 ภาคการศึกษา (Semesters)
- 📢 ประกาศ (Announcements)
- 📊 รายงาน (Reports)

## 5.4 Key Pages และ Screens

### 5.4.1 Login Page

**Layout:**
- แบ่งครึ่งหน้าจอ
- ซ้าย: รูปภาพ/ภาพประกอบของระบบ
- ขวา: ฟอร์ม Login

**Elements:**
- Input: Username (ไอคอน 👤)
- Input: Password (ไอคอน 🔒)
- Button: เข้าสู่ระบบ (Primary button)
- Button: เข้าสู่ระบบด้วย RMUTI (Secondary button)
- Link: สมัครสมาชิก

**Features:**
- Form validation แบบ real-time
- Error messages ใต้ input
- Loading state ขณะ login

### 5.4.2 Dashboard Page

**Layout:**
- Cards แสดงสถิติ (สำหรับ Admin)
  - จำนวนการจองทั้งหมด
  - การจองวันนี้
  - ห้องที่ใช้งานอยู่
  - รออนุมัติ
  
- การจองที่กำลังจะถึง (Upcoming Bookings)
  - แสดงเป็น List/Timeline
  - แสดงข้อมูล: ห้อง, วันเวลา, วัตถุประสงค์
  
- ประกาศสำคัญ (Announcements)
  - แสดงประกาศล่าสุด
  - ปักหมุดประกาศด่วน

### 5.4.3 Room List Page

**Layout:**
- Filter Sidebar (ด้านซ้าย)
  - ประเภทห้อง (Dropdown)
  - อาคาร (Dropdown)
  - ความจุขั้นต่ำ (Number input)
  - อุปกรณ์ (Checkboxes)
  
- Room Cards Grid (ด้านขวา)
  - แสดงเป็น Grid 3 columns
  - แต่ละ Card แสดง:
    - รูปห้อง (ถ้ามี) / placeholder
    - ชื่อห้อง (ใหญ่ชัดเจน)
    - อาคาร + ชั้น
    - ความจุ (ไอคอน 👥)
    - อุปกรณ์ (ไอคอน)
    - ปุ่ม "ดูรายละเอียด" หรือ "จองเลย"

**Interactions:**
- Hover effect บน Card
- Click เพื่อดูรายละเอียดห้อง
- Pagination หรือ Infinite Scroll

### 5.4.4 Booking Form

**Layout:**
- แบบ Step-by-Step หรือ Single Page Form

**Step 1: เลือกห้อง**
- แสดงรายการห้องที่ว่าง
- สามารถ filter ได้

**Step 2: เลือกวันเวลา**
- Date Picker (Calendar)
- Time Picker (Dropdown หรือ Slider)
- แสดง Time slots ที่ว่าง

**Step 3: กรอกรายละเอียด**
- วัตถุประสงค์ (Textarea)
- จำนวนผู้เข้าร่วม (Number input)
- หมายเหตุเพิ่มเติม (Textarea - optional)

**Step 4: ยืนยัน**
- แสดงสรุปข้อมูลทั้งหมด
- ปุ่ม "ยืนยันการจอง"

**Features:**
- Validation แต่ละ step
- ปุ่ม "กลับ" และ "ถัดไป"
- Progress indicator
- Availability check แบบ real-time

### 5.4.5 My Bookings Page

**Layout:**
- Tabs แยกตามสถานะ:
  - ทั้งหมด (All)
  - กำลังจะมาถึง (Upcoming)
  - รอการอนุมัติ (Pending)
  - อนุมัติแล้ว (Approved)
  - ประวัติ (History)

**Booking Card:**
```
┌────────────────────────────────────────┐
│ [Status Badge]                  [Menu] │
│                                        │
│ 🏢 ห้อง 301, อาคาร 1, ชั้น 3         │
│ 📅 15 มีนาคม 2567                     │
│ ⏰ 13:00 - 15:00 (2 ชั่วโมง)         │
│ 👥 30 คน                              │
│ 📝 ติวเสริม                           │
│                                        │
│ [เช็คอิน] [ยกเลิก]                    │
└────────────────────────────────────────┘
```

**Colors:**
- สีเหลือง (PENDING) - รอการอนุมัติ
- สีเขียว (APPROVED) - อนุมัติแล้ว
- สีแดง (REJECTED) - ปฏิเสธ
- สีเทา (CANCELLED) - ยกเลิกแล้ว

### 5.4.6 Admin - Approval Page

**Layout:**
- Table หรือ Card List
- แสดงการจองที่รอการอนุมัติ

**Each Row/Card:**
- ข้อมูลผู้จอง (ชื่อ, ID)
- ห้อง
- วันเวลา
- วัตถุประสงค์
- Actions: [อนุมัติ] [ปฏิเสธ]

**Modal สำหรับอนุมัติ/ปฏิเสธ:**
- แสดงรายละเอียดเต็ม
- Textarea สำหรับหมายเหตุ
- ปุ่ม Confirm

## 5.5 Components และ UI Elements

### 5.5.1 Buttons

```
Primary Button   - สีน้ำเงิน ใช้สำหรับ action หลัก
Secondary Button - ขอบสีน้ำเงิน พื้นขาว ใช้สำหรับ action รอง
Danger Button    - สีแดง ใช้สำหรับ delete, reject
Success Button   - สีเขียว ใช้สำหรับ approve, confirm
```

### 5.5.2 Cards

- มี shadow เล็กน้อย
- Border radius 8px
- Padding 16-24px
- Hover effect: shadow เพิ่มขึ้น

### 5.5.3 Forms

- Label ชัดเจน
- Required fields มี * สีแดง
- Error message สีแดงใต้ input
- Success validation สีเขียว

### 5.5.4 Tables

- Header พื้นสีเทาอ่อน
- Zebra striping (แถวสลับสี)
- Hover effect บน row
- Actions column ขวาสุด

### 5.5.5 Modals/Dialogs

- Backdrop สีเทาโปร่งแสง
- Modal อยู่กลางหน้าจอ
- มีปุ่มปิด (X) มุมขวาบน
- ปุ่ม Cancel และ Confirm ด้านล่าง

### 5.5.6 Toast Notifications

```javascript
Success: เขียว, ไอคอน ✓
Error: แดง, ไอคอน ✗
Warning: เหลือง, ไอคอน ⚠
Info: น้ำเงิน, ไอคอน ℹ
```

- แสดงที่มุมขวาบน
- Auto-dismiss หลัง 3-5 วินาที
- สามารถปิดด้วยตนเองได้

## 5.6 Responsive Design

### 5.6.1 Breakpoints

```css
/* Mobile */
@media (max-width: 640px)

/* Tablet */
@media (min-width: 641px) and (max-width: 1024px)

/* Desktop */
@media (min-width: 1025px)
```

### 5.6.2 Mobile Adaptations

**Navigation:**
- Sidebar แปลงเป็น Hamburger Menu
- Bottom Navigation Bar (ถ้าเหมาะสม)

**Layout:**
- Grid columns ลดลง (3 → 2 → 1)
- Stack vertically
- Font size เล็กลงเล็กน้อย

**Interactions:**
- Touch-friendly buttons (ขนาดใหญ่ขึ้น)
- Swipe gestures
- Pull-to-refresh

## 5.7 Icons และ Visual Elements

### 5.7.1 Icon Library

ใช้ **Lucide React Icons**

- ✓ Modern และ Consistent
- ✓ Tree-shakable (ไม่กระทบ bundle size)
- ✓ Customizable

**ตัวอย่าง Icons ที่ใช้:**
```
Home: 🏠 (Home)
Rooms: 🏢 (Building)
Calendar: 📅 (Calendar)
Clock: ⏰ (Clock)
User: 👤 (User)
Users: 👥 (Users)
Bell: 🔔 (Bell)
Settings: ⚙️ (Settings)
Check: ✓ (Check)
X: ✗ (X)
```

### 5.7.2 Images และ Placeholders

- Room images: 16:9 ratio
- User avatars: Circle, 40x40px
- Placeholder images เมื่อไม่มีรูป

## 5.8 Accessibility (A11y)

### 5.8.1 WCAG Guidelines

- **Level AA Compliance**
- Color contrast ratio ≥ 4.5:1
- Focus indicators ชัดเจน
- Alt text สำหรับรูปภาพ

### 5.8.2 Keyboard Navigation

- Tab navigation ทำงานได้ทั้งระบบ
- Escape key ปิด modal
- Enter key submit form
- Arrow keys navigate lists

### 5.8.3 Screen Reader Support

- Semantic HTML
- ARIA labels
- Descriptive link text

## 5.9 Performance Considerations

### 5.9.1 Image Optimization

- ใช้ Next.js Image component
- Lazy loading
- WebP format
- Responsive images

### 5.9.2 Code Splitting

- Dynamic imports
- Route-based splitting
- Component-level splitting

### 5.9.3 Loading States

- Skeleton screens
- Spinners
- Progress bars
- Shimmer effects

## 5.10 Design System Tools

### 5.10.1 Component Library

**shadcn/ui** - Headless UI components

**ข้อดี:**
- Copy-paste components (ไม่ใช่ dependency)
- Customizable ได้ทุกอย่าง
- Built with Radix UI (Accessible)
- Styled with Tailwind CSS

**Components ที่ใช้:**
- Button
- Card
- Dialog/Modal
- Form (Input, Select, Textarea)
- Table
- Dropdown Menu
- Alert Dialog
- Badge
- Calendar/Date Picker
- Tabs
- Toast (Sonner)

### 5.10.2 Styling Approach

**Tailwind CSS** - Utility-first CSS

**ข้อดี:**
- Rapid development
- Consistent design tokens
- No CSS file bloat
- Easy to maintain

**Example:**
```jsx
<button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">
  จองห้อง
</button>
```

## 5.11 Animation และ Transitions

### 5.11.1 Micro-interactions

- Button hover: scale(1.02)
- Card hover: shadow เพิ่ม
- Input focus: border color เปลี่ยน
- Page transitions: fade in/out

### 5.11.2 Animation Library

ใช้ CSS transitions และ Tailwind CSS animations

```css
transition-all duration-200 ease-in-out
```

## 5.12 Dark Mode (Future Enhancement)

ระบบออกแบบไว้รองรับ Dark Mode:

```css
/* Light Mode */
.light {
  --background: white;
  --text: black;
}

/* Dark Mode */
.dark {
  --background: #1F2937;
  --text: white;
}
```

ใช้ `next-themes` package สำหรับ Dark Mode toggle

---

## สรุป

การออกแบบ UI ของระบบยึดหลักการ:
- ✅ ใช้งานง่าย (Usability)
- ✅ สวยงามและทันสมัย (Modern Design)
- ✅ ตอบสนองเร็ว (Performance)
- ✅ เข้าถึงได้ง่าย (Accessibility)
- ✅ Responsive ทุกอุปกรณ์

**Design System** ที่เลือกใช้ (Tailwind CSS + shadcn/ui) ช่วยให้:
- พัฒนาได้เร็ว
- Maintain ง่าย
- Consistent ทั้งระบบ
- Performance ดี
