import nodemailer from 'nodemailer';

// SMTP transporter — ใช้ email ที่ตั้งค่าใน .env โดยตรง
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true', // true = port 465, false = port 587 (STARTTLS)
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM_EMAIL = process.env.SMTP_USER || '';
const FROM_NAME = process.env.SMTP_FROM_NAME || 'ระบบจองห้อง';
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

interface BookingEmailData {
  bookingId: string;
  studentName: string;
  studentEmail: string | null;
  roomName: string;
  date: string;
  startTime: string;
  endTime: string; 
  purpose: string;
  attendees: number;
  approvalToken: string;
}

interface TeacherEmail {
  name: string;
  email: string;
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function formatTime(timeStr: string): string {
  return new Date(timeStr).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
}

function buildApprovalEmailHtml(data: BookingEmailData): string {
  const approvalUrl = `${APP_URL}/approve-booking/${data.approvalToken}`;
  const dateFormatted = formatDate(data.date);
  const startFormatted = formatTime(data.startTime);
  const endFormatted = formatTime(data.endTime);

  return `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>คำขอจองห้อง - รอการอนุมัติ</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 0;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:12px;overflow:hidden;box-shadow:0 2px 8px rgba(0,0,0,0.08);">

          <!-- Header -->
          <tr>
            <td style="background-color:#2563eb;padding:28px 32px;">
              <h1 style="margin:0;color:#ffffff;font-size:20px;font-weight:700;">
                📋 คำขอจองห้อง — รอการอนุมัติ
              </h1>
              <p style="margin:6px 0 0;color:#bfdbfe;font-size:14px;">
                มีนักศึกษาส่งคำขอจองห้องเข้ามาในระบบ กรุณาพิจารณาอนุมัติ
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding:32px;">

              <!-- Student info -->
              <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f8fafc;border-radius:8px;padding:20px;margin-bottom:24px;">
                <tr>
                  <td>
                    <p style="margin:0 0 4px;font-size:12px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em;font-weight:600;">ผู้ขอจอง</p>
                    <p style="margin:0 0 2px;font-size:18px;font-weight:700;color:#1e293b;">${data.studentName}</p>
                    ${data.studentEmail ? `<p style="margin:0;font-size:14px;color:#3b82f6;">${data.studentEmail}</p>` : ''}
                  </td>
                </tr>
              </table>

              <!-- Booking details -->
              <p style="margin:0 0 16px;font-size:15px;font-weight:600;color:#1e293b;">รายละเอียดการจอง</p>
              <table width="100%" cellpadding="0" cellspacing="0" style="border:1px solid #e2e8f0;border-radius:8px;overflow:hidden;margin-bottom:24px;">
                <tr style="background-color:#f8fafc;">
                  <td style="padding:12px 16px;font-size:13px;color:#64748b;font-weight:600;width:140px;">ห้อง</td>
                  <td style="padding:12px 16px;font-size:14px;color:#1e293b;font-weight:600;">${data.roomName}</td>
                </tr>
                <tr style="border-top:1px solid #e2e8f0;">
                  <td style="padding:12px 16px;font-size:13px;color:#64748b;font-weight:600;">วันที่</td>
                  <td style="padding:12px 16px;font-size:14px;color:#1e293b;">${dateFormatted}</td>
                </tr>
                <tr style="background-color:#f8fafc;border-top:1px solid #e2e8f0;">
                  <td style="padding:12px 16px;font-size:13px;color:#64748b;font-weight:600;">เวลา</td>
                  <td style="padding:12px 16px;font-size:14px;color:#1e293b;">${startFormatted} — ${endFormatted} น.</td>
                </tr>
                <tr style="border-top:1px solid #e2e8f0;">
                  <td style="padding:12px 16px;font-size:13px;color:#64748b;font-weight:600;">วัตถุประสงค์</td>
                  <td style="padding:12px 16px;font-size:14px;color:#1e293b;">${data.purpose}</td>
                </tr>
                <tr style="background-color:#f8fafc;border-top:1px solid #e2e8f0;">
                  <td style="padding:12px 16px;font-size:13px;color:#64748b;font-weight:600;">จำนวนผู้เข้าใช้</td>
                  <td style="padding:12px 16px;font-size:14px;color:#1e293b;">${data.attendees} คน</td>
                </tr>
              </table>

              <!-- CTA Button -->
              <p style="margin:0 0 16px;font-size:14px;color:#475569;">
                กรุณาคลิกปุ่มด้านล่างเพื่อดำเนินการ:
              </p>
              <table width="100%" cellpadding="0" cellspacing="0">
                <tr>
                  <td align="center" style="padding-bottom:16px;">
                    <a href="${approvalUrl}"
                       style="display:inline-block;background-color:#2563eb;color:#ffffff;text-decoration:none;padding:14px 40px;border-radius:8px;font-size:15px;font-weight:600;letter-spacing:0.01em;">
                      ดูคำขอและตัดสินใจ →
                    </a>
                  </td>
                </tr>
              </table>

              <!-- Link fallback -->
              <p style="margin:16px 0 0;font-size:12px;color:#94a3b8;text-align:center;">
                หากปุ่มด้านบนไม่ทำงาน คัดลอกลิงก์นี้ไปวางในเบราว์เซอร์:<br/>
                <span style="color:#3b82f6;word-break:break-all;">${approvalUrl}</span>
              </p>

            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8fafc;padding:20px 32px;border-top:1px solid #e2e8f0;">
              <p style="margin:0;font-size:12px;color:#94a3b8;text-align:center;">
                ลิงก์นี้มีอายุ 7 วัน • ระบบจองห้อง มทร.อีสาน
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
  `.trim();
}

export async function sendBookingApprovalEmail(
  booking: BookingEmailData,
  teachers: TeacherEmail[]
): Promise<void> {
  if (teachers.length === 0) return;

  const html = buildApprovalEmailHtml(booking);
  const subject = `[จองห้อง] ${booking.studentName} ขอจอง ${booking.roomName}`;

  // ส่ง FROM email ของระบบ, Reply-To เป็น email นักศึกษา
  const from = `${FROM_NAME} <${FROM_EMAIL}>`;

  const emailPromises = teachers.map((teacher) =>
    transporter.sendMail({
      from,
      replyTo: booking.studentEmail || undefined,
      to: teacher.email,
      subject,
      html,
    })
  );

  await Promise.all(emailPromises);
}
