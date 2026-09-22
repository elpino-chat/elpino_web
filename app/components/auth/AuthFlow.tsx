"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import api from "@/lib/api";
import { useTranslation } from "@/app/hooks/useTranslation";
import {
  getErrorMessage,
  getFriendlyAuthError,
  getRequestedPlan,
  GoogleIcon,
  Spinner,
} from "@/app/components/auth/AuthShared";

type AuthResponse = {
  isNew?: boolean;
  next?: string;
  needsVerification?: boolean;
  email?: string;
  user?: { name?: string };
};

const LANGUAGES = [
  { code: "cs", name: "Czech", countryCode: "cz" },
  { code: "da", name: "Danish", countryCode: "dk" },
  { code: "de", name: "Deutsch", countryCode: "de" },
  { code: "en", name: "English", countryCode: "gb" },
  { code: "es", name: "Español", countryCode: "es" },
  { code: "fi", name: "Finnish", countryCode: "fi" },
  { code: "fr", name: "Français", countryCode: "fr" },
  { code: "hu", name: "Hungarian", countryCode: "hu" },
  { code: "id", name: "Indonesian", countryCode: "id" },
  { code: "it", name: "Italian", countryCode: "it" },
  { code: "ja", name: "Japanese", countryCode: "jp" },
  { code: "ko", name: "Korean", countryCode: "kr" },
  { code: "nl", name: "Dutch", countryCode: "nl" },
  { code: "pl", name: "Polish", countryCode: "pl" },
  { code: "pt", name: "Portuguese", countryCode: "pt" },
  { code: "pt-br", name: "Portuguese (Brazil)", countryCode: "br" },
  { code: "ro", name: "Romanian", countryCode: "ro" },
  { code: "ru", name: "Russian", countryCode: "ru" },
  { code: "sv", name: "Swedish", countryCode: "se" },
  { code: "th", name: "Thai", countryCode: "th" },
  { code: "tr", name: "Turkish", countryCode: "tr" },
  { code: "uk", name: "Ukrainian", countryCode: "ua" },
  { code: "vi", name: "Vietnamese", countryCode: "vn" },
  { code: "zh-tw", name: "Chinese (Taiwan)", countryCode: "tw" },
];

const SIGNUP_LABELS: Record<string, { first: string; last: string; choose: string; change: string; heading: string; description: string }> = {
  cs: { first: "Jméno", last: "Příjmení", choose: "Vyberte jazyk", change: "Změnit údaje", heading: "Poznejte svého nového partnera v podpoře", description: "Začněte zdarma. Není vyžadována kreditní karta." },
  da: { first: "Fornavn", last: "Efternavn", choose: "Vælg sprog", change: "Rediger oplysninger", heading: "Mødt dit nye supportteammedlem", description: "Kom i gang gratis. Intet kreditkort påkrævet." },
  de: { first: "Vorname", last: "Nachname", choose: "Sprache wählen", change: "Angaben ändern", heading: "Treffen Sie Ihren neuen Support-Teamkollegen", description: "Kostenlos starten. Keine Kreditkarte erforderlich." },
  en: { first: "First name", last: "Last name", choose: "Choose language", change: "Change details", heading: "Meet your new support teammate", description: "Start for free. No credit card required." },
  es: { first: "Nombre", last: "Apellido", choose: "Elegir idioma", change: "Cambiar datos", heading: "Conoce a tu nuevo compañero de soporte", description: "Comienza gratis. No se requiere tarjeta de crédito." },
  fi: { first: "Etunimi", last: "Sukunimi", choose: "Valitse kieli", change: "Muuta tietoja", heading: "Tutki uutta tukitiimikumppaniasi", description: "Aloita ilmaiseksi. Luottokortti ei vaaditaan." },
  fr: { first: "Prénom", last: "Nom", choose: "Choisir la langue", change: "Modifier les informations", heading: "Rencontrez votre nouveau coéquipier de support", description: "Commencez gratuitement. Aucune carte de crédit requise." },
  hu: { first: "Keresztnév", last: "Vezetéknév", choose: "Nyelv kiválasztása", change: "Adatok módosítása", heading: "Ismerje meg az új támogatási csapattagot", description: "Kezdj ingyen. Nincs szükség bankkártyára." },
  id: { first: "Nama depan", last: "Nama belakang", choose: "Pilih bahasa", change: "Ubah detail", heading: "Bertemu dengan rekan kerja dukungan baru Anda", description: "Mulai gratis. Tidak ada kartu kredit yang diperlukan." },
  it: { first: "Nome", last: "Cognome", choose: "Scegli la lingua", change: "Modifica dati", heading: "Conosci il tuo nuovo compagno di supporto", description: "Inizia gratuitamente. Nessuna carta di credito richiesta." },
  ja: { first: "名", last: "姓", choose: "言語を選択", change: "詳細を変更", heading: "新しいサポート チームメイトに会いましょう", description: "無料で開始します。クレジット カードは不要です。" },
  ko: { first: "이름", last: "성", choose: "언어 선택", change: "정보 변경", heading: "새로운 지원 팀원을 만나세요", description: "무료로 시작하세요. 신용카드가 필요하지 않습니다." },
  nl: { first: "Voornaam", last: "Achternaam", choose: "Kies taal", change: "Gegevens wijzigen", heading: "Ontmoet uw nieuwe ondersteuningsteammember", description: "Gratis starten. Geen creditcard nodig." },
  pl: { first: "Imię", last: "Nazwisko", choose: "Wybierz język", change: "Zmień dane", heading: "Poznaj swojego nowego kolegę ze wsparcia", description: "Zacznij za darmo. Nie jest wymagana karta kredytowa." },
  pt: { first: "Nome", last: "Apelido", choose: "Escolher idioma", change: "Alterar dados", heading: "Conheça seu novo colega de suporte", description: "Comece gratuitamente. Nenhum cartão de crédito necessário." },
  "pt-br": { first: "Nome", last: "Sobrenome", choose: "Escolher idioma", change: "Alterar dados", heading: "Conheça seu novo colega de suporte", description: "Comece gratuitamente. Nenhum cartão de crédito necessário." },
  ro: { first: "Prenume", last: "Nume", choose: "Alege limba", change: "Modifică datele", heading: "Cunoaștere-ți noul coleg de suport", description: "Începeți gratuit. Nicio carte de credit necesară." },
  ru: { first: "Имя", last: "Фамилия", choose: "Выберите язык", change: "Изменить данные", heading: "Познакомьтесь со своим новым партнером по поддержке", description: "Начните бесплатно. Кредитная карта не требуется." },
  sv: { first: "Förnamn", last: "Efternamn", choose: "Välj språk", change: "Ändra uppgifter", heading: "Möt din nya supportkollega", description: "Börja gratis. Inget kreditkort krävs." },
  th: { first: "ชื่อ", last: "นามสกุล", choose: "เลือกภาษา", change: "แก้ไขข้อมูล", heading: "พบกับสมาชิกทีมสนับสนุนคนใหม่ของคุณ", description: "เริ่มต้นได้ฟรี ไม่ต้องใช้บัตรเครดิต" },
  tr: { first: "Ad", last: "Soyad", choose: "Dil seçin", change: "Bilgileri değiştir", heading: "Yeni destek ekip arkadaşınızla tanışın", description: "Ücretsiz başlayın. Kredi kartı gerekmez." },
  uk: { first: "Ім’я", last: "Прізвище", choose: "Виберіть мову", change: "Змінити дані", heading: "Познайомтеся зі своїм новим товаришем по підтримці", description: "Почніть безкоштовно. Кредитна карта не потрібна." },
  vi: { first: "Tên", last: "Họ", choose: "Chọn ngôn ngữ", change: "Thay đổi thông tin", heading: "Gặp gỡ đồng nghiệp hỗ trợ mới của bạn", description: "Bắt đầu miễn phí. Không cần thẻ tín dụng." },
  "zh-tw": { first: "名字", last: "姓氏", choose: "選擇語言", change: "修改資料", heading: "認識你的新支持隊友", description: "免費開始。無需信用卡。" },
};

function FlagImage({ countryCode, alt }: { countryCode: string; alt: string }) {
  return (
    <img
      src={`https://flagsapi.com/${countryCode.toUpperCase()}/flat/32.png`}
      alt={alt}
      className="w-5 h-4 object-cover rounded-sm"
    />
  );
}

function DropdownIcon() {
  return (
    <svg className="w-5 h-5 text-black/50" fill="currentColor" viewBox="0 0 24 24">
      <path d="M7 10l5 5 5-5z" />
    </svg>
  );
}

function OtpInput({
  value,
  onChange,
  disabled,
  length = 6,
}: {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  length?: number;
}) {
  const inputsRef = useRef<(HTMLInputElement | null)[]>([]);

  const setDigit = (index: number, digit: string) => {
    const chars = value.padEnd(length, " ").split("");
    chars[index] = digit;
    onChange(chars.join("").trimEnd());
  };

  const handleChange = (index: number, raw: string) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    setDigit(index, digit);
    if (digit && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index: number, event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Backspace") {
      if (value[index]) {
        setDigit(index, "");
      } else if (index > 0) {
        setDigit(index - 1, "");
        inputsRef.current[index - 1]?.focus();
      }
    } else if (event.key === "ArrowLeft" && index > 0) {
      inputsRef.current[index - 1]?.focus();
    } else if (event.key === "ArrowRight" && index < length - 1) {
      inputsRef.current[index + 1]?.focus();
    }
  };

  const handlePaste = (event: React.ClipboardEvent<HTMLInputElement>) => {
    event.preventDefault();
    const pasted = event.clipboardData.getData("text").replace(/\D/g, "").slice(0, length);
    if (!pasted) return;
    onChange(pasted);
    inputsRef.current[Math.min(pasted.length, length - 1)]?.focus();
  };

  return (
    <div className="mt-4 flex items-center justify-center gap-2 sm:gap-3">
      {Array.from({ length }).map((_, index) => (
        <input
          key={index}
          ref={(el) => {
            inputsRef.current[index] = el;
          }}
          value={value[index] ?? ""}
          onChange={(event) => handleChange(index, event.target.value)}
          onKeyDown={(event) => handleKeyDown(index, event)}
          onPaste={handlePaste}
          inputMode="numeric"
          autoComplete={index === 0 ? "one-time-code" : "off"}
          maxLength={1}
          autoFocus={index === 0}
          disabled={disabled}
          className="h-12 w-10 rounded-[10px] border border-[#9ca3b8] bg-white text-center text-lg font-semibold outline-none transition focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15 disabled:opacity-50 sm:h-[52px] sm:w-12"
        />
      ))}
    </div>
  );
}

export function AuthFlow({ initialMode }: { initialMode: "login" | "signup" }) {
  const params = useSearchParams();
  const router = useRouter();
  const requestedPlan = getRequestedPlan(params.get("plan"));

  const [loading, setLoading] = useState<string | null>(null);
  const [email, setEmail] = useState(() => params.get("email") ?? "");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [agreeToTerms, setAgreeToTerms] = useState(false);
  const [showPassword, setShowPassword] = useState(initialMode === "login");
  const [pendingVerifyEmail, setPendingVerifyEmail] = useState<string | null>(null);
  const [existingAccountEmail, setExistingAccountEmail] = useState<string | null>(null);
  const [otp, setOtp] = useState("");
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);
  const [verifiedEmail, setVerifiedEmail] = useState<string | null>(null);
  const [profileName, setProfileName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmNewPassword, setConfirmNewPassword] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [language, setLanguage] = useState("en");
  const [languageOpen, setLanguageOpen] = useState(false);
  const mode = initialMode;
  const { t } = useTranslation(language as any);
  const signupLabels = SIGNUP_LABELS[language] ?? SIGNUP_LABELS.en;

  useEffect(() => {
    const savedLanguage = window.localStorage.getItem("elpino-language");
    if (savedLanguage && LANGUAGES.some((item) => item.code === savedLanguage)) {
      setLanguage(savedLanguage);
    }
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
    window.localStorage.setItem("elpino-language", language);
  }, [language]);

  useEffect(() => {
    const next = sanitizeReturnPath(params.get("next"));
    api
      .get("/auth/me")
      .then(async () => {
        // Already signed in. Users who never finished onboarding go there,
        // not to the dashboard, otherwise they can never reach the flow again.
        try {
          const res = await fetch("/api/onboarding/status");
          const data = (await res.json()) as { onboarding?: { completedAt?: string } };
          if (res.ok && !data.onboarding?.completedAt) {
            router.replace("/onboarding");
            return;
          }
        } catch {
          // fall through to the dashboard on status errors
        }
        router.replace(
          next || (requestedPlan ? `/dashboard?plan=${requestedPlan}` : "/dashboard"),
        );
      })
      .catch(() => null);
  }, [router, params, requestedPlan]);

  useEffect(() => {
    const errorCode = params.get("error");
    if (!errorCode) return;
    toast.error(getFriendlyAuthError(errorCode));
    const qs = new URLSearchParams(params.toString());
    qs.delete("error");
    router.replace(`${mode === "signup" ? "/signup" : "/login"}${qs.toString() ? `?${qs.toString()}` : ""}`);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function navigateToMode(next: "login" | "signup") {
    const qs = new URLSearchParams(params.toString());
    setShowPassword(false);
    setPassword("");
    setFirstName("");
    setLastName("");
    setAgreeToTerms(false);
    router.push(`/${next === "signup" ? "signup" : "login"}${qs.toString() ? `?${qs.toString()}` : ""}`);
  }

  function getPostAuthDestination(data: AuthResponse) {
    const next = sanitizeReturnPath(params.get("next"));
    if (data?.isNew) return "/onboarding";
    return next || (requestedPlan ? `/dashboard?plan=${requestedPlan}` : sanitizeReturnPath(data?.next) || "/dashboard");
  }

  const handleGoogleLogin = async () => {
    if (loading) return;
    const next = sanitizeReturnPath(params.get("next"));
    const returnTo = next || (requestedPlan ? `/dashboard?plan=${requestedPlan}` : "/dashboard");
    setLoading("google");
    try {
      const { signInWithGooglePopup } = await import("@/lib/firebase-client");
      const idToken = await signInWithGooglePopup();
      const res = await fetch("/api/auth/firebase-google", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ idToken, returnTo }),
      });
      const data = (await res.json().catch(() => ({}))) as { destination?: string; error?: string };
      if (!res.ok || !data.destination) throw new Error(data.error || "Google sign-in failed");
      window.location.href = data.destination;
    } catch (error) {
      setLoading(null);
      // A closed popup or cancelled consent screen is a normal exit, not a
      // failure worth alarming someone with a toast.
      const code = (error as { code?: string })?.code;
      if (code === "auth/popup-closed-by-user" || code === "auth/cancelled-popup-request") return;
      if (code === "auth/configuration-not-found") {
        toast.error("Google sign-in is not enabled for this Firebase project. Enable the Google provider in Firebase Authentication.");
        return;
      }
      if (code === "auth/unauthorized-domain") {
        toast.error("This domain is not authorized for Google sign-in. Add it under Firebase Authentication → Settings → Authorized domains.");
        return;
      }
      toast.error(error instanceof Error && error.message ? error.message : "Couldn't sign in with Google. Please try again.");
    }
  };

  const handleEmailLogin = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (mode === "signup" && !showPassword) {
      setLoading("email");
      setExistingAccountEmail(null);
      try {
        await api.post("/auth/email/send-verification", { email });
        setPendingVerifyEmail(email.trim().toLowerCase());
        setOtp("");
      } catch (err: unknown) {
        const status = (err as { response?: { status?: number } })?.response?.status;
        const message = getErrorMessage(err, "Could not send verification code");
        if (status === 409 || /already|exists|registered/i.test(message)) {
          setExistingAccountEmail(email.trim().toLowerCase());
          return;
        }
        toast.error(message);
      } finally {
        setLoading(null);
      }
      return;
    }

    if (!showPassword) {
      setShowPassword(true);
      return;
    }

    setLoading("email");
    try {
      if (mode === "signup") {
        const fullName = `${firstName} ${lastName}`.trim();
        const { data } = await api.post<AuthResponse>("/auth/password/register", { name: fullName || email.split("@")[0], firstName, lastName, email, password });
        setPendingVerifyEmail(data.email ?? email);
        return;
      }
      const { data } = await api.post<AuthResponse>("/auth/password/login", { email, password });
      if (data.needsVerification) {
        setPendingVerifyEmail(data.email ?? email);
        return;
      }
      router.push(getPostAuthDestination(data));
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (mode === "signup" && status === 409) {
        toast.error("That email is already registered. Switching you to sign in.");
        navigateToMode("login");
        return;
      }
      toast.error(getErrorMessage(err, mode === "signup" ? "Could not create your account" : "Could not sign in"));
    } finally {
      setLoading(null);
    }
  };

  const handleVerified = (data: AuthResponse) => {
    router.push(getPostAuthDestination(data));
  };

  const handleVerifyOtp = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!pendingVerifyEmail) return;
    setLoading("email");
    try {
      const { data } = await api.post<{ email: string }>("/auth/email/verify", { email: pendingVerifyEmail, otp });
      if (mode === "signup") {
        // OTP is confirmed but no account or session exists yet — that only
        // happens once a password is set, in handleCompleteProfile below.
        setPendingVerifyEmail(null);
        setVerifiedEmail(data.email);
      } else {
        handleVerified(data as AuthResponse);
      }
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Invalid or expired code"));
    } finally {
      setLoading(null);
    }
  };

  const handleCompleteProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!verifiedEmail) return;

    if (newPassword.length < 8) {
      toast.error(t("auth.signup.passwordRequirementsNotMet"));
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error(t("auth.signup.passwordsDontMatch"));
      return;
    }

    setLoading("profile");
    try {
      const { data } = await api.post<AuthResponse>("/auth/complete-profile", {
        email: verifiedEmail,
        name: profileName.trim(),
        password: newPassword,
      });
      // The account and session are created here, not at OTP-verify time.
      handleVerified(data);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Could not save your details"));
    } finally {
      setLoading(null);
    }
  };

  const handleResendOtp = async () => {
    if (!pendingVerifyEmail) return;
    setResending(true);
    setResent(false);
    try {
      await api.post("/auth/email/send-verification", { email: pendingVerifyEmail });
      setResent(true);
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Could not resend code"));
    } finally {
      setResending(false);
    }
  };

  const handleChangeEmail = () => {
    setPendingVerifyEmail(null);
    setOtp("");
    setResent(false);
    setExistingAccountEmail(null);
  };

  const loginExperience = mode === "login" ? (
    <main lang={language} className="relative min-h-screen bg-white font-display text-[#202124] antialiased">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,#ff8157_0%,#d9bef4_45%,#428ce5_100%)]" />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-[420px] flex-col items-center justify-center px-6 py-16 text-center">
        <Link href="/" aria-label="Elpino home" className="inline-flex rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#428CE5]/35 focus-visible:ring-offset-4">
          <Image src="/icon.png" alt="Elpino" width={40} height={40} priority className="h-10 w-10 rounded-[10px] object-cover" />
        </Link>

        {!pendingVerifyEmail && (
          <div className="mt-5 animate-[fadeIn_.55s_ease-out_both]">
            <h1 className="text-[22px] font-bold leading-tight tracking-[-0.02em] text-black">Your AI support.</h1>
            <p className="text-[22px] font-bold leading-tight tracking-[-0.02em] text-black/30">Log in to your Elpino account</p>
          </div>
        )}

        <div className="mt-8 w-full text-left">
          {pendingVerifyEmail ? (
            <form onSubmit={handleVerifyOtp} className="w-full text-center">
              <h1 className="text-center text-[22px] font-bold tracking-[-0.02em] text-black">{t("auth.signup.enterCode")}</h1>
              <p className="mt-2 text-center text-[14px] text-black/45">{pendingVerifyEmail}{" "}<button type="button" onClick={handleChangeEmail} className="font-medium text-[#347dce] hover:underline">{t("auth.signup.changeEmail")}</button></p>
              <OtpInput value={otp} onChange={setOtp} disabled={Boolean(loading)} />
              <button type="submit" disabled={Boolean(loading) || otp.length !== 6} className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2563eb] text-[15px] font-semibold text-white transition hover:bg-[#1d4ed8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40">
                {loading === "email" && <Spinner />}{t("auth.signup.verifyBtn")}
              </button>
              <button type="button" onClick={handleResendOtp} disabled={resending} className="mt-5 w-full text-center text-[14px] font-medium text-[#347dce] hover:underline disabled:opacity-50">{resent ? t("auth.signup.codeSent") : resending ? t("auth.signup.sending") : t("auth.signup.resendCode")}</button>
            </form>
          ) : (
            <>
              <form onSubmit={handleEmailLogin} className="w-full space-y-4">
                <div>
                  <label htmlFor="login-email" className="mb-2 block text-[13px] font-medium text-black/70">{t("auth.signup.emailLabel")}</label>
                  <input id="login-email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder={t("auth.signup.emailPlaceholder")} type="email" autoComplete="email" required autoFocus className="h-12 w-full rounded-xl border border-black/15 bg-white px-4 text-[15px] outline-none transition placeholder:text-black/30 hover:border-black/25 focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10" />
                  <p className="mt-2 text-[12px] leading-5 text-black/40">Use your work email to easily collaborate with your team</p>
                </div>
                <div>
                  <div className="mb-2 flex items-center justify-between">
                    <label htmlFor="login-password" className="text-[13px] font-medium text-black/70">{t("auth.signup.passwordLabel")}</label>
                    <Link href="/forgot-password" className="text-[12px] font-medium text-[#347dce] hover:underline">{t("auth.signup.forgotPassword")}</Link>
                  </div>
                  <input id="login-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t("auth.signup.passwordPlaceholder")} type="password" autoComplete="current-password" minLength={8} required className="h-12 w-full rounded-xl border border-black/15 bg-white px-4 text-[15px] outline-none transition placeholder:text-black/30 hover:border-black/25 focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10" />
                </div>
                <button type="submit" disabled={Boolean(loading)} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2563eb] text-[15px] font-semibold text-white transition hover:bg-[#1d4ed8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/40 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-50">
                  {loading === "email" && <Spinner />}{t("auth.signup.signIn")}
                </button>
              </form>

              <div className="my-6 flex items-center gap-4" aria-hidden="true">
                <div className="h-px flex-1 bg-black/10" />
                <span className="text-[12px] text-black/40">or continue with</span>
                <div className="h-px flex-1 bg-black/10" />
              </div>

              <button
                type="button"
                onClick={handleGoogleLogin}
                disabled={Boolean(loading)}
                className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-black/12 bg-white text-[15px] font-normal text-black transition hover:-translate-y-0.5 hover:border-black/25 hover:shadow-[0_8px_20px_rgba(17,18,15,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span className="flex h-5 w-5 items-center justify-center">{loading === "google" ? <Spinner dark /> : <GoogleIcon />}</span>
                <span>Continue with Google</span>
              </button>

              <p className="mt-7 text-center text-[14px] text-black/45">{t("auth.signup.noAccount")}{" "}<Link href="/signup" className="font-semibold text-[#202124] underline decoration-black/20 underline-offset-4 transition hover:decoration-black/70">{t("auth.signup.signup")}</Link></p>

              <p className="mt-8 text-center text-[12px] leading-5 text-black/35">
                {t("auth.signup.agreeText")} <Link href="/terms" className="text-black/55 underline hover:text-black/80">{t("auth.signup.terms")}</Link> {t("auth.signup.and")} <Link href="/privacy" className="text-black/55 underline hover:text-black/80">{t("auth.signup.privacy")}</Link>.
              </p>

              <div className="relative mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setLanguageOpen((open) => !open)}
                  aria-expanded={languageOpen}
                  aria-haspopup="listbox"
                  className="flex h-9 items-center gap-2 rounded-full border border-black/15 bg-white px-3 text-[13px] text-black/55 transition hover:border-black/30"
                >
                  <FlagImage countryCode={LANGUAGES.find((item) => item.code === language)?.countryCode || "gb"} alt="" />
                  <span>Language: {LANGUAGES.find((item) => item.code === language)?.name}</span>
                  <DropdownIcon />
                </button>

                {languageOpen && (
                  <>
                    <button className="fixed inset-0 z-40 cursor-default" aria-label="Close language menu" onClick={() => setLanguageOpen(false)} />
                    <div className="absolute bottom-[calc(100%+8px)] left-1/2 z-50 w-60 -translate-x-1/2 overflow-hidden rounded-[14px] border border-[#e0e2e7] bg-white p-2 text-left shadow-[0_18px_50px_rgba(26,32,44,0.14)]">
                      <div className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#89909f]">{signupLabels.choose}</div>
                      <div className="max-h-[310px] overflow-y-auto overscroll-contain">
                        {LANGUAGES.map((item) => (
                          <button
                            type="button"
                            role="option"
                            aria-selected={language === item.code}
                            key={item.code}
                            onClick={() => {
                              setLanguage(item.code);
                              setLanguageOpen(false);
                            }}
                            className={`flex w-full items-center gap-3 rounded-[9px] px-3 py-2.5 text-left text-sm transition ${language === item.code ? "bg-[#eff6ff] font-semibold text-[#1d4ed8]" : "text-[#404653] hover:bg-[#f5f6f7]"}`}
                          >
                            <FlagImage countryCode={item.countryCode} alt="" />
                            <span>{item.name}</span>
                            {language === item.code && <span className="ml-auto text-[#2563eb]">✓</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      <button
        type="button"
        onClick={() => toast.info("How can we help? Email support@elpino.chat")}
        aria-label={t("auth.signup.needHelp")}
        className="fixed bottom-6 right-6 flex h-9 w-9 items-center justify-center rounded-full border border-black/15 bg-white text-[15px] text-black/45 shadow-sm transition hover:text-black/80"
      >
        ?
      </button>
    </main>
  ) : null;

  if (loginExperience) return loginExperience;

  return (
    <main lang={language} className="relative min-h-screen bg-white font-display text-[#202124] antialiased">
      <div className="absolute inset-x-0 top-0 h-[3px] bg-[linear-gradient(90deg,#ff8157_0%,#d9bef4_45%,#428ce5_100%)]" />

      <section className="relative z-10 mx-auto flex min-h-screen w-full max-w-[420px] flex-col items-center justify-center px-6 py-16 text-center">
        <Link href="/" aria-label="Elpino home" className="inline-flex rounded-[10px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#428CE5]/35 focus-visible:ring-offset-4">
          <Image src="/icon.png" alt="Elpino" width={40} height={40} priority className="h-10 w-10 rounded-[10px] object-cover" />
        </Link>

        {!pendingVerifyEmail && !verifiedEmail && (
          <div className="mt-5 animate-[fadeIn_.55s_ease-out_both]">
            <h1 className="text-[22px] font-bold leading-tight tracking-[-0.02em] text-black">{t("auth.signup.title")}</h1>
            <p className="mt-1 text-[15px] leading-6 text-black/45">{t("auth.signup.subtitle")}</p>
          </div>
        )}

        <div className="mt-8 w-full text-left">
          {verifiedEmail ? (
            <form onSubmit={handleCompleteProfile} className="w-full">
              <h1 className="text-center text-2xl font-medium tracking-[-0.03em]">{t("auth.signup.setPasswordHeading")}</h1>
              <p className="mt-2 text-center text-sm text-black/50">{t("auth.signup.setPasswordSubheading")}</p>

              <label htmlFor="profile-name" className="mb-2 mt-5 block text-[13px] font-medium text-black/70">
                {t("auth.signup.nameLabel")}
              </label>
              <input
                id="profile-name"
                value={profileName}
                onChange={(event) => setProfileName(event.target.value)}
                placeholder={t("auth.signup.namePlaceholder")}
                type="text"
                autoComplete="name"
                required
                autoFocus
                className="h-12 w-full rounded-xl border border-black/15 bg-white px-4 text-[15px] outline-none transition placeholder:text-black/30 hover:border-black/25 focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
              />

              <label htmlFor="profile-password" className="mb-2 mt-4 block text-[13px] font-medium text-black/70">
                {t("auth.signup.passwordLabel")}
              </label>
              <div className="relative">
                <input
                  id="profile-password"
                  value={newPassword}
                  onChange={(event) => setNewPassword(event.target.value)}
                  placeholder={t("auth.signup.passwordPlaceholder")}
                  type={showNewPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className="h-12 w-full rounded-xl border border-black/15 bg-white px-4 pr-14 text-[15px] outline-none transition placeholder:text-black/30 hover:border-black/25 focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword((value) => !value)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#347dce] hover:underline"
                >
                  {showNewPassword ? t("auth.signup.hidePassword") : t("auth.signup.showPassword")}
                </button>
              </div>

              <label htmlFor="profile-confirm-password" className="mb-2 mt-4 block text-[13px] font-medium text-black/70">
                {t("auth.signup.confirmPasswordLabel")}
              </label>
              <input
                id="profile-confirm-password"
                value={confirmNewPassword}
                onChange={(event) => setConfirmNewPassword(event.target.value)}
                placeholder={t("auth.signup.confirmPasswordPlaceholder")}
                type={showNewPassword ? "text" : "password"}
                autoComplete="new-password"
                required
                className="h-12 w-full rounded-xl border border-black/15 bg-white px-4 text-[15px] outline-none transition placeholder:text-black/30 hover:border-black/25 focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10"
              />
              {confirmNewPassword.length > 0 && confirmNewPassword !== newPassword && (
                <p className="mt-1.5 text-[12px] text-red-600">{t("auth.signup.passwordsDontMatch")}</p>
              )}

              <button
                type="submit"
                disabled={
                  Boolean(loading) ||
                  !profileName.trim() ||
                  newPassword.length < 8 ||
                  newPassword !== confirmNewPassword
                }
                className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2563eb] text-[15px] font-semibold text-white transition hover:bg-[#1d4ed8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading === "profile" && <Spinner />}
                {t("auth.signup.continueBtn")}
              </button>
              <p className="mt-4 text-center text-[12px] leading-5 text-black/35">
                {t("auth.signup.agreeText")} <Link href="/terms" className="text-black/55 underline hover:text-black/80">{t("auth.signup.terms")}</Link> {t("auth.signup.and")} <Link href="/privacy" className="text-black/55 underline hover:text-black/80">{t("auth.signup.privacy")}</Link>.
              </p>
            </form>
          ) : pendingVerifyEmail ? (
            <form onSubmit={handleVerifyOtp} className="w-full text-center">
              <h1 className="text-center text-[22px] font-bold tracking-[-0.02em] text-black">{t("auth.signup.enterCode")}</h1>
              <p className="mt-2 text-center text-[14px] text-black/45">
                {pendingVerifyEmail}{" "}
                <button type="button" onClick={handleChangeEmail} className="font-medium text-[#347dce] hover:underline">
                  {t("auth.signup.changeEmail")}
                </button>
              </p>
              <OtpInput value={otp} onChange={setOtp} disabled={Boolean(loading)} />
              <button type="submit" disabled={Boolean(loading) || otp.length !== 6} className="mt-7 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2563eb] text-[15px] font-semibold text-white transition hover:bg-[#1d4ed8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/40 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-40">
                {loading === "email" && <Spinner />}{t("auth.signup.verifyBtn")}
              </button>
              <button type="button" onClick={handleResendOtp} disabled={resending} className="mt-5 w-full text-center text-[14px] font-medium text-[#347dce] hover:underline disabled:opacity-50">
                {resent ? t("auth.signup.codeSent") : resending ? t("auth.signup.sending") : t("auth.signup.resendCode")}
              </button>
            </form>
          ) : (
            <>
              <form onSubmit={handleEmailLogin} className="w-full space-y-4">
                {!showPassword ? (
                  <div>
                    <label htmlFor="signup-email" className="mb-2 block text-[13px] font-medium text-black/70">
                      {t("auth.signup.emailLabel")}
                    </label>
                    <input id="signup-email" value={email} onChange={(event) => { setEmail(event.target.value); setExistingAccountEmail(null); }} placeholder={t("auth.signup.emailPlaceholder")} type="email" autoComplete="email" required autoFocus className="h-12 w-full rounded-xl border border-black/15 bg-white px-4 text-[15px] outline-none transition placeholder:text-black/30 hover:border-black/25 focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10" />
                  </div>
                ) : (
                  <div>
                    <button type="button" onClick={() => setShowPassword(false)} className="mb-3 text-sm font-medium text-[#347dce] hover:underline">← {signupLabels.change}</button>
                    <div className="rounded-xl border border-black/12 bg-[#fafafa] px-4 py-3 text-sm text-black/60">{email}</div>
                    <label className="mb-2 mt-4 block text-[13px] font-medium text-black/70" htmlFor="signup-password">{t("auth.signup.passwordLabel")}</label>
                    <input id="signup-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t("auth.signup.passwordPlaceholder")} type="password" autoComplete="new-password" minLength={8} required autoFocus className="h-12 w-full rounded-xl border border-black/15 bg-white px-4 text-[15px] outline-none transition placeholder:text-black/30 hover:border-black/25 focus:border-[#2563eb] focus:ring-4 focus:ring-[#2563eb]/10" />
                  </div>
                )}
                <button type="submit" disabled={Boolean(loading)} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#2563eb] text-[15px] font-semibold text-white transition hover:bg-[#1d4ed8] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/40 focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-50">
                  {loading === "email" && <Spinner />}
                  {showPassword ? t("auth.signup.createWorkspace") : t("auth.signup.continueBtn")}
                </button>
              </form>

              {existingAccountEmail && (
                <div className="mt-3 rounded-xl border border-[#f2c7c7] bg-[#fff7f7] px-3 py-2.5 text-[13px] leading-5 text-[#6f2929]" role="alert">
                  {t("auth.signup.accountExists")} {existingAccountEmail}.{" "}
                  <Link href={`/login?email=${encodeURIComponent(existingAccountEmail)}`} className="font-medium text-[#1447ff] underline underline-offset-2">
                    {t("auth.signup.tryLogin")}
                  </Link>
                  .
                </div>
              )}

              {!showPassword && (
                <>
                  <div className="my-6 flex items-center gap-4" aria-hidden="true">
                    <div className="h-px flex-1 bg-black/10" />
                    <span className="text-[12px] text-black/40">or continue with</span>
                    <div className="h-px flex-1 bg-black/10" />
                  </div>
                  <button
                    type="button"
                    onClick={handleGoogleLogin}
                    disabled={Boolean(loading)}
                    className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-black/12 bg-white text-[15px] font-normal text-black transition hover:-translate-y-0.5 hover:border-black/25 hover:shadow-[0_8px_20px_rgba(17,18,15,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    <span className="flex h-5 w-5 items-center justify-center">{loading === "google" ? <Spinner dark /> : <GoogleIcon />}</span>
                    <span>Continue with Google</span>
                  </button>
                </>
              )}

              <p className="mt-7 text-center text-[14px] text-black/45">
                {t("auth.signup.hasAccount")}{" "}
                <Link href="/login" className="font-semibold text-[#202124] underline decoration-black/20 underline-offset-4 transition hover:decoration-black/70">{t("auth.signup.login")}</Link>
              </p>

              <p className="mt-8 text-center text-[12px] leading-5 text-black/35">
                {t("auth.signup.agreeText")} <Link href="/terms" className="text-black/55 underline hover:text-black/80">{t("auth.signup.terms")}</Link> {t("auth.signup.and")} <Link href="/privacy" className="text-black/55 underline hover:text-black/80">{t("auth.signup.privacy")}</Link>.
              </p>

              <div className="relative mt-8 flex justify-center">
                <button
                  type="button"
                  onClick={() => setLanguageOpen((open) => !open)}
                  aria-expanded={languageOpen}
                  aria-haspopup="listbox"
                  className="flex h-9 items-center gap-2 rounded-full border border-black/15 bg-white px-3 text-[13px] text-black/55 transition hover:border-black/30"
                >
                  <FlagImage countryCode={LANGUAGES.find((item) => item.code === language)?.countryCode || "gb"} alt="" />
                  <span>Language: {LANGUAGES.find((item) => item.code === language)?.name}</span>
                  <DropdownIcon />
                </button>

                {languageOpen && (
                  <>
                    <button className="fixed inset-0 z-40 cursor-default" aria-label="Close language menu" onClick={() => setLanguageOpen(false)} />
                    <div className="absolute bottom-[calc(100%+8px)] left-1/2 z-50 w-60 -translate-x-1/2 overflow-hidden rounded-[14px] border border-[#e0e2e7] bg-white p-2 text-left shadow-[0_18px_50px_rgba(26,32,44,0.14)]">
                      <div className="px-3 pb-2 pt-1 text-[11px] font-bold uppercase tracking-[0.14em] text-[#89909f]">{signupLabels.choose}</div>
                      <div className="max-h-[310px] overflow-y-auto overscroll-contain">
                        {LANGUAGES.map((item) => (
                          <button
                            type="button"
                            role="option"
                            aria-selected={language === item.code}
                            key={item.code}
                            onClick={() => {
                              setLanguage(item.code);
                              setLanguageOpen(false);
                            }}
                            className={`flex w-full items-center gap-3 rounded-[9px] px-3 py-2.5 text-left text-sm transition ${language === item.code ? "bg-[#eff6ff] font-semibold text-[#1d4ed8]" : "text-[#404653] hover:bg-[#f5f6f7]"}`}
                          >
                            <FlagImage countryCode={item.countryCode} alt="" />
                            <span>{item.name}</span>
                            {language === item.code && <span className="ml-auto text-[#2563eb]">✓</span>}
                          </button>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          )}
        </div>
      </section>

      <button
        type="button"
        onClick={() => toast.info("How can we help? Email support@elpino.chat")}
        aria-label={t("auth.signup.needHelp")}
        className="fixed bottom-6 right-6 flex h-9 w-9 items-center justify-center rounded-full border border-black/15 bg-white text-[15px] text-black/45 shadow-sm transition hover:text-black/80"
      >
        ?
      </button>
    </main>
  );
}

function sanitizeReturnPath(value: string | null | undefined) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) {
    return "";
  }
  try {
    const parsed = new URL(value, "https://elpino.local");
    return `${parsed.pathname}${parsed.search}${parsed.hash}`;
  } catch {
    return "";
  }
}
