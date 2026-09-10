"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState, type FormEvent, type ReactNode } from "react";
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

function AuthOption({
  icon,
  label,
  onClick,
  disabled,
  className = "",
}: {
  icon: ReactNode;
  label: string;
  onClick?: () => void;
  disabled?: boolean;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`flex w-full items-center justify-center gap-3 rounded-xl border border-[#DDDAD3] bg-white py-4 text-black transition duration-200 hover:-translate-y-0.5 hover:border-black/30 hover:shadow-[0_8px_24px_rgba(17,18,15,0.06)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/20 focus-visible:ring-offset-2 focus-visible:ring-offset-white disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      <span className="flex items-center justify-center">{icon}</span>
      <span className="text-center text-base font-medium leading-none text-black">
        {label}
      </span>
    </button>
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
  const [showPassword, setShowPassword] = useState(false);
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

  const handleGoogleLogin = () => {
    const next = sanitizeReturnPath(params.get("next"));
    const returnTo = next || (requestedPlan ? `/dashboard?plan=${requestedPlan}` : "/dashboard");
    setLoading("google");
    window.location.href = `/api/auth/google?return_to=${encodeURIComponent(returnTo)}`;
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

  const fieldClass =
    "mt-2 h-14 w-full rounded-xl border border-[#DDDAD3] bg-[#f8f9f9] px-4 text-base font-normal text-black outline-none transition placeholder:text-black/35 focus:border-black/50 focus:ring-2 focus:ring-black/10";
  const primaryButtonClass =
    "mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-black text-sm font-semibold text-white transition duration-200 hover:-translate-y-0.5 hover:bg-black/85 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/30 focus-visible:ring-offset-2 focus-visible:ring-offset-white active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50";

  const mirrored = mode === "login";

  return (
      <main lang={language} className={`relative min-h-screen bg-white font-display text-[#222733] antialiased lg:grid lg:h-screen ${mirrored ? "lg:grid-cols-[1fr_2fr]" : "lg:grid-cols-[2fr_1fr]"} lg:overflow-hidden`}>
        <div className="absolute inset-x-0 top-0 h-[3px] bg-[#2563eb]" />
        <div className={`pointer-events-none fixed inset-y-0 z-10 hidden w-1/3 bg-white lg:block ${mirrored ? "left-0 shadow-[18px_0_42px_rgba(15,23,42,0.12)]" : "right-0 shadow-[-18px_0_42px_rgba(15,23,42,0.12)]"}`} />

        <header className={`fixed top-7 z-30 hidden h-10 w-1/3 items-center bg-white px-7 lg:flex xl:px-9 ${mirrored ? "left-0 justify-start" : "right-0 justify-end"}`}>
          <div className="flex w-full items-center gap-2 sm:gap-3">
            <Link href="/" aria-label="Elpino home" className="mr-auto inline-flex rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1447ff]/30">
              <Image src="/icon.png" alt="Elpino" width={32} height={32} className="h-8 w-8 rounded-md object-cover" />
            </Link>
            <div className="relative order-2">
              <button
                type="button"
                onClick={() => setLanguageOpen((open) => !open)}
                aria-expanded={languageOpen}
                aria-haspopup="listbox"
                className="flex h-10 items-center gap-2 rounded-full border border-black/20 bg-white px-3 text-sm font-normal text-[#454b59] transition hover:border-[#1447ff]/40 hover:bg-[#f8f9ff] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#2563eb]/25"
              >
                <FlagImage
                  countryCode={LANGUAGES.find((item) => item.code === language)?.countryCode || "gb"}
                  alt=""
                />
                <span className="hidden 2xl:inline">{LANGUAGES.find((item) => item.code === language)?.name}</span>
                <DropdownIcon />
              </button>

              {languageOpen && (
                <>
                  <button className="fixed inset-0 z-40 cursor-default" aria-label="Close language menu" onClick={() => setLanguageOpen(false)} />
                  <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-60 overflow-hidden rounded-[14px] border border-[#e0e2e7] bg-white p-2 shadow-[0_18px_50px_rgba(26,32,44,0.14)]">
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

            <button
              type="button"
              onClick={() => toast.info("How can we help? Email support@elpino.chat")}
              className="order-1 inline-flex h-10 items-center px-2 text-sm font-normal text-[#1447ff] transition hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1447ff]/25"
            >
              <span>{t("auth.signup.needHelp")}</span>
            </button>

            <Link
              href="/login"
              className="hidden"
            >
              {t("auth.signup.login")}
            </Link>
          </div>
        </header>

        <section className="mx-auto grid min-h-[calc(100vh-6rem)] max-w-[1280px] items-center gap-16 px-6 pb-10 pt-8 lg:contents">
          <div className={`relative z-20 mx-auto w-full max-w-[500px] ${mirrored ? "lg:col-start-1" : "lg:col-start-2"} lg:row-start-1 lg:h-screen lg:overflow-y-auto lg:px-10 lg:pb-16 lg:pt-28 lg:[scrollbar-width:none] lg:[&::-webkit-scrollbar]:hidden xl:px-14`}>
            {!pendingVerifyEmail && !verifiedEmail && (
              <div className="mb-7 text-left">
                <h1 className="text-[27px] font-normal leading-tight tracking-[-0.025em] text-[#292e3a] sm:text-[30px]">
                  {mode === "login" ? t("auth.signup.loginScreen.title") : t("auth.signup.title")}
                </h1>
                <p className="mt-2 text-[14px] leading-6 text-[#313747] sm:text-[15px]">
                  {mode === "login" ? t("auth.signup.loginScreen.subtitle") : t("auth.signup.subtitle")}
                </p>
              </div>
            )}

            {verifiedEmail ? (
              <form onSubmit={handleCompleteProfile} className="w-full">
                <h1 className="text-[22px] font-normal leading-tight tracking-[-0.02em] text-[#292e3a] sm:text-[24px]">
                  {t("auth.signup.setPasswordHeading")}
                </h1>
                <p className="mt-2 text-sm text-[#454b59]">{t("auth.signup.setPasswordSubheading")}</p>

                <label htmlFor="profile-name" className="mb-2 mt-5 block text-[15px] font-normal text-[#343b49]">
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
                  className="h-10 w-full rounded-[8px] border border-black/20 bg-[#f8f9f9] px-3 text-[14px] outline-none transition placeholder:text-[#858c9a] focus:bg-white focus:ring-2 focus:ring-[#2563eb]/30"
                />

                <label htmlFor="profile-password" className="mb-2 mt-4 block text-[15px] font-normal text-[#343b49]">
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
                    className="h-10 w-full rounded-[8px] border border-black/20 bg-[#f8f9f9] px-3 pr-14 text-[14px] outline-none transition placeholder:text-[#858c9a] focus:bg-white focus:ring-2 focus:ring-[#2563eb]/30"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword((value) => !value)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-medium text-[#1d4ed8] hover:underline"
                  >
                    {showNewPassword ? t("auth.signup.hidePassword") : t("auth.signup.showPassword")}
                  </button>
                </div>

                <label htmlFor="profile-confirm-password" className="mb-2 mt-4 block text-[15px] font-normal text-[#343b49]">
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
                  className="h-10 w-full rounded-[8px] border border-black/20 bg-[#f8f9f9] px-3 text-[14px] outline-none transition placeholder:text-[#858c9a] focus:bg-white focus:ring-2 focus:ring-[#2563eb]/30"
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
                  className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#1447ff] text-[14px] font-normal text-white transition hover:bg-[#0f3be0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1447ff]/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {loading === "profile" && <Spinner />}
                  {t("auth.signup.continueBtn")}
                </button>
                <p className="mt-4 text-left text-[13px] leading-5 text-[#6b7180]">
                  {t("auth.signup.agreeText")} <Link href="/terms" className="font-medium text-[#1d4ed8] hover:underline">{t("auth.signup.terms")}</Link> {t("auth.signup.and")} <Link href="/privacy" className="font-medium text-[#1d4ed8] hover:underline">{t("auth.signup.privacy")}</Link>.
                </p>
              </form>
            ) : pendingVerifyEmail ? (
              <form onSubmit={handleVerifyOtp} className="w-full">
                <h1 className="text-[22px] font-normal leading-tight tracking-[-0.02em] text-[#292e3a] sm:text-[24px]">
                  {t("auth.signup.enterCode")}
                </h1>
                <p className="mt-2 text-left text-sm text-[#454b59]">
                  {pendingVerifyEmail}{" "}
                  <button type="button" onClick={handleChangeEmail} className="font-medium text-[#1d4ed8] hover:underline">
                    {t("auth.signup.changeEmail")}
                  </button>
                </p>
                <OtpInput value={otp} onChange={setOtp} disabled={Boolean(loading)} />
                <button type="submit" disabled={Boolean(loading) || otp.length !== 6} className="mt-5 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#1447ff] text-[14px] font-normal text-white transition hover:bg-[#0f3be0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1447ff]/30 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:bg-[#1447ff]">
                  {loading === "email" && <Spinner />}
                  {t("auth.signup.verifyBtn")}
                </button>
                <button type="button" onClick={handleResendOtp} disabled={resending} className="mt-4 w-full text-center text-sm font-semibold text-[#1d4ed8] hover:underline disabled:opacity-50">
                  {resent ? t("auth.signup.codeSent") : resending ? t("auth.signup.sending") : t("auth.signup.resendCode")}
                </button>
              </form>
            ) : (
              <>
                <form onSubmit={handleEmailLogin} className="w-full">
                  {!showPassword ? (
                    <div>
                      <label htmlFor="signup-email" className="mb-2 block text-[15px] font-normal text-[#343b49]">
                        {t("auth.signup.emailLabel")}
                      </label>
                      <input id="signup-email" value={email} onChange={(event) => { setEmail(event.target.value); setExistingAccountEmail(null); }} placeholder={t("auth.signup.emailPlaceholder")} type="email" autoComplete="email" required autoFocus className="h-10 w-full rounded-[8px] border border-black/20 bg-[#f8f9f9] px-3 text-[14px] outline-none transition placeholder:text-[#858c9a] focus:bg-white focus:ring-2 focus:ring-[#2563eb]/30" />
                    </div>
                  ) : (
                    <>
                      <button type="button" onClick={() => setShowPassword(false)} className="mb-3 text-sm font-medium text-[#1d4ed8] hover:underline">← {signupLabels.change}</button>
                      <div className="rounded-[10px] border border-[#e0e2e8] bg-[#f8f9fa] px-4 py-3 text-sm text-[#4c5260]">{email}</div>
                      <div className="mt-4 flex items-center justify-between">
                        <label className="block text-sm font-medium text-[#303643]" htmlFor="signup-password">{t("auth.signup.passwordLabel")}</label>
                        {mode === "login" && (
                          <Link href="/forgot-password" className="text-xs font-medium text-[#1d4ed8] hover:underline">
                            {t("auth.signup.forgotPassword")}
                          </Link>
                        )}
                      </div>
                      <input id="signup-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder={t("auth.signup.passwordPlaceholder")} type="password" autoComplete={mode === "login" ? "current-password" : "new-password"} minLength={8} required autoFocus className="mt-2 h-[51px] w-full rounded-[10px] border border-[#9ca3b8] bg-white px-4 text-[16px] outline-none transition placeholder:text-[#7a8090] focus:border-[#2563eb] focus:ring-2 focus:ring-[#2563eb]/15" />
                    </>
                  )}
                  <button type="submit" disabled={Boolean(loading)} className="mt-3 flex h-10 w-full items-center justify-center gap-2 rounded-md bg-[#1447ff] text-[14px] font-normal text-white transition hover:bg-[#0f3be0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1447ff]/30 focus-visible:ring-offset-2 disabled:cursor-wait disabled:bg-[#1447ff]">
                    {loading === "email" && <Spinner />}
                    {showPassword ? (mode === "login" ? t("auth.signup.signIn") : t("auth.signup.createWorkspace")) : t("auth.signup.continueBtn")}
                  </button>
                </form>

                {existingAccountEmail && (
                  <div className="mt-3 rounded-md border border-[#f2c7c7] bg-[#fff7f7] px-3 py-2.5 text-[13px] leading-5 text-[#6f2929]" role="alert">
                    {t("auth.signup.accountExists")} {existingAccountEmail}.{" "}
                    <Link href={`/login?email=${encodeURIComponent(existingAccountEmail)}`} className="font-medium text-[#1447ff] underline underline-offset-2">
                      {t("auth.signup.tryLogin")}
                    </Link>
                    .
                  </div>
                )}

                {!showPassword && (
                  <>
                    <div className="my-5 flex items-center gap-3" aria-hidden="true">
                      <div className="h-px flex-1 bg-black/15" />
                      <span className="text-[11px] font-normal uppercase tracking-[0.14em] text-black/45">OR</span>
                      <div className="h-px flex-1 bg-black/15" />
                    </div>
                    <div className="grid grid-cols-1 gap-2.5">
                      <AuthOption icon={loading === "google" ? <Spinner dark /> : <GoogleIcon />} label={t("auth.signup.continueGoogle")} onClick={handleGoogleLogin} disabled={Boolean(loading)} className="!h-10 !rounded-md !border-[#9ca3b8] !py-0 [&>span:last-child]:!text-[14px] [&>span:last-child]:!font-normal" />
                    </div>
                  </>
                )}

                <p className="mt-4 text-left text-[14px] leading-6 text-[#424858]">
                  {t("auth.signup.agreeText")} <Link href="/terms" className="font-medium text-[#1d4ed8] hover:underline">{t("auth.signup.terms")}</Link> {t("auth.signup.and")}<br className="hidden sm:block" /> <Link href="/privacy" className="font-medium text-[#1d4ed8] hover:underline">{t("auth.signup.privacy")}</Link>.
                </p>
                <div className="mt-7 rounded-[9px] bg-[#f4f4f5] px-4 py-3.5 text-left text-[14px] text-[#454b59]">
                  {mode === "login" ? (
                    <>
                      {t("auth.signup.noAccount")} <Link href="/signup" className="font-normal text-[#1d4ed8] hover:underline">{t("auth.signup.signup")}</Link>
                    </>
                  ) : (
                    <>
                      {t("auth.signup.hasAccount")} <Link href="/login" className="font-normal text-[#1d4ed8] hover:underline">{t("auth.signup.login")}</Link>
                    </>
                  )}
                </div>
              </>
            )}
          </div>

          <div className={`hidden lg:fixed lg:inset-y-0 lg:flex lg:w-2/3 ${mirrored ? "lg:right-0 lg:col-start-2" : "lg:left-0"}`}>
            <div className="group relative h-full w-full animate-[fadeIn_.7s_ease-out_both] overflow-hidden bg-[#eef4ff] shadow-[0_20px_60px_rgba(15,23,42,0.13)]">
              <Image
                src={mode === "login" ? "/images/login-support-illustration.png" : "/images/customer-growth-illustration.png"}
                alt={mode === "login" ? "A support specialist welcoming a customer into their secure workspace" : "A team building stronger customer relationships and growing together"}
                fill
                sizes="(min-width: 1024px) 67vw, 0px"
                className={`object-cover ${mode === "login" ? "object-[center_38%]" : "object-center"}`}
                priority
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#06142f]/95 via-[#07152f]/35 to-[#07152f]/5" />
              <Link href="/" aria-label="Elpino home" className="absolute left-10 top-7 z-10 inline-flex xl:left-14">
                <Image
                  src="/elpino-wordmark-white.png"
                  alt="Elpino"
                  width={136}
                  height={40}
                  className="h-8 w-auto object-contain drop-shadow-[0_2px_10px_rgba(0,0,0,0.2)]"
                />
              </Link>
              <div className="hidden">
                <button
                  type="button"
                  onClick={() => setLanguageOpen((open) => !open)}
                  aria-expanded={languageOpen}
                  aria-haspopup="listbox"
                  className="flex h-12 items-center gap-2.5 rounded-[10px] border border-white/70 bg-transparent px-4 text-base font-semibold text-white shadow-[0_8px_28px_rgba(7,21,47,0.16)] backdrop-blur-[2px] transition hover:border-white hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70 [&>svg]:text-white"
                >
                  <FlagImage countryCode={LANGUAGES.find((item) => item.code === language)?.countryCode || "gb"} alt="" />
                  <span>{LANGUAGES.find((item) => item.code === language)?.name}</span>
                  <DropdownIcon />
                </button>

                {languageOpen && (
                  <>
                    <button className="fixed inset-0 z-40 cursor-default" aria-label="Close language menu" onClick={() => setLanguageOpen(false)} />
                    <div className="absolute right-0 top-[calc(100%+8px)] z-50 w-60 overflow-hidden rounded-[14px] border border-[#e0e2e7] bg-white p-2 shadow-[0_18px_50px_rgba(7,21,47,0.22)]">
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
              <div className="absolute bottom-10 left-10 right-10 text-left xl:bottom-14 xl:left-14 xl:right-14">
                <p className="max-w-[680px] text-[42px] font-normal leading-[1.06] tracking-[-0.04em] text-white xl:text-[56px]">
                  {mode === "login" ? t("auth.signup.loginScreen.formTitle") : t("auth.signup.formTitle")}
                </p>
                <p className="mt-3 max-w-[480px] text-[15px] leading-6 text-white/75 xl:text-[17px]">
                  {mode === "login" ? t("auth.signup.loginScreen.formSubtitle") : t("auth.signup.formSubtitle")}
                </p>
              </div>
            </div>
          </div>
        </section>
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
