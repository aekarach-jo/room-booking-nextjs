import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { NextRequest } from 'next/server';
import { prisma } from './prisma';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
const SALT_ROUNDS = 10;

export interface JwtPayload {
  userId: string;
  username: string;
  role: string;
}

export interface AuthUser {
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
  suspendedUntil?: Date | null;
  lastLoginAt?: Date | null;
  loginCount?: number;
  createdAt?: Date;
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, SALT_ROUNDS);
}

export async function comparePassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

// JWT utilities
export function signToken(payload: JwtPayload): string {
  // expiresIn can be a number (seconds) or a string like '7d', '1h', etc.
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as jwt.SignOptions['expiresIn']
  });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JwtPayload;
  } catch {
    return null;
  }
}

// Get token from request headers or cookies
export function getTokenFromRequest(request: NextRequest): string | null {
  // Try Authorization header first
  const authHeader = request.headers.get('authorization');
  if (authHeader?.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }

  // Try cookie
  const token = request.cookies.get('token')?.value;
  return token || null;
}

// Verify auth from request (for API routes)
export async function verifyAuth(request: NextRequest): Promise<AuthUser | null> {
  const token = getTokenFromRequest(request);
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    select: {
      id: true,
      username: true,
      fullName: true,
      fullNameEn: true,
      email: true,
      role: true,
      studentId: true,
      teacherId: true,
      department: true,
      faculty: true,
      program: true,
      degreeLevel: true,
      campus: true,
      phone: true,
      avatar: true,
      year: true,
      isActive: true,
      isSuspended: true,
      suspendedUntil: true,
      lastLoginAt: true,
      loginCount: true,
      createdAt: true,
    },
  });

  if (!user || !user.isActive) return null;

  return user;
}

// Get current user from cookies (for server components)
export async function getCurrentUser(): Promise<AuthUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get('token')?.value;

  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
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
    },
  });

  if (!user || !user.isActive) return null;

  return user;
}

// Check if user has required role
export function hasRole(user: AuthUser, allowedRoles: string[]): boolean {
  return allowedRoles.includes(user.role);
}

// Check if user is admin (STAFF or DEPARTMENT_HEAD)
export function isAdmin(user: AuthUser): boolean {
  return hasRole(user, ['STAFF', 'DEPARTMENT_HEAD']);
}
