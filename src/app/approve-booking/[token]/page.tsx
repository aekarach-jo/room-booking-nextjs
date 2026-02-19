'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { CheckCircle, XCircle, Clock, AlertTriangle, Building2, Calendar, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';

interface BookingDetail {
  bookingId: string;
  status: string;
  room: { id: string; name: string; type: string; building: string | null; floor: number | null };
  student: { id: string; fullName: string; email: string | null; studentId: string | null; department: string | null };
  date: string;
  startTime: string;
  endTime: string;
  purpose: string;
  attendees: number;
  expiresAt: string;
}

type PageState = 'loading' | 'ready' | 'submitting' | 'done' | 'error';

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    timeZone: 'Asia/Bangkok',
  });
}

function formatTime(timeStr: string): string {
  return new Date(timeStr).toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
    timeZone: 'Asia/Bangkok',
  });
}

export default function ApproveBookingPage() {
  const params = useParams();
  const token = params.token as string;

  const [state, setState] = useState<PageState>('loading');
  const [booking, setBooking] = useState<BookingDetail | null>(null);
  const [errorMsg, setErrorMsg] = useState('');
  const [showRejectForm, setShowRejectForm] = useState(false);
  const [reason, setReason] = useState('');
  const [doneAction, setDoneAction] = useState<'approve' | 'reject' | null>(null);
  const [alreadyStatus, setAlreadyStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    fetch(`/api/bookings/approve-by-token?token=${token}`)
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          if (res.status === 410 || res.status === 409) {
            setAlreadyStatus(data.status || null);
            setErrorMsg(data.error);
          } else {
            setErrorMsg(data.error || 'เกิดข้อผิดพลาด');
          }
          setState('error');
        } else {
          setBooking(data);
          setState('ready');
        }
      })
      .catch(() => {
        setErrorMsg('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
        setState('error');
      });
  }, [token]);

  async function handleAction(action: 'approve' | 'reject') {
    if (action === 'reject' && !reason.trim()) return;
    setState('submitting');
    try {
      const res = await fetch('/api/bookings/approve-by-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, action, reason: reason.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) {
        setErrorMsg(data.error || 'เกิดข้อผิดพลาด');
        setState('error');
      } else {
        setDoneAction(action);
        setState('done');
      }
    } catch {
      setErrorMsg('ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้');
      setState('error');
    }
  }

  if (state === 'loading') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-3 text-zinc-500">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
          <p className="text-sm">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  if (state === 'error') {
    const isAlreadyDone = alreadyStatus !== null;
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
        <Card className="w-full max-w-md text-center shadow-md">
          <CardContent className="pt-8 pb-8 flex flex-col items-center gap-4">
            {isAlreadyDone ? (
              <>
                <div className="h-14 w-14 rounded-full bg-zinc-100 flex items-center justify-center">
                  <Clock className="h-7 w-7 text-zinc-500" />
                </div>
                <div>
                  <p className="font-semibold text-zinc-800 text-lg">ดำเนินการแล้ว</p>
                  <p className="text-sm text-zinc-500 mt-1">{errorMsg}</p>
                  <div className="mt-3">
                    <Badge variant={alreadyStatus === 'APPROVED' ? 'default' : 'destructive'}>
                      {alreadyStatus === 'APPROVED' ? 'อนุมัติแล้ว' : alreadyStatus === 'REJECTED' ? 'ปฏิเสธแล้ว' : alreadyStatus}
                    </Badge>
                  </div>
                </div>
              </>
            ) : (
              <>
                <div className="h-14 w-14 rounded-full bg-red-50 flex items-center justify-center">
                  <AlertTriangle className="h-7 w-7 text-red-500" />
                </div>
                <div>
                  <p className="font-semibold text-zinc-800 text-lg">ไม่สามารถดำเนินการได้</p>
                  <p className="text-sm text-zinc-500 mt-1">{errorMsg}</p>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>
    );
  }

  if (state === 'done') {
    const approved = doneAction === 'approve';
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
        <Card className="w-full max-w-md text-center shadow-md">
          <CardContent className="pt-8 pb-8 flex flex-col items-center gap-4">
            <div className={`h-16 w-16 rounded-full flex items-center justify-center ${approved ? 'bg-green-50' : 'bg-red-50'}`}>
              {approved
                ? <CheckCircle className="h-9 w-9 text-green-600" />
                : <XCircle className="h-9 w-9 text-red-500" />}
            </div>
            <div>
              <p className="font-semibold text-zinc-800 text-xl">
                {approved ? 'อนุมัติการจองแล้ว' : 'ปฏิเสธการจองแล้ว'}
              </p>
              <p className="text-sm text-zinc-500 mt-2">
                {approved
                  ? 'ระบบได้แจ้งนักศึกษาเรียบร้อยแล้ว'
                  : 'ระบบได้แจ้งนักศึกษาพร้อมเหตุผลเรียบร้อยแล้ว'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!booking) return null;

  return (
    <div className="min-h-screen bg-zinc-50 flex items-start justify-center py-12 px-4">
      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold text-zinc-900">อนุมัติคำขอจองห้อง</h1>
          <p className="text-sm text-zinc-500 mt-1">กรุณาตรวจสอบรายละเอียดและดำเนินการ</p>
        </div>

        <Card className="shadow-md">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold text-zinc-700 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              รายละเอียดการจอง
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Student info */}
            <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-1">ผู้ขอจอง</p>
              <p className="font-semibold text-zinc-900 text-lg">{booking.student.fullName}</p>
              {booking.student.email && (
                <p className="text-sm text-blue-600">{booking.student.email}</p>
              )}
              {booking.student.studentId && (
                <p className="text-xs text-zinc-500 mt-0.5">รหัสนักศึกษา: {booking.student.studentId}</p>
              )}
              {booking.student.department && (
                <p className="text-xs text-zinc-500">ภาควิชา: {booking.student.department}</p>
              )}
            </div>

            {/* Booking details */}
            <div className="divide-y divide-zinc-100 rounded-lg border border-zinc-200 overflow-hidden">
              <div className="flex items-center gap-3 px-4 py-3">
                <Building2 className="h-4 w-4 text-zinc-400 shrink-0" />
                <div>
                  <p className="text-xs text-zinc-400">ห้อง</p>
                  <p className="font-medium text-zinc-900">
                    {booking.room.name}
                    {booking.room.building && <span className="text-zinc-500 font-normal"> · {booking.room.building}</span>}
                    {booking.room.floor != null && <span className="text-zinc-500 font-normal"> ชั้น {booking.room.floor}</span>}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3">
                <Calendar className="h-4 w-4 text-zinc-400 shrink-0" />
                <div>
                  <p className="text-xs text-zinc-400">วันที่ / เวลา</p>
                  <p className="font-medium text-zinc-900">{formatDate(booking.date)}</p>
                  <p className="text-sm text-zinc-600">
                    {formatTime(booking.startTime)} — {formatTime(booking.endTime)} น.
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3 px-4 py-3">
                <Users className="h-4 w-4 text-zinc-400 shrink-0" />
                <div>
                  <p className="text-xs text-zinc-400">จำนวนผู้เข้าใช้</p>
                  <p className="font-medium text-zinc-900">{booking.attendees} คน</p>
                </div>
              </div>
              <div className="px-4 py-3">
                <p className="text-xs text-zinc-400 mb-1">วัตถุประสงค์</p>
                <p className="text-sm text-zinc-900">{booking.purpose}</p>
              </div>
            </div>

            {/* Reject reason textarea */}
            {showRejectForm && (
              <div className="space-y-2">
                <label className="text-sm font-medium text-zinc-700">
                  เหตุผลการปฏิเสธ <span className="text-red-500">*</span>
                </label>
                <Textarea
                  placeholder="กรุณาระบุเหตุผล..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  className="resize-none"
                />
              </div>
            )}

            {/* Actions */}
            <div className="flex flex-col gap-2 pt-2">
              {!showRejectForm ? (
                <>
                  <Button
                    className="w-full bg-green-600 hover:bg-green-700 text-white"
                    size="lg"
                    disabled={state === 'submitting'}
                    onClick={() => handleAction('approve')}
                  >
                    <CheckCircle className="h-4 w-4 mr-2" />
                    อนุมัติการจอง
                  </Button>
                  <Button
                    variant="outline"
                    className="w-full border-red-300 text-red-600 hover:bg-red-50"
                    size="lg"
                    onClick={() => setShowRejectForm(true)}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    ปฏิเสธการจอง
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    className="w-full bg-red-600 hover:bg-red-700 text-white"
                    size="lg"
                    disabled={state === 'submitting' || !reason.trim()}
                    onClick={() => handleAction('reject')}
                  >
                    <XCircle className="h-4 w-4 mr-2" />
                    {state === 'submitting' ? 'กำลังดำเนินการ...' : 'ยืนยันการปฏิเสธ'}
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full text-zinc-500"
                    onClick={() => { setShowRejectForm(false); setReason(''); }}
                  >
                    ยกเลิก
                  </Button>
                </>
              )}
            </div>

            <p className="text-xs text-center text-zinc-400">
              ลิงก์นี้หมดอายุ {new Date(booking.expiresAt).toLocaleDateString('th-TH', { timeZone: 'Asia/Bangkok' })}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
