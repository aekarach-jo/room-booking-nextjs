'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, Mail, UserCheck, UserX, Save, X, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';

interface User {
  id: string;
  fullName: string;
  email: string | null;
  role: string;
  department: string | null;
}

const ROLE_LABEL: Record<string, string> = {
  STUDENT: 'นักศึกษา',
  TEACHER: 'อาจารย์',
  STAFF: 'เจ้าหน้าที่',
  DEPARTMENT_HEAD: 'หัวหน้าภาควิชา',
};

const ROLE_COLOR: Record<string, string> = {
  STUDENT: 'bg-blue-100 text-blue-700',
  TEACHER: 'bg-green-100 text-green-700',
  STAFF: 'bg-orange-100 text-orange-700',
  DEPARTMENT_HEAD: 'bg-purple-100 text-purple-700',
};

export default function AdminSettingsPage() {
  const [allUsers, setAllUsers] = useState<User[]>([]);
  const [recipientIds, setRecipientIds] = useState<Set<string>>(new Set());
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [usersRes, settingRes] = await Promise.all([
        fetch('/api/users?limit=200'),
        fetch('/api/settings/email-recipients'),
      ]);
      const usersData = await usersRes.json();
      const settingData = await settingRes.json();

      const users: User[] = (usersData.data || []).map((u: User) => ({
        id: u.id,
        fullName: u.fullName,
        email: u.email,
        role: u.role,
        department: u.department,
      }));
      setAllUsers(users);

      const ids = new Set<string>(settingData.recipientIds || []);
      setRecipientIds(ids);
      setSavedIds(new Set(ids));
    } catch {
      toast.error('โหลดข้อมูลไม่สำเร็จ');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  function toggle(userId: string) {
    setRecipientIds((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  }

  async function save() {
    setSaving(true);
    try {
      const res = await fetch('/api/settings/email-recipients', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientIds: Array.from(recipientIds) }),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      const ids = new Set<string>(data.recipientIds);
      setRecipientIds(ids);
      setSavedIds(ids);
      toast.success('บันทึกการตั้งค่าแล้ว');
    } catch {
      toast.error('บันทึกไม่สำเร็จ กรุณาลองใหม่');
    } finally {
      setSaving(false);
    }
  }

  function reset() {
    setRecipientIds(new Set(savedIds));
  }

  const filteredUsers = allUsers.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      (u.email || '').toLowerCase().includes(q) ||
      (u.department || '').toLowerCase().includes(q)
    );
  });

  const selectedUsers = allUsers.filter((u) => recipientIds.has(u.id));
  const hasChanges =
    recipientIds.size !== savedIds.size ||
    [...recipientIds].some((id) => !savedIds.has(id));

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-2xl font-bold text-foreground">ตั้งค่าการแจ้งเตือน Email</h1>
        <p className="text-muted-foreground mt-1">
          เลือกรายชื่อผู้รับ email แจ้งเตือนเมื่อมีนักศึกษาส่งคำขอจองห้อง
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* Left: User list picker */}
        <div className="lg:col-span-3 space-y-3">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Search className="h-4 w-4" />
                เลือกผู้รับ Email
              </CardTitle>
              <CardDescription>
                คลิกชื่อผู้ใช้เพื่อเพิ่ม/ลบออกจากรายการผู้รับ
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                placeholder="ค้นหาชื่อ, email, ภาควิชา..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9"
              />

              <div className="rounded-lg border divide-y max-h-[440px] overflow-y-auto">
                {filteredUsers.length === 0 ? (
                  <p className="py-8 text-center text-sm text-muted-foreground">ไม่พบผู้ใช้</p>
                ) : (
                  filteredUsers.map((u) => {
                    const selected = recipientIds.has(u.id);
                    return (
                      <button
                        key={u.id}
                        onClick={() => toggle(u.id)}
                        className={`w-full flex items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-muted/50 ${
                          selected ? 'bg-primary/5' : ''
                        }`}
                      >
                        {/* Checkbox indicator */}
                        <div
                          className={`h-4 w-4 shrink-0 rounded border-2 flex items-center justify-center transition-colors ${
                            selected
                              ? 'bg-primary border-primary'
                              : 'border-muted-foreground/30'
                          }`}
                        >
                          {selected && (
                            <svg className="h-2.5 w-2.5 text-primary-foreground" fill="none" viewBox="0 0 10 10">
                              <path d="M1 5l3 3 5-7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                          )}
                        </div>

                        {/* Avatar */}
                        <div className="h-8 w-8 shrink-0 rounded-lg bg-primary/10 flex items-center justify-center">
                          <span className="text-xs font-semibold text-primary">
                            {u.fullName.charAt(0)}
                          </span>
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium truncate">{u.fullName}</span>
                            <span className={`text-xs px-1.5 py-0.5 rounded font-medium ${ROLE_COLOR[u.role] || 'bg-zinc-100 text-zinc-600'}`}>
                              {ROLE_LABEL[u.role] || u.role}
                            </span>
                          </div>
                          {u.email ? (
                            <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                          ) : (
                            <p className="text-xs text-red-400">ไม่มี email</p>
                          )}
                          {u.department && (
                            <p className="text-xs text-muted-foreground/70 truncate">{u.department}</p>
                          )}
                        </div>

                        {/* No-email warning */}
                        {!u.email && selected && (
                          <span className="text-xs text-red-500 shrink-0">จะไม่ได้รับ</span>
                        )}
                      </button>
                    );
                  })
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right: Selected recipients summary + save */}
        <div className="lg:col-span-2 space-y-4">
          <Card className={`border-2 ${hasChanges ? 'border-primary/50' : 'border-border'}`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4 text-primary" />
                ผู้รับที่เลือก
                <Badge variant="secondary" className="ml-auto">
                  {recipientIds.size} คน
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {selectedUsers.length === 0 ? (
                <div className="py-6 text-center">
                  <UserX className="h-8 w-8 text-muted-foreground/40 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">ยังไม่มีผู้รับที่เลือก</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">
                    email จะไม่ถูกส่งออก
                  </p>
                </div>
              ) : (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {selectedUsers.map((u) => (
                    <div
                      key={u.id}
                      className="flex items-center gap-2 rounded-lg bg-muted/50 px-3 py-2"
                    >
                      <UserCheck className="h-3.5 w-3.5 text-primary shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{u.fullName}</p>
                        {u.email ? (
                          <p className="text-xs text-muted-foreground truncate">{u.email}</p>
                        ) : (
                          <p className="text-xs text-red-400">ไม่มี email — จะไม่ได้รับ</p>
                        )}
                      </div>
                      <button
                        onClick={() => toggle(u.id)}
                        className="shrink-0 text-muted-foreground/50 hover:text-destructive transition-colors"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Warning for selected users without email */}
              {selectedUsers.some((u) => !u.email) && (
                <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 border border-amber-200">
                  ผู้รับบางคนไม่มี email จะไม่ได้รับการแจ้งเตือน
                </p>
              )}

              {/* Action buttons */}
              <div className="flex gap-2 pt-1">
                <Button
                  onClick={save}
                  disabled={saving || !hasChanges}
                  className="flex-1"
                  size="sm"
                >
                  {saving ? (
                    <RefreshCw className="h-3.5 w-3.5 mr-1.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5 mr-1.5" />
                  )}
                  {saving ? 'กำลังบันทึก...' : 'บันทึก'}
                </Button>
                {hasChanges && (
                  <Button variant="outline" size="sm" onClick={reset}>
                    ยกเลิก
                  </Button>
                )}
              </div>

              {hasChanges && (
                <p className="text-xs text-primary text-center">มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก</p>
              )}
            </CardContent>
          </Card>

          {/* Info box */}
          <Card className="bg-muted/30">
            <CardContent className="pt-4 pb-4">
              <p className="text-xs text-muted-foreground leading-relaxed">
                <strong>หมายเหตุ:</strong> ผู้รับทุกคนในรายการจะได้รับ email พร้อมลิงก์สำหรับ
                อนุมัติ/ปฏิเสธคำขอจองห้อง โดยไม่ต้อง login เข้าระบบ
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
