// Re-export Prisma types
export type {
  User,
  Room,
  Booking,
  RecurringBooking,
  RoomMaintenance,
  Semester,
  SpecialDate,
  Notification,
  Announcement,
} from '@prisma/client';

// Re-export enums
export {
  Role,
  RoomType,
  BookingStatus,
  RecurringPattern,
  SpecialDateType,
  NotificationType,
  AnnouncementType,
} from '@prisma/client';

// API Response types
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Auth types
export interface LoginResponse {
  token: string;
  user: UserResponse;
}

export interface UserResponse {
  id: string;
  username: string;
  fullName: string;
  fullNameEn?: string | null;
  email?: string | null;
  role: string;
  studentId?: string | null;
  teacherId?: string | null;
  department?: string | null;
  faculty?: string | null;
  program?: string | null;
  degreeLevel?: string | null;
  campus?: string | null;
  phone?: string | null;
  avatar?: string | null;
  year?: number | null;
  isActive: boolean;
  isSuspended: boolean;
  suspendedUntil?: Date | string | null;
  lastLoginAt?: Date | string | null;
  loginCount?: number;
  createdAt?: Date | string;
}

// Booking with relations
export interface BookingWithRelations {
  id: string;
  userId: string;
  roomId: string;
  date: Date;
  startTime: Date;
  endTime: Date;
  purpose: string;
  attendees: number;
  status: string;
  adminNote?: string | null;
  checkInTime?: Date | null;
  checkOutTime?: Date | null;
  isNoShow: boolean;
  recurringBookingId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  user: {
    id: string;
    username: string;
    fullName: string;
    role: string;
  };
  room: {
    id: string;
    name: string;
    type: string;
    building?: string | null;
    floor?: number | null;
  };
}

// Room with relations
export interface RoomWithRelations {
  id: string;
  name: string;
  type: string;
  floor?: number | null;
  building?: string | null;
  capacity: number;
  equipment?: string[] | null;
  description?: string | null;
  openTime?: string | null;
  closeTime?: string | null;
  isActive: boolean;
  maxBookingHours?: number | null;
  advanceBookingDays?: number | null;
  requireApproval: boolean;
  _count?: {
    bookings: number;
  };
}

// Analytics types
export interface OverviewStats {
  totalBookings: number;
  pendingBookings: number;
  totalRooms: number;
  activeUsers: number;
  todayBookings: number;
  weeklyBookings: number;
}

export interface RoomUsageStats {
  roomId: string;
  roomName: string;
  totalBookings: number;
  totalHours: number;
  utilizationRate: number;
}

export interface BookingTrend {
  date: string;
  count: number;
}
