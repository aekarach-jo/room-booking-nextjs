import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { verifyAuth, isAdmin } from '@/lib/auth';

const SETTING_KEY = 'email_notification_recipients';

// GET /api/settings/email-recipients — returns recipient user IDs and their details
export async function GET(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!isAdmin(user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const setting = await prisma.systemSetting.findUnique({ where: { key: SETTING_KEY } });
    const recipientIds: string[] = Array.isArray(setting?.value) ? (setting!.value as string[]) : [];

    // Return full user details for each recipient
    const recipients = recipientIds.length > 0
      ? await prisma.user.findMany({
          where: { id: { in: recipientIds }, isActive: true },
          select: { id: true, fullName: true, email: true, role: true, department: true },
          orderBy: { fullName: 'asc' },
        })
      : [];

    return NextResponse.json({ recipientIds, recipients });
  } catch (error) {
    console.error('GET email-recipients error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/settings/email-recipients — update recipient user IDs list
export async function PUT(request: NextRequest) {
  try {
    const user = await verifyAuth(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    if (!isAdmin(user)) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { recipientIds } = body as { recipientIds: string[] };

    if (!Array.isArray(recipientIds)) {
      return NextResponse.json({ error: 'recipientIds must be an array' }, { status: 400 });
    }

    // Verify all IDs belong to active users
    const validUsers = await prisma.user.findMany({
      where: { id: { in: recipientIds }, isActive: true },
      select: { id: true },
    });
    const validIds = validUsers.map((u) => u.id);

    await prisma.systemSetting.upsert({
      where: { key: SETTING_KEY },
      create: { key: SETTING_KEY, value: validIds },
      update: { value: validIds },
    });

    return NextResponse.json({ success: true, recipientIds: validIds });
  } catch (error) {
    console.error('PUT email-recipients error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
