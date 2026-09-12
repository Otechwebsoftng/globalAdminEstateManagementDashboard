import React, { useState, useEffect, useRef } from "react";
import { ShieldCheck, Mail, Lock, ArrowRight, Check, AlertCircle, RefreshCw, KeyRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import type { User } from "../../context/AuthContext";
import { homePathFor, type Persona } from "../../config/personas";
import { useNavigate } from "react-router-dom";
import { authApi } from "../../services/api";

const OTP_LEN = 6;
const emptyOtp = () => Array.from({ length: OTP_LEN }, () => "");

/** Pull digits from clipboard / autofill text (handles "123 456", "code: 123456", etc.). */
function extractOtpDigits(raw: string, max = OTP_LEN): string {
  return raw.replace(/\D/g, "").slice(0, max);
}

interface EstateLoginProps {
  onLoginSuccess?: (adminName: string) => void;
  onBackToMain?: () => void;
}

export default function EstateLogin({ onLoginSuccess, onBackToMain }: EstateLoginProps) {
  const auth = useAuth();
  const [persona, setPersona] = useState<Persona>("GLOBAL_ADMIN");
  const navigate = useNavigate();
  const [authStep, setAuthStep] = useState<"login" | "two-factor" | "reset-password" | "set-new-password">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errors, setErrors] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 2FA state
  const [otp, setOtp] = useState<string[]>(emptyOtp);
  const [countdown, setCountdown] = useState(252);
  /** Guards against the post-paste `onChange` that would wipe a just-filled OTP. */
  const otpPasteLock = useRef(false);
  const resetPasteLock = useRef(false);
  
  // Set New Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [strengthScore, setStrengthScore] = useState(0);

  // Reset password state
  const [resetEmail, setResetEmail] = useState("");
  const [resetOtp, setResetOtp] = useState<string[]>(emptyOtp);
  const [resetStep, setResetStep] = useState<"email" | "otp" | "new-password">("email");

  // 2FA Timer Countdown
  useEffect(() => {
    if (authStep !== "two-factor" || countdown <= 0) return;
    const timer = setInterval(() => {
      setCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [authStep, countdown]);

  const formatTime = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = sec % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  // Password strength logic
  useEffect(() => {
    let score = 0;
    if (newPassword.length >= 8) score += 1;
    if (/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword)) score += 1;
    if (/[0-9]/.test(newPassword)) score += 1;
    if (/[^A-Za-z0-9]/.test(newPassword)) score += 1;
    setStrengthScore(score);
  }, [newPassword]);

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrors("Please fill in all details.");
      return;
    }
    if (isLoading) return;
    setErrors("");
    setIsLoading(true);

    try {
      const login = persona === "ESTATE_ADMIN"
        ? authApi.loginEstateAdmin
        : authApi.loginGlobalAdmin;
      const response = await login({ email, password }) as any;
      console.log("Login response:", response);
      const mfaToken = response?.token || response?.data?.mfaToken || response?.mfaToken;
      if (mfaToken) {
        auth.setMfaToken(mfaToken);
        setAuthStep("two-factor");
      } else {
        setErrors("Login succeeded but no MFA token received. Check console for response shape.");
      }
    } catch (err: any) {
      setErrors(err.message || "Invalid email or password.");
    } finally {
      setIsLoading(false);
    }
  };

  const focusOtp = (index: number) =>
    document.getElementById(`2fa-otp-${Math.min(Math.max(index, 0), OTP_LEN - 1)}`)?.focus();

  const focusResetOtp = (index: number) =>
    document.getElementById(`reset-otp-${Math.min(Math.max(index, 0), OTP_LEN - 1)}`)?.focus();

  /**
   * Spread digits across boxes. Full 6-digit pastes always start at box 0 so
   * pasting into any field (or with leftover digits) still fills the whole OTP.
   */
  const applyOtpDigits = (
    setCodes: React.Dispatch<React.SetStateAction<string[]>>,
    focus: (i: number) => void,
    index: number,
    raw: string,
  ) => {
    const digits = extractOtpDigits(raw);
    if (!digits) return;
    const start = digits.length >= OTP_LEN ? 0 : index;
    setCodes((prev) => {
      const next = [...prev];
      for (let i = 0; i < digits.length && start + i < OTP_LEN; i++) next[start + i] = digits[i];
      return next;
    });
    focus(Math.min(start + digits.length, OTP_LEN - 1));
  };

  const lockPaste = (lock: React.MutableRefObject<boolean>) => {
    lock.current = true;
    // Chromium/Safari often fire `change` after paste on a macrotask — keep the
    // lock long enough that the wipe can't land after we fill the boxes.
    window.setTimeout(() => { lock.current = false; }, 50);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (otpPasteLock.current) return;
    // Autofill and some keyboards deliver several characters at once.
    if (val.length > 1) return applyOtpDigits(setOtp, focusOtp, index, val);
    const digit = val.replace(/\D/g, "").slice(-1);
    setOtp((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < OTP_LEN - 1) focusOtp(index + 1);
  };

  const handleOtpPaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    lockPaste(otpPasteLock);
    const text = e.clipboardData.getData("text/plain") || e.clipboardData.getData("text");
    applyOtpDigits(setOtp, focusOtp, index, text);
  };

  const handleResetOtpChange = (index: number, val: string) => {
    if (resetPasteLock.current) return;
    if (val.length > 1) return applyOtpDigits(setResetOtp, focusResetOtp, index, val);
    const digit = val.replace(/\D/g, "").slice(-1);
    setResetOtp((prev) => {
      const next = [...prev];
      next[index] = digit;
      return next;
    });
    if (digit && index < OTP_LEN - 1) focusResetOtp(index + 1);
  };

  const handleResetOtpPaste = (index: number, e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    lockPaste(resetPasteLock);
    const text = e.clipboardData.getData("text/plain") || e.clipboardData.getData("text");
    applyOtpDigits(setResetOtp, focusResetOtp, index, text);
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      e.preventDefault();
      setOtp((prev) => {
        const next = [...prev];
        next[index - 1] = "";
        return next;
      });
      focusOtp(index - 1);
    }
    if (e.key === "ArrowLeft") { e.preventDefault(); focusOtp(index - 1); }
    if (e.key === "ArrowRight") { e.preventDefault(); focusOtp(index + 1); }
  };

  const handleVerify2FA = async () => {
    const code = otp.join("");
    if (code.length < 6) {
      setErrors("Complete the 6-digit token verification.");
      return;
    }
    setErrors("");
    setIsLoading(true);

    try {
      const mfaToken = auth.mfaToken || localStorage.getItem("global_estates_mfa_token");
      console.log("MFA token being sent:", mfaToken);
      const response = await authApi.verifyOtp({
        otpType: "ADMIN_LOGIN",
        otp: code,
        email,
      }, mfaToken ?? undefined) as any;
      console.log("Verify OTP response:", response);
      const accessToken = response?.data?.accessToken || response?.accessToken || response?.token;
      const user = response?.data?.user || response?.user;
      if (accessToken && user) {
        const userData: User = {
          id: user.id,
          name: `${user.firstName} ${user.lastName}`,
          role: user.role?.name || (persona === "ESTATE_ADMIN" ? "Estate Administrator" : "Global Administrator"),
          email: user.email,
          // Only the global-admin login path exists today; the estate-admin
          // toggle sets this to ESTATE_ADMIN when it lands.
          persona,
          roleId: user.role?.id,
          permissions: user.role?.permissions?.map((perm: any) => perm.slug),
          estateId: user.estateId ?? user.estate?.id,
        };
        auth.login(userData, accessToken);
        if (onLoginSuccess) onLoginSuccess(userData.name);
        navigate(homePathFor(persona), { replace: true });
      } else if (accessToken) {
        auth.login(
          { id: "admin", name: "Administrator", role: "Global Admin", email, persona },
          accessToken,
        );
        navigate(homePathFor(persona), { replace: true });
      } else {
        setErrors("OTP verification succeeded but no token received. Check console.");
      }
    } catch (err: any) {
      setErrors(err.message || "Invalid OTP code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    try {
      await authApi.resendOtp({ otpType: "ADMIN_LOGIN", email });
      setCountdown(252);
    } catch (err: any) {
      setErrors(err.message || "Failed to resend OTP.");
    }
  };

  const handleResetRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setErrors("Please enter your email address.");
      return;
    }
    setIsLoading(true);
    try {
      await authApi.forgotPassword({ email });
      setResetEmail(email);
      setAuthStep("set-new-password");
      setResetStep("otp");
    } catch (err: any) {
      setErrors(err.message || "Failed to send reset link.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetOtpVerify = async () => {
    const code = resetOtp.join("");
    if (code.length < 6) {
      setErrors("Enter the complete 6-digit code.");
      return;
    }
    setIsLoading(true);
    try {
      await authApi.verifyPasswordOtp({
        otpType: "FORGOT_PASSWORD",
        otp: code,
        email: resetEmail,
      });
      setResetStep("new-password");
    } catch (err: any) {
      setErrors(err.message || "Invalid OTP code.");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordResetComplete = async (e: React.FormEvent) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      setErrors("Passwords do not match.");
      return;
    }
    if (strengthScore < 3) {
      setErrors("Please create a stronger password complying with security rules.");
      return;
    }
    setIsLoading(true);
    try {
      const code = resetOtp.join("");
      await authApi.resetPassword(code, { password: newPassword, email: resetEmail });
      alert("Security Credentials successfully updated! You can now sign in with your new password.");
      setAuthStep("login");
      setResetStep("email");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      setErrors(err.message || "Failed to reset password.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="estate-login-view" className="bg-slate-50 min-h-screen flex items-center justify-center p-4 sm:p-6 font-sans antialiased text-slate-800">
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-gray-200 shadow-xl overflow-hidden flex flex-col md:flex-row min-h-[600px]">
        
        {/* LEFT COLUMN: AUTH FORMS */}
        <div className="w-full md:w-1/2 p-8 sm:p-12 flex flex-col justify-between bg-white text-slate-800">
          
          {/* Logo Brand Title */}
          <div className="flex items-center gap-2.5 mb-8">
            <div className="h-9 w-9 bg-blue-600 rounded-xl text-white flex items-center justify-center font-bold shadow-md">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <span className="text-sm font-black tracking-tight text-slate-900 block leading-tight">Overall Admin</span>
            </div>
          </div>

          {/* DYNAMIC FORM SEGMENTS */}
          {authStep === "login" && (
            <div className="my-auto space-y-5">
              <div>
                <h2 className="text-2xl sm:text-3xl font-black text-slate-905 font-display mt-3 leading-tight tracking-tight">
                  Welcome Back
                </h2>
                <p className="text-xs text-gray-400 mt-1 leading-normal">
                  Enter your credentials to access the central control panel managing access, residents, and security.
                </p>
              </div>

              {/* Which portal to sign in to. Drives the login endpoint and
                  the post-OTP redirect. */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                {([
                  { key: "GLOBAL_ADMIN", label: "Platform Admin" },
                  { key: "ESTATE_ADMIN", label: "Estate Admin" },
                ] as const).map((opt) => (
                  <button
                    key={opt.key}
                    type="button"
                    onClick={() => setPersona(opt.key)}
                    className={`py-2 rounded-lg text-[11px] font-black transition-all ${
                      persona === opt.key
                        ? "bg-white text-slate-900 shadow-sm"
                        : "text-slate-500 hover:text-slate-800"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5 pl-0.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
                    <input 
                      type="email"
                      required
                      placeholder="e.g. admin@globalestates.ng"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full text-xs pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-colors placeholder:text-gray-400 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1.5 px-0.5">
                    <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                      Password
                    </label>
                    <button 
                      type="button"
                      onClick={() => setAuthStep("reset-password")}
                      className="text-[10px] font-bold text-blue-600 hover:text-blue-700 underline"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3.5 top-3.5 h-4.5 w-4.5 text-gray-400" />
                    <input 
                      type="password"
                      required
                      placeholder="••••••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full text-xs pl-11 pr-4 py-3.5 bg-gray-50/50 border border-gray-200 rounded-xl text-slate-900 outline-none focus:bg-white focus:border-blue-600 transition-colors placeholder:text-gray-400"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 py-1.5">
                  <input 
                    type="checkbox" 
                    id="remember-device" 
                    defaultChecked 
                    className="accent-blue-600 h-4 w-4 bg-white border-gray-200 rounded text-blue-600 cursor-pointer"
                  />
                  <label htmlFor="remember-device" className="text-[11px] text-gray-500 font-medium cursor-pointer">
                    Remember this device for 30 days
                  </label>
                </div>

                {errors && (
                  <p className="text-xs text-rose-600 font-medium flex items-center gap-1.5 bg-rose-50 p-2.5 rounded-lg border border-rose-100">
                    <AlertCircle className="h-4 w-4" />
                    {errors}
                  </p>
                )}

                <button
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-blue-105"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span>Sign into Dashboard</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>
              </form>
            </div>
          )}

          {/* TWO-FACTOR SECURITY VERIFICATION SCREEN */}
          {authStep === "two-factor" && (
            <div className="my-auto space-y-6 text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 mb-2">
                <KeyRound className="h-6 w-6 stroke-[2]" />
              </div>

              <div className="text-left sm:text-center">
                <h2 className="text-2xl font-black text-slate-900 font-display tracking-tight leading-normal">
                  Security Verification
                </h2>
                <p className="text-xs text-gray-400 mt-2 max-w-xs mx-auto leading-relaxed">
                  Provide the multifactor 2FA authentication token relayed to your registered workspace profile.
                </p>
              </div>

              {/* Digits row — paste on any box fills all six */}
              <div
                className="flex gap-2.5 sm:gap-3 justify-center my-6"
                onPaste={(e) => {
                  // Catch paste when focus is on the row wrapper (e.g. after tab).
                  if ((e.target as HTMLElement).tagName === "INPUT") return;
                  e.preventDefault();
                  lockPaste(otpPasteLock);
                  const text = e.clipboardData.getData("text/plain") || e.clipboardData.getData("text");
                  applyOtpDigits(setOtp, focusOtp, 0, text);
                }}
              >
                {otp.map((dig, idx) => (
                  <input
                    key={idx}
                    id={`2fa-otp-${idx}`}
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    autoComplete={idx === 0 ? "one-time-code" : "off"}
                    aria-label={`Digit ${idx + 1} of ${OTP_LEN}`}
                    value={dig}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    onPaste={(e) => handleOtpPaste(idx, e)}
                    onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                    onFocus={(e) => e.currentTarget.select()}
                    className="w-10 sm:w-12 h-12 sm:h-14 text-center text-xl font-black bg-gray-50 border-2 border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-600 font-mono text-slate-900"
                  />
                ))}
              </div>

              {errors && (
                <p className="text-xs text-rose-600 font-medium mb-3">{errors}</p>
              )}

              <div className="space-y-4">
                <button 
                  onClick={handleVerify2FA}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer shadow-md"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    "Verify and Enter Dashboard"
                  )}
                </button>

                <div className="flex justify-between items-center text-xs font-semibold px-1">
                  <button 
                    onClick={() => { setAuthStep("login"); setErrors(""); }}
                    className="text-gray-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer"
                  >
                    Change Credentials
                  </button>

                  <button
                    onClick={handleResendOtp}
                    className="text-gray-400 font-mono text-[11px] flex items-center gap-1 cursor-pointer hover:text-blue-600"
                  >
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    {countdown > 0 ? (
                      <>Resend code in <b className="text-blue-600 font-bold">{formatTime(countdown)}</b></>
                    ) : (
                      <span className="text-blue-600 font-bold">Resend Code</span>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* RESET PASSWORD / EMAIL SUBMIT */}
          {authStep === "reset-password" && (
            <div className="my-auto space-y-5">
              <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-gray-50 text-blue-600 border border-gray-150">
                <Mail className="h-5.5 w-5.5" />
              </div>

              <div>
                <h2 className="text-2xl font-black text-slate-900 font-display tracking-tight">
                  Password Reset
                </h2>
                <p className="text-xs text-gray-405 mt-1 leading-normal">
                  Enter internal address authorized with your account and we will dispatch a digital reset link.
                </p>
              </div>

              <form onSubmit={handleResetRequest} className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-1.5">
                    Email Address
                  </label>
                  <input 
                    type="email"
                    required
                    placeholder="email@globalestates.ng"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs px-4 py-3 bg-gray-50/50 border border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-600 text-slate-900 font-mono"
                  />
                </div>

                {errors && (
                  <p className="text-xs text-rose-600 font-medium flex items-center gap-1.5 bg-rose-50 p-2.5 rounded-lg border border-rose-100">
                    <AlertCircle className="h-4 w-4" />
                    {errors}
                  </p>
                )}

                <button 
                  type="submit"
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1"
                >
                  {isLoading ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <span>Send Recovery Link</span>
                      <ArrowRight className="h-4 w-4" />
                    </>
                  )}
                </button>

                <div className="text-center">
                  <button 
                    type="button"
                    onClick={() => { setAuthStep("login"); setErrors(""); }}
                    className="text-xs text-gray-500 hover:text-slate-800 font-semibold underline"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* SET NEW PASSWORD (after OTP verification) */}
          {authStep === "set-new-password" && (
            <div className="my-auto space-y-5">
              <div>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-extrabold px-2.5 py-1 rounded block w-max">
                  CREDENTIAL RENEWAL
                </span>
                <h2 className="text-2xl font-black text-slate-900 font-display tracking-tight leading-normal mt-3">
                  {resetStep === "otp" ? "Enter Reset Code" : "Create New Password"}
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  {resetStep === "otp"
                    ? "Enter the 6-digit code sent to your email."
                    : "Choose a robust password to shield your central estate service accesses."}
                </p>
              </div>

              {resetStep === "otp" && (
                <div className="space-y-4">
                  <div className="flex gap-2.5 sm:gap-3 justify-center my-4">
                    {resetOtp.map((dig, idx) => (
                      <input
                        key={idx}
                        id={`reset-otp-${idx}`}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        autoComplete={idx === 0 ? "one-time-code" : "off"}
                        aria-label={`Reset code digit ${idx + 1} of ${OTP_LEN}`}
                        value={dig}
                        onChange={(e) => handleResetOtpChange(idx, e.target.value)}
                        onPaste={(e) => handleResetOtpPaste(idx, e)}
                        onKeyDown={(e) => {
                          if (e.key === "Backspace" && !resetOtp[idx] && idx > 0) {
                            e.preventDefault();
                            setResetOtp((prev) => {
                              const next = [...prev];
                              next[idx - 1] = "";
                              return next;
                            });
                            focusResetOtp(idx - 1);
                          }
                        }}
                        onFocus={(e) => e.currentTarget.select()}
                        className="w-10 sm:w-12 h-12 text-center text-xl font-black bg-gray-50 border-2 border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-600 font-mono text-slate-900"
                      />
                    ))}
                  </div>

                  {errors && (
                    <p className="text-xs text-rose-600 font-medium">{errors}</p>
                  )}

                  <button
                    onClick={handleResetOtpVerify}
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1"
                  >
                    {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Verify Code"}
                  </button>

                  <div className="text-center">
                    <button
                      type="button"
                      onClick={() => { setAuthStep("login"); setResetStep("email"); setErrors(""); }}
                      className="text-xs text-gray-500 hover:text-slate-800 font-semibold underline"
                    >
                      Back to Sign In
                    </button>
                  </div>
                </div>
              )}

              {resetStep === "new-password" && (
                <form onSubmit={handlePasswordResetComplete} className="space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 pl-0.5">
                      Your Password
                    </label>
                    <input 
                      type="password"
                      required
                      placeholder="Enter security password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      className="w-full text-xs px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-600 font-mono text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 pl-0.5">
                      Confirm Password
                    </label>
                    <input 
                      type="password"
                      required
                      placeholder="Re-enter password for checking"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full text-xs px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:border-blue-600 font-mono text-slate-900"
                    />
                  </div>

                  {/* PASSWORD STRENGTH FEEDBACK */}
                  <div className="p-3 bg-gray-50 border border-gray-150 rounded-xl space-y-2.5">
                    <div className="flex justify-between items-center text-[10px] font-bold">
                      <span className="text-gray-400">Password Strength:</span>
                      <span className={`uppercase ${
                        strengthScore === 4 
                          ? "text-green-600" 
                          : strengthScore >= 2 
                          ? "text-amber-600" 
                          : "text-rose-600"
                      }`}>
                        {strengthScore === 4 ? "Strong" : strengthScore >= 2 ? "Moderate" : "Weak"}
                      </span>
                    </div>

                    <div className="flex gap-1.5 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${strengthScore >= 1 ? "bg-rose-500 w-1/4" : "w-0"}`} />
                      <div className={`h-full rounded-full transition-all duration-300 ${strengthScore >= 2 ? "bg-amber-500 w-1/4" : "w-0"}`} />
                      <div className={`h-full rounded-full transition-all duration-300 ${strengthScore >= 3 ? "bg-emerald-500 w-1/4" : "w-0"}`} />
                      <div className={`h-full rounded-full transition-all duration-300 ${strengthScore === 4 ? "bg-green-500 w-1/4" : "w-0"}`} />
                    </div>

                    <div className="grid grid-cols-2 gap-x-2 gap-y-1 pt-1">
                      <div className="flex items-center gap-1.5 text-[9px] font-medium">
                        <div className={`h-3 w-3 rounded-full flex items-center justify-center ${newPassword.length >= 8 ? "bg-emerald-50 text-emerald-600" : "bg-gray-200 text-gray-400"}`}>
                          <Check className="h-2 w-2 stroke-[4]" />
                        </div>
                        <span className={newPassword.length >= 8 ? "text-gray-700" : "text-gray-405"}>At least 8 characters</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[9px] font-medium">
                        <div className={`h-3 w-3 rounded-full flex items-center justify-center ${/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) ? "bg-emerald-50 text-emerald-600" : "bg-gray-200 text-gray-400"}`}>
                          <Check className="h-2 w-2 stroke-[4]" />
                        </div>
                        <span className={/[A-Z]/.test(newPassword) && /[a-z]/.test(newPassword) ? "text-gray-700" : "text-gray-405"}>Uppercase balance</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[9px] font-medium">
                        <div className={`h-3 w-3 rounded-full flex items-center justify-center ${/[0-9]/.test(newPassword) ? "bg-emerald-50 text-emerald-600" : "bg-gray-200 text-gray-400"}`}>
                          <Check className="h-2 w-2 stroke-[4]" />
                        </div>
                        <span className={/[0-9]/.test(newPassword) ? "text-gray-700" : "text-gray-405"}>Contains number</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-[9px] font-medium">
                        <div className={`h-3 w-3 rounded-full flex items-center justify-center ${/[^A-Za-z0-9]/.test(newPassword) ? "bg-emerald-50 text-emerald-600" : "bg-gray-200 text-gray-400"}`}>
                          <Check className="h-2 w-2 stroke-[4]" />
                        </div>
                        <span className={/[^A-Za-z0-9]/.test(newPassword) ? "text-gray-700" : "text-gray-405"}>Letters & symbols</span>
                      </div>
                    </div>
                  </div>

                  {errors && (
                    <p className="text-xs text-rose-600 font-medium">{errors}</p>
                  )}

                  <button 
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1"
                  >
                    {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : "Reset Password & Continue"}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* ACCESS LINK TO PORTAL RETURN */}
          <div className="border-t border-gray-100 pt-5 mt-8 flex justify-center items-center text-[10px] text-gray-450 font-mono shrink-0">
            <button 
              onClick={() => { if (onBackToMain) onBackToMain(); }}
              className="hover:text-blue-600 underline cursor-pointer font-bold bg-transparent border-none text-gray-500"
            >
              Need Technical Support? Contact Support.
            </button>
          </div>

        </div>

        {/* RIGHT COLUMN: BRANDED ILLUSTRATION AND QUOTE SCREEN */}
        <div className="hidden md:flex md:w-1/2 bg-slate-50 text-slate-800 p-12 shrink-0 flex-col justify-between relative overflow-hidden border-l border-gray-200">
          <div className="absolute top-0 right-0 w-80 h-80 bg-blue-100/40 rounded-full blur-[80px] pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-indigo-100/30 rounded-full blur-[80px] pointer-events-none animate-pulse" />

          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              backgroundImage: "linear-gradient(rgba(2,6,23,0.45), rgba(2,6,23,0.25)), url('/login-placeholder.png')",
              backgroundRepeat: 'no-repeat',
              backgroundPosition: 'center right',
              backgroundSize: 'cover',
            }}
          />

          {/* Status badges */}
          <div className="absolute top-8 left-12 flex gap-3 z-20">
            <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-[12px] text-white font-semibold flex items-center gap-3 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-emerald-400 inline-block" />
              <span><b className="font-black">SYSTEM UPDATE:</b> OPERATIONAL</span>
            </div>
            <div className="px-4 py-2 rounded-full bg-white/10 backdrop-blur-sm border border-white/10 text-[12px] text-white font-semibold flex items-center gap-2 shadow-sm">
              <span>V4.2 SECURE</span>
            </div>
          </div>

          <div className="z-10 max-w-sm">
            <span className="text-[10px] text-gray-400 uppercase tracking-widest block font-bold font-mono">Operations Platform</span>
            <h3 className="text-3xl font-black font-display tracking-tight leading-none text-slate-900 mt-1.5">
              Secure Oversight Management
            </h3>
            <p className="text-xs text-gray-500 mt-2.5 leading-relaxed font-sans">
              The premium command node designed for national security audits, instant resident registration, and real-time biometric checking stamps.
            </p>
          </div>

          <div className="mt-8 z-20">
            <div className="p-8 bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl shadow-2xl max-w-md text-white">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex gap-1 text-amber-300 text-xl">
                  {[...Array(5)].map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                </div>
              </div>

              <p className="text-lg sm:text-xl leading-relaxed italic font-medium opacity-95">
                "The central interface has revolutionized how we manage access across our nationwide portfolio of residential estates."
              </p>

              <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-4">
                <div className="h-10 w-10 rounded-full ring-2 ring-blue-600 overflow-hidden bg-slate-100">
                  <img src="/image.png" alt="Emmanuel Clark" className="h-full w-full object-cover" />
                </div>
                <div>
                  <span className="text-sm font-bold block">Verified Platform Admin</span>
                  <span className="text-[12px] opacity-80 block">VP of Operations, Global Estates</span>
                </div>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
