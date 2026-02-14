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
// Note: RMUTI API returns UPPERCASE keys
export interface RMUTIUserInfo {
  // ข้อมูลพื้นฐาน (lowercase)
  id?: string;
  username?: string;
  email?: string;
  
  // ข้อมูลพื้นฐาน (UPPERCASE - actual RMUTI format)
  USERNAME?: string;
  EMAIL?: string;
  TYPE?: string;
  
  // ข้อมูลนักศึกษา (UPPERCASE)
  STUDENT_NO?: string;
  CITIZEN_ID?: string;
  PREFIX_TH?: string;
  FIRST_NAME_TH?: string;
  LAST_NAME_TH?: string;
  PREFIX_EN?: string;
  FIRST_NAME_EN?: string;
  LAST_NAME_EN?: string;
  GENDER?: string;
  BIRTH_DATE?: string;
  TELNO?: string;
  
  // ข้อมูลการศึกษา (UPPERCASE)
  DEGREE_ID?: number;
  DEGREE?: string;
  YEARNO?: number;
  PROGRAM_ID?: number;
  PROGRAM_NAME_TH?: string;
  PROGRAM_NAME_EN?: string;
  DEPARTMENT_ID?: number;
  DEPARTMENT_NAME_TH?: string;
  DEPARTMENT_NAME_EN?: string;
  FACULTY_ID?: number;
  FACULTY_NAME_TH?: string;
  FACULTY_NAME_EN?: string;
  CAMPUS_ID?: string;
  CAMPUS_NAME?: string;
  STATUS_ID?: number;
  STATUS_NAME?: string;
  PICTURE?: string;
  
  // ข้อมูลบุคลากร (UPPERCASE)
  EMPLOYEE_NO?: string;
  POSITION?: string;
  
  // lowercase alternatives (for backward compatibility)
  name_th?: string;
  name_en?: string;
  firstname_th?: string;
  lastname_th?: string;
  firstname_en?: string;
  lastname_en?: string;
  fullname_th?: string;
  fullname_en?: string;
  student_id?: string;
  studentId?: string;
  faculty?: string;
  faculty_name?: string;
  department?: string;
  department_name?: string;
  program?: string;
  degree_level?: string;
  year?: number | string;
  campus?: string;
  employee_id?: string;
  employeeId?: string;
  position?: string;
  user_type?: 'student' | 'staff' | 'teacher' | 'alumni' | string;
  type?: string;
  role?: string;
  picture?: string;
  avatar?: string;
  phone?: string;
  
  // Response wrapper
  data?: RMUTIUserInfo;
  success?: boolean;
  message?: string;
  
  // Allow any other keys
  [key: string]: unknown;
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
 * Handles both UPPERCASE (actual RMUTI format) and lowercase keys
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
  // Get student/employee ID (UPPERCASE first, then lowercase)
  const studentNo = raw.STUDENT_NO || raw.student_id || raw.studentId || null;
  const employeeNo = raw.EMPLOYEE_NO || raw.employee_id || raw.employeeId || null;
  
  // Get username
  const username = raw.USERNAME || raw.username || studentNo || employeeNo || '';
  
  // Get RMUTI ID (use CITIZEN_ID or student/employee number as unique identifier)
  const rmutiId = raw.CITIZEN_ID || raw.id || studentNo || employeeNo || username;
  
  // Get full name Thai (UPPERCASE format: PREFIX + FIRST_NAME + LAST_NAME)
  const fullNameTh = raw.FIRST_NAME_TH && raw.LAST_NAME_TH 
    ? `${raw.PREFIX_TH || ''}${raw.FIRST_NAME_TH} ${raw.LAST_NAME_TH}`.trim()
    : raw.fullname_th || raw.name_th || 
      (raw.firstname_th && raw.lastname_th ? `${raw.firstname_th} ${raw.lastname_th}` : null);
  
  // Get full name English (UPPERCASE format)
  const fullNameEn = raw.FIRST_NAME_EN && raw.LAST_NAME_EN
    ? `${raw.PREFIX_EN || ''}${raw.FIRST_NAME_EN} ${raw.LAST_NAME_EN}`.trim()
    : raw.fullname_en || raw.name_en ||
      (raw.firstname_en && raw.lastname_en ? `${raw.firstname_en} ${raw.lastname_en}` : null);
  
  // Final full name (prefer Thai)
  const fullName = fullNameTh || fullNameEn || username;
  
  // Get year (calculate from YEARNO - admission year)
  let year: number | null = null;
  if (raw.YEARNO) {
    // Calculate current year of study from admission year
    const currentYear = new Date().getFullYear() + 543; // Buddhist year
    const admissionYear = raw.YEARNO;
    year = currentYear - admissionYear + 1;
    if (year < 1 || year > 10) year = null; // Sanity check
  } else if (raw.year) {
    year = typeof raw.year === 'number' ? raw.year : parseInt(raw.year, 10);
    if (isNaN(year)) year = null;
  }
  
  // Get user type
  const userType = raw.TYPE || raw.user_type || raw.type || raw.role || 'student';
  
  return {
    rmutiId,
    username,
    fullName,
    fullNameEn: fullNameEn || null,
    email: raw.EMAIL || raw.email || null,
    studentId: studentNo,
    employeeId: employeeNo,
    department: raw.DEPARTMENT_NAME_TH || raw.DEPARTMENT_NAME_EN || raw.department_name || raw.department || null,
    faculty: raw.FACULTY_NAME_TH || raw.FACULTY_NAME_EN || raw.faculty_name || raw.faculty || null,
    program: raw.PROGRAM_NAME_TH || raw.PROGRAM_NAME_EN || raw.program || null,
    degreeLevel: raw.DEGREE || raw.degree_level || null,
    campus: raw.CAMPUS_NAME || raw.campus || null,
    phone: raw.TELNO || raw.phone || null,
    avatar: raw.PICTURE || raw.picture || raw.avatar || null,
    year,
    userType: userType.toLowerCase(),
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
