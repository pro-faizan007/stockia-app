import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldAlert,
  Users,
  Eye,
  Building2,
  MapPin,
  Calendar,
  CheckCircle2,
  RefreshCw,
  Search,
  ArrowRight,
  Database,
  Layers,
  Crown,
} from 'lucide-react';
import { UserProfile } from '../types';
import { fetchAllUsers } from '../lib/dataService';

interface SuperAdminModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentViewingUserId: string;
  onSelectUserToView: (user: UserProfile) => void;
  onResetToSelf: () => void;
  superAdminEmail: string;
}

export function SuperAdminModal({
  isOpen,
  onClose,
  currentViewingUserId,
  onSelectUserToView,
  onResetToSelf,
  superAdminEmail,
}: SuperAdminModalProps) {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [error, setError] = useState<string | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const list = await fetchAllUsers();
      setUsers(list);
    } catch (err: any) {
      console.error(err);
      setError('تمام صارفین کی فہرست حاصل کرنے میں مسئلہ پیش آیا۔');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadUsers();
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const filteredUsers = users.filter((u) => {
    const q = searchQuery.toLowerCase();
    return (
      (u.displayName && u.displayName.toLowerCase().includes(q)) ||
      (u.email && u.email.toLowerCase().includes(q)) ||
      (u.businessName && u.businessName.toLowerCase().includes(q)) ||
      (u.mandiName && u.mandiName.toLowerCase().includes(q)) ||
      (u.city && u.city.toLowerCase().includes(q))
    );
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/85 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-4xl bg-slate-900 border border-amber-500/40 rounded-3xl shadow-2xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Top Header */}
        <div className="bg-gradient-to-r from-amber-500/20 via-purple-500/15 to-slate-900 p-6 pb-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shadow-inner">
              <Crown className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-white tracking-wide">
                  سپر ایڈمن کنٹرول پینل (Super User Console)
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-bold">
                  MASTER OVERVIEW
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                لاگ ان بطور: <span className="font-mono text-amber-400 font-bold">{superAdminEmail}</span> • تمام صارفین کا ڈیٹا دیکھنے اور غلطیوں کی اصلاح کی سہولت
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Global Statistics Banner */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-6 pb-2 border-b border-slate-800/80 bg-slate-950/40">
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">کل رجسٹرڈ تاجر</div>
            <div className="text-xl font-black text-amber-400">{users.length} یوزرز</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">سپر یوزر پاور</div>
            <div className="text-xl font-black text-emerald-400">مکمل رسائی</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-semibold">ڈیٹا موڈ</div>
            <div className="text-xl font-black text-blue-400">ریئل ٹائم کلاؤڈ</div>
          </div>
          <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center">
            <button
              onClick={onResetToSelf}
              className="w-full py-2 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs text-slate-200 font-bold hover:text-amber-300 transition-colors"
            >
              اپنے کھاتے پر واپس
            </button>
          </div>
        </div>

        {/* Search & Actions Bar */}
        <div className="p-6 pb-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
            <input
              type="text"
              placeholder="صارف کا نام، ای میل، دکان یا شہر تلاش کریں..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={loadUsers}
            disabled={loading}
            className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 text-xs font-bold border border-slate-700 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>ری فریش لسٹ</span>
          </button>
        </div>

        {/* Users Table / List */}
        <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3">
          {error && (
            <div className="p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-16 text-center text-slate-400 text-xs">
              صارفین کی تفصیلات لوڈ ہو رہی ہیں...
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="py-16 text-center text-slate-500 text-xs">
              کوئی صارف نہیں ملا۔
            </div>
          ) : (
            <div className="space-y-2.5">
              {filteredUsers.map((u) => {
                const isCurrent = currentViewingUserId === u.uid;
                const isSuper = u.email?.toLowerCase() === superAdminEmail.toLowerCase();

                return (
                  <div
                    key={u.uid}
                    className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                      isCurrent
                        ? 'bg-amber-500/10 border-amber-500/50 shadow-md'
                        : 'bg-slate-950/60 border-slate-800/90 hover:border-slate-750'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-white text-sm">
                          {u.displayName || 'Unnamed Trader'}
                        </span>
                        {isSuper && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-400 text-[10px] font-bold border border-amber-500/30">
                            👑 سپر ایڈمن
                          </span>
                        )}
                        {isCurrent && (
                          <span className="px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-400 text-[10px] font-bold border border-emerald-500/30 flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3" /> ایکٹو ڈیش بورڈ
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3 text-xs text-slate-400 flex-wrap">
                        <span className="font-mono text-slate-300">{u.email}</span>
                        {u.businessName && (
                          <span className="flex items-center gap-1">
                            <Building2 className="w-3 h-3 text-slate-500" />
                            {u.businessName}
                          </span>
                        )}
                        {(u.mandiName || u.city) && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3 text-slate-500" />
                            {u.mandiName || u.city}
                          </span>
                        )}
                        {u.phone && <span>📞 {u.phone}</span>}
                      </div>

                      <div className="text-[10px] text-slate-400 font-mono">
                        UID: {u.uid}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isCurrent ? (
                        <span className="text-xs font-bold text-amber-400 px-3 py-1.5 rounded-xl bg-amber-500/15">
                          دیکھا جا رہا ہے
                        </span>
                      ) : (
                        <button
                          onClick={() => {
                            onSelectUserToView(u);
                            onClose();
                          }}
                          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-md transition-all active:scale-95"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>اس صارف کا کھاتہ دیکھیں و درست کریں</span>
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
