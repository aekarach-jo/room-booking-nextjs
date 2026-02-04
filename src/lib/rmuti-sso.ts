/**
 * RMUTI SSO OAuth 2.0 Configuration
 * 
 * ระบบ Single Sign-On ของมหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน
 * ใช้ OAuth 2.0 Authorization Code Flow
 * 
 * เอกสาร API: https://api.rmuti.ac.th
 * หากมีข้อสงสัย: mis@rmuti.ac.th
 */

// Environment variables ที่ต้องตั้งค่าใน .env
// RMUTI_SV=room-booking-KK
// RMUTI_CLIENT_ID=your_client_id
// RMUTI_CLIENT_SECRET=your_client_secret
// RMUTI_REDIRECT_URI=http://localhost:3000/api/auth/rmuti/callback
// NEXT_PUBLIC_RMUTI_SSO_ENABLED=true

export const RMUTI_SSO_CONFIG = {
  // Service Name (SV) - ได้จากการลงทะเบียน
  sv: process.env.RMUTI_SV || 'room-booking-KK',
  
  // OAuth 2.0 Endpoints (RMUTI API จริง)
  authorizationEndpoint: 'https://api.rmuti.ac.th/sso/oauth.php',
  tokenEndpoint: 'https://api.rmuti.ac.th/api/oauth/token',
  userInfoEndpoint: 'https://api.rmuti.ac.th/api/v3/profile',
  logoutEndpoint: 'https://api.rmuti.ac.th/sso/index.php',
  
  // Client credentials
  clientId: process.env.RMUTI_CLIENT_ID || '',
  clientSecret: process.env.RMUTI_CLIENT_SECRET || '',
  redirectUri: process.env.RMUTI_REDIRECT_URI || 'http://localhost:3000/api/auth/rmuti/callback',
  
  // Feature flag
  isEnabled: process.env.NEXT_PUBLIC_RMUTI_SSO_ENABLED === 'true',
};

// Types for RMUTI user data (ตาม API v3/profile)
export interface RMUTIUserInfo {
  // ข้อมูลพื้นฐาน
  id?: string;                  // RMUTI User ID
  username?: string;            // Username
  email?: string;
  
  // ข้อมูลส่วนตัว
  name_th?: string;             // ชื่อ-สกุล ภาษาไทย
  name_en?: string;             // ชื่อ-สกุล ภาษาอังกฤษ
  firstname_th?: string;
  lastname_th?: string;
  firstname_en?: string;
  lastname_en?: string;
  fullname_th?: string;
  fullname_en?: string;
  
  // ข้อมูลนักศึกษา
  student_id?: string;          // รหัสนักศึกษา
  studentId?: string;           // alternative key
  faculty?: string;             // คณะ
  faculty_name?: string;
  department?: string;          // สาขา
  department_name?: string;
  program?: string;             // หลักสูตร
  degree_level?: string;        // ระดับการศึกษา
  year?: number | string;       // ชั้นปี
  campus?: string;              // วิทยาเขต
  
  // ข้อมูลบุคลากร
  employee_id?: string;         // รหัสบุคลากร
  employeeId?: string;          // alternative key
  position?: string;            // ตำแหน่ง
  
  // ประเภทผู้ใช้
  user_type?: 'student' | 'staff' | 'teacher' | 'alumni' | string;
  type?: string;                // alternative key
  role?: string;
  
  // ข้อมูลเพิ่มเติม
  picture?: string;
  avatar?: string;
  phone?: string;
  
  // Response wrapper (บางครั้ง API อาจส่งมาใน data field)
  data?: RMUTIUserInfo;
  success?: boolean;
  message?: string;
}

export interface RMUTITokenResponse {
  access_token: string;
  token_type?: string;
  expires_in?: number;
  refresh_token?: string;
  scope?: string;
  
  // Error response
  error?: string;
  error_description?: string;
}

/**
 * Generate OAuth 2.0 Authorization URL
 * ตาม format: https://api.rmuti.ac.th/sso/oauth.php?sv=[sv]&redirect_uri=[redirect_uri]&state=[state]
 */
export function getAuthorizationUrl(state: string): string {
  const params = new URLSearchParams({
    sv: RMUTI_SSO_CONFIG.sv,
    redirect_uri: RMUTI_SSO_CONFIG.redirectUri,
    state: state,
  });

  return `${RMUTI_SSO_CONFIG.authorizationEndpoint}?${params.toString()}`;
}

/**
 * Generate logout URL
 */
export function getLogoutUrl(redirectUri: string): string {
  return `${RMUTI_SSO_CONFIG.logoutEndpoint}?logout&redirect=${encodeURIComponent(redirectUri)}`;
}

/**
 * Exchange authorization code for tokens
 * ตาม PHP example: ส่ง client_id, client_secret, grant_type, code
 */
export async function exchangeCodeForTokens(code: string): Promise<RMUTITokenResponse> {
  const tokenParams = new URLSearchParams({
    client_id: RMUTI_SSO_CONFIG.clientId,
    client_secret: RMUTI_SSO_CONFIG.clientSecret,
    grant_type: 'authorization_code',
    code: code,
  });

  const response = await fetch(RMUTI_SSO_CONFIG.tokenEndpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: tokenParams.toString(),
  });

  const data = await response.json();

  if (data.error) {
    throw new Error(`Token exchange failed: ${data.error_description || data.error}`);
  }

  if (!data.access_token) {
    throw new Error('No access token received');
  }

  return data;
}

/**
 * Get user info from RMUTI API v3/profile
 */
export async function getUserInfo(accessToken: string): Promise<RMUTIUserInfo> {
  const response = await fetch(RMUTI_SSO_CONFIG.userInfoEndpoint, {
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to get user info: ${error}`);
  }

  const data = await response.json();
  
  // Handle wrapped response (if API returns { data: {...}, success: true })
  if (data.data && typeof data.data === 'object') {
    return data.data;
  }
  
  return data;
}

/**
 * Normalize RMUTI user data to consistent format
 */
export function normalizeUserInfo(raw: RMUTIUserInfo): {
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
} {
  // Get ID
  const rmutiId = raw.id || raw.username || raw.student_id || raw.studentId || raw.employee_id || raw.employeeId || '';
  
  // Get username (prefer student_id or employee_id)
  const username = raw.student_id || raw.studentId || raw.employee_id || raw.employeeId || raw.username || rmutiId;
  
  // Get full name (prefer Thai)
  const fullName = raw.fullname_th || raw.name_th || 
    (raw.firstname_th && raw.lastname_th ? `${raw.firstname_th} ${raw.lastname_th}` : null) ||
    raw.fullname_en || raw.name_en ||
    (raw.firstname_en && raw.lastname_en ? `${raw.firstname_en} ${raw.lastname_en}` : null) ||
    username;

  // Get full name English
  const fullNameEn = raw.fullname_en || raw.name_en ||
    (raw.firstname_en && raw.lastname_en ? `${raw.firstname_en} ${raw.lastname_en}` : null);
  
  // Get year as number
  let year: number | null = null;
  if (raw.year) {
    year = typeof raw.year === 'number' ? raw.year : parseInt(raw.year, 10);
    if (isNaN(year)) year = null;
  }
  
  return {
    rmutiId,
    username,
    fullName,
    fullNameEn: fullNameEn || null,
    email: raw.email || null,
    studentId: raw.student_id || raw.studentId || null,
    employeeId: raw.employee_id || raw.employeeId || null,
    department: raw.department_name || raw.department || null,
    faculty: raw.faculty_name || raw.faculty || null,
    program: raw.program || null,
    degreeLevel: raw.degree_level || null,
    campus: raw.campus || null,
    phone: raw.phone || null,
    avatar: raw.picture || raw.avatar || null,
    year,
    userType: raw.user_type || raw.type || raw.role || 'student',
  };
}

/**
 * Map RMUTI user type to system role
 */
export function mapRMUTIUserTypeToRole(userType: string): 'STUDENT' | 'TEACHER' | 'STAFF' | 'DEPARTMENT_HEAD' {
  const type = userType.toLowerCase();
  
  if (type.includes('student') || type.includes('นักศึกษา')) {
    return 'STUDENT';
  }
  if (type.includes('teacher') || type.includes('อาจารย์') || type.includes('lecturer')) {
    return 'TEACHER';
  }
  if (type.includes('staff') || type.includes('เจ้าหน้าที่') || type.includes('บุคลากร')) {
    return 'STAFF';
  }
  if (type.includes('head') || type.includes('หัวหน้า')) {
    return 'DEPARTMENT_HEAD';
  }
  
  // Default to student
  return 'STUDENT';
}

/**
 * Generate random state for CSRF protection
 */
export function generateState(): string {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  return Array.from(array, byte => byte.toString(16).padStart(2, '0')).join('');
}
