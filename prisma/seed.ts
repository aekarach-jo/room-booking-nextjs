import { PrismaClient, Role, RoomType, BookingStatus, AnnouncementType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Create Users
  const hashedPassword = await bcrypt.hash('password123', 10);

  const admin = await prisma.user.upsert({
    where: { username: 'admin' },
    update: {},
    create: {
      username: 'admin',
      password: hashedPassword,
      fullName: 'System Administrator',
      role: Role.STAFF,
      department: 'IT Department',
    },
  });

  const teacher = await prisma.user.upsert({
    where: { username: 'teacher1' },
    update: {},
    create: {
      username: 'teacher1',
      password: hashedPassword,
      fullName: 'Dr. Somchai Prasert',
      role: Role.TEACHER,
      teacherId: 'T001',
      department: 'Computer Science',
    },
  });

  const student1 = await prisma.user.upsert({
    where: { username: 'student1' },
    update: {},
    create: {
      username: 'student1',
      password: hashedPassword,
      fullName: 'Nattapong Srisuk',
      role: Role.STUDENT,
      studentId: '6501001',
      department: 'Computer Science',
      year: 3,
    },
  });

  const student2 = await prisma.user.upsert({
    where: { username: 'student2' },
    update: {},
    create: {
      username: 'student2',
      password: hashedPassword,
      fullName: 'Wanida Chaidee',
      role: Role.STUDENT,
      studentId: '6501002',
      department: 'Information Technology',
      year: 2,
    },
  });

  console.log('Users created');

  // Create Rooms
  const room1 = await prisma.room.upsert({
    where: { id: 'room-lecture-101' },
    update: {},
    create: {
      id: 'room-lecture-101',
      name: 'Lecture Room 101',
      type: RoomType.LECTURE,
      floor: 1,
      building: 'Building A',
      capacity: 50,
      equipment: ['Projector', 'Whiteboard', 'Air Conditioning', 'Microphone'],
      description: 'Large lecture room with modern facilities',
      openTime: '08:00',
      closeTime: '20:00',
      maxBookingHours: 4,
      advanceBookingDays: 14,
      requireApproval: true,
    },
  });

  const room2 = await prisma.room.upsert({
    where: { id: 'room-lab-201' },
    update: {},
    create: {
      id: 'room-lab-201',
      name: 'Computer Lab 201',
      type: RoomType.COMPUTER_LAB,
      floor: 2,
      building: 'Building B',
      capacity: 30,
      equipment: ['Computers (30)', 'Projector', 'Air Conditioning', 'Printer'],
      description: 'Computer laboratory with high-spec workstations',
      openTime: '08:00',
      closeTime: '18:00',
      maxBookingHours: 3,
      advanceBookingDays: 7,
      requireApproval: true,
    },
  });

  const room3 = await prisma.room.upsert({
    where: { id: 'room-meeting-301' },
    update: {},
    create: {
      id: 'room-meeting-301',
      name: 'Meeting Room 301',
      type: RoomType.MEETING,
      floor: 3,
      building: 'Building A',
      capacity: 12,
      equipment: ['TV Screen', 'Whiteboard', 'Video Conferencing', 'Air Conditioning'],
      description: 'Small meeting room for group discussions',
      openTime: '08:00',
      closeTime: '20:00',
      maxBookingHours: 2,
      advanceBookingDays: 7,
      requireApproval: false,
    },
  });

  const room4 = await prisma.room.upsert({
    where: { id: 'room-study-102' },
    update: {},
    create: {
      id: 'room-study-102',
      name: 'Study Room 102',
      type: RoomType.STUDY,
      floor: 1,
      building: 'Library',
      capacity: 8,
      equipment: ['Whiteboard', 'Power Outlets', 'Air Conditioning'],
      description: 'Quiet study room for small groups',
      openTime: '07:00',
      closeTime: '22:00',
      maxBookingHours: 3,
      advanceBookingDays: 3,
      requireApproval: false,
    },
  });

  const room5 = await prisma.room.upsert({
    where: { id: 'room-lab-physics' },
    update: {},
    create: {
      id: 'room-lab-physics',
      name: 'Physics Laboratory',
      type: RoomType.LABORATORY,
      floor: 2,
      building: 'Science Building',
      capacity: 25,
      equipment: ['Lab Equipment', 'Safety Gear', 'Projector', 'Air Conditioning'],
      description: 'Physics laboratory with experimental equipment',
      openTime: '09:00',
      closeTime: '17:00',
      maxBookingHours: 3,
      advanceBookingDays: 7,
      requireApproval: true,
    },
  });

  console.log('Rooms created');

  // Create Semester
  const semester = await prisma.semester.upsert({
    where: { id: 'semester-2024-2' },
    update: {},
    create: {
      id: 'semester-2024-2',
      name: 'Semester 2/2024',
      startDate: new Date('2024-11-01'),
      endDate: new Date('2025-03-31'),
      isActive: true,
    },
  });

  console.log('Semester created');

  // Create some sample bookings
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  const nextWeek = new Date(today);
  nextWeek.setDate(nextWeek.getDate() + 7);

  await prisma.booking.create({
    data: {
      userId: student1.id,
      roomId: room3.id,
      date: tomorrow,
      startTime: new Date(`${tomorrow.toISOString().split('T')[0]}T10:00:00`),
      endTime: new Date(`${tomorrow.toISOString().split('T')[0]}T12:00:00`),
      purpose: 'Group project meeting',
      attendees: 5,
      status: BookingStatus.APPROVED,
    },
  });

  await prisma.booking.create({
    data: {
      userId: teacher.id,
      roomId: room1.id,
      date: tomorrow,
      startTime: new Date(`${tomorrow.toISOString().split('T')[0]}T13:00:00`),
      endTime: new Date(`${tomorrow.toISOString().split('T')[0]}T16:00:00`),
      purpose: 'Special lecture on AI',
      attendees: 40,
      status: BookingStatus.APPROVED,
    },
  });

  await prisma.booking.create({
    data: {
      userId: student2.id,
      roomId: room2.id,
      date: nextWeek,
      startTime: new Date(`${nextWeek.toISOString().split('T')[0]}T09:00:00`),
      endTime: new Date(`${nextWeek.toISOString().split('T')[0]}T12:00:00`),
      purpose: 'Programming workshop',
      attendees: 20,
      status: BookingStatus.PENDING,
    },
  });

  console.log('Bookings created');

  // Create Announcements
  await prisma.announcement.create({
    data: {
      title: 'Welcome to Room Booking System',
      content: 'Welcome to our new room booking system! You can now easily book rooms for your classes, meetings, and study sessions. Please read the guidelines before making your first booking.',
      type: AnnouncementType.INFO,
      isPinned: true,
      createdBy: admin.id,
    },
  });

  await prisma.announcement.create({
    data: {
      title: 'Maintenance Schedule',
      content: 'Building A will undergo maintenance from January 15-17. Some rooms may be unavailable during this period. Please plan your bookings accordingly.',
      type: AnnouncementType.WARNING,
      isPinned: false,
      createdBy: admin.id,
    },
  });

  console.log('Announcements created');

  // Create Notifications for users
  await prisma.notification.create({
    data: {
      userId: student1.id,
      type: 'BOOKING_APPROVED',
      title: 'Booking Approved',
      message: 'Your booking for Meeting Room 301 has been approved.',
      isRead: false,
    },
  });

  await prisma.notification.create({
    data: {
      userId: student2.id,
      type: 'BOOKING_REMINDER',
      title: 'Upcoming Booking Reminder',
      message: 'You have a booking for Computer Lab 201 next week.',
      isRead: false,
    },
  });

  console.log('Notifications created');

  console.log('Seeding completed!');
  console.log('\n--- Test Accounts ---');
  console.log('Admin: admin / password123');
  console.log('Teacher: teacher1 / password123');
  console.log('Student 1: student1 / password123');
  console.log('Student 2: student2 / password123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
