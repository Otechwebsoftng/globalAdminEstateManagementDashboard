import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  X, Check, AlertTriangle, ShieldCheck, Phone, 
  MapPin, Clock, Star, MessageSquare, Copy, Mail, User, Briefcase
} from "lucide-react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 1. SOS Emergency Modal
export function SOSEmergencyModal({ isOpen, onClose }: ModalProps) {
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const contacts = [
    { name: "Emergency Command Center (Lagos)", number: "112", desc: "For urgent security & physical safety threats" },
    { name: "Legal Aid Council of Nigeria", number: "+234 800 435 7787", desc: "Free state-sponsored defense & legal support" },
    { name: "FIDA Nigeria (Women's Rights Support)", number: "+234 803 345 6789", desc: "Federation of Women Lawyers general helpline" },
    { name: "NBA Human Rights Committee Hotline", number: "+234 908 765 4321", desc: "Reporting arbitrary arrests or civil abuse" },
  ];

  const handleCopy = (num: string, idx: number) => {
    navigator.clipboard.writeText(num);
    setCopiedIndex(idx);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />
          
          {/* Card */}
          <motion.div 
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-red-500/20 bg-white shadow-2xl"
          >
            {/* Header Red Banner */}
            <div className="bg-red-600 px-6 py-5 text-white flex items-center gap-3">
              <div className="rounded-full bg-white/20 p-2 text-white animate-pulse">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold font-display">SOS Legal Emergency Help</h3>
                <p className="text-xs text-red-100">Instant Nigerian Legal Aid & Security Helplines</p>
              </div>
              <button 
                onClick={onClose}
                className="absolute top-4 right-4 text-white/80 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Content info */}
            <div className="p-6">
              <p className="text-sm text-gray-600 mb-5 leading-relaxed">
                If you are currently facing immediate detention, arbitrary arrest, or legal harassment in Nigeria, use these verified public-interests and emergency hotlines.
              </p>

              <div className="space-y-3.5">
                {contacts.map((c, idx) => (
                  <div key={idx} className="flex justify-between items-center p-3.5 bg-red-50/50 rounded-xl border border-red-100 hover:border-red-200 transition-all">
                    <div>
                      <h4 className="text-sm font-semibold text-gray-900">{c.name}</h4>
                      <p className="text-xs text-gray-500 mt-0.5">{c.desc}</p>
                      <p className="text-sm font-bold text-red-600 mt-1 font-mono">{c.number}</p>
                    </div>
                    
                    <button 
                      onClick={() => handleCopy(c.number, idx)}
                      className="px-3 py-1.5 text-xs font-semibold bg-white border border-red-200 rounded-lg hover:bg-red-50 text-red-700 transition-colors flex items-center gap-1.5 shadow-sm"
                    >
                      {copiedIndex === idx ? (
                        <>
                          <Check className="h-3.5 w-3.5 text-green-600" />
                          <span className="text-green-700 font-medium">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-3.5 w-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                ))}
              </div>

              <div className="mt-6 flex flex-col gap-2.5">
                <a 
                  href="tel:112"
                  className="w-full bg-red-600 text-white text-center py-3 font-semibold rounded-xl hover:bg-red-700 active:scale-[0.99] transition-all shadow-md shadow-red-200 flex items-center justify-center gap-2"
                >
                  <Phone className="h-4 w-4" />
                  Dial Universal Emergency (112)
                </a>
                <button 
                  onClick={onClose}
                  className="w-full text-center py-2 text-xs font-medium text-gray-500 hover:text-gray-800 transition-all"
                >
                  Dismiss Emergency Notice
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// 2. Join Waitlist Modal
export function JoinWaitlistModal({ isOpen, onClose }: ModalProps) {
  const [userType, setUserType] = useState<"client" | "lawyer">("client");
  const [formState, setFormState] = useState({ name: "", email: "", phone: "", location: "Lagos", focus: "CAC & Corporate" });
  const [submitted, setSubmitted] = useState(false);

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormState({ ...formState, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.email || !formState.phone) return;
    setSubmitted(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div 
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl border border-emerald-50"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
            >
              <X className="h-5 w-5" />
            </button>

            {!submitted ? (
              <form onSubmit={handleSubmit} className="p-7">
                <div className="text-center mb-6">
                  <div className="inline-flex items-center justify-center bg-emerald-50 text-emerald-700 p-2.5 rounded-full mb-3">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 font-display">Join 9ja Legal Waitlist</h3>
                  <p className="text-xs text-gray-500 mt-1">Get early access & special launch pricing schedules</p>
                </div>

                {/* Account Type Tab */}
                <div className="grid grid-cols-2 p-1 bg-gray-100 rounded-xl mb-5">
                  <button
                    type="button"
                    onClick={() => setUserType("client")}
                    className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      userType === "client" ? "bg-white text-emerald-800 shadow" : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    <User className="h-3.5 w-3.5" />
                    I need legal help
                  </button>
                  <button
                    type="button"
                    onClick={() => setUserType("lawyer")}
                    className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                      userType === "lawyer" ? "bg-white text-emerald-800 shadow" : "text-gray-500 hover:text-gray-800"
                    }`}
                  >
                    <Briefcase className="h-3.5 w-3.5" />
                    I am a lawyer
                  </button>
                </div>

                {/* Form fields */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Full Name</label>
                    <input 
                      required 
                      type="text" 
                      name="name"
                      placeholder="e.g. Chinedu Okafor"
                      value={formState.name}
                      onChange={handleFormChange}
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Email Address</label>
                    <input 
                      required 
                      type="email" 
                      name="email"
                      placeholder="e.g. chinedu@example.com"
                      value={formState.email}
                      onChange={handleFormChange}
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">WhatsApp / Phone Number</label>
                    <input 
                      required 
                      type="tel" 
                      name="phone"
                      placeholder="e.g. +234 80 1234 5678"
                      value={formState.phone}
                      onChange={handleFormChange}
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all font-sans"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">State Location</label>
                      <select 
                        name="location" 
                        value={formState.location}
                        onChange={handleFormChange}
                        className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-white outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-sans"
                      >
                        <option>Lagos</option>
                        <option>Abuja (FCT)</option>
                        <option>Rivers (PH)</option>
                        <option>Kano</option>
                        <option>Oyo (Ibadan)</option>
                        <option>Enugu</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-gray-600 mb-1">
                        {userType === "client" ? "Core Area Needed" : "Practice Area"}
                      </label>
                      <select 
                        name="focus" 
                        value={formState.focus}
                        onChange={handleFormChange}
                        className="w-full text-sm px-3 py-2.5 rounded-xl border border-gray-200 bg-white outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 font-sans"
                      >
                        <option>CAC & Registration</option>
                        <option>Property Verification</option>
                        <option>Vehicle Documentation</option>
                        <option>Contract Strategy</option>
                        <option>Family & Will Counsel</option>
                        <option>Litigation Support</option>
                      </select>
                    </div>
                  </div>
                </div>

                <button 
                  type="submit"
                  className="w-full mt-6 bg-[#007A5E] text-white py-3.5 font-semibold rounded-xl hover:bg-[#005f48] active:scale-[0.99] transition-all shadow-md shadow-emerald-100/50 flex items-center justify-center gap-2"
                >
                  <Check className="h-4.5 w-4.5" />
                  Request Access as {userType === "client" ? "Client" : "Lawyer"}
                </button>

                <p className="text-[10px] text-gray-400 text-center mt-3.5">
                  By joining, you agree to receive launch announcements and legal guidelines. Secure Escrow guaranteed.
                </p>
              </form>
            ) : (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-8 text-center"
              >
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 mb-5">
                  <Check className="h-8 w-8" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 font-display">You're On The List!</h3>
                <p className="text-sm text-gray-600 mt-2 leading-relaxed max-w-xs mx-auto">
                  Thank you, <b>{formState.name}</b>! We've registered you as a prioritized <b>{userType}</b> on 9ja Legal Assistant.
                </p>

                <div className="my-5 p-4 rounded-xl bg-emerald-50/50 border border-emerald-100 text-left text-xs text-emerald-800 space-y-1.5">
                  <div>• <b>Position:</b> 1700+ Early Backer Queue</div>
                  <div>• <b>State Focus:</b> {formState.location}</div>
                  <div>• <b>Category:</b> {formState.focus}</div>
                  <div>• <b>Email:</b> {formState.email}</div>
                </div>

                <p className="text-xs text-gray-400">
                  We've sent a verified reservation token to your email with a free Nigerian business legal checklist!
                </p>

                <button
                  onClick={() => {
                    setSubmitted(false);
                    onClose();
                  }}
                  className="w-full mt-6 bg-gray-100 hover:bg-gray-200 text-gray-700 py-3 font-semibold rounded-xl text-sm transition-all"
                >
                  Return To App
                </button>
              </motion.div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// 3. Find Lawyer Search Modal
export function FindLawyerModal({ isOpen, onClose, initialCategory = "All" }: ModalProps & { initialCategory?: string }) {
  const [selectedCat, setSelectedCat] = useState(initialCategory);
  const [selectedState, setSelectedState] = useState("Lagos (LAG)");
  const [isBooked, setIsBooked] = useState<string | null>(null);

  const mockLawyers = [
    {
      id: "law-1",
      name: "Barr. Adenike Balogun",
      role: "Senior Corporate Attorney",
      exp: "9 Years Exp",
      location: "Ikoyi, Lagos",
      stars: 4.9,
      reviews: "142 client reviews",
      specialty: "CAC & Corporate",
      price: "#25,000 / Consult",
      tags: ["Transparent Admin", "Quick Filer"],
      imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: "law-2",
      name: "Barr. Chidi Obi-Nwachukwu",
      role: "Real Estate & Land Spec",
      exp: "12 Years Exp",
      location: "Wuse 2, Abuja",
      stars: 5.0,
      reviews: "189 client reviews",
      specialty: "Property Verification",
      price: "#35,000 / Consult",
      tags: ["Escrow Audit Expert", "Deed Specialist"],
      imageUrl: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=400&auto=format&fit=crop"
    },
    {
      id: "law-3",
      name: "Barr. Ibrahim Yusuf",
      role: "Family Estate & Wills Counsel",
      exp: "7 Years Exp",
      location: "Nasirawa, Kano",
      stars: 4.8,
      reviews: "93 client reviews",
      specialty: "Family & Personal Law",
      price: "#20,000 / Consult",
      tags: ["Discretion Guaranteed", "Arbitration Expert"],
      imageUrl: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=400&auto=format&fit=crop"
    }
  ];

  const filtered = mockLawyers.filter(l => {
    if (selectedCat === "All") return true;
    if (selectedCat.toLowerCase().includes("cac") && l.specialty.includes("CAC")) return true;
    if (selectedCat.toLowerCase().includes("property") && l.specialty.includes("Property")) return true;
    if (selectedCat.toLowerCase().includes("family") && l.specialty.includes("Family")) return true;
    return true; // default fallback
  });

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div 
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            className="relative w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl flex flex-col max-h-[90vh]"
          >
            {/* Header */}
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="text-xl font-bold text-gray-900 font-display">Verified 9ja Legal Experts</h3>
                <p className="text-xs text-gray-500 mt-1">Select and request secure escrow-backed legal consultation</p>
              </div>
              <button onClick={onClose} className="rounded-lg p-1.5 hover:bg-gray-100 text-gray-400 hover:text-gray-700 transition-colors">
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Selection bar */}
            <div className="p-4 grid grid-cols-2 gap-3 bg-white border-b border-gray-100">
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Select Practice Area</label>
                <select 
                  value={selectedCat} 
                  onChange={(e) => setSelectedCat(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-lg border border-gray-200 bg-white"
                >
                  <option value="All">All Categories</option>
                  <option value="CAC">CAC Business Incorporation</option>
                  <option value="Property">Property & Land Verification</option>
                  <option value="Family">Family Estate Law & Dispute</option>
                </select>
              </div>
              <div>
                <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">State Focus</label>
                <select 
                  value={selectedState} 
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full text-xs font-semibold p-2.5 rounded-lg border border-gray-200 bg-white"
                >
                  <option>Lagos (LAG)</option>
                  <option>Abuja (FCT)</option>
                  <option>Kano State</option>
                  <option>Rivers State</option>
                </select>
              </div>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {filtered.map((l) => (
                <div key={l.id} className="p-5 border border-gray-150 rounded-2xl flex flex-col md:flex-row gap-5 hover:border-emerald-300 transition-all shadow-sm">
                  {/* Photo */}
                  <div className="w-16 h-16 md:w-24 md:h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0 relative">
                    <img referrerPolicy="no-referrer" src={l.imageUrl} alt={l.name} className="w-full h-full object-cover" />
                    <div className="absolute bottom-1 right-1 bg-emerald-600 text-white p-0.5 rounded-full">
                      <ShieldCheck className="w-3.5 h-3.5" />
                    </div>
                  </div>

                  {/* Body info */}
                  <div className="flex-1">
                    <div className="flex items-start justify-between flex-wrap gap-2">
                      <div>
                        <h4 className="text-md font-bold text-gray-900">{l.name}</h4>
                        <p className="text-xs font-semibold text-emerald-700">{l.role}</p>
                      </div>
                      <div className="flex items-center gap-1 bg-amber-50 rounded-lg px-2 py-1 text-xs font-bold text-amber-700">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>{l.stars}</span>
                        <span className="text-gray-400 text-[10px] font-medium">({l.exp})</span>
                      </div>
                    </div>

                    <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" /> {l.location} • <Clock className="w-3.5 h-3.5 text-gray-400 ml-1" /> Ready this week
                    </p>

                    {/* Tags */}
                    <div className="flex items-center gap-1.5 mt-3 flex-wrap">
                      {l.tags.map((t, i) => (
                        <span key={i} className="text-[10px] font-semibold tracking-wider uppercase px-2.5 py-1 bg-gray-100 text-gray-600 rounded">
                          {t}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Booking Section */}
                  <div className="md:w-44 border-t md:border-t-0 md:border-l border-gray-100 pt-4 md:pt-0 md:pl-5 flex flex-col justify-between items-center text-center">
                    <div>
                      <p className="text-[10px] font-bold text-gray-450 uppercase">Escrow Rate</p>
                      <h5 className="text-base font-bold text-gray-900 mt-1">{l.price}</h5>
                      <p className="text-[9px] text-[#007A5E] font-semibold mt-0.5">Payment safety on delivery</p>
                    </div>

                    {isBooked === l.id ? (
                      <div className="w-full mt-4 bg-emerald-50 border border-emerald-100 rounded-xl py-2 px-3 text-emerald-800 text-[11px] font-semibold flex items-center justify-center gap-1">
                        <Check className="h-3 w-3 stroke-[3]" /> Request Pending
                      </div>
                    ) : (
                      <button
                        onClick={() => setIsBooked(l.id)}
                        className="w-full mt-4 bg-[#007A5E] hover:bg-[#005f48] text-white font-semibold py-2 rounded-xl text-xs transition-colors flex items-center justify-center gap-1"
                      >
                        <MessageSquare className="w-3 h-3" /> Book Consultation
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {filtered.length === 0 && (
                <div className="text-center py-12 text-gray-400">
                  <p className="text-sm font-medium">No direct match available in {selectedCat} yet.</p>
                  <p className="text-xs text-gray-500 mt-2">Try choosing "All Categories" or switch your State filter.</p>
                </div>
              )}
            </div>

            {/* Bottom Alert bar */}
            <div className="p-4 bg-emerald-50/50 border-t border-emerald-100 flex items-center gap-2.5 text-xs text-emerald-800">
              <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0" />
              <span><b>Secured Escrow Guard:</b> All legal fees are held in safe escrow and only paid to lawyers upon successful task verification.</span>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

// 4. Custom Workflow Service Modal (for our direct legal hub workflow orders)
interface ServiceWorkflowProps extends ModalProps {
  title: string;
  placeholderText: string;
  fieldLabel: string;
}

export function ServiceWorkflowModal({ isOpen, onClose, title, placeholderText, fieldLabel }: ServiceWorkflowProps) {
  const [desc, setDesc] = useState("");
  const [phone, setPhone] = useState("");
  const [ordered, setOrdered] = useState(false);

  const handleOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (!desc || !phone) return;
    setOrdered(true);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
          />

          <motion.div 
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <button 
              onClick={onClose}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {!ordered ? (
              <form onSubmit={handleOrder} className="p-7">
                <div className="mb-5">
                  <span className="text-[10px] font-bold bg-emerald-50 text-[#007A5E] uppercase tracking-widest px-2.5 py-1 rounded">
                    Verified Digital Workflow
                  </span>
                  <h3 className="text-xl font-bold text-gray-900 font-display mt-2">{title}</h3>
                  <p className="text-xs text-gray-500 mt-1">Get immediate advice and direct professional filing services</p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">{fieldLabel}</label>
                    <input 
                      required
                      type="text"
                      value={desc}
                      onChange={(e) => setDesc(e.target.value)}
                      placeholder={placeholderText}
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all font-sans"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">Upload Supporting Document (Optional)</label>
                    <div className="border border-dashed border-gray-200 rounded-xl p-4 text-center hover:bg-gray-50 transition-colors cursor-pointer">
                      <p className="text-xs text-gray-500 font-medium">Drag and drop file here, or click to browse</p>
                      <p className="text-[10px] text-gray-400 mt-1">PDF, JPG, PNG up to 10MB</p>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-gray-600 mb-1">WhatsApp phone number for updates</label>
                    <input 
                      required
                      type="tel"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +234 803 111 2222"
                      className="w-full text-sm px-3.5 py-2.5 rounded-xl border border-gray-200 outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 transition-all font-sans"
                    />
                  </div>

                  <div className="p-3 bg-amber-50 rounded-xl border border-amber-100 flex items-start gap-2.5">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-amber-800 leading-normal">
                      <b>Escrow Payment Security:</b> Once submitted, we will match you with a vetted lawyer. The starting fee is held securely in escrow.
                    </p>
                  </div>
                </div>

                <div className="mt-6 flex gap-3">
                  <button 
                    type="button" 
                    onClick={onClose}
                    className="flex-1 bg-gray-50 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-100 text-xs transition-colors"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit"
                    className="flex-1 bg-[#007A5E] hover:bg-[#005f48] text-white py-3 rounded-xl font-semibold text-xs transition-colors shadow-lg shadow-emerald-100"
                  >
                    Submit Secure Request
                  </button>
                </div>
              </form>
            ) : (
              <div className="p-8 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-emerald-800 mb-4 animate-bounce">
                  <Check className="h-7 w-7" />
                </div>
                <h3 className="text-lg font-bold text-gray-900 font-display">Filing Dispatch Process Started</h3>
                <p className="text-xs text-gray-600 mt-2 leading-relaxed">
                  Your request for <b>{desc}</b> has been queued. We are pairing you with a specialized attorney in Lagos command.
                </p>

                <div className="my-4 p-3 bg-slate-50 rounded-xl text-left text-[11px] text-gray-600 border border-gray-100">
                  <div className="font-semibold text-emerald-800 mb-1">Next Escrow Safeguard Steps:</div>
                  <div>1. Attorney reviews details (usually under 2 hours).</div>
                  <div>2. You approve starting scope.</div>
                  <div>3. Funds are deposited into verified secure escrow.</div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    setOrdered(false);
                    onClose();
                  }}
                  className="w-full mt-4 bg-gray-900 text-white hover:bg-black py-2.5 text-xs font-semibold rounded-xl transition-all"
                >
                  Return
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
