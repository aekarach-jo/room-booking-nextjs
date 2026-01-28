import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import {
  RMUTI_SSO_CONFIG,
  exchangeCodeForTokens,
  getUserInfo,
  mapRMUTIUserTypeToRole,
  type RMUTIUserInfo,
} from '@/lib/rmuti-sso';

/**
 * GET /api/auth/rmuti/callback - Handle RMUTI SSO callback
 * Exchanges authorization code for tokens and creates/updates user
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const state = searchParams.get('state');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    // Handle OAuth errors
    if (error) {
      console.error('RMUTI SSO error:', error, errorDescription);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, request.url)
      );
    }

    // Validate required parameters
    if (!code || !state) {
      return NextResponse.redirect(
        new URL('/login?error=Missing authorization code or state', request.url)
      );
    }

    // Validate state (CSRF protection)
    const cookieStore = await cookies();
    const storedState = cookieStore.get('rmuti_oauth_state')?.value;

    if (!storedState || storedState !== state) {
      return NextResponse.redirect(
        new URL('/login?error=Invalid state parameter', request.url)
      );
    }

    // Clear the state cookie
    cookieStore.delete('rmuti_oauth_state');

    // Exchange code for tokens
    const tokens = await exchangeCodeForTokens(code);

    // Get user info from RMUTI API
    const rmutiUser = await getUserInfo(tokens.access_token);

    // Create or update user in database
    const user = await upsertUserFromRMUTI(rmutiUser);

    // Generate JWT token
    const jwtToken = signToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    // Set auth cookie
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.set('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('RMUTI SSO callback error:', error);
    return NextResponse.redirect(
      new URL('/login?error=SSO login failed. Please try again.', request.url)
    );
  }
}

/**
 * Create or update user from RMUTI data
 */
async function upsertUserFromRMUTI(rmutiUser: RMUTIUserInfo) {
  const role = mapRMUTIUserTypeToRole(rmutiUser.user_type);
  
  // Generate a unique username from RMUTI data
  const username = rmutiUser.student_id || rmutiUser.employee_id || rmutiUser.username;
  
  // Get full name (prefer Thai, fallback to English)
  const fullName = rmutiUser.name_th || rmutiUser.name_en || 
    `${rmutiUser.firstname_th || rmutiUser.firstname_en || ''} ${rmutiUser.lastname_th || rmutiUser.lastname_en || ''}`.trim() ||
    username;

  // Check if user exists (by rmutiId or username)
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { rmutiId: rmutiUser.sub },
        { username: username },
      ],
    },
  });

  if (existingUser) {
    // Update existing user with latest RMUTI data
    return prisma.user.update({
      where: { id: existingUser.id },
      data: {
        rmutiId: rmutiUser.sub,
        fullName: fullName,
        department: rmutiUser.department || rmutiUser.faculty,
        year: rmutiUser.year,
        studentId: rmutiUser.student_id,
        teacherId: rmutiUser.employee_id,
        // Don't update role if already set (admin might have changed it)
        ...(existingUser.role === 'STUDENT' ? { role: role as 'STUDENT' | 'TEACHER' | 'STAFF' | 'DEPARTMENT_HEAD' } : {}),
      },
    });
  }

  // Create new user
  // Generate a random password (user can't use it directly, they must login via SSO)
  const randomPassword = crypto.randomUUID();
  const bcrypt = await import('bcrypt');
  const hashedPassword = await bcrypt.hash(randomPassword, 10);

  return prisma.user.create({
    data: {
      username: username,
      password: hashedPassword,
      fullName: fullName,
      role: role as 'STUDENT' | 'TEACHER' | 'STAFF' | 'DEPARTMENT_HEAD',
      studentId: rmutiUser.student_id,
      teacherId: rmutiUser.employee_id,
      department: rmutiUser.department || rmutiUser.faculty,
      year: rmutiUser.year,
      rmutiId: rmutiUser.sub,
      isActive: true,
    },
  });
}
