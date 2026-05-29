import React, { useState, useEffect } from "react";
import { ShieldCheck, Mail, Lock, ArrowRight, Check, AlertCircle, RefreshCw, KeyRound } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

interface EstateLoginProps {
  onLoginSuccess?: (adminName: string) => void;
  onBackToMain?: () => void;
}

export default function EstateLogin({ onLoginSuccess, onBackToMain }: EstateLoginProps) {
  const auth = useAuth();
  const navigate = useNavigate();
  const [authStep, setAuthStep] = useState<"login" | "two-factor" | "reset-password" | "set-new-password">("login");
  const [email, setEmail] = useState("admin@globalestates.ng");
  const [password, setPassword] = useState("Vanguard2026!");
  const [errors, setErrors] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // 2FA state
  const [otp, setOtp] = useState<string[]>(["", "", "", ""]);
  const [countdown, setCountdown] = useState(252); // 4 mins 12 secs
  
  // Set New Password state
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [strengthScore, setStrengthScore] = useState(0);

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

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setErrors("Please fill in all details.");
      return;
    }
    if (email !== "admin@globalestates.ng" || password !== "Vanguard2026!") {
      setErrors("Invalid email or password. Try demo: admin@globalestates.ng / Vanguard2026!");
      return;
    }
    setErrors("");
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      setAuthStep("two-factor");
    }, 1000);
  };

  const handleOtpChange = (index: number, val: string) => {
    if (isNaN(Number(val))) return;
    const newOtp = [...otp];
    newOtp[index] = val.substring(val.length - 1);
    setOtp(newOtp);

    // Auto-focus next input
    if (val && index < 3) {
      const nextInp = document.getElementById(`2fa-otp-${index + 1}`);
      nextInp?.focus();
    }
  };

  const handleVerify2FA = () => {
    const code = otp.join("");
    if (code.length < 4) {
      setErrors("Complete the 4-digit token verification.");
      return;
    }
    setErrors("");
    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      const userData = { id: "admin-1", name: "Emmanuel Clark", role: "Global Administrator", email: "admin@globalestates.ng" };
      auth.login(userData);
      if (onLoginSuccess) onLoginSuccess("Emmanuel Clark");
    }, 1200);
  };

  const handleResetRequest = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setAuthStep("set-new-password");
    }, 1200);
  };

  const handlePasswordResetComplete = (e: React.FormEvent) => {
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
    setTimeout(() => {
      setIsLoading(false);
      alert("Security Credentials successfully updated! You can now sign in with your new password.");
      setAuthStep("login");
    }, 1200);
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
              {/* <span className="block text-[10px] text-gray-400 font-bold uppercase leading-none tracking-tight">Oversight Platform</span> */}
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

              {/* Digits row */}
              <div className="flex gap-3.5 justify-center my-6">
                {otp.map((dig, idx) => (
                  <input
                    key={idx}
                    id={`2fa-otp-${idx}`}
                    type="text"
                    maxLength={1}
                    value={dig}
                    onChange={(e) => handleOtpChange(idx, e.target.value)}
                    className="w-12 sm:w-14 h-12 sm:h-14 text-center text-xl font-black bg-gray-50 border-2 border-gray-200 rounded-xl outline-none focus:bg-white focus:border-blue-600 font-mono text-slate-900 max-w-[60px]"
                  />
                ))}
              </div>

              {errors && (
                <p className="text-xs text-rose-600 font-medium mb-3">{errors}</p>
              )}

              {/* Simulation Helper */}
              <div className="bg-blue-50/40 border border-blue-105 p-3.5 rounded-xl text-left text-[11px] text-blue-900 flex flex-col gap-1.5">
                <span className="font-bold text-blue-700 uppercase text-[9px] tracking-wider block">Sandbox Key Release</span>
                <span>Enter any 4-digit security code (e.g. <b className="font-mono text-blue-700">2026</b>) to bypass state authentication and enter the admin console.</span>
              </div>

              <div className="space-y-4">
                <button 
                  onClick={handleVerify2FA}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer shadow-md"
                >
                  Verify and Enter Dashboard
                </button>

                <div className="flex justify-between items-center text-xs font-semibold px-1">
                  <button 
                    onClick={() => setAuthStep("login")}
                    className="text-gray-500 hover:text-slate-800 flex items-center gap-1.5 cursor-pointer"
                  >
                    Change Credentials
                  </button>

                  <span className="text-gray-400 font-mono text-[11px] flex items-center gap-1">
                    <span className="h-2 w-2 rounded-full bg-amber-500 animate-pulse" />
                    Resend code in <b className="text-blue-600 font-bold">{formatTime(countdown)}</b>
                  </span>
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

                <button 
                  type="submit"
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1"
                >
                  <span>Send Recovery Link</span>
                  <ArrowRight className="h-4 w-4" />
                </button>

                <div className="text-center">
                  <button 
                    type="button"
                    onClick={() => setAuthStep("login")}
                    className="text-xs text-gray-500 hover:text-slate-800 font-semibold underline"
                  >
                    Back to Sign In
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* DYNAMIC PASSWORD STRENGTH & SET NEW PASSWORD */}
          {authStep === "set-new-password" && (
            <div className="my-auto space-y-5">
              <div>
                <span className="text-[10px] bg-indigo-50 text-indigo-700 font-extrabold px-2.5 py-1 rounded block w-max">
                  CREDENTIAL RENEWAL
                </span>
                <h2 className="text-2xl font-black text-slate-900 font-display tracking-tight leading-normal mt-3">
                  Create New Password
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Choose a robust password to shield your central estate service accesses.
                </p>
              </div>

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

                {/* LIVING PASSWORD STRENGTH FEEDBACK */}
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

                  {/* Visual segment bars */}
                  <div className="flex gap-1.5 h-1 w-full bg-gray-200 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full transition-all duration-300 ${
                      strengthScore >= 1 ? "bg-rose-500 w-1/4" : "w-0"
                    }`} />
                    <div className={`h-full rounded-full transition-all duration-300 ${
                      strengthScore >= 2 ? "bg-amber-500 w-1/4" : "w-0"
                    }`} />
                    <div className={`h-full rounded-full transition-all duration-300 ${
                      strengthScore >= 3 ? "bg-emerald-500 w-1/4" : "w-0"
                    }`} />
                    <div className={`h-full rounded-full transition-all duration-300 ${
                      strengthScore === 4 ? "bg-green-500 w-1/4" : "w-0"
                    }`} />
                  </div>

                  {/* Rules Checklists */}
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
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl text-xs cursor-pointer flex items-center justify-center gap-1"
                >
                  Reset Password & Continue
                </button>
              </form>
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
                  <span className="text-sm font-bold block">Emmanuel Stark</span>
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
