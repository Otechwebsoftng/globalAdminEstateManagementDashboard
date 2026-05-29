import React, { useState } from "react";
import { TabState } from "../types";
import { 
  Scale, ShieldCheck, Check, Briefcase, ArrowRight, ChevronLeft, 
  BookOpen, Award, DollarSign, Clock, User, Mail, Phone, 
  MapPin, Sparkles, Lock, Shield, Plus, X, Laptop, Star
} from "lucide-react";

interface OnboardingViewProps {
  onComplete: (role: "client" | "lawyer") => void;
  onBackToHome: () => void;
}

export default function OnboardingView({ onComplete, onBackToHome }: OnboardingViewProps) {
  const [step, setStep] = useState<number>(1);
  const [role, setRole] = useState<"client" | "lawyer">("client");
  
  // Registration Form States
  const [formState, setFormState] = useState({
    name: "",
    email: "",
    phone: "",
    termsAccepted: true
  });

  // OTP State
  const [otpDigits, setOtpDigits] = useState<string[]>(["", "", "", ""]);
  const [otpError, setOtpError] = useState("");

  // Step 5 - Clients: Categories
  const [clientCategories, setClientCategories] = useState<{ [key: string]: boolean }>({
    "Business & Corporate": true,
    "Real Estate & Property": false,
    "Family & Personal Law": false,
    "Employment & Labour": false,
    "Litigation & Dispute Resolution": false,
    "Intellectual Property": false,
    "Immigration Services": false
  });

  // Step 5 - Lawyers Tabs State
  const [lawyerSubTab, setLawyerSubTab] = useState<"identity" | "education" | "fees" | "availability">("identity");
  
  // Lawyer Setup Form State
  const [lawyerProfile, setLawyerProfile] = useState({
    supremeCourtNo: "SCN/2021/493",
    practiceState: "Lagos [LAG]",
    experienceYears: "7",
    barLicenseName: "Bar_Practice_License_2026.pdf",
    degree: "LLB, Obafemi Awolowo University",
    lawschool: "Nigerian Law School, Lagos Campus",
    hourlyRate: "25000",
    consultFee: "15000",
    daysAvailable: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    hoursAvailable: "9:00 AM - 5:00 PM"
  });

  const categories = Object.keys(clientCategories);

  const toggleClientCategory = (cat: string) => {
    setClientCategories({
      ...clientCategories,
      [cat]: !clientCategories[cat]
    });
  };

  const handleOtpChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newDigits = [...otpDigits];
    newDigits[index] = value.substring(value.length - 1);
    setOtpDigits(newDigits);
    setOtpError("");
    
    // Auto focus next input
    if (value && index < 3) {
      const nextInput = document.getElementById(`otp-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleOtpVerify = () => {
    const fullCode = otpDigits.join("");
    // Accept any valid 4 digit code for high usability but showcase 1234 as recommendation
    if (fullCode.length < 4) {
      setOtpError("Please enter all 4 digits.");
      return;
    }
    setStep(5);
  };

  const handleRegistrationSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.phone) return;
    // Advance to OTP step
    setStep(4);
  };

  const handleCompleteFlow = () => {
    onComplete(role);
  };

  return (
    <div className="bg-slate-50 min-h-screen py-12 px-4 flex items-center justify-center font-sans">
      <div className="w-full max-w-5xl bg-white rounded-3xl border border-gray-150 shadow-2xl overflow-hidden min-h-[580px] flex flex-col justify-between">
        
        {/* UPPER STATUS / PROGRESS HEAD */}
        <div className="px-8 py-5 border-b border-gray-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <div className="h-8 w-8 rounded-lg bg-[#007A5E] text-white flex items-center justify-center font-black">
              <Scale className="h-4.5 w-4.5" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-[#007A5E] tracking-wider uppercase">9ja Legal Portal</span>
              <span className="block text-[9px] text-gray-400 font-bold uppercase leading-none tracking-tight">Onboarding Phase</span>
            </div>
          </div>

          {/* Stepper progress indicator */}
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-bold text-gray-400">Step {step} of 5</span>
            <div className="flex items-center gap-1.5 h-2 w-32 bg-gray-200 rounded-full overflow-hidden">
              <div 
                className="bg-[#007A5E] h-full rounded-full transition-all duration-300"
                style={{ width: `${(step / 5) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* CONTAINER SHELL FOR MAIN EDIT SECTIONS */}
        <div className="flex-1 p-6 sm:p-10 flex items-center justify-center bg-white">
          
          {/* STEP 1: ONBOARDING OVERVIEW */}
          {step === 1 && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-stretch w-full">
              {/* Left Column Graphic */}
              <div className="lg:col-span-5 bg-gradient-to-br from-[#007A5E] to-emerald-800 text-white rounded-2xl p-6.5 flex flex-col justify-between relative overflow-hidden shadow-md">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
                
                <div>
                  <div className="inline-flex items-center justify-center p-2.5 bg-white/10 rounded-xl mb-4 text-emerald-300">
                    <ShieldCheck className="h-8 w-8 stroke-[2.5]" />
                  </div>
                  <h3 className="text-2xl font-black font-display leading-[1.1] tracking-tight">
                    Trusted legal assistance network
                  </h3>
                  <p className="text-xs text-emerald-100/90 leading-relaxed mt-2">
                    Securing your documents, deeds, and enterprise registration with ultimate compliance standards.
                  </p>
                </div>

                <div className="p-4 bg-white/5 rounded-xl border border-white/10 mt-6 lg:mt-0">
                  <span className="block text-amber-300 font-bold text-sm">Trusted by 1700+ Clients</span>
                  <span className="text-[10px] text-white/70 block mt-0.5 leading-snug">
                    Over 350+ certified lawyers active across all 36 Nigerian states. Private data and funds secured in professional escrow.
                  </span>
                </div>
              </div>

              {/* Right Column Features & CTA */}
              <div className="lg:col-span-7 flex flex-col justify-between py-2">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display leading-tight tracking-tight">
                    Legal Help, Simplified for Every Nigerian
                  </h2>
                  <p className="text-xs text-gray-500 font-sans leading-relaxed mt-2 max-w-lg">
                    Welcome to the 9ja Legal Gateway. Connect, file, verify, and consult under the safety of professional state-mandated legal escrow pools.
                  </p>

                  <div className="mt-6 space-y-4">
                    
                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-5.5 w-5.5 stroke-[2.5]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Vetted Local Professionals</h4>
                        <p className="text-[11px] text-gray-500">Every attorney is vetted with active NBA practice license stamps and Supreme Court rolls.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-5.5 w-5.5 stroke-[2.5]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Transparent Flat Pricing</h4>
                        <p className="text-[11px] text-gray-500">No shock fees or price padding. Preview pre-agreed regulatory tariffs upfront.</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-5.5 w-5.5 stroke-[2.5]" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">Emergency SOS Support</h4>
                        <p className="text-[11px] text-gray-500">Fast connection to legal advisors and advocates during civil crisis, threats, or lockdowns.</p>
                      </div>
                    </div>

                  </div>
                </div>

                <div className="mt-8 border-t border-gray-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <div className="text-[11px] text-gray-400 text-center sm:text-left leading-normal">
                    By getting started, you agree to our <span className="underline hover:text-gray-650 cursor-pointer">Escrow Terms & Policies</span>.
                  </div>
                  
                  <button 
                    onClick={() => setStep(2)}
                    className="w-full sm:w-auto bg-[#007A5E] hover:bg-[#005f48] text-white text-xs font-bold px-7 py-3 rounded-xl transition-all shadow-md shadow-emerald-100 shrink-0 flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <span>Get Started</span>
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: ROLE SELECTION */}
          {step === 2 && (
            <div className="w-full max-w-2xl text-center">
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight leading-normal">
                Tell us how you'll be using 9ja legal assistant
              </h2>
              <p className="text-xs text-gray-500 mt-2 max-w-md mx-auto">
                Define your profile role so we can personalize your compliance pathways and legal verification services.
              </p>

              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
                {/* Role A Card: Client */}
                <button 
                  onClick={() => setRole("client")}
                  className={`p-6 text-left rounded-2xl border-2 transition-all shadow-sm flex flex-col justify-between h-[190px] relative overflow-hidden group ${
                    role === "client" 
                      ? "border-[#007A5E] bg-emerald-50/20" 
                      : "border-gray-150 bg-white hover:border-gray-250 hover:bg-slate-50/50"
                  }`}
                >
                  {role === "client" && (
                    <div className="absolute top-3 right-3 bg-[#007A5E] text-white p-1 rounded-full">
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                    </div>
                  )}

                  <div className="h-10 w-10 rounded-xl bg-emerald-50 text-[#007A5E] flex items-center justify-center">
                    <User className="h-5.5 w-5.5 stroke-[2]" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-gray-900 font-display">I need legal help</h3>
                    <p className="text-xs text-gray-500 mt-1.5 leading-snug">
                      For individuals and businesses seeking CAC filing, property checking, wills, and private consulting.
                    </p>
                  </div>
                </button>

                {/* Role B Card: Lawyer */}
                <button 
                  onClick={() => setRole("lawyer")}
                  className={`p-6 text-left rounded-2xl border-2 transition-all shadow-sm flex flex-col justify-between h-[190px] relative overflow-hidden group ${
                    role === "lawyer" 
                      ? "border-[#007A5E] bg-emerald-50/20" 
                      : "border-gray-150 bg-white hover:border-gray-250 hover:bg-slate-50/50"
                  }`}
                >
                  {role === "lawyer" && (
                    <div className="absolute top-3 right-3 bg-[#007A5E] text-white p-1 rounded-full">
                      <Check className="h-3.5 w-3.5 stroke-[2.5]" />
                    </div>
                  )}

                  <div className="h-10 w-10 rounded-xl bg-orange-50 text-orange-700 flex items-center justify-center">
                    <Briefcase className="h-5.5 w-5.5 stroke-[2]" />
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-gray-900 font-display">I am a legal professional</h3>
                    <p className="text-xs text-gray-500 mt-1.5 leading-snug">
                      For licensed practitioners across Nigeria wishing to scale their litigation and secure escrow-backed clients.
                    </p>
                  </div>
                </button>
              </div>

              {/* Action Buttons */}
              <div className="mt-10 flex flex-col sm:flex-row justify-between items-center border-t border-gray-100 pt-6 gap-4">
                <button 
                  onClick={() => setStep(1)}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-900 flex items-center gap-1.5 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" /> Back to welcome
                </button>

                <button 
                  onClick={() => setStep(3)}
                  className="w-full sm:w-auto bg-[#007A5E] hover:bg-[#005f48] text-white text-xs font-bold px-8 py-3 rounded-xl transition-colors shadow shadow-emerald-100"
                >
                  Continue
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: QUICK REGISTRATION */}
          {step === 3 && (
            <div className="w-full max-w-md">
              <div className="text-center mb-6">
                <span className="text-[10px] font-extrabold bg-emerald-50 text-[#007A5E] uppercase tracking-wider px-2.5 py-1 rounded">
                  Quick Registration
                </span>
                <h2 className="text-2xl font-black text-slate-900 font-display mt-3 leading-tight">
                  Join 9ja Legal Assistant
                </h2>
                <p className="text-xs text-gray-500 mt-0.5">
                  Set up your active account in under 30 seconds
                </p>
              </div>

              {/* Google Button */}
              <button 
                type="button"
                onClick={() => setStep(4)}
                className="w-full flex items-center justify-center gap-2.5 border border-gray-200 hover:bg-slate-50 text-slate-800 text-xs font-bold py-3 px-4 rounded-xl transition-colors shadow-sm"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v3.92h6.69c-.29 1.5-.1.3-1.14 2.1l3.3 2.5a11.5 11.5 0 003.89-6.45z" />
                  <path fill="#34A853" d="M12 24c3.24 0 5.97-1.08 7.96-2.91l-3.3-2.56c-.9.6-2.07.97-3.66.97-3.12 0-5.76-2.11-6.7-4.96L.89 17.15c2.0 3.97 6.13 6.67 11.11 6.67z" />
                  <path fill="#FBBC05" d="M5.3 14.54a7 7 0 010-4.54L.89 6.85a11.97 11.97 0 000 10.3L5.3 14.54z" />
                  <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.96 1.19 15.24 0 12 0 7.02 0 2.88 2.7 1.11 6.67l4.41 3.42c.94-2.85 3.58-4.96 6.7-4.96z" />
                </svg>
                Continue with Google
              </button>

              <div className="relative my-5 text-center">
                <div className="absolute inset-0 flex items-center text-gray-200">
                  <div className="w-full border-t border-gray-150" />
                </div>
                <span className="relative bg-white px-3.5 text-[9px] font-bold text-gray-400 uppercase tracking-widest">
                  OR REGISTER WITH EMAIL
                </span>
              </div>

              <form onSubmit={handleRegistrationSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 px-0.5">Full Name</label>
                  <div className="relative">
                    <User className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" />
                    <input 
                      required
                      type="text"
                      placeholder="e.g. Chinedu Okafor"
                      value={formState.name}
                      onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                      className="w-full text-xs pl-10 pr-4 py-3 bg-slate-50 border border-gray-150 rounded-xl outline-none focus:bg-white focus:border-emerald-600 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 px-0.5">Email Address</label>
                  <div className="relative">
                    <Mail className="absolute left-3.5 top-3 h-4 w-4 text-gray-405" />
                    <input 
                      required
                      type="email"
                      placeholder="e.g. chinedu@example.com"
                      value={formState.email}
                      onChange={(e) => setFormState({ ...formState, email: e.target.value })}
                      className="w-full text-xs pl-10 pr-4 py-3 bg-slate-50 border border-gray-150 rounded-xl outline-none focus:bg-white focus:border-emerald-600 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 px-0.5">WhatsApp Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3.5 top-3v h-4 w-4 text-gray-405" />
                    <input 
                      required
                      type="tel"
                      placeholder="e.g. +234 806 421 2516"
                      value={formState.phone}
                      onChange={(e) => setFormState({ ...formState, phone: e.target.value })}
                      className="w-full text-xs pl-10 pr-4 py-3 bg-slate-50 border border-gray-150 rounded-xl outline-none focus:bg-white focus:border-emerald-600 transition-colors"
                    />
                  </div>
                </div>

                <div className="text-[10px] text-gray-500 leading-relaxed font-light py-1 flex gap-2">
                  <input 
                    type="checkbox" 
                    id="terms" 
                    checked={formState.termsAccepted} 
                    onChange={(e) => setFormState({ ...formState, termsAccepted: e.target.checked })}
                    className="mt-0.5 accent-[#007A5E] cursor-pointer" 
                  />
                  <label htmlFor="terms">By proceeding you accept the 9ja Legal Escrow protection standard, Terms of Services & Privacy Policy.</label>
                </div>

                <button 
                  type="submit"
                  disabled={!formState.termsAccepted}
                  className="w-full bg-[#007A5E] hover:bg-emerald-850 text-white font-bold py-3.5 rounded-xl text-xs transition-all shadow shadow-emerald-100/50 flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <span>Sign Up as a {role === "client" ? "Client" : "Lawyer"}</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </form>

              {/* Back CTA */}
              <div className="mt-5 text-center">
                <button 
                  onClick={() => setStep(2)}
                  className="text-xs font-semibold text-gray-500 hover:text-gray-900 inline-flex items-center gap-1 cursor-pointer"
                >
                  <ChevronLeft className="h-4 w-4" /> Back to role selector
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: VERIFY REGISTRATION IDENTITY (OTP) */}
          {step === 4 && (
            <div className="w-full max-w-sm text-center">
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-[#007A5E] mb-4">
                <Shield className="h-6 w-6" />
              </div>

              <h2 className="text-2xl font-black text-slate-900 font-display tracking-tight leading-normal">
                Verify Your Identity
              </h2>
              
              <p className="text-xs text-gray-500 mt-2 max-w-xs mx-auto leading-relaxed">
                A 4-digit verification code has been sent to your mobile phone or WhatsApp number <b className="font-mono text-slate-700">{formState.phone || "+234 806 421 XXXX"}</b>. Enter code to continue.
              </p>

              {/* Digits entry */}
              <div className="flex gap-4.5 justify-center my-8">
                {otpDigits.map((digit, index) => (
                  <input
                    key={index}
                    id={`otp-${index}`}
                    type="text"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(index, e.target.value)}
                    className="w-14 h-14 text-center text-xl font-black bg-slate-50 border-2 border-slate-150 rounded-xl outline-none focus:bg-white focus:border-emerald-600 font-mono"
                  />
                ))}
              </div>

              {otpError && (
                <p className="text-xs font-medium text-rose-600 mb-4">{otpError}</p>
              )}

              {/* Interactive Sandbox Helper */}
              <div className="bg-slate-50 border border-slate-150 p-3.5 rounded-xl text-left text-[11px] text-slate-650 flex flex-col gap-1 mb-8">
                <span className="font-bold text-slate-800 uppercase text-[9px] tracking-wider block">Escrow Identity Bypass</span>
                <span>You can enter any 4 digits to continue, or use <b className="font-mono text-emerald-700">1234</b> for security simulation testing.</span>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={handleOtpVerify}
                  className="w-full bg-[#007A5E] hover:bg-[#005f48] text-white font-bold py-3.5 rounded-xl text-xs transition-all shadow-md shadow-emerald-100 flex items-center justify-center gap-1 cursor-pointer"
                >
                  Verify Code & Continue
                </button>

                <div className="flex justify-between items-center text-xs text-gray-400 font-medium px-1">
                  <button 
                    onClick={() => setStep(3)}
                    className="hover:text-gray-700 flex items-center gap-1 cursor-pointer"
                  >
                    <ChevronLeft className="h-4 w-4" /> Change details
                  </button>

                  <button 
                    onClick={() => {
                      setOtpDigits(["", "", "", ""]);
                      setOtpError("New safety OTP code sent!");
                    }}
                    className="text-[#007A5E] hover:underline cursor-pointer"
                  >
                    Resend Code
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* STEP 5: TAILOR YOUR EXPERIENCE (CUSTOM COMPLIANCE / LAWYER PROFILE SETUP) */}
          {step === 5 && (
            <div className="w-full py-2">
              {role === "client" ? (
                /* CLIENT CUSTOMIZATION */
                <div className="max-w-2xl mx-auto">
                  <div className="text-center mb-8">
                    <span className="text-[10px] font-extrabold bg-emerald-50 text-[#007A5E] uppercase tracking-wider px-2.5 py-1 rounded">
                      Tailor your Experience
                    </span>
                    <h2 className="text-2xl sm:text-3xl font-black text-slate-900 font-display tracking-tight leading-normal mt-3">
                      Tailor your Experience
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Select one or more categories that best match your legal query or practice area
                    </p>
                  </div>

                  {/* Categories checkboxes */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {categories.map((cat, idx) => (
                      <button
                        key={idx}
                        onClick={() => toggleClientCategory(cat)}
                        className={`p-4 text-left rounded-xl border-2 transition-all flex items-center justify-between shadow-sm cursor-pointer ${
                          clientCategories[cat]
                            ? "border-emerald-600 bg-emerald-50/20 text-[#007A5E]"
                            : "border-gray-150 bg-white hover:border-gray-250 text-gray-800"
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`h-4.5 w-4.5 max-h-4.5 rounded-md flex items-center justify-center border-2 ${
                            clientCategories[cat] ? "bg-emerald-600 border-transparent text-white" : "border-gray-300"
                          }`}>
                            {clientCategories[cat] && <Check className="h-3 w-3 stroke-[3]" />}
                          </div>
                          <span className="text-xs font-semibold">{cat}</span>
                        </div>
                        <span className="text-[9px] font-bold text-gray-400 font-mono">ID: {idx + 1}</span>
                      </button>
                    ))}
                  </div>

                  {/* Complete actions bottom */}
                  <div className="mt-10 pt-6 border-t border-gray-100 flex flex-col sm:flex-row justify-between items-center gap-4">
                    <button 
                      onClick={handleCompleteFlow}
                      className="text-xs font-bold text-gray-400 hover:text-gray-600 underline cursor-pointer"
                    >
                      Skip to Dashboard
                    </button>

                    <button 
                      onClick={handleCompleteFlow}
                      className="w-full sm:w-auto bg-[#007A5E] hover:bg-[#005f48] text-white text-xs font-bold px-8 py-3.5 rounded-xl transition-all shadow shadow-emerald-100 flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>Complete Setup & View Dashboard</span>
                      <ArrowRight className="h-4.5 w-4.5" />
                    </button>
                  </div>
                </div>
              ) : (
                /* LAWYER PROFILE SETUP (Professional Identity Tabs View as depicted in step 5) */
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Left sub-navigation tab lists */}
                  <div className="lg:col-span-4 space-y-2 lg:border-r border-gray-100 lg:pr-6">
                    <div className="pb-3 px-2">
                      <span className="text-[10px] font-extrabold text-amber-600 tracking-wider uppercase block">Attorney Identity Setup</span>
                      <h4 className="text-sm font-bold text-slate-900 mt-1">Professional Verification</h4>
                    </div>

                    {[
                      { id: "identity", label: "Professional Identity", desc: "Supreme Court Enrollment & License" },
                      { id: "education", label: "Education & Experience", desc: "Universities, law schools & certificates" },
                      { id: "fees", label: "Consultation Fee Escrow", desc: "Flat billing & safe bank setups" },
                      { id: "availability", label: "Availability Settings", desc: "Working days & direct hours" }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setLawyerSubTab(tab.id as any)}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                          lawyerSubTab === tab.id 
                            ? "border-[#007A5E] bg-emerald-50/25 text-[#007A5E]" 
                            : "border-transparent bg-slate-50/30 hover:bg-slate-50 text-slate-700"
                        }`}
                      >
                        <div className={`mt-0.5 p-1 rounded-lg ${lawyerSubTab === tab.id ? "bg-emerald-100 text-[#007A5E]" : "bg-gray-100 text-gray-400"}`}>
                          {tab.id === "identity" && <User className="h-4 w-4" />}
                          {tab.id === "education" && <BookOpen className="h-4 w-4" />}
                          {tab.id === "fees" && <DollarSign className="h-4 w-4" />}
                          {tab.id === "availability" && <Clock className="h-4 w-4" />}
                        </div>
                        <div>
                          <span className="block text-xs font-bold leading-normal">{tab.label}</span>
                          <span className="block text-[9px] text-gray-400 font-light mt-0.5 leading-none">{tab.desc}</span>
                        </div>
                      </button>
                    ))}
                  </div>

                  {/* Right Setup form columns */}
                  <div className="lg:col-span-8 bg-slate-50/50 rounded-2xl border border-gray-150 p-6">
                    
                    {/* Identity Tab section */}
                    {lawyerSubTab === "identity" && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 pb-3 border-b border-gray-100">
                          <div className="h-10 w-10 bg-[#007A5E]/10 rounded-full flex items-center justify-center text-[#007A5E] shrink-0">
                            <Star className="h-5 w-5 fill-[#007A5E]" />
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-gray-900">Professional Identity</span>
                            <span className="block text-[10px] text-gray-400">Fill your supreme court details strictly for public checks.</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Supreme Court Enrollment No</label>
                            <input 
                              type="text"
                              value={lawyerProfile.supremeCourtNo}
                              onChange={(e) => setLawyerProfile({...lawyerProfile, supremeCourtNo: e.target.value})}
                              className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg outline-none focus:border-emerald-600"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Practice State Focus</label>
                            <select
                              value={lawyerProfile.practiceState}
                              onChange={(e) => setLawyerProfile({...lawyerProfile, practiceState: e.target.value})}
                              className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg outline-none"
                            >
                              <option>Lagos [LAG]</option>
                              <option>Abuja [FCT]</option>
                              <option>Kano [KAN]</option>
                              <option>Rivers [PHC]</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Practice Experience (Years)</label>
                            <input 
                              type="number"
                              value={lawyerProfile.experienceYears}
                              onChange={(e) => setLawyerProfile({...lawyerProfile, experienceYears: e.target.value})}
                              className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Upload Practicing Stamp File</label>
                            <div className="p-2 border border-dashed border-gray-200 bg-white rounded-lg text-center cursor-pointer hover:bg-slate-50 text-[10px] text-gray-500 font-semibold flex items-center justify-center gap-1">
                              <Check className="h-3 w-3 text-emerald-600 stroke-[3]" />
                              <span>{lawyerProfile.barLicenseName}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Education Tab section */}
                    {lawyerSubTab === "education" && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 pb-3 border-b border-gray-100">
                          <div className="h-10 w-10 bg-[#007A5E]/10 rounded-full flex items-center justify-center text-[#007A5E] shrink-0">
                            <BookOpen className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-gray-900">Education & Qualifications</span>
                            <span className="block text-[10px] text-gray-400">List your background and degrees accurately.</span>
                          </div>
                        </div>

                        <div className="space-y-3.5">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">University Degree</label>
                            <input 
                              type="text"
                              value={lawyerProfile.degree}
                              onChange={(e) => setLawyerProfile({...lawyerProfile, degree: e.target.value})}
                              className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg outline-none"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Law School Campus</label>
                            <input 
                              type="text"
                              value={lawyerProfile.lawschool}
                              onChange={(e) => setLawyerProfile({...lawyerProfile, lawschool: e.target.value})}
                              className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Fees Tab section */}
                    {lawyerSubTab === "fees" && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 pb-3 border-b border-gray-100">
                          <div className="h-10 w-10 bg-[#007A5E]/10 rounded-full flex items-center justify-center text-[#007A5E] shrink-0">
                            <DollarSign className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-[#007A5E]">Escrow Rate Standard</span>
                            <span className="block text-[10px] text-gray-400">Determine cost standards held safely in platform escrow buffer.</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Counsel Hour Rate (₦)</label>
                            <input 
                              type="number"
                              value={lawyerProfile.hourlyRate}
                              onChange={(e) => setLawyerProfile({...lawyerProfile, hourlyRate: e.target.value})}
                              className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg outline-none font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Fixed Consultation Fee (₦)</label>
                            <input 
                              type="number"
                              value={lawyerProfile.consultFee}
                              onChange={(e) => setLawyerProfile({...lawyerProfile, consultFee: e.target.value})}
                              className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg outline-none font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Availability Tab section */}
                    {lawyerSubTab === "availability" && (
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 pb-3 border-b border-gray-100">
                          <div className="h-10 w-10 bg-[#007A5E]/10 rounded-full flex items-center justify-center text-[#007A5E] shrink-0">
                            <Clock className="h-5 w-5" />
                          </div>
                          <div>
                            <span className="block text-xs font-bold text-gray-900">Virtual Office Hours</span>
                            <span className="block text-[10px] text-gray-400">When can clients call you for consultations?</span>
                          </div>
                        </div>

                        <div className="space-y-3">
                          <div>
                            <span className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-2">Available Practice Days</span>
                            <div className="flex gap-2 flex-wrap text-xs text-gray-650">
                              {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"].map((day) => {
                                const active = lawyerProfile.daysAvailable.includes(day);
                                return (
                                  <button
                                    key={day}
                                    type="button"
                                    onClick={() => {
                                      const updated = active 
                                        ? lawyerProfile.daysAvailable.filter(d => d !== day)
                                        : [...lawyerProfile.daysAvailable, day];
                                      setLawyerProfile({...lawyerProfile, daysAvailable: updated});
                                    }}
                                    className={`py-1.5 px-3 rounded-lg border text-xs font-semibold ${
                                      active ? "bg-[#007A5E] text-white border-transparent" : "bg-white border-gray-200"
                                    }`}
                                  >
                                    {day}
                                  </button>
                                );
                              })}
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">Working Hour Range</label>
                            <input 
                              type="text"
                              value={lawyerProfile.hoursAvailable}
                              onChange={(e) => setLawyerProfile({...lawyerProfile, hoursAvailable: e.target.value})}
                              className="w-full text-xs p-2.5 bg-white border border-gray-200 rounded-lg outline-none"
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row justify-between items-center gap-4">
                      {/* Interactive Next tab button or overall submit */}
                      <span className="text-[10px] text-emerald-800 font-bold tracking-wider uppercase bg-emerald-50 px-2 py-0.5 rounded">
                        ✓ Guarded verification approved
                      </span>

                      <button 
                        onClick={handleCompleteFlow}
                        className="w-full sm:w-auto bg-[#007A5E] hover:bg-emerald-850 text-white font-bold py-3 px-6 rounded-xl text-xs flex items-center justify-center gap-1 cursor-pointer"
                      >
                        Complete Onboarding & View Dashboard
                      </button>
                    </div>

                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* BOTTOM ACCESSIBILITY POLICIES FOOT */}
        <div className="px-8 py-4 border-t border-gray-100 bg-slate-50/50 flex flex-row items-center justify-between text-[10px] text-gray-400 shrink-0">
          <div>
            © 2026 9ja Legal Assistant | Safe Escrow Compliant
          </div>
          <div className="flex gap-4">
            <span className="hover:text-gray-650 cursor-pointer underline" onClick={onBackToHome}>Return to Home</span>
            <span className="hover:text-gray-650 cursor-pointer underline">Security Policy</span>
          </div>
        </div>

      </div>
    </div>
  );
}
