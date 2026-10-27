"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "@/hooks/useReducedMotion";
import { useLanguage } from "@/i18n";
import { MatagerLogo } from "@/components/brand/MatagerLogo";
import {
  X,
  ArrowRight,
  ArrowLeft,
  Check,
  CheckCircle2,
  Store,
  Layers,
  Monitor,
  Building,
  MapPin,
  Mail,
  Phone,
  ShieldCheck,
  CreditCard,
  Rocket,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  Info,
  ChevronRight,
  ExternalLink,
  User,
} from "lucide-react";
import { APP_ROUTES } from "@/config/routes";
import { setupStoreOwnerAccount } from "@/lib/firestore-service";

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: "signin" | "signup";
  initialRole?: "owner" | "employee";
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = "signup",
  initialRole = "owner",
  onClose,
}) => {
  const { dir, locale } = useLanguage();
  const isAr = locale === "ar";
  const prefersReducedMotion = useReducedMotion();

  // Active flow: "signup" (7 steps, Store Owner only) or "signin" (4 steps)
  const [mode, setMode] = useState<"signin" | "signup">(initialMode);

  // Focus management
  const modalRef = useRef<HTMLDivElement>(null);
  const previouslyFocusedElement = useRef<HTMLElement | null>(null);

  // ─── SIGN UP STATE (7 Steps) ───
  const [signupStep, setSignupStep] = useState<1 | 2 | 3 | 4 | 5 | 6 | 7>(1);

  // Step 1: Sales channels
  const [salesChannel, setSalesChannel] = useState<"hybrid" | "online" | "pos">("hybrid");

  // Step 2: Business details
  const [storeName, setStoreName] = useState("");
  const [legalName, setLegalName] = useState("");

  // Step 3: Category
  const [category, setCategory] = useState<string>("Retail & Fashion");

  // Step 4: Location
  const [country, setCountry] = useState(isAr ? "Saudi Arabia" : "United States");
  const [city, setCity] = useState("");
  const [address, setAddress] = useState("");

  // Step 5: Contact
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [contactCode, setContactCode] = useState("");
  const [isContactVerified, setIsContactVerified] = useState(false);
  const [contactVerifySent, setContactVerifySent] = useState(false);

  // Step 6: Plan
  const [selectedPlan, setSelectedPlan] = useState<"starter" | "pro" | "enterprise">("pro");

  // Step 7: Launching state
  const [isLaunching, setIsLaunching] = useState(false);

  // ─── SIGN IN STATE (S1 to S5) ───
  // S1 Identify -> S2 Verify (OTP) or S3 Password -> S3b Reset -> S4 Choose Store -> S5 Done
  const [signinStage, setSigninStage] = useState<
    "identify" | "verify" | "password" | "reset" | "choose_store" | "done"
  >("identify");
  const [identifier, setIdentifier] = useState("");
  const [otpValues, setOtpValues] = useState<string[]>(["", "", "", "", "", ""]);
  const [resendCountdown, setResendCountdown] = useState<number>(30);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [resetSent, setResetSent] = useState(false);
  const [selectedStore, setSelectedStore] = useState<string>("Apex Luxury Store");
  const [signinRole, setSigninRole] = useState<"owner" | "employee">(initialRole);
  const [rememberDevice, setRememberDevice] = useState(true);

  const otpInputsRef = useRef<(HTMLInputElement | null)[]>([]);

  // Sync initialMode on prop change
  useEffect(() => {
    setMode(initialMode);
    resetAllFlows();
  }, [initialMode]);

  // Capture trigger focus and handle Escape
  useEffect(() => {
    if (isOpen) {
      previouslyFocusedElement.current = document.activeElement as HTMLElement;
      // Focus modal on open
      setTimeout(() => {
        modalRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") {
          handleClose();
        }
      };
      window.addEventListener("keydown", handleKeyDown);
      return () => window.removeEventListener("keydown", handleKeyDown);
    } else {
      previouslyFocusedElement.current?.focus();
    }
  }, [isOpen]);

  // Resend Countdown timer for OTP
  useEffect(() => {
    if (mode === "signin" && signinStage === "verify" && resendCountdown > 0) {
      const timer = setTimeout(() => {
        setResendCountdown((c) => c - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [mode, signinStage, resendCountdown]);

  // S5 Done auto-redirect after 1.5s to APP_ROUTES.dashboard
  useEffect(() => {
    if (mode === "signin" && signinStage === "done") {
      const redirectTimer = setTimeout(() => {
        window.location.href = APP_ROUTES.dashboard;
      }, 1500);
      return () => clearTimeout(redirectTimer);
    }
  }, [mode, signinStage]);

  const handleClose = () => {
    resetAllFlows();
    onClose();
  };

  const resetAllFlows = () => {
    setSignupStep(1);
    setSigninStage("identify");
    setOtpValues(["", "", "", "", "", ""]);
    setResendCountdown(30);
    setPassword("");
    setShowPassword(false);
    setResetSent(false);
    setIsLaunching(false);
  };

  const switchMode = (newMode: "signin" | "signup") => {
    setMode(newMode);
    resetAllFlows();
  };

  // ─── STEP VALIDATION LOGIC ───
  const isSignupStepValid = () => {
    switch (signupStep) {
      case 1:
        return !!salesChannel;
      case 2:
        return storeName.trim().length > 0 && legalName.trim().length > 0;
      case 3:
        return category.trim().length > 0;
      case 4:
        return country.trim().length > 0 && city.trim().length > 0 && address.trim().length > 0;
      case 5:
        return email.includes("@") && phone.trim().length >= 7;
      case 6:
        return !!selectedPlan;
      case 7:
        return true;
      default:
        return false;
    }
  };

  const handleSignupNext = () => {
    if (!isSignupStepValid()) return;
    if (signupStep < 7) {
      setSignupStep((s) => (s + 1) as any);
    } else {
      // Step 7: Launch & Setup in Firebase Cloud
      setIsLaunching(true);
      setupStoreOwnerAccount({
        salesChannel,
        storeName,
        legalName,
        category,
        country,
        city,
        address,
        email,
        phone,
        password,
        selectedPlan,
      })
        .then(() => {
          setTimeout(() => {
            window.location.href = APP_ROUTES.dashboard;
          }, 1200);
        })
        .catch((err) => {
          console.error("Firebase store setup error:", err);
          window.location.href = APP_ROUTES.dashboard;
        });
    }
  };

  const handleSignupBack = () => {
    if (signupStep > 1) {
      setSignupStep((s) => (s - 1) as any);
    }
  };

  // Signin validation
  const isSigninIdentifyValid = () => {
    return identifier.trim().length >= 4;
  };

  const isOtpComplete = () => {
    return otpValues.every((digit) => digit.length === 1);
  };

  const handleOtpChange = (index: number, value: string) => {
    // Handle single character or paste
    if (value.length > 1) {
      const digits = value.replace(/\D/g, "").slice(0, 6).split("");
      const newOtp = [...otpValues];
      digits.forEach((d, i) => {
        if (i < 6) newOtp[i] = d;
      });
      setOtpValues(newOtp);
      const nextIndex = Math.min(digits.length, 5);
      otpInputsRef.current[nextIndex]?.focus();
      return;
    }

    const digit = value.replace(/\D/g, "");
    const newOtp = [...otpValues];
    newOtp[index] = digit;
    setOtpValues(newOtp);

    // Auto-advance
    if (digit && index < 5) {
      otpInputsRef.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otpValues[index] && index > 0) {
      otpInputsRef.current[index - 1]?.focus();
    }
  };

  const handleVerifyOtp = () => {
    if (isOtpComplete()) {
      // Advance to choose store (S4)
      setSigninStage("choose_store");
    }
  };

  const handlePasswordSignIn = () => {
    if (password.trim().length >= 4) {
      setSigninStage("choose_store");
    }
  };

  const handleChooseStoreContinue = () => {
    setSigninStage("done");
  };

  // Compute Active Dots Position for Sign-In
  const getSigninActiveDot = () => {
    switch (signinStage) {
      case "identify":
        return 1;
      case "verify":
      case "password":
      case "reset":
        return 2;
      case "choose_store":
        return 3;
      case "done":
        return 4;
      default:
        return 1;
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      dir={dir}
    >
      {/* Frosted Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={handleClose}
        className="fixed inset-0 bg-black/80 backdrop-blur-md"
      />

      {/* Main Dialog Modal Panel */}
      <motion.div
        ref={modalRef}
        tabIndex={-1}
        initial={{ opacity: 0, scale: 0.96, y: 14 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 14 }}
        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-[500px] bg-[var(--color-surface)] border border-[var(--color-border)] rounded-[20px] p-6 sm:p-7 shadow-2xl text-[var(--color-text-primary)] z-10 overflow-hidden my-auto outline-none"
        style={{
          boxShadow:
            "0 30px 70px -15px rgba(0, 0, 0, 0.75), 0 0 0 1px var(--color-border-subtle)",
        }}
      >
        {/* Atmospheric Radial Wash */}
        <div
          className="absolute -top-24 start-1/2 -translate-x-1/2 rtl:translate-x-1/2 w-80 h-36 pointer-events-none blur-3xl opacity-50"
          style={{
            background:
              "radial-gradient(ellipse at center, rgba(4, 121, 232, 0.45) 0%, rgba(0, 131, 254, 0.2) 60%, transparent 80%)",
          }}
          aria-hidden="true"
        />

        {/* Modal Header: Brand, Close Button & Non-Clickable Progress Dots */}
        <div className="relative mb-6">
          <div className="flex items-center justify-between pb-3 border-b border-[var(--color-border-subtle)]">
            <MatagerLogo size="sm" showWordmark={true} animated={false} />

            {/* Non-Clickable Progress Dots (7 dots for sign up, 4 dots for sign in) */}
            <div
              className="flex items-center gap-1.5"
              aria-label={
                mode === "signup"
                  ? `Step ${signupStep} of 7`
                  : `Step ${getSigninActiveDot()} of 4`
              }
            >
              {mode === "signup"
                ? [1, 2, 3, 4, 5, 6, 7].map((dot) => (
                  <span
                    key={dot}
                    className={`msm-dot ${dot === signupStep
                      ? "is-active"
                      : dot < signupStep
                        ? "is-passed"
                        : ""
                      }`}
                  />
                ))
                : [1, 2, 3, 4].map((dot) => (
                  <span
                    key={dot}
                    className={`msm-dot ${dot === getSigninActiveDot()
                      ? "is-active"
                      : dot < getSigninActiveDot()
                        ? "is-passed"
                        : ""
                      }`}
                  />
                ))}
            </div>

            {/* Close Button */}
            <button
              type="button"
              onClick={handleClose}
              className="p-1.5 rounded-full text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] border border-[var(--color-border-subtle)] transition-colors"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* ══════════════════════════════════════════════════════════════════
            FLOW A: SIGN UP (Store Owner Only — 7 Steps)
            ══════════════════════════════════════════════════════════════════ */}
        {mode === "signup" && (
          <div className="space-y-5">
            {/* ─── STEP 1: Sales channels ─── */}
            {signupStep === 1 && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-ui uppercase tracking-wider text-gradient-primary font-bold block mb-1">
                    {isAr ? "الخطوة 1: قنوات البيع" : "Step 1: Sales channels"}
                  </span>
                  <h2 className="font-heading text-xl sm:text-2xl font-normal text-[var(--color-text-primary)]">
                    {isAr ? "ما هي استراتيجيتك الحالية؟" : "What is your current strategy?"}
                  </h2>
                </div>

                <div className="space-y-2.5">
                  {/* Option 1: Hybrid Unified Store (Default Selected) */}
                  <div
                    onClick={() => setSalesChannel("hybrid")}
                    className={`msm-opt ${salesChannel === "hybrid" ? "is-selected" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-[8px] bg-gradient-to-br from-[var(--color-primary-dark)]/20 to-[var(--color-primary-light)]/20 text-[var(--color-primary-light)] mt-0.5">
                        <Layers className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[var(--color-text-primary)]">
                          {isAr ? "متجر موحد هجين" : "Hybrid Unified Store"}
                        </div>
                        <div className="msm-sub text-xs text-[var(--color-text-secondary)] mt-0.5">
                          {isAr ? "نقاط بيع (POS) متزامنة مع موقعك الإلكتروني." : "POS synced with your website."}
                        </div>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${salesChannel === "hybrid" ? "border-transparent bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] text-white shadow-sm shadow-[var(--color-primary-dark)]/40" : "border-[var(--color-border)]"}`}>
                      {salesChannel === "hybrid" && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                    </div>
                  </div>

                  {/* Option 2: Online Store */}
                  <div
                    onClick={() => setSalesChannel("online")}
                    className={`msm-opt ${salesChannel === "online" ? "is-selected" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-[8px] bg-[var(--color-accent-mint)]/15 text-[var(--color-accent-mint)] mt-0.5">
                        <Monitor className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[var(--color-text-primary)]">
                          {isAr ? "متجر إلكتروني" : "Online Store"}
                        </div>
                        <div className="msm-sub text-xs text-[var(--color-text-secondary)] mt-0.5">
                          {isAr ? "البيع عبر موقع إلكتروني مخصص." : "Sell through a custom website."}
                        </div>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${salesChannel === "online" ? "border-transparent bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] text-white shadow-sm shadow-[var(--color-primary-dark)]/40" : "border-[var(--color-border)]"}`}>
                      {salesChannel === "online" && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                    </div>
                  </div>

                  {/* Option 3: POS Setup */}
                  <div
                    onClick={() => setSalesChannel("pos")}
                    className={`msm-opt ${salesChannel === "pos" ? "is-selected" : ""}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className="p-2 rounded-[8px] bg-gradient-to-br from-[var(--color-primary-dark)]/20 to-[var(--color-primary-light)]/20 text-[var(--color-primary-light)] mt-0.5">
                        <Store className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-[var(--color-text-primary)]">
                          {isAr ? "إعداد نقاط البيع" : "POS Setup"}
                        </div>
                        <div className="msm-sub text-xs text-[var(--color-text-secondary)] mt-0.5">
                          {isAr ? "نظام كاشير نقاط بيع فقط." : "POS cashier system only."}
                        </div>
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${salesChannel === "pos" ? "border-transparent bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] text-white shadow-sm shadow-[var(--color-primary-dark)]/40" : "border-[var(--color-border)]"}`}>
                      {salesChannel === "pos" && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                    </div>
                  </div>
                </div>


              </div>
            )}

            {/* ─── STEP 2: Business details ─── */}
            {signupStep === 2 && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-ui uppercase tracking-wider text-gradient-primary font-bold block mb-1">
                    {isAr ? "الخطوة 2: بيانات النشاط" : "Step 2: Business details"}
                  </span>

                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                      {isAr ? "اسم المتجر" : "Store name"}
                    </label>
                    <input
                      type="text"
                      required
                      value={storeName}
                      onChange={(e) => setStoreName(e.target.value)}
                      placeholder={isAr ? "متجر الأناقة" : "Store name"}
                      className="input-theme-gradient w-full px-3.5 py-2.5 rounded-[10px] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                      {isAr ? "الاسم القانوني للشركة" : "Legal name"}
                    </label>
                    <input
                      type="text"
                      required
                      value={legalName}
                      onChange={(e) => setLegalName(e.target.value)}
                      placeholder={isAr ? "شركة الأناقة للتجارة ذ.م.م" : "Legal company name"}
                      className="input-theme-gradient w-full px-3.5 py-2.5 rounded-[10px] text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ─── STEP 3: Category ─── */}
            {signupStep === 3 && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-ui uppercase tracking-wider text-gradient-primary font-bold block mb-1">
                    {isAr ? "الخطوة 3: التصنيف" : "Step 3: Category"}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  {[
                    "Retail & Fashion",
                    "Food & Beverage",
                    "Electronics & Tech",
                    "Beauty & Cosmetics",
                    "Grocery & Market",
                    "Home & Living",
                    "Services & Digital",
                  ].map((cat) => (
                    <div
                      key={cat}
                      onClick={() => setCategory(cat)}
                      className={`msm-opt text-xs py-2.5 px-3 ${category === cat ? "is-selected" : ""
                        }`}
                    >
                      <span className="font-medium text-[var(--color-text-primary)]">{cat}</span>
                      {category === cat && (
                        <Check className="w-3.5 h-3.5 text-[var(--color-primary-light)] shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ─── STEP 4: Location ─── */}
            {signupStep === 4 && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-ui uppercase tracking-wider text-gradient-primary font-bold block mb-1">
                    {isAr ? "الخطوة 4: الموقع الجغرافي" : "Step 4: Location"}
                  </span>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                      {isAr ? "الدولة" : "Country"}
                    </label>
                    <select
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="input-theme-gradient w-full px-3.5 py-2.5 rounded-[10px] text-sm"
                    >
                      <option value="Saudi Arabia">Saudi Arabia (المملكة العربية السعودية)</option>
                      <option value="United Arab Emirates">United Arab Emirates (الإمارات)</option>
                      <option value="Egypt">Egypt (مصر)</option>
                      <option value="United States">United States</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Germany">Germany</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                      {isAr ? "المدينة" : "City"}
                    </label>
                    <input
                      type="text"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder={isAr ? "الرياض" : "City"}
                      className="input-theme-gradient w-full px-3.5 py-2.5 rounded-[10px] text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                      {isAr ? "العنوان أو الحي" : "Address"}
                    </label>
                    <input
                      type="text"
                      required
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      placeholder={isAr ? "حي العليا، طريق الملك فهد" : "Street address"}
                      className="input-theme-gradient w-full px-3.5 py-2.5 rounded-[10px] text-sm"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* ─── STEP 5: Contact ─── */}
            {signupStep === 5 && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-ui uppercase tracking-wider text-gradient-primary font-bold block mb-1">
                    {isAr ? "الخطوة 5: بيانات الاتصال" : "Step 5: Contact"}
                  </span>

                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                      {isAr ? "البريد الإلكتروني للعمل" : "Email"}
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="owner@store.com"
                      dir="ltr"
                      className="input-theme-gradient w-full px-3.5 py-2.5 rounded-[10px] text-sm font-ui"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1">
                      {isAr ? "رقم الهاتف" : "Phone"}
                    </label>
                    <input
                      type="tel"
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+966 50 123 4567"
                      dir="ltr"
                      className="input-theme-gradient w-full px-3.5 py-2.5 rounded-[10px] text-sm font-ui"
                    />
                  </div>

                  {/* Verification Snippet */}
                  <div className="pt-2">
                    {!contactVerifySent ? (
                      <button
                        type="button"
                        onClick={() => setContactVerifySent(true)}
                        disabled={!email.includes("@") || phone.trim().length < 7}
                        className="w-full py-2 rounded-[8px] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] text-xs font-medium text-[var(--color-text-primary)] hover:bg-[var(--color-surface-hover)] disabled:opacity-40 transition-colors"
                      >
                        {isAr ? "إرسال رمز التحقق للاتصال" : "Send contact verification"}
                      </button>
                    ) : (
                      <div className="p-3 rounded-[10px] bg-[var(--color-surface-elevated)] border border-[var(--color-accent-mint)]/40 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[var(--color-text-secondary)]">
                            {isAr ? "أدخل رمز التحقق (اختباري: 123456)" : "Enter verification code (Demo: 123456)"}
                          </span>
                          <span className="text-[var(--color-accent-mint)] font-ui font-bold">
                            {isContactVerified ? "✓ Verified" : "Sent"}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={contactCode}
                            onChange={(e) => {
                              setContactCode(e.target.value);
                              if (e.target.value.length >= 4) {
                                setIsContactVerified(true);
                              }
                            }}
                            placeholder="123456"
                            className="input-theme-gradient flex-1 px-3 py-1.5 rounded-[6px] text-xs font-ui text-center"
                          />
                          <button
                            type="button"
                            onClick={() => setIsContactVerified(true)}
                            className="px-3 py-1.5 rounded-[6px] bg-[var(--color-accent-mint)] text-black text-xs font-semibold"
                          >
                            {isAr ? "تحقق" : "Verify"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ─── STEP 6: Plan ─── */}
            {signupStep === 6 && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-ui uppercase tracking-wider text-gradient-primary font-bold block mb-1">
                    {isAr ? "الخطوة 6: الباقة" : "Step 6: Plan"}
                  </span>
                </div>

                <div className="space-y-2.5">
                  {/* Plan 1: Starter */}
                  <div
                    data-planid="starter"
                    data-price="29"
                    onClick={() => setSelectedPlan("starter")}
                    className={`msm-opt ${selectedPlan === "starter" ? "is-selected" : ""}`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[var(--color-text-primary)]">Starter</span>
                        <span className="text-xs font-ui text-[var(--color-text-muted)]">$29 / mo</span>
                      </div>
                      <div className="msm-sub text-xs text-[var(--color-text-secondary)] mt-0.5">
                        {isAr ? "واجهة متجر واحدة + نقطة بيع أساسية" : "Single storefront + Essential POS"}
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${selectedPlan === "starter" ? "border-transparent bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] text-white shadow-sm shadow-[var(--color-primary-dark)]/40" : "border-[var(--color-border)]"}`}>
                      {selectedPlan === "starter" && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                    </div>
                  </div>

                  {/* Plan 2: Professional (Popular) */}
                  <div
                    data-planid="pro"
                    data-price="79"
                    onClick={() => setSelectedPlan("pro")}
                    className={`msm-opt ${selectedPlan === "pro" ? "is-selected" : ""}`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[var(--color-text-primary)]">Professional</span>
                        <span className="text-xs font-ui font-bold text-[var(--color-accent-mint)]">$79 / mo</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] font-ui bg-gradient-to-r from-[var(--color-primary-dark)]/20 to-[var(--color-primary-light)]/20 text-[var(--color-primary-light)] border border-[var(--color-primary-light)]/30">
                          Popular
                        </span>
                      </div>
                      <div className="msm-sub text-xs text-[var(--color-text-secondary)] mt-0.5">
                        {isAr ? "نقاط بيع متعددة الفروع + تكامل الشحن + عمولة 0%" : "Multi-branch POS + Carrier API + 0% fees"}
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${selectedPlan === "pro" ? "border-transparent bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] text-white shadow-sm shadow-[var(--color-primary-dark)]/40" : "border-[var(--color-border)]"}`}>
                      {selectedPlan === "pro" && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                    </div>
                  </div>

                  {/* Plan 3: Enterprise */}
                  <div
                    data-planid="enterprise"
                    data-price="199"
                    onClick={() => setSelectedPlan("enterprise")}
                    className={`msm-opt ${selectedPlan === "enterprise" ? "is-selected" : ""}`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[var(--color-text-primary)]">Enterprise</span>
                        <span className="text-xs font-ui text-[var(--color-text-muted)]">$199 / mo</span>
                      </div>
                      <div className="msm-sub text-xs text-[var(--color-text-secondary)] mt-0.5">
                        {isAr ? "مساحة مخصصة بالكامل + دفتر حسابات متعدد التجار" : "Dedicated cluster + Multi-vendor ledger"}
                      </div>
                    </div>
                    <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${selectedPlan === "enterprise" ? "border-transparent bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] text-white shadow-sm shadow-[var(--color-primary-dark)]/40" : "border-[var(--color-border)]"}`}>
                      {selectedPlan === "enterprise" && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ─── STEP 7: Review & launch ─── */}
            {signupStep === 7 && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-ui uppercase tracking-wider text-gradient-primary font-bold block mb-1">
                    {isAr ? "الخطوة 7: المراجعة والإطلاق" : "Step 7: Review & launch"}
                  </span>
                  <h2 className="font-heading text-xl sm:text-2xl font-normal text-[var(--color-text-primary)]">
                    {isAr ? "جاهز لإطلاق مساحة العمل" : "Review & launch"}
                  </h2>
                </div>

                <div className="p-4 rounded-[12px] bg-[var(--color-surface-elevated)] border border-[var(--color-border)] space-y-2.5 text-xs">
                  <div className="flex justify-between py-1 border-b border-[var(--color-border-subtle)]">
                    <span className="text-[var(--color-text-secondary)]">{isAr ? "الاستراتيجية" : "Strategy"}</span>
                    <span className="font-medium text-[var(--color-text-primary)]">
                      {salesChannel === "hybrid"
                        ? "Hybrid Unified Store"
                        : salesChannel === "online"
                          ? "Online Store"
                          : "POS Setup"}
                    </span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--color-border-subtle)]">
                    <span className="text-[var(--color-text-secondary)]">{isAr ? "اسم المتجر" : "Store"}</span>
                    <span className="font-medium text-[var(--color-text-primary)]">{storeName || "My Store"}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--color-border-subtle)]">
                    <span className="text-[var(--color-text-secondary)]">{isAr ? "التصنيف" : "Category"}</span>
                    <span className="font-medium text-[var(--color-text-primary)]">{category}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--color-border-subtle)]">
                    <span className="text-[var(--color-text-secondary)]">{isAr ? "الموقع" : "Location"}</span>
                    <span className="font-medium text-[var(--color-text-primary)]">{city || "Riyadh"}, {country}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-[var(--color-border-subtle)]">
                    <span className="text-[var(--color-text-secondary)]">{isAr ? "الباقة المختارة" : "Plan"}</span>
                    <span className="font-bold text-[var(--color-accent-mint)] font-ui uppercase">{selectedPlan}</span>
                  </div>
                </div>

                <div className="p-3 rounded-[10px] bg-[var(--color-accent-mint)]/10 border border-[var(--color-accent-mint)]/30 text-xs text-[var(--color-text-secondary)] flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[var(--color-accent-mint)] shrink-0" />
                  <span>
                    {isAr
                      ? "سيتم إنشاء مساحة عمل صاحب المتجر وتفعيل واجهة المتجر ونقاط البيع فوراً."
                      : "Store Owner workspace and credentials will be provisioned in 30 seconds."}
                  </span>
                </div>
              </div>
            )}

            {/* Navigation Actions for Sign Up (Back / Next) */}
            <div className="flex items-center justify-between pt-3 border-t border-[var(--color-border)]">
              {signupStep > 1 ? (
                <button
                  type="button"
                  onClick={handleSignupBack}
                  className="msm-back"
                >
                  <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
                  <span>{isAr ? "السابق" : "Back"}</span>
                </button>
              ) : (
                <div />
              )}

              <button
                type="button"
                onClick={handleSignupNext}
                disabled={!isSignupStepValid() || isLaunching}
                className="msm-next"
              >
                {isLaunching ? (
                  <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>
                      {signupStep === 7
                        ? isAr
                          ? "إطلاق مساحة العمل"
                          : "Launch Workspace"
                        : isAr
                          ? "المتابعة"
                          : "Continue"}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </>
                )}
              </button>
            </div>

            {/* Footer Flow Switcher (.msm-switch flips to Sign In) */}
            <div className="pt-3 text-center border-t border-[var(--color-border-subtle)]">
              <p className="text-xs text-[var(--color-text-secondary)]">
                {isAr ? "هل لديك حساب بالفعل؟" : "Already have an account?"}{" "}
                <button
                  type="button"
                  data-switch="signin"
                  onClick={() => switchMode("signin")}
                  className="msm-switch"
                >
                  {isAr ? "تسجيل الدخول" : "Sign in"}
                </button>
              </p>
            </div>
          </div>
        )}

        {/* ══════════════════════════════════════════════════════════════════
            FLOW B: SIGN IN (Store Owner OR Staff/Cashier — 4 Dots)
            ══════════════════════════════════════════════════════════════════ */}
        {mode === "signin" && (
          <div className="space-y-5">
            {/* ─── S1. IDENTIFY & AUTH (Image 2 Layout) ─── */}
            {signinStage === "identify" && (
              <div className="space-y-4">
                <div>
                  <span className="text-[11px] font-ui uppercase tracking-wider text-gradient-primary font-bold block mb-1">
                    MATAGER AUTHENTICATION
                  </span>
                  <h2 className="font-heading text-2xl font-normal text-[var(--color-text-primary)]">
                    {isAr ? "تسجيل الدخول إلى متاجر" : "Sign In to Matager"}
                  </h2>
                  <p className="msm-sub text-xs text-[var(--color-text-secondary)] mt-1">
                    {isAr ? "تسجيل الدخول إلى مساحة عمل متجرك." : "Sign in to your store workspace."}
                  </p>
                </div>

                {/* Role Switcher (Staff / Cashier vs Store Owner) */}
                <div className="flex p-1 rounded-[12px] bg-[var(--color-surface-elevated)] border border-[var(--color-border-subtle)]">
                  <button
                    type="button"
                    onClick={() => setSigninRole("employee")}
                    className={`flex-1 py-2 px-3 rounded-[9px] text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${signinRole === "employee"
                      ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm border border-[var(--color-border)]"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                      }`}
                  >
                    <User className="w-3.5 h-3.5" />
                    <span>{isAr ? "كاشير / موظف" : "Staff / Cashier"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSigninRole("owner")}
                    className={`flex-1 py-2 px-3 rounded-[9px] text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${signinRole === "owner"
                      ? "bg-[var(--color-surface)] text-[var(--color-text-primary)] shadow-sm border border-[var(--color-border)]"
                      : "text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)]"
                      }`}
                  >
                    <Store className="w-3.5 h-3.5" />
                    <span>{isAr ? "صاحب المتجر" : "Store Owner"}</span>
                  </button>
                </div>

                {/* Field 1: Email or Phone (2-Color Gradient Input) */}
                <div>
                  <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                    {isAr ? "البريد الإلكتروني أو الهاتف" : "Email or Phone"}
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      required
                      value={identifier}
                      onChange={(e) => setIdentifier(e.target.value)}
                      autoComplete="username"
                      placeholder={isAr ? "owner@store.com أو رقم الهاتف" : "owner@store.com"}
                      dir="ltr"
                      className="input-theme-gradient w-full px-3.5 pe-10 py-2.5 rounded-[10px] text-sm font-ui"
                    />
                    <Mail className="w-4 h-4 text-[var(--color-text-muted)] absolute end-3.5 top-3 pointer-events-none" />
                  </div>
                </div>

                {/* Field 2: Password (2-Color Gradient Input) */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-[var(--color-text-secondary)]">
                      {isAr ? "كلمة المرور" : "Password"}
                    </label>
                    <button
                      type="button"
                      onClick={() => setSigninStage("reset")}
                      className="text-xs text-gradient-primary font-medium hover:underline"
                    >
                      {isAr ? "نسيت كلمة المرور؟" : "Forgot password?"}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      placeholder="••••••••••••"
                      dir="ltr"
                      className="input-theme-gradient w-full ps-3.5 pe-10 py-2.5 rounded-[10px] text-sm font-ui"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-3.5 top-3 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember device checkbox & OTP alternative */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <label className="flex items-center gap-2 cursor-pointer text-[var(--color-text-secondary)]">
                    <input
                      type="checkbox"
                      checked={rememberDevice}
                      onChange={(e) => setRememberDevice(e.target.checked)}
                      className="w-4 h-4 rounded border-[var(--color-border)] accent-[var(--color-primary-dark)] cursor-pointer"
                    />
                    <span>{isAr ? "تذكر هذا الجهاز لمدة 30 يوماً" : "Remember device for 30 days"}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => setSigninStage("verify")}
                    className="text-xs text-gradient-primary font-medium hover:underline"
                  >
                    {isAr ? "رمز التحقق OTP" : "Use OTP instead"}
                  </button>
                </div>

                {/* Primary Button: Sign In to Workspace (UNTOUCHED Primary Button Style) */}
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => {
                      if (password.trim().length >= 4) {
                        handlePasswordSignIn();
                      } else {
                        setSigninStage("verify");
                      }
                    }}
                    disabled={!isSigninIdentifyValid()}
                    className="msm-next w-full py-3"
                  >
                    <span>{isAr ? "تسجيل الدخول لمساحة العمل" : "Sign In to Workspace"}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {/* ─── S2. VERIFY (OTP) ─── */}
            {signinStage === "verify" && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-heading text-2xl font-normal text-[var(--color-text-primary)]">
                    {isAr ? "أدخل رمز التحقق" : "Enter your code"}
                  </h2>
                  <p className="msm-sub text-xs text-[var(--color-text-secondary)] mt-1">
                    {isAr
                      ? `أرسلنا رمزاً مكوناً من 6 أرقام إلى ${identifier}.`
                      : `We sent a 6-digit code to ${identifier}.`}
                  </p>
                </div>

                {/* 6 Digit Inputs (2-Color Gradient) */}
                <div className="flex items-center justify-between gap-2 py-2" dir="ltr">
                  {otpValues.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => {
                        otpInputsRef.current[idx] = el;
                      }}
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="input-theme-gradient w-11 h-12 text-center text-lg font-bold font-ui rounded-[10px] transition-all"
                    />
                  ))}
                </div>

                {/* Resend & Password fallback */}
                <div className="flex items-center justify-between text-xs pt-1">
                  <button
                    type="button"
                    disabled={resendCountdown > 0}
                    onClick={() => setResendCountdown(30)}
                    className="text-[var(--color-text-secondary)] hover:text-[var(--color-text-primary)] disabled:opacity-50"
                  >
                    {resendCountdown > 0
                      ? isAr
                        ? `إعادة الإرسال بعد (${resendCountdown}ث)`
                        : `Resend code (${resendCountdown}s)`
                      : isAr
                        ? "إعادة إرسال الرمز"
                        : "Resend code"}
                  </button>

                  <button
                    type="button"
                    onClick={() => setSigninStage("identify")}
                    className="text-gradient-primary hover:underline font-medium"
                  >
                    {isAr ? "استخدام كلمة المرور بدلاً من ذلك" : "Use password instead"}
                  </button>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSigninStage("identify")}
                    className="msm-back"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
                    <span>{isAr ? "السابق" : "Back"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleVerifyOtp}
                    disabled={!isOtpComplete()}
                    className="msm-next flex-1 py-3"
                  >
                    <span>{isAr ? "تحقق" : "Verify"}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {/* ─── S3. PASSWORD FALLBACK ─── */}
            {signinStage === "password" && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-heading text-2xl font-normal text-[var(--color-text-primary)]">
                    {isAr ? "مرحباً بعودتك" : "Welcome back"}
                  </h2>
                  <p className="msm-sub text-xs text-[var(--color-text-secondary)] mt-1">
                    {isAr ? "تسجيل الدخول إلى متجرك." : "Sign in to your store."}
                  </p>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="text-xs font-medium text-[var(--color-text-secondary)]">
                      {isAr ? "كلمة المرور" : "Password"}
                    </label>
                    <button
                      type="button"
                      onClick={() => setSigninStage("reset")}
                      className="text-xs text-gradient-primary hover:underline"
                    >
                      {isAr ? "نسيت كلمة المرور؟" : "Forgot password?"}
                    </button>
                  </div>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      autoComplete="current-password"
                      placeholder="••••••••••••"
                      dir="ltr"
                      className="input-theme-gradient w-full ps-3.5 pe-10 py-2.5 rounded-[10px] text-sm font-ui"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute end-3.5 top-3 text-[var(--color-text-muted)] hover:text-[var(--color-text-primary)]"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setSigninStage("identify")}
                    className="msm-back"
                  >
                    <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
                    <span>{isAr ? "السابق" : "Back"}</span>
                  </button>
                  <button
                    type="button"
                    onClick={handlePasswordSignIn}
                    disabled={password.trim().length < 4}
                    className="msm-next flex-1 py-3"
                  >
                    <span>{isAr ? "تسجيل الدخول" : "Sign in"}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {/* ─── S3b. RESET PASSWORD BRANCH ─── */}
            {signinStage === "reset" && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-heading text-2xl font-normal text-[var(--color-text-primary)]">
                    {isAr ? "إعادة تعيين كلمة المرور" : "Reset your password"}
                  </h2>
                  <p className="msm-sub text-xs text-[var(--color-text-secondary)] mt-1">
                    {isAr
                      ? "أدخل بريدك الإلكتروني وسنرسل لك رابط الاستعادة."
                      : "Enter your email to receive recovery instructions."}
                  </p>
                </div>

                {!resetSent ? (
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-text-secondary)] mb-1.5">
                        {isAr ? "البريد الإلكتروني" : "Email"}
                      </label>
                      <input
                        type="email"
                        required
                        value={identifier}
                        onChange={(e) => setIdentifier(e.target.value)}
                        placeholder="owner@store.com"
                        dir="ltr"
                        className="input-theme-gradient w-full px-3.5 py-2.5 rounded-[10px] text-sm font-ui"
                      />
                    </div>

                    <div className="flex items-center gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setSigninStage("identify")}
                        className="msm-back"
                      >
                        <ArrowLeft className="w-3.5 h-3.5 rtl:rotate-180" />
                        <span>{isAr ? "السابق" : "Back"}</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => setResetSent(true)}
                        disabled={!identifier.includes("@")}
                        className="msm-next flex-1 py-3"
                      >
                        <span>{isAr ? "إرسال رابط الاستعادة" : "Send reset link"}</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-[12px] bg-[var(--color-surface-elevated)] border border-[var(--color-accent-mint)]/40 text-center space-y-3">
                    <CheckCircle2 className="w-8 h-8 text-[var(--color-accent-mint)] mx-auto" />
                    <div className="text-xs text-[var(--color-text-secondary)]">
                      {isAr
                        ? `تم إرسال تعليمات إعادة التعيين إلى ${identifier}.`
                        : `Password reset instructions sent to ${identifier}.`}
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setResetSent(false);
                        setSigninStage("identify");
                      }}
                      className="msm-switch text-xs"
                    >
                      {isAr ? "العودة لتسجيل الدخول" : "Back to sign in"}
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ─── S4. CHOOSE STORE ─── */}
            {signinStage === "choose_store" && (
              <div className="space-y-4">
                <div>
                  <h2 className="font-heading text-2xl font-normal text-[var(--color-text-primary)]">
                    {isAr ? "اختر المتجر" : "Choose store"}
                  </h2>
                  <p className="msm-sub text-xs text-[var(--color-text-secondary)] mt-1">
                    {isAr ? "حدد المتجر الذي ترغب بإدارته." : "Select your active store workspace."}
                  </p>
                </div>

                <div className="space-y-2.5">
                  {[
                    { name: "Apex Luxury Store", role: isAr ? "صاحب المتجر (Owner)" : "Store Owner" },
                    { name: "Riyadh Central Flagship", role: isAr ? "كاشير / موظف (Staff)" : "Staff / Cashier" },
                    { name: "Jeddah Mall Express", role: isAr ? "كاشير / موظف (Staff)" : "Staff / Cashier" },
                  ].map((st) => (
                    <div
                      key={st.name}
                      onClick={() => setSelectedStore(st.name)}
                      className={`msm-opt ${selectedStore === st.name ? "is-selected" : ""}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-[8px] bg-gradient-to-br from-[var(--color-primary-dark)]/20 to-[var(--color-primary-light)]/20 text-[var(--color-primary-light)]">
                          <Store className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="text-sm font-semibold text-[var(--color-text-primary)]">
                            {st.name}
                          </div>
                          <div className="msm-sub text-xs text-[var(--color-text-secondary)]">
                            {st.role}
                          </div>
                        </div>
                      </div>
                      <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 transition-all ${selectedStore === st.name ? "border-transparent bg-gradient-to-r from-[var(--color-primary-dark)] to-[var(--color-primary-light)] text-white shadow-sm shadow-[var(--color-primary-dark)]/40" : "border-[var(--color-border)]"}`}>
                        {selectedStore === st.name && <Check className="w-2.5 h-2.5 text-white stroke-[3]" />}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2">
                  <button
                    type="button"
                    onClick={handleChooseStoreContinue}
                    className="msm-next w-full py-3"
                  >
                    <span>{isAr ? "المتابعة" : "Continue"}</span>
                    <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                  </button>
                </div>
              </div>
            )}

            {/* ─── S5. DONE ─── */}
            {signinStage === "done" && (
              <div className="py-8 text-center space-y-4">
                <div className="w-16 h-16 rounded-full bg-[var(--color-accent-mint)]/20 border border-[var(--color-accent-mint)]/40 flex items-center justify-center text-[var(--color-accent-mint)] mx-auto shadow-lg shadow-[var(--color-accent-mint)]/10 animate-bounce">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h2 className="font-heading text-2xl font-normal text-[var(--color-text-primary)]">
                    {isAr ? "تم تسجيل دخولك بنجاح" : "You're signed in"}
                  </h2>
                  <p className="msm-sub text-xs text-[var(--color-text-secondary)] mt-1">
                    {isAr
                      ? `جاري توجيهك إلى ${selectedStore}...`
                      : `Taking you to ${selectedStore}.`}
                  </p>
                </div>

                <div className="pt-3">
                  <a
                    href={APP_ROUTES.dashboard}
                    className="btn-primary-pill text-xs py-2.5 px-6 inline-flex"
                  >
                    <span>{isAr ? "الانتقال إلى لوحة التحكم" : "Go to dashboard"}</span>
                  </a>
                </div>
              </div>
            )}

            {/* Footer Flow Switcher (.msm-switch flips to Sign Up) */}
            {signinStage !== "done" && (
              <div className="pt-3 text-center border-t border-[var(--color-border-subtle)]">
                <p className="text-xs text-[var(--color-text-secondary)]">
                  {isAr ? "ليس لديك حساب متجر؟" : "Don't have a store account?"}{" "}
                  <button
                    type="button"
                    data-switch="signup"
                    onClick={() => switchMode("signup")}
                    className="msm-switch"
                  >
                    {isAr ? "إنشاء حساب" : "Create account"}
                  </button>
                </p>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
