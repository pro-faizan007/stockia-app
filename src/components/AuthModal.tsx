import React, { useState } from 'react';
import {
  X,
  Mail,
  Lock,
  User,
  Building2,
  MapPin,
  Phone,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  Wheat,
} from 'lucide-react';
import {
  signInWithGoogle,
  loginWithEmail,
  registerWithEmail,
} from '../lib/firebase';
import { saveUserProfile } from '../lib/dataService';
import { UserProfile } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'login' | 'signup';
  onSuccess: () => void;
}

export function AuthModal({
  isOpen,
  onClose,
  initialMode = 'login',
  onSuccess,
}: AuthModalProps) {
  const [mode, setMode] = useState<'login' | 'signup'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [mandiName, setMandiName] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleGoogleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await signInWithGoogle();
      if (res.user) {
        const profile: UserProfile = {
          uid: res.user.uid,
          email: res.user.email || '',
          displayName: res.user.displayName || 'Mandi Trader',
          role:
            res.user.email?.toLowerCase() === 'rahatlee97@gmail.com'
              ? 'superadmin'
              : 'user',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        await saveUserProfile(profile);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      setError(err?.message || 'گوگل سائن ان میں مسئلہ پیش آیا۔ براہ کرم دوبارہ کوشش کریں۔');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!email.trim() || !password.trim()) {
      setError('براہ کرم ای میل اور پاس ورڈ درج کریں۔');
      return;
    }

    if (mode === 'signup' && password.length < 6) {
      setError('پاس ورڈ کم از کم 6 ہندسوں یا حروف پر مشتمل ہونا چاہیے۔');
      return;
    }

    setLoading(true);
    try {
      if (mode === 'signup') {
        const res = await registerWithEmail(email, password, displayName || 'Mandi Trader');
        if (res.user) {
          const profile: UserProfile = {
            uid: res.user.uid,
            email: res.user.email || '',
            displayName: displayName.trim() || 'غلہ تاجر',
            role:
              res.user.email?.toLowerCase() === 'rahatlee97@gmail.com'
                ? 'superadmin'
                : 'user',
            businessName: businessName.trim() || 'سٹاکیہ گودام',
            mandiName: mandiName.trim() || 'غلہ منڈی',
            city: city.trim() || 'پنجاب، پاکستان',
            phone: phone.trim() || '',
            createdAt: new Date().toISOString(),
            lastLoginAt: new Date().toISOString(),
          };
          await saveUserProfile(profile);
        }
      } else {
        await loginWithEmail(email, password);
      }
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error(err);
      if (err?.code === 'auth/email-already-in-use') {
        setError('یہ ای میل پہلے سے رجسٹرڈ ہے۔ براہ کرم لاگ ان کریں۔');
      } else if (err?.code === 'auth/user-not-found' || err?.code === 'auth/wrong-password' || err?.code === 'auth/invalid-credential') {
        setError('ای میل یا پاس ورڈ درست نہیں ہے۔');
      } else {
        setError(err?.message || 'اکاؤنٹ میں داخل ہونے میں مسئلہ پیش آیا۔');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-6">
        {/* Top Header Glow */}
        <div className="bg-gradient-to-r from-amber-500/20 via-emerald-500/20 to-amber-500/10 p-6 pb-5 border-b border-slate-800/80">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-inner">
              <Wheat className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-wide">
                MandiStockia <span className="text-amber-400 text-sm font-normal">منڈی پورٹل</span>
              </h2>
              <p className="text-xs text-slate-300 mt-0.5">
                {mode === 'signup'
                  ? 'مفت اکاؤنٹ بنائیں اور اپنا گودام و کھاتہ محفوظ کریں'
                  : 'اپنے محفوظ غلہ منڈی ڈیش بورڈ میں لاگ ان کریں'}
              </p>
            </div>
          </div>

          {/* Switch Mode Tabs */}
          <div className="grid grid-cols-2 p-1 bg-slate-950/60 rounded-xl mt-4 border border-slate-800/80">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setError(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'login'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              لاگ ان (Sign In)
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('signup');
                setError(null);
              }}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${
                mode === 'signup'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              نیا اکاؤنٹ (Sign Up)
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">
          {error && (
            <div className="flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/15 border border-rose-500/30 text-rose-300 text-xs">
              <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          {/* Google 1-Click Login */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-750 border border-slate-700 text-white text-xs font-semibold hover:border-slate-600 transition-all active:scale-[0.98] shadow-sm disabled:opacity-50"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.14z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.15 0 9.92 0 12s.45 3.85 1.24 5.42l4.04-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>گوگل کے ذریعے جاری رکھیں (Google Sign-In)</span>
          </button>

          <div className="relative flex items-center justify-center">
            <div className="border-t border-slate-800 w-full" />
            <span className="bg-slate-900 px-3 text-[11px] text-slate-500 uppercase font-mono">
              یا ای میل کے ذریعے
            </span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            {mode === 'signup' && (
              <>
                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    آپ کا نام (Full Name) *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="text"
                      required
                      placeholder="مثال: چوہدری محمد اسلم"
                      value={displayName}
                      onChange={(e) => setDisplayName(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      فرم / گودام کا نام
                    </label>
                    <div className="relative">
                      <Building2 className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="چوہدری ٹریڈرز"
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                      غلہ منڈی / شہر
                    </label>
                    <div className="relative">
                      <MapPin className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                      <input
                        type="text"
                        placeholder="اوکاڑہ نیو منڈی"
                        value={mandiName}
                        onChange={(e) => setMandiName(e.target.value)}
                        className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                    موبائل نمبر (WhatsApp)
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                    <input
                      type="tel"
                      placeholder="0300-1234567"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                ای میل ایڈریس (Email Address) *
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="email"
                  required
                  placeholder="trader@mandistockia.pk"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                پاس ورڈ (Password) *
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg shadow-amber-500/20 active:scale-[0.98] transition-all disabled:opacity-50 mt-2"
            >
              {loading ? (
                <span>عمل ہو رہا ہے...</span>
              ) : mode === 'signup' ? (
                <>
                  <span>نیا اکاؤنٹ بنائیں اور لاگ ان کریں</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              ) : (
                <>
                  <span>ڈیش بورڈ میں داخل ہوں</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Security Guarantee */}
          <div className="pt-2 text-center flex items-center justify-center gap-1.5 text-[10px] text-slate-400">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span>آپ کا تمام ذاتی ڈیٹا محفوظ کلاؤڈ ڈیٹا بیس میں الگ سٹور ہوتا ہے۔</span>
          </div>
        </div>
      </div>
    </div>
  );
}
