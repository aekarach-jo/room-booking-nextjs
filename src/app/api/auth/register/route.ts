import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword, signToken } from '@/lib/auth';
import { registerSchema } from '@/lib/validations/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate input
    const result = registerSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: result.error.flatten() },
        { status: 400 }
      );
    }

    const { username, password, fullName, email, role, studentId, teacherId, department, year } = result.data;

    // Check if username already exists
    const existingUser = await prisma.user.findUnique({
      where: { username },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create user
    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        fullName,
        email,
        role,
        studentId: role === 'STUDENT' ? studentId : null,
        teacherId: role === 'TEACHER' ? teacherId : null,
        department,
        year: role === 'STUDENT' ? year : null,
      },
      select: {
        id: true,
        username: true,
        fullName: true,
        role: true,
        studentId: true,
        teacherId: true,
        department: true,
        year: true,
        isActive: true,
        isSuspended: true,
        createdAt: true,
      },
    });

    // Generate token
    const token = signToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    const response = NextResponse.json(
      { token, user },
      { status: 201 }
    );

    // Set cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
