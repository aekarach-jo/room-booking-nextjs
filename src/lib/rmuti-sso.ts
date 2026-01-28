/**
 * RMUTI SSO OAuth 2.0 Configuration
 * 
 * ระบบ Single Sign-On ของมหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน
 * ใช้ OAuth 2.0 Authorization Code Flow
 * 
 * สำหรับขอใช้บริการ: https://forms.office.com/r/2vnBihsLcD
 * เอกสาร API: https://api.rmuti.ac.th
 */

// Environment variables ที่ต้องตั้งค่าใน .env
// RMUTI_CLIENT_ID=your_client_id
// RMUTI_CLIENT_SECRET=your_client_secret
// RMUTI_REDIRECT_URI=http://localhost:3000/api/auth/rmuti/callback
// NEXT_PUBLIC_RMUTI_SSO_ENABLED=true

export const RMUTI_SSO_CONFIG = {
  // OAuth 2.0 Endpoints (ตามมาตรฐาน RMUTI API)
  authorizationEndpoint: process.env.RMUTI_AUTH_ENDPOINT || 'https://sso.rmuti.ac.th/oauth/authorize',
  tokenEndpoint: process.env.RMUTI_TOKEN_ENDPOINT || 'https://sso.rmuti.ac.th/oauth/token',
  userInfoEndpoint: process.env.RMUTI_USERINFO_ENDPOINT || 'https://api.rmuti.ac.th/api/userinfo',
  
  // Client credentials
  clientId: process.env.RMUTI_CLIENT_ID || '',
  clientSecret: process.env.RMUTI_CLIENT_SECRET || '',
  redirectUri: process.env.RMUTI_REDIRECT_URI || 'http://localhost:3000/api/auth/rmuti/callback',
  
  // Scopes
  scope: 'openid profile email student_info',
  
  // Feature flag
  isEnabled: process.env.NEXT_PUBLIC_RMUTI_SSO_ENABLED === 'true',
};

// Types for RMUTI user data
export interface RMUTIUserInfo {
  // ข้อมูลพื้นฐาน
  sub: string;                  // RMUTI User ID
  username: string;             // Username (รหัสนักศึกษา/บุคลากร)
  email: string;
  
  // ข้อมูลส่วนตัว
  name_th?: string;             // ชื่อ-สกุล ภาษาไทย
  name_en?: string;             // ชื่อ-สกุล ภาษาอังกฤษ
  firstname_th?: string;
  lastname_th?: string;
  firstname_en?: string;
  lastname_en?: string;
  
  // ข้อมูลนักศึกษา
  student_id?: string;          // รหัสนักศึกษา
  faculty?: string;             // คณะ
  department?: string;          // สาขา
  program?: string;             // หลักสูตร
  degree_level?: string;        // ระดับการศึกษา (ปริญญาตรี, โท, เอก)
  year?: number;                // ชั้นปี
  campus?: string;              // วิทยาเขต
  
  // ข้อมูลบุคลากร
  employee_id?: string;         // รหัสบุคลากร
  position?: string;            // ตำแหน่ง
  
  // ประเภทผู้ใช้
  user_type: 'student' | 'staff' | 'teacher' | 'alumni';
}

export interface RMUTITokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  scope?: string;
  id_token?: string;
}

/**
 * Generate OAuth 2.0 Authorization URL
 */
export function getAuthorizationUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: RMUTI_SSO_CONFIG.clientId,
    redirect_uri: RMUTI_SSO_CONFIG.redirectUri,
    scope: RMUTI_SSO_CONFIG.scope,
    state: state,
  });

  return `${RMUTI_SSO_CONFIG.authorizationEndpoint}?${params.toString()}`;
}

/**
 * Exchange authorization code for tokens
 */
export async function exchangeCodeForTokens(code: string): Promise<RMUTITokenResponse> {
  const response = await fetch(RMUTI_SSO_CONFIG.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': `Basic ${Buffer.from(`${RMUTI_SSO_CONFIG.clientId}:${RMUTI_SSO_CONFIG.clientSecret}`).toString('base64')}`,
    },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: RMUTI_SSO_CONFIG.redirectUri,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }

  return response.json();
}

/**
 * Get user info from RMUTI API
 */
export async function getUserInfo(accessToken: string): Promise<RMUTIUserInfo> {
  const response = await fetch(RMUTI_SSO_CONFIG.userInfoEndpoint, {
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get user info: ${error}`);
  }

  return response.json();
}

/**
 * Map RMUTI user type to system role
 */
export function mapRMUTIUserTypeToRole(userType: RMUTIUserInfo['user_type']): string {
  switch (userType) {
    case 'student':
      return 'STUDENT';
    case 'teacher':
      return 'TEACHER';
    case 'staff':
      return 'STAFF';
    case 'alumni':
      return 'STUDENT'; // Alumni as student role
    default:
      return 'STUDENT';
  }
}

/**
 * Generate random state for CSRF protection
 */
export function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
