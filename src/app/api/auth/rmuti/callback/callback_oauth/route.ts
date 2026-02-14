import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { prisma } from '@/lib/prisma';
import { signToken } from '@/lib/auth';
import {
  exchangeCodeForTokens,
  getUserInfo,
  normalizeUserInfo,
  mapRMUTIUserTypeToRole,
} from '@/lib/rmuti-sso';

/**
 * GET /api/auth/rmuti/callback/callback_oauth - Handle RMUTI SSO callback
 * RMUTI redirects to this path with the authorization code
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const code = searchParams.get('code');
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');

    console.log('RMUTI SSO callback received:', { 
      code: code ? 'present' : 'missing',
      error,
      url: request.url 
    });

    // Handle OAuth errors
    if (error) {
      console.error('RMUTI SSO error:', error, errorDescription);
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(errorDescription || error)}`, request.url)
      );
    }

    // Validate required parameters
    if (!code) {
      console.error('RMUTI SSO: Missing authorization code');
      return NextResponse.redirect(
        new URL('/login?error=Missing authorization code', request.url)
      );
    }

    // Clear any existing state cookie
    const cookieStore = await cookies();
    cookieStore.delete('rmuti_oauth_state');

    // Exchange code for tokens
    console.log('RMUTI SSO: Exchanging code for tokens...');
    const tokens = await exchangeCodeForTokens(code);
    console.log('RMUTI SSO: Got tokens:', { 
      hasAccessToken: !!tokens.access_token,
      tokenType: tokens.token_type 
    });

    // Get user info from RMUTI API
    console.log('RMUTI SSO: Fetching user info...');
    const rmutiUserRaw = await getUserInfo(tokens.access_token);
    console.log('RMUTI SSO: Got user info (RAW):', JSON.stringify(rmutiUserRaw, null, 2));
    
    // Normalize the user data
    const rmutiUser = normalizeUserInfo(rmutiUserRaw);
    console.log('RMUTI SSO: Normalized user:', JSON.stringify(rmutiUser, null, 2));

    // Create or update user in database
    const user = await upsertUserFromRMUTI(rmutiUser);
    console.log('RMUTI SSO: User created/updated:', { 
      id: user.id, 
      username: user.username 
    });

    // Generate JWT token
    const jwtToken = signToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    // Set auth cookie and redirect to home
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.set('token', jwtToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      path: '/',
    });

    console.log('RMUTI SSO: Login successful, redirecting to home');
    return response;
  } catch (error) {
    console.error('RMUTI SSO callback error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent('SSO login failed: ' + errorMessage)}`, request.url)
    );
  }
}

/**
 * Create or update user from RMUTI data
 */
async function upsertUserFromRMUTI(rmutiUser: {
  rmutiId: string;
  username: string;
  fullName: string;
  fullNameEn: string | null;
  email: string | null;
  studentId: string | null;
  employeeId: string | null;
  department: string | null;
  faculty: string | null;
  program: string | null;
  degreeLevel: string | null;
  campus: string | null;
  phone: string | null;
  avatar: string | null;
  year: number | null;
  userType: string;
}) {
  const role = mapRMUTIUserTypeToRole(rmutiUser.userType);
  
  // Check if user exists (by rmutiId or username)
  const existingUser = await prisma.user.findFirst({
    where: {
      OR: [
        { rmutiId: rmutiUser.rmutiId },
        { username: rmutiUser.username },
      ],
    },
  });

  if (existingUser) {
    // Update existing user with latest RMUTI data + increment login count
    return prisma.user.update({
      where: { id: existingUser.id },
      data: {
        rmutiId: rmutiUser.rmutiId,
        fullName: rmutiUser.fullName,
        fullNameEn: rmutiUser.fullNameEn,
        email: rmutiUser.email,
        department: rmutiUser.department || rmutiUser.faculty,
        faculty: rmutiUser.faculty,
        program: rmutiUser.program,
        degreeLevel: rmutiUser.degreeLevel,
        campus: rmutiUser.campus,
        phone: rmutiUser.phone,
        avatar: rmutiUser.avatar,
        year: rmutiUser.year,
        studentId: rmutiUser.studentId,
        teacherId: rmutiUser.employeeId,
        lastLoginAt: new Date(),
        loginCount: { increment: 1 },
        // Don't update role if already set (admin might have changed it)
        ...(existingUser.role === 'STUDENT' ? { role } : {}),
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
      username: rmutiUser.username,
      password: hashedPassword,
      fullName: rmutiUser.fullName,
      fullNameEn: rmutiUser.fullNameEn,
      email: rmutiUser.email,
      role: role,
      studentId: rmutiUser.studentId,
      teacherId: rmutiUser.employeeId,
      department: rmutiUser.department || rmutiUser.faculty,
      faculty: rmutiUser.faculty,
      program: rmutiUser.program,
      degreeLevel: rmutiUser.degreeLevel,
      campus: rmutiUser.campus,
      phone: rmutiUser.phone,
      avatar: rmutiUser.avatar,
      year: rmutiUser.year,
      rmutiId: rmutiUser.rmutiId,
      lastLoginAt: new Date(),
      loginCount: 1,
      isActive: true,
    },
  });
}
