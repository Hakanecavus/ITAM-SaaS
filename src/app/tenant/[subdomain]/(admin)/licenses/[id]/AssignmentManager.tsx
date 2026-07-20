'use client';

import { useState } from 'react';
import { UserMinus, UserPlus, Loader2 } from 'lucide-react';
import { assignLicense, revokeLicense } from '@/app/actions/license';
import toast from 'react-hot-toast';
import { useRouter } from 'next/navigation';

interface User {
  id: string;
  name: string;
  email: string;
}

interface Assignment {
  id: string;
  user: User;
  assignedAt: Date;
}

interface AssignmentManagerProps {
  subdomain: string;
  licenseId: string;
  seats: number;
  assignments: Assignment[];
  users: User[];
}

export function AssignmentManager({ subdomain, licenseId, seats, assignments, users }: AssignmentManagerProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState('');

  const isFull = assignments.length >= seats;
  const availableUsers = users.filter(u => !assignments.some(a => a.user.id === u.id));

  const handleAssign = async () => {
    if (!selectedUserId) {
      toast.error('Lütfen bir kullanıcı seçin.');
      return;
    }

    setLoading(true);
    try {
      const res = await assignLicense(subdomain, licenseId, selectedUserId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Lisans kullanıcıya atandı.');
        setSelectedUserId('');
        router.refresh();
      }
    } catch (e) {
      toast.error('Beklenmeyen bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  const handleRevoke = async (assignmentId: string, userName: string) => {
    if (!confirm(`${userName} kullanıcısından bu lisansı geri almak istediğinize emin misiniz?`)) return;

    setLoading(true);
    try {
      const res = await revokeLicense(subdomain, assignmentId);
      if (res.error) {
        toast.error(res.error);
      } else {
        toast.success('Lisans ataması kaldırıldı.');
        router.refresh();
      }
    } catch (e) {
      toast.error('Beklenmeyen bir hata oluştu.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Atama Ekleme Formu */}
      <div className="flex gap-2">
        <select 
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          disabled={isFull || loading || availableUsers.length === 0}
          className="flex-1 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 text-sm outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 text-slate-900 dark:text-white disabled:opacity-50"
        >
          <option value="">
            {isFull ? 'Kapasite Dolu' : availableUsers.length === 0 ? 'Tüm kullanıcılar atanmış' : 'Kullanıcı Seçin...'}
          </option>
          {availableUsers.map(u => (
            <option key={u.id} value={u.id}>{u.name}</option>
          ))}
        </select>
        <button
          onClick={handleAssign}
          disabled={!selectedUserId || isFull || loading}
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl font-medium shadow-sm transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {loading ? <Loader2 size={18} className="animate-spin" /> : <UserPlus size={18} />}
          <span className="hidden sm:inline">Ata</span>
        </button>
      </div>

      {/* Atama Listesi */}
      <div className="space-y-3">
        {assignments.length === 0 ? (
          <div className="text-center py-6 text-sm text-slate-500 dark:text-slate-400 border border-dashed border-slate-200 dark:border-slate-800 rounded-xl">
            Henüz kimseye atanmamış.
          </div>
        ) : (
          assignments.map(assignment => (
            <div key={assignment.id} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
              <div>
                <div className="font-semibold text-sm text-slate-800 dark:text-slate-200">{assignment.user.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                  {new Date(assignment.assignedAt).toLocaleDateString('tr-TR')} tarihinde atandı
                </div>
              </div>
              <button
                onClick={() => handleRevoke(assignment.id, assignment.user.name)}
                disabled={loading}
                className="p-2 text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 rounded-lg transition-colors disabled:opacity-50"
                title="Geri Al"
              >
                <UserMinus size={18} />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
