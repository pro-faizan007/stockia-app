import React, { useState } from 'react';
import {
  Wheat,
  ShieldCheck,
  CheckCircle2,
  TrendingUp,
  Warehouse,
  BookOpen,
  Calculator,
  FileText,
  Sun,
  Users,
  ArrowRight,
  Sparkles,
  PhoneCall,
  Check,
  Zap,
  Layers,
  ChevronDown,
  DollarSign,
  Award,
  Globe,
  Lock,
  LogIn,
} from 'lucide-react';

interface LandingPageProps {
  onOpenAuth: (mode: 'login' | 'signup') => void;
  onEnterDemo: () => void;
  isLoggedIn: boolean;
  onGoToApp: () => void;
  userEmail?: string | null;
}

export function LandingPage({
  onOpenAuth,
  onEnterDemo,
  isLoggedIn,
  onGoToApp,
  userEmail,
}: LandingPageProps) {
  const [activePreviewTab, setActivePreviewTab] = useState<'diary' | 'godam' | 'calc' | 'sales'>('diary');
  const [faqOpen, setFaqOpen] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setFaqOpen(faqOpen === idx ? null : idx);
  };

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* 1. Promotional Header */}
      <header className="sticky top-0 z-40 bg-slate-900/95 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-2.5 sm:px-6 lg:px-8 h-14 sm:h-20 flex items-center justify-between gap-2">
          {/* Logo */}
          <div className="flex items-center gap-1.5 sm:gap-3 min-w-0 shrink">
            <div className="w-8 h-8 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-gradient-to-tr from-amber-500 to-amber-600 flex items-center justify-center text-slate-950 font-black shadow-md shadow-amber-500/20 shrink-0">
              <Wheat className="w-4 h-4 sm:w-6 sm:h-6" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-sm sm:text-xl font-black tracking-tight text-white whitespace-nowrap">
                  Mandi<span className="text-amber-400">Stockia</span>
                </span>
                <span className="text-[9px] sm:text-xs font-bold uppercase tracking-wider px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 hidden md:inline-block shrink-0">
                  منڈی منیجر
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-400 hidden lg:block truncate">
                پاکستان غلہ منڈی انوینٹری، آڑھتی ڈائری و ڈھلتا حساب کتاب
              </p>
            </div>
          </div>

          {/* Nav Links */}
          <nav className="hidden md:flex items-center gap-5 lg:gap-6 text-xs font-semibold text-slate-300">
            <a href="#features" className="hover:text-amber-400 transition-colors">
              خصوصیات
            </a>
            <a href="#preview" className="hover:text-amber-400 transition-colors">
              سسٹم پریویو
            </a>
            <a href="#pricing" className="hover:text-amber-400 transition-colors">
              کمرشل پیکیجز
            </a>
            <a href="#testimonials" className="hover:text-amber-400 transition-colors">
              تاجروں کی آراء
            </a>
            <a href="#faq" className="hover:text-amber-400 transition-colors">
              عام سوالات
            </a>
          </nav>

          {/* Action Buttons (Strictly single-line, compact on small phones) */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {isLoggedIn ? (
              <button
                onClick={onGoToApp}
                className="flex items-center gap-1.5 px-3 py-1.5 sm:px-5 sm:py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs sm:text-sm shadow-md shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400 transition-all active:scale-95 whitespace-nowrap cursor-pointer"
              >
                <span>ڈیش بورڈ</span>
                <ArrowRight className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            ) : (
              <>
                <button
                  onClick={onEnterDemo}
                  className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800/90 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-bold transition-all hover:text-amber-400 whitespace-nowrap cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>لائیو ڈیمو</span>
                </button>
                <button
                  onClick={() => onOpenAuth('login')}
                  className="px-2 py-1.5 sm:px-3 sm:py-2 text-xs sm:text-sm font-bold text-slate-200 hover:text-white transition-colors whitespace-nowrap cursor-pointer"
                >
                  لاگ ان
                </button>
                <button
                  onClick={() => onOpenAuth('signup')}
                  className="flex items-center justify-center px-2.5 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 text-slate-950 font-black text-xs sm:text-sm shadow-md shadow-amber-500/20 hover:from-amber-400 hover:to-amber-500 transition-all active:scale-95 whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>شروع کریں</span>
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative overflow-hidden pt-4 pb-8 sm:pt-10 sm:pb-14">
        {/* Background glow effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 sm:w-[600px] sm:h-[600px] bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 left-1/4 w-60 h-60 sm:w-80 sm:h-80 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 text-center space-y-3.5 sm:space-y-6">
          {/* Top Badge */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 sm:px-4 sm:py-1.5 rounded-full bg-slate-800/90 border border-amber-500/30 text-amber-400 text-[10px] sm:text-sm font-semibold shadow-inner max-w-full">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 shrink-0" />
            <span className="truncate">پاکستان کی پہلی غلہ منڈی و گودام ایپ</span>
          </div>

          {/* Headline */}
          <h1 className="text-2xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white tracking-tight leading-snug sm:leading-tight max-w-4xl mx-auto px-1">
            غلہ منڈی کا حساب کتاب، دکان وزٹ اور گودام ڈھلتا اب{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400">
              ڈیجیٹل اور خودکار
            </span>
          </h1>

          {/* Description */}
          <p className="text-xs sm:text-base lg:text-lg text-slate-300 max-w-3xl mx-auto leading-relaxed px-1">
            گندم، دھان (چاول)، مکئی اور سرھوں کا من و بوری حساب، 1.0 تا 2.5 کلو فی بوری ڈھلتا کٹوتی، روزانہ آڑھتی دکان وزٹ ڈائری، اور اناج فروخت پر فوری نفع نقصان ٹریکر۔
          </p>

          {/* CTA Group */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5 sm:gap-3.5 pt-1 w-full max-w-xs sm:max-w-none mx-auto">
            <button
              onClick={() => onOpenAuth('signup')}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 sm:px-7 sm:py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-base shadow-lg shadow-amber-500/25 active:scale-95 transition-all cursor-pointer whitespace-nowrap"
            >
              <span>مفت اکاؤنٹ بنائیں اور شروع کریں</span>
              <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
            </button>

            <button
              onClick={onEnterDemo}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-3 sm:px-6 sm:py-3.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 border border-slate-700/80 text-white font-bold text-xs sm:text-base shadow-md transition-all active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>لائیو ڈیمو چلا کر دیکھیں</span>
            </button>
          </div>

          {/* Trust Highlights */}
          <div className="pt-4 sm:pt-6 grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 max-w-4xl mx-auto">
            <div className="p-2.5 sm:p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-base sm:text-2xl font-black text-amber-400">50,000+</div>
              <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5">بوریاں ریکارڈڈ</div>
            </div>
            <div className="p-2.5 sm:p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-base sm:text-2xl font-black text-emerald-400">100%</div>
              <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5">ڈھلتا کٹوتی درستی</div>
            </div>
            <div className="p-2.5 sm:p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-base sm:text-2xl font-black text-blue-400">40 کلو من</div>
              <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5">منڈی فارمولا</div>
            </div>
            <div className="p-2.5 sm:p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
              <div className="text-base sm:text-2xl font-black text-purple-400">1-کلک</div>
              <div className="text-[10px] sm:text-xs text-slate-400 mt-0.5">پی ڈی ایف رسید</div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Core Features Section */}
      <section id="features" className="py-7 sm:py-10 bg-slate-900/50 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
          <div className="text-center max-w-4xl mx-auto space-y-2.5 sm:space-y-3">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gradient-to-r from-amber-500/20 via-emerald-500/15 to-amber-500/20 border border-amber-500/40 text-amber-300 text-xs sm:text-sm font-extrabold shadow-sm">
              <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
              <span>جامع منڈی سسٹم و خودکار ڈیجیٹل کھاتہ</span>
            </div>

            <h2 className="text-3xl sm:text-5xl lg:text-5xl font-black text-white tracking-tight leading-tight sm:leading-snug">
              ہر آڑھتی، گودام دار اور غلہ بیوپاری کی{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-amber-300 to-emerald-400 drop-shadow-sm">
                تمام ضروریات کا حل
              </span>
            </h2>

            <div className="relative inline-block mt-2 w-full max-w-3xl">
              <div className="absolute -inset-1 bg-gradient-to-r from-amber-500/20 to-emerald-500/20 rounded-2xl blur-md opacity-70" />
              <div className="relative px-5 sm:px-8 py-3.5 sm:py-4 rounded-2xl bg-slate-900/95 border border-amber-500/35 shadow-xl mx-auto">
                <p className="text-base sm:text-xl lg:text-2xl font-extrabold text-amber-300 sm:text-amber-200 leading-relaxed tracking-wide">
                  روایتی کاپی اور پرچی کے بجائے موبائل اور لیپ ٹاپ پر تیز ترین اور محفوظ ترین کھاتہ۔
                </p>
                <p className="text-xs sm:text-sm text-slate-300 mt-1.5 font-medium">
                  اب کوئی سودا، بوری کا وزن یا ڈھلتا کٹوتی کا حساب غائب یا غلط نہیں ہوگا!
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-500/40 transition-all group space-y-3 shadow-lg flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform mx-auto">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white text-center">دکان وزٹ و بیوپاری ڈائری</h3>
              <p className="text-xs text-slate-300 leading-relaxed text-center">
                منڈی میں مختلف دکانوں کے چکر کے دوران بھاؤ (فی بوری / فی کلو / فی من)، نمی (Moisture %)، اناج کا معیار (سپر، اے گریڈ) درج کریں اور 1-کلک سے لاٹ میں تبدیل کریں۔
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-emerald-500/40 transition-all group space-y-3 shadow-lg flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 group-hover:scale-105 transition-transform mx-auto">
                <Warehouse className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white text-center">گودام انوینٹری و ڈھلتا کٹوتی</h3>
              <p className="text-xs text-slate-300 leading-relaxed text-center">
                کل وزن بمقابلہ بل والا وزن اور ڈھلتا کی مد میں حاصل ہونے والا اضافی اناج ٹریک کریں۔ باردانہ، پلے داری، تلائی اور مزدوری شامل کر کے فی من اصل لاگت جانیں۔
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-blue-500/40 transition-all group space-y-3 shadow-lg flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-blue-500/15 border border-blue-500/30 flex items-center justify-center text-blue-400 group-hover:scale-105 transition-transform mx-auto">
                <Calculator className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white text-center">ریئل ٹائم منڈی کیلکولیٹر</h3>
              <p className="text-xs text-slate-300 leading-relaxed text-center">
                40 کلو من، 60 کلو، 70 کلو یا کسٹم بوری کے درمیان فوری تبدیلی۔ فی بوری 1 تا 2.5 کلو ڈھلتا کٹوتی اور منڈی کے رائج فارمولوں کا فوری اور بے عیب حساب۔
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-purple-500/40 transition-all group space-y-3 shadow-lg flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-purple-500/15 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-105 transition-transform mx-auto">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white text-center">فروخت کھاتہ و منافع ٹریکر</h3>
              <p className="text-xs text-slate-300 leading-relaxed text-center">
                فلور ملوں اور خریداروں کو اناج فروخت کرنے کا مکمل ریکارڈ۔ خریدی گئی لاٹ کی اصل لاگت اور موجودہ فروخت کے درمیان خالص نفع یا نقصان (PKR) فوری دیکھیں!
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-rose-500/40 transition-all group space-y-3 shadow-lg flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-rose-500/15 border border-rose-500/30 flex items-center justify-center text-rose-400 group-hover:scale-105 transition-transform mx-auto">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white text-center">مارکیٹ بھاؤ و اتار چڑھاؤ چارٹس</h3>
              <p className="text-xs text-slate-300 leading-relaxed text-center">
                مختلف منڈیوں کے روزانہ کم ترین، بلند ترین اور اوسط ریٹس کا گرافکل ٹریکر۔ تیزی یا مندی کا فوری رجحان جان کر اناج بیچنے کا بہترین وقت منتخب کریں۔
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 hover:border-amber-400/40 transition-all group space-y-3 shadow-lg flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 group-hover:scale-105 transition-transform mx-auto">
                <Sun className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-white text-center">کھلی منڈی و دھوپ ہائی کنٹراسٹ موڈ</h3>
              <p className="text-xs text-slate-300 leading-relaxed text-center">
                تیز دھوپ میں موبائل سکرین پر واضح نظر آنے کے لیے خصوصی ہائی کنٹراسٹ ڈسپلے موڈ اور پیشہ ورانہ پرنٹ ایبل پی ڈی ایف رسیدوں کی تیاری۔
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Interactive Preview Tabs */}
      <section id="preview" className="py-7 sm:py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20">
              لائیو انٹرفیس جھلک
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              سافٹ ویئر کے مختلف ماڈیولز دیکھیں
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              نیچے ٹیبز پر کلک کر کے ایپ کے مختلف فیچرز کی لائیو ڈیزائن چیک کریں:
            </p>
          </div>

          {/* Module Selector */}
          <div className="flex flex-wrap justify-center gap-2 p-1.5 bg-slate-900/90 rounded-2xl border border-slate-800 max-w-2xl mx-auto">
            <button
              onClick={() => setActivePreviewTab('diary')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activePreviewTab === 'diary'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>دکان وزٹ ڈائری</span>
            </button>
            <button
              onClick={() => setActivePreviewTab('godam')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activePreviewTab === 'godam'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Warehouse className="w-4 h-4" />
              <span>گودام سٹاک لاٹس</span>
            </button>
            <button
              onClick={() => setActivePreviewTab('calc')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activePreviewTab === 'calc'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Calculator className="w-4 h-4" />
              <span>ڈھلتا کیلکولیٹر</span>
            </button>
            <button
              onClick={() => setActivePreviewTab('sales')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activePreviewTab === 'sales'
                  ? 'bg-amber-500 text-slate-950 shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <DollarSign className="w-4 h-4" />
              <span>سیلز کھاتہ</span>
            </button>
          </div>

          {/* Interactive Card Preview Display */}
          <div className="bg-slate-900/95 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl max-w-4xl mx-auto">
            {activePreviewTab === 'diary' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-mono text-amber-400 font-bold">Shop # 34-A • اوکاڑہ نیو غلہ منڈی</span>
                    <h4 className="text-lg font-bold text-white">آڑھتی چوہدری توصیف اینڈ سنز</h4>
                    <span className="text-xs text-slate-400">گندم (اکبر 2019 کلین) • نمی: 11.2% • سپر کوالٹی</span>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400">سودا ریٹ (فی من)</span>
                    <div className="text-xl font-black text-emerald-400">₨ 3,920</div>
                    <span className="text-[10px] text-amber-300 font-mono">₨ 3,920 فی بوری (40 کلو)</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">تعداد بوریاں</span>
                    <span className="font-bold text-white text-sm">300 بوریاں</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">کل وزن (منڈز)</span>
                    <span className="font-bold text-white text-sm">300.00 من</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">ڈھلتا کٹوتی (1 کلو / 50 کلو)</span>
                    <span className="font-bold text-amber-400 text-sm">240 کلو اناج فائدہ</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">کل اندازاً مالیت</span>
                    <span className="font-bold text-emerald-400 text-sm">₨ 1,176,000</span>
                  </div>
                </div>
                <div className="pt-2 flex items-center justify-between text-xs text-slate-400">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" /> سودا پکا ہو گیا (Purchased)
                  </span>
                  <button
                    onClick={onEnterDemo}
                    className="text-amber-400 hover:underline font-bold flex items-center gap-1"
                  >
                    <span>ایپ میں آزمائیں</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {activePreviewTab === 'godam' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div>
                    <span className="text-xs font-mono text-emerald-400 font-bold">LOT-WHT-101 • گودام نمبر 2، گیٹ 4</span>
                    <h4 className="text-lg font-bold text-white">گندم سپر کوالٹی ذخیرہ لاٹ</h4>
                    <span className="text-xs text-slate-400">باقی بوریاں: 450 / 500 • فی بوری 50 کلو</span>
                  </div>
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-slate-400">موجودہ مارکیٹ ریٹ پر مالیت</span>
                    <div className="text-xl font-black text-amber-400">₨ 2,242,500</div>
                    <span className="text-[10px] text-emerald-400 font-semibold">+₨ 85,500 متوقع منافع</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">فزیکل اناج</span>
                    <span className="font-bold text-white text-sm">562.50 من</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">بلڈ من (جس کے پیسے دیے)</span>
                    <span className="font-bold text-white text-sm">551.25 من</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">ڈھلتا اناج سرپلس</span>
                    <span className="font-bold text-emerald-400 text-sm">+11.25 من مفت اناج</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">لینڈڈ لاگت فی من</span>
                    <span className="font-bold text-blue-400 text-sm">₨ 3,835 / من</span>
                  </div>
                </div>
              </div>
            )}

            {activePreviewTab === 'calc' && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-800">
                  <h4 className="text-base font-bold text-white">فوری غلہ کٹوتی و ڈھلتا کیلکولیشن نمونہ</h4>
                  <p className="text-xs text-slate-400">100 بوریاں گندم (50 کلو والی) @ ₨ 3,900 فی من (40 کلو)</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">کل کانٹا وزن (Gross)</span>
                    <span className="font-bold text-white text-sm">5,000 کلو (125.0 من)</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">ڈھلتا کٹوتی (1.0 کلو / 50 کلو)</span>
                    <span className="font-bold text-amber-400 text-sm">-100 کلو کٹوتی</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">خالص بل والا وزن (Net)</span>
                    <span className="font-bold text-emerald-400 text-sm">4,900 کلو (122.50 من)</span>
                  </div>
                </div>
                <div className="p-3.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-between text-xs">
                  <span className="text-emerald-300 font-bold">کسان یا بیوپاری کو ادا کی جانے والی رقم:</span>
                  <span className="text-base font-black text-emerald-400">₨ 477,750 PKR</span>
                </div>
              </div>
            )}

            {activePreviewTab === 'sales' && (
              <div className="space-y-4">
                <div className="pb-3 border-b border-slate-800">
                  <h4 className="text-base font-bold text-white">فروخت کھاتہ و منافع اینٹری نمونہ</h4>
                  <p className="text-xs text-slate-400">خریدار: اتفاق فلور ملز لمیٹڈ • 100 بوریاں فروخت</p>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">فروخت ریٹ</span>
                    <span className="font-bold text-white text-sm">₨ 4,050 / من</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">فروخت انوائس مالیت</span>
                    <span className="font-bold text-emerald-400 text-sm">₨ 501,188 PKR</span>
                  </div>
                  <div className="p-3 rounded-xl bg-slate-950/60 border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">خالص منافع (Net Profit)</span>
                    <span className="font-bold text-amber-400 text-sm">+₨ 26,594 PKR</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 5. Commercial Packages & Selling Section */}
      <section id="pricing" className="py-7 sm:py-10 bg-slate-900/60 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              کمرشل پیکیجز
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              اس ایپ کو اپنے کاروبار یا غلہ منڈی ایسوسی ایشن کے لیے حاصل کریں
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              ہر تاجر کا اپنا علیحدہ اور محفوظ اکاؤنٹ۔ سپر ایڈمن بیک اینڈ سے تمام صارفین کی نگرانی و سپورٹ کی سہولت۔
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {/* Tier 1 */}
            <div className="p-7 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-6">
              <div className="space-y-4 text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block text-center">سنگل مرچنٹ</span>
                <h3 className="text-xl font-bold text-white text-center">سٹاکیہ بنیادی (Basic)</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-black text-amber-400">مفت</span>
                  <span className="text-xs text-slate-400">/ بنیادی ٹرائل</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed text-center">
                  چھوٹے تاجروں اور کسانوں کے لیے بنیادی دکان وزٹ اور کٹوتی کا حساب کتاب۔
                </p>
                <ul className="space-y-2.5 text-xs text-slate-300 pt-2 text-start max-w-xs mx-auto">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>50 لاٹس گودام انوینٹری</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>دکان وزٹ ڈائری</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>ڈھلتا و منڈی کیلکولیٹر</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>محفوظ کلاؤڈ ڈیٹا بیس</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => onOpenAuth('signup')}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                مفت اکاؤنٹ بنائیں
              </button>
            </div>

            {/* Tier 2 (Highlighted) */}
            <div className="relative p-7 rounded-3xl bg-slate-900 border-2 border-amber-500 shadow-2xl shadow-amber-500/15 flex flex-col justify-between space-y-6">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-amber-500 text-slate-950 font-black text-[11px] uppercase tracking-wider shadow-md">
                سب سے مقبول
              </div>
              <div className="space-y-4 text-center">
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider block text-center">پروفیشنل آڑھتی</span>
                <h3 className="text-xl font-bold text-white text-center">آڑھتی پلس (Pro Trader)</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-black text-amber-400">₨ 2,999</span>
                  <span className="text-xs text-slate-400">/ ماہانہ</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed text-center">
                  فعال آڑھتیوں اور کمیشن ایجنٹوں کے لیے لا محدود گودام لاٹس اور پی ڈی ایف بلز۔
                </p>
                <ul className="space-y-2.5 text-xs text-slate-200 pt-2 text-start max-w-xs mx-auto">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span className="font-semibold text-white">لا محدود گودام انوینٹری لاٹس</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>پی ڈی ایف سیلز و انوینٹری رپورٹس</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>آؤٹ ڈور دھوپ موڈ سپورٹ</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>روزانہ مارکیٹ ریٹس چارٹ</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-amber-400 shrink-0" />
                    <span>واٹس ایپ بیک اپ و ترجیحی سپورٹ</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => onOpenAuth('signup')}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold text-xs shadow-lg transition-all cursor-pointer"
              >
                آڑھتی پلس حاصل کریں
              </button>
            </div>

            {/* Tier 3 */}
            <div className="p-7 rounded-3xl bg-slate-900 border border-slate-800 flex flex-col justify-between space-y-6">
              <div className="space-y-4 text-center">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block text-center">منڈی کارپوریشن</span>
                <h3 className="text-xl font-bold text-white text-center">سپر غلہ انٹرپرائز (Enterprise)</h3>
                <div className="flex items-baseline justify-center gap-1">
                  <span className="text-3xl font-black text-amber-400">₨ 6,999</span>
                  <span className="text-xs text-slate-400">/ ماہانہ</span>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed text-center">
                  فلور ملوں، ملٹیپل گودام چینز اور منڈی ایسوسی ایشنز کے لیے فل ایکسس۔
                </p>
                <ul className="space-y-2.5 text-xs text-slate-300 pt-2 text-start max-w-xs mx-auto">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>ملٹیپل یوزرز اور ملازمین اکاؤنٹس</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>سپر ایڈمن کنسول و جامع نگرانی</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>کسٹم منڈی فارمولے و کٹوتی قواعد</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>وقف شدہ تکنیکی اکاؤنٹ مینیجر</span>
                  </li>
                </ul>
              </div>
              <button
                onClick={() => onOpenAuth('signup')}
                className="w-full py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors cursor-pointer"
              >
                انٹرپرائز سپورٹ سے رابطہ کریں
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 6. Testimonials from Grain Markets */}
      <section id="testimonials" className="py-7 sm:py-10 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
          <div className="text-center max-w-3xl mx-auto space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              منڈی کا اعتماد
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              پنجاب و سندھ کے معروف غلہ تاجر کیا کہتے ہیں
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-center flex flex-col items-center justify-between">
              <p className="text-xs text-slate-300 leading-relaxed italic text-center">
                "پہلے پرچیوں پر ڈھلتا کی کٹوتی میں بہت غلطیاں ہوتی تھیں اور گودام میں کتنا مال بچا ہے، شام کو یاد نہیں رہتا تھا۔ اب ہر سودے کا فی من خرچ اور خالص اناج سیکنڈوں میں سامنے ہوتا ہے۔"
              </p>
              <div className="pt-2 border-t border-slate-800/80 w-full text-center">
                <h4 className="text-sm font-bold text-white text-center">میاں طارق محمود</h4>
                <p className="text-[11px] text-amber-400 text-center">غلہ کمیشن ایجنٹ، اوکاڑہ نیو غلہ منڈی</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-center flex flex-col items-center justify-between">
              <p className="text-xs text-slate-300 leading-relaxed italic text-center">
                "دھوپ موڈ فیچر کمال کا ہے۔ منڈی کے کھلے میدان میں موبائل پر حساب کرنا آسان ہو گیا ہے۔ اس ایپ نے ہمارے فلور مل سپلائی کے کھاتے کو بالکل شفاف کر دیا ہے۔"
              </p>
              <div className="pt-2 border-t border-slate-800/80 w-full text-center">
                <h4 className="text-sm font-bold text-white text-center">چوہدری شہزاد اکرم</h4>
                <p className="text-[11px] text-amber-400 text-center">گودام دار و سپلائر، فیصل آباد غلہ منڈی</p>
              </div>
            </div>

            <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4 text-center flex flex-col items-center justify-between">
              <p className="text-xs text-slate-300 leading-relaxed italic text-center">
                "سب سے اچھی بات یہ ہے کہ میرا ڈیٹا صرف میرے پاس ہے اور اگر فون گم بھی ہو جائے تو گوگل لاگ ان سے سارا گودام سٹاک واپس آ جاتا ہے۔ ہر بیوپاری کو یہ سافٹ ویئر لازمی لینا چاہیے۔"
              </p>
              <div className="pt-2 border-t border-slate-800/80 w-full text-center">
                <h4 className="text-sm font-bold text-white text-center">ملک ناصر نواز</h4>
                <p className="text-[11px] text-amber-400 text-center">سٹاکیہ تاجر، سرگودھا غلہ منڈی</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 7. FAQ Section */}
      <section id="faq" className="py-7 sm:py-10 bg-slate-900/40 border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 space-y-5 sm:space-y-6">
          <div className="text-center space-y-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-widest px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20">
              عام سوالات و جوابات
            </span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
              اکثر پوچھے جانے والے سوالات
            </h2>
          </div>

          <div className="space-y-3">
            {[
              {
                q: 'کیا ہر تاجر کا ڈیٹا الگ اور مکمل طور پر پرائیویٹ رہتا ہے؟',
                a: 'جی ہاں، بالکل! فائر بیس کلاؤڈ ڈیٹا بیس میں ہر تاجر کا اپنا الگ والٹ ہوتا ہے۔ کوئی بھی دوسرا تاجر آپ کا گودام، وزٹ نوٹس یا سیلز کھاتہ نہیں دیکھ سکتا۔',
              },
              {
                q: 'کیا ڈھلتا اور کٹوتی کی شرح اپنی منڈی کے مطابق تبدیل ہو سکتی ہے؟',
                a: 'جی ہاں! سیٹنگز ٹیب سے آپ گندم، دھان (چاول)، مکئی اور سرھوں کے لیے ڈھلتا کٹوتی (مثلاً 1.0 کلو، 1.5 کلو، یا 2.0 کلو) اور بوری کا وزن اپنی مرضی سے ایڈجسٹ کر سکتے ہیں۔',
              },
              {
                q: 'سپر ایڈمن (Super Admin) کا کیا کام ہے؟',
                a: 'سپر ایڈمن کے پاس تمام رجسٹرڈ صارفین کا عمومی نظارہ ہوتا ہے تاکہ اگر کسی تاجر کے کھاتے میں کوئی فنی یا حسابی غلطی ہو، تو سپر ایڈمن اسے فوری طور پر چیک کر کے درست کر سکے۔',
              },
              {
                q: 'کیا یہ ایپ موبائل فون اور لیپ ٹاپ دونوں پر چلتی ہے؟',
                a: 'جی ہاں، یہ جدید ویب ایپ ہے جو ہر اینڈرائیڈ فون، آئی فون، ٹیبلٹ اور کمپیوٹر پر انتہائی تیز رفتاری سے کام کرتی ہے۔',
              },
            ].map((item, idx) => (
              <div
                key={idx}
                className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden"
              >
                <button
                  type="button"
                  onClick={() => toggleFaq(idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-right text-xs sm:text-sm font-bold text-white hover:text-amber-400 transition-colors cursor-pointer"
                >
                  <span className="text-right flex-1">{item.q}</span>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-400 transition-transform shrink-0 ml-2 ${
                      faqOpen === idx ? 'rotate-180 text-amber-400' : ''
                    }`}
                  />
                </button>
                {faqOpen === idx && (
                  <div className="p-4 sm:p-5 pt-0 text-xs text-slate-300 leading-relaxed border-t border-slate-800/80 text-right">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 8. Bottom CTA Banner */}
      <section className="py-8 sm:py-12 bg-gradient-to-r from-amber-600 via-amber-500 to-emerald-600 text-slate-950">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center space-y-6">
          <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
            آج ہی اپنا غلہ منڈی ڈیجیٹل کھاتہ شروع کریں!
          </h2>
          <p className="text-xs sm:text-sm font-semibold text-slate-900 max-w-2xl mx-auto">
            کوئی کریڈٹ کارڈ درکار نہیں ہے۔ صرف 30 سیکنڈ میں رجسٹر ہوں اور اپنے گودام کی پہلی لاٹ درج کریں۔
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={() => onOpenAuth('signup')}
              className="w-full sm:w-auto px-8 py-3.5 rounded-2xl bg-slate-950 text-white hover:bg-slate-900 font-extrabold text-sm shadow-xl active:scale-95 transition-all"
            >
              مفت رجسٹر ہوں اور شروع کریں
            </button>
            <button
              onClick={onEnterDemo}
              className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/20 hover:bg-white/30 text-slate-950 font-bold text-sm backdrop-blur-sm transition-all"
            >
              لائیو ڈیمو آزمائیں
            </button>
          </div>
        </div>
      </section>

      {/* 9. Landing Footer */}
      <footer className="py-6 sm:py-8 bg-slate-950 border-t border-slate-900 text-slate-500 text-xs">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div className="flex items-center justify-center gap-2">
            <span className="font-bold text-slate-300">MandiStockia</span>
            <span>•</span>
            <span>پاکستان منڈی انوینٹری پورٹل</span>
          </div>
          <div className="flex items-center justify-center gap-3 text-[11px]">
            {/* Login button: hidden on mobile screens per user request */}
            <button
              onClick={() => onOpenAuth('login')}
              className="hidden sm:inline-flex text-slate-400 hover:text-amber-400 transition-colors font-medium items-center gap-1.5 cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-amber-400" />
              <span>لاگ ان (Sign In)</span>
            </button>
            <span className="hidden sm:inline">•</span>
            <span>© 2026 MandiStockia. تمام حقوق محفوظ ہیں۔</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
