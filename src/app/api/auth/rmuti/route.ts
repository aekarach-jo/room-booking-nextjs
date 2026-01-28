import { NextResponse } from 'next/server';
import { RMUTI_SSO_CONFIG, getAuthorizationUrl, generateState } from '@/lib/rmuti-sso';
import { cookies } from 'next/headers';

/**
 * GET /api/auth/rmuti - Initiate RMUTI SSO login
 * Redirects user to RMUTI SSO authorization page
 */
export async function GET() {
  try {
    // Check if SSO is enabled
    if (!RMUTI_SSO_CONFIG.isEnabled) {
      return NextResponse.json(
        { error: 'RMUTI SSO is not enabled' },
        { status: 400 }
      );
    }

    // Check if client is configured
    if (!RMUTI_SSO_CONFIG.clientId) {
      return NextResponse.json(
        { error: 'RMUTI SSO is not configured' },
        { status: 500 }
      );
    }

    // Generate state for CSRF protection
    const state = generateState();

    // Store state in cookie for validation
    const cookieStore = await cookies();
    cookieStore.set('rmuti_oauth_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 10, // 10 minutes
      path: '/',
    });

    // Generate authorization URL and redirect
    const authUrl = getAuthorizationUrl(state);

    return NextResponse.redirect(authUrl);
  } catch (error) {
    console.error('RMUTI SSO initiation error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate SSO login' },
      { status: 500 }
    );
  }
}
