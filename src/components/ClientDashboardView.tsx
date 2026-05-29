import React, { useState, useEffect } from "react";
import { 
  Building2, HardHat, FileText, Scale, HandIcon, ShieldCheck, 
  Send, MessageSquare, Plus, Clock, AlertTriangle, ArrowRight, Check,
  User, Award, RefreshCw, Sparkles, X, MapPin, Download, CheckSquare, Upload, Phone
} from "lucide-react";

interface ClientDashboardProps {
  onLogout: () => void;
  openEmergency: () => void;
}

interface Message {
  sender: "client" | "lawyer";
  text: string;
  time: string;
}

export default function ClientDashboardView({ onLogout, openEmergency }: ClientDashboardProps) {
  // Escrow state simulation
  const [escrowReleased, setEscrowReleased] = useState(false);
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);
  
  // Custom File Uploader simulation
  const [attachments, setAttachments] = useState<string[]>(["Directors_ID_Card.jpg"]);
  const [isUploading, setIsUploading] = useState(false);

  // Chat Simulator states
  const [chatMessage, setChatMessage] = useState("");
  const [chatLog, setChatLog] = useState<Message[]>([
    { sender: "lawyer", text: "Hello! I am Barr. Adenike Balogun, your matched Corporate Specialist. I have reserved the name 'Okafor Tech Ventures' successfully with the CAC. Have you uploaded your ID Card?", time: "09:30 AM" }
  ]);
  const [lawyerIsTyping, setLawyerIsTyping] = useState(false);

  const simulateLawyerResponse = (clientMsg: string) => {
    setLawyerIsTyping(true);
    setTimeout(() => {
      setLawyerIsTyping(false);
      let responseText = "Understood. I've logged that. I am currently aligning the Memorandum of Association. Let me know if you would like me to draft your partnership deed next!";
      
      const lower = clientMsg.toLowerCase();
      if (lower.includes("cac") || lower.includes("company") || lower.includes("name")) {
        responseText = "Great! The CAC registration usually takes 3 to 5 working days in total. Once you approve the reserved name certificate, we will submit the tax registration.";
      } else if (lower.includes("id") || lower.includes("document") || lower.includes("upload")) {
        responseText = "Perfect, I can see the ID in the escrow portal. I will proceed to sign off on the regulatory stamps immediately.";
      } else if (lower.includes("emergency") || lower.includes("arrest") || lower.includes("police")) {
        responseText = "If this is a civil crisis, please click the Red SOS Button right now to access the direct state aid lines! I can also coordinate free state legal defense.";
      }

      setChatLog(prev => [
        ...prev,
        { sender: "lawyer", text: responseText, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
      ]);
    }, 1500);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;
    
    const userMsg = chatMessage;
    setChatLog(prev => [
      ...prev,
      { sender: "client", text: userMsg, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
    ]);
    setChatMessage("");
    simulateLawyerResponse(userMsg);
  };

  // Mock Upload simulation
  const handleUploadFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const fileName = e.target.files[0].name;
      setIsUploading(true);
      setTimeout(() => {
        setAttachments(prev => [...prev, fileName]);
        setIsUploading(false);
        // Instant lawyer feedback
        setChatLog(prev => [
          ...prev,
          { sender: "lawyer", text: `Thanks for uploading '${fileName}'! I've updated the filing bundle.`, time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }
        ]);
      }, 1200);
    }
  };

  return (
    <div className="bg-slate-50 min-h-screen py-8 px-4 font-sans">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* TOP COMPACT TITLE HEADER & SUMMARY */}
        <div className="bg-white rounded-2xl border border-gray-150 p-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-[#007A5E] to-emerald-700 text-white flex items-center justify-center shadow">
              <User className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[10px] bg-emerald-50 text-[#007A5E] font-extrabold uppercase px-2.5 py-0.5 rounded tracking-wider">
                Active Client Portal
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-display mt-1">
                Welcome back, Chinedu
              </h1>
              <p className="text-xs text-gray-500 font-medium">
                Monitor your business formation and property checks under protected escrow standards.
              </p>
            </div>
          </div>

          <div className="flex gap-3 shrink-0">
            <button
              onClick={openEmergency}
              className="bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold px-4 py-2.5 rounded-xl border border-rose-200 transition-colors flex items-center gap-1.5"
            >
              <AlertTriangle className="h-4 w-4 text-rose-600 animate-pulse" />
              <span>SOS Emergency</span>
            </button>
            <button
              onClick={onLogout}
              className="text-gray-500 hover:text-gray-800 text-xs font-semibold px-3 py-2.5 border border-gray-200 hover:bg-slate-50 rounded-xl transition-colors"
            >
              Sign Out
            </button>
          </div>
        </div>

        {/* METRIC BANNER CHIPS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          <div className="p-5 bg-white rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Active Files</span>
              <span className="text-xl font-black text-slate-950 block mt-1">1 Case File</span>
              <span className="text-[10px] text-emerald-800 font-semibold mt-0.5 block flex items-center gap-1">
                ● CAC Corporate Setup
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-700 flex items-center justify-center">
              <Building2 className="h-5.5 w-5.5" />
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Escrow Buffer Held</span>
              <span className="text-xl font-black text-slate-950 block mt-1">
                {escrowReleased ? "₦0.00" : "₦55,000.00"}
              </span>
              <span className="text-[10px] text-gray-450 font-medium mt-0.5 block">
                {escrowReleased ? "Funds disbursed to Lawyer" : "Held in safe secure transit"}
              </span>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="h-5.5 w-5.5" />
            </div>
          </div>

          <div className="p-5 bg-white rounded-2xl border border-gray-150 shadow-sm flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block">Allocated Partner</span>
              <span className="text-sm font-bold text-slate-950 block mt-1.5">Barr. A. Balogun</span>
              <span className="text-[10px] text-[#007A5E] font-bold mt-0.5 block">
                ⭐ 4.9 Rating • 9 Yrs Exp
              </span>
            </div>
            <div className="w-10 h-10 rounded-xl overflow-hidden shrink-0">
              <img referrerPolicy="no-referrer" src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=300" className="w-full h-full object-cover" />
            </div>
          </div>

          <div className="p-5 bg-gradient-to-br from-[#007A5E] to-emerald-800 text-white rounded-2xl shadow flex items-center justify-between">
            <div>
              <span className="text-[10px] font-bold text-emerald-250 uppercase tracking-widest block">Your Free Checklist</span>
              <span className="text-xs font-bold block mt-1.5 leading-tight">Nigerian SME Safety Compliance</span>
              <button className="text-[10px] text-white underline mt-1.5 font-bold flex items-center gap-1">
                <Download className="h-3 w-3" /> Get PDF Guide
              </button>
            </div>
            <div className="h-10 w-10 rounded-xl bg-white/10 text-emerald-200 flex items-center justify-center">
              <Award className="h-5.5 w-5.5" />
            </div>
          </div>

        </div>

        {/* CENTRAL TWIN PANELS: active case progress tracker and live consult chat */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
          
          {/* LEFT: Case Progress Tracker & Request Filing (Active Milestones) */}
          <div className="lg:col-span-7 flex flex-col justify-between space-y-8">
            
            {/* Active Transaction / Milestones Card */}
            <div className="bg-white rounded-3xl border border-gray-150 p-6 flex-1 flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center pb-4 border-b border-gray-100 flex-wrap gap-2">
                  <div>
                    <span className="text-[10px] font-bold bg-amber-50 text-amber-700 uppercase tracking-wider px-2 py-0.5 rounded">
                      In-Progress File Registry
                    </span>
                    <h3 className="text-md font-bold text-slate-950 mt-1">
                      CAC Business Incorporation: Okafor Tech Ventures
                    </h3>
                  </div>
                  <span className="text-xs font-bold text-gray-500 font-mono">ID: SCN-995-CAC</span>
                </div>

                {/* Milestone Progress bar */}
                <div className="my-6">
                  <div className="flex justify-between text-xs font-bold text-gray-700 mb-1.5">
                    <span>Filing Milestone Stage</span>
                    <span className="text-[#007A5E]">60% Complete</span>
                  </div>
                  <div className="h-2.5 bg-gray-105 rounded-full overflow-hidden flex">
                    <div className="bg-[#007A5E] rounded-full h-full transition-all" style={{ width: "60%" }} />
                  </div>
                </div>

                {/* Vertical Tracker Process List */}
                <div className="space-y-4">
                  
                  <div className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 text-xs font-bold">
                      ✓
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-gray-900 leading-none">Step 1: Reserve Company Business Name</span>
                      <span className="block text-[10px] text-[#007A5E] font-semibold mt-1">Status: Approved & Secured</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 text-xs font-bold animate-pulse">
                      ●
                    </div>
                    <div>
                      <span className="block text-xs font-bold text-gray-950 leading-none">Step 2: Sign Corporate Incorporation Forms</span>
                      <span className="block text-[10px] text-gray-500 mt-1">Pending client upload checking of national ID cards / Director details.</span>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <div className="h-6 w-6 rounded-full bg-gray-100 text-gray-400 flex items-center justify-center shrink-0 text-xs font-bold">
                      3
                    </div>
                    <div>
                      <span className="block text-xs font-semibold text-gray-400 leading-none">Step 3: CAC Submission & Tax Register Filing</span>
                      <span className="block text-[10px] text-gray-400 mt-1">Triggers upon sign-off form compilation. Full certification will dispatch.</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Action buttons on transaction */}
              <div className="mt-8 pt-5 border-t border-gray-100 bg-slate-50/40 -mx-6 -mb-6 p-6 rounded-b-3xl">
                <div className="flex justify-between items-center flex-wrap gap-4">
                  <div className="text-xs text-gray-500 leading-relaxed font-sans max-w-sm">
                    {escrowReleased ? (
                      <span className="text-emerald-800 font-bold block flex items-center gap-1">
                        ✓ Escrow Released. Your attorney has received the funds.
                      </span>
                    ) : (
                      <span>Funds are held safely in 9ja Legal escrow buffer. Instruct payout when happy with complete job.</span>
                    )}
                  </div>
                  
                  <div className="flex gap-2">
                    {!escrowReleased && (
                      <button 
                        onClick={() => {
                          const confirmPay = window.confirm("Are you sure you want to release the escrow payment of ₦55,000.00 to Barr. Adenike Balogun? Proceed only if you confirm delivery.");
                          if (confirmPay) {
                            setEscrowReleased(true);
                            // Log in chat
                            setChatLog(prev => [
                              ...prev,
                              { sender: "lawyer", text: "Wow, thank you Chinedu! Payment received from Escrow buffer. I will finalize tax registration and dispatch via DHL today.", time: "Just now" }
                            ]);
                          }
                        }}
                        className="bg-[#007A5E] hover:bg-[#005f48] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all cursor-pointer shadow-sm hover:shadow"
                      >
                        Release Escrow Payout
                      </button>
                    )}
                    <button className="bg-white border border-gray-200 hover:bg-slate-50 text-slate-800 text-xs font-semibold px-3 py-2 rounded-xl transition-colors">
                      Download Receipt
                    </button>
                  </div>
                </div>
              </div>

            </div>

            {/* Request Filing options cards grid */}
            <div className="bg-white rounded-3xl border border-gray-150 p-6">
              <span className="text-[10px] font-bold text-[#007A5E] uppercase tracking-wider block">Want to file another request?</span>
              <h4 className="text-base font-black text-slate-900 font-display mt-0.5">Instant Professional Compliance Hub</h4>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 mt-4">
                
                <button 
                  onClick={() => setActiveWorkflow("cac")}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-gray-150 text-left transition-colors flex flex-col justify-between h-[115px]"
                >
                  <Building2 className="h-5 w-5 text-[#007A5E]" />
                  <div>
                    <span className="block text-xs font-bold text-gray-900 leading-tight">Additional CAC Filing</span>
                    <span className="block text-[9px] text-gray-400 mt-1">Ltd Shares, partnership, or NGO setups.</span>
                  </div>
                </button>

                <button 
                  onClick={() => setActiveWorkflow("land")}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-gray-150 text-left transition-colors flex flex-col justify-between h-[115px]"
                >
                  <MapPin className="h-5 w-5 text-[#007A5E]" />
                  <div>
                    <span className="block text-xs font-bold text-gray-900 leading-tight">Property Verification</span>
                    <span className="block text-[9px] text-gray-400 mt-1">Verify titles, deed surveys & land audits.</span>
                  </div>
                </button>

                <button 
                  onClick={() => setActiveWorkflow("will")}
                  className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border border-gray-150 text-left transition-colors flex flex-col justify-between h-[115px]"
                >
                  <FileText className="h-5 w-5 text-[#007A5E]" />
                  <div>
                    <span className="block text-xs font-bold text-gray-900 leading-tight">Wills & Personal Deed</span>
                    <span className="block text-[9px] text-gray-400 mt-1">Discreet inheritance, trust & estate strategies.</span>
                  </div>
                </button>

              </div>
            </div>

          </div>

          {/* RIGHT: Vetted Attorney Messaging Box */}
          <div className="lg:col-span-5 bg-white rounded-3xl border border-gray-150 overflow-hidden flex flex-col h-[520px] lg:h-auto shadow-sm">
            
            {/* Chat header */}
            <div className="p-4 border-b border-gray-100 bg-slate-50/50 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="relative w-9 h-9 rounded-xl overflow-hidden bg-gray-100">
                  <img src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?q=80&w=200" className="w-full h-full object-cover" />
                  <span className="absolute bottom-0 right-0 h-2.5 w-2.5 bg-green-500 border-2 border-white rounded-full" />
                </div>
                <div>
                  <h4 className="text-xs font-black text-gray-900">Barr. Adenike Balogun</h4>
                  <p className="text-[10px] text-emerald-800 font-bold flex items-center gap-1 leading-none mt-0.5">
                    ● Premium Active Matched Partner
                  </p>
                </div>
              </div>

              <div className="bg-white border border-gray-150 text-[10px] font-bold text-gray-505 px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1 font-mono">
                <Clock className="h-3.5 w-3.5 text-[#007A5E]" />
                <span>Response in minutes</span>
              </div>
            </div>

            {/* Message screen logs */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-50/30">
              
              {chatLog.map((m, idx) => (
                <div key={idx} className={`flex ${m.sender === "client" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-xs leading-relaxed ${
                    m.sender === "client" 
                      ? "bg-[#007A5E] text-white rounded-br-none" 
                      : "bg-white text-gray-950 border border-gray-150 rounded-bl-none shadow-sm"
                  }`}>
                    <p>{m.text}</p>
                    <span className={`block text-[8px] mt-1 text-right font-mono ${m.sender === "client" ? "text-emerald-100" : "text-gray-400"}`}>
                      {m.time}
                    </span>
                  </div>
                </div>
              ))}

              {lawyerIsTyping && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-400 border border-gray-150 p-2.5 rounded-xl rounded-bl-none text-[10px] italic flex items-center gap-2">
                    <RefreshCw className="h-3 w-3 animate-spin text-[#007A5E]" />
                    <span>Barrister Adenike is tying instructions...</span>
                  </div>
                </div>
              )}

            </div>

            {/* Sandbox Case Document Attachments board inside messenger */}
            <div className="px-4 py-2 border-t border-gray-100 bg-slate-50 flex items-center justify-between flex-wrap gap-2 text-xs">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest block">Core Documents:</span>
                {attachments.map((file, i) => (
                  <div key={i} className="bg-white border border-gray-200 text-[10px] font-semibold text-gray-650 px-2.5 py-1 rounded-md shadow-sm flex items-center gap-1 max-w-[150px] truncate">
                    <CheckSquare className="h-3 w-3 text-emerald-600 shrink-0" />
                    <span className="truncate">{file}</span>
                  </div>
                ))}
                {isUploading && (
                  <span className="text-[9px] text-[#007A5E] font-bold animate-pulse">Uploading file...</span>
                )}
              </div>

              {/* Upload action button */}
              <label className="text-[10px] bg-white border border-emerald-250 hover:bg-emerald-50 text-emerald-800 font-bold px-2 px-1 py-1 rounded-md shadow-sm cursor-pointer transition-colors flex items-center gap-1 shrink-0">
                <Upload className="h-3 w-3" />
                <span>Upload Document</span>
                <input type="file" className="hidden" onChange={handleUploadFile} accept=".pdf,.png,.jpg,.jpeg" />
              </label>
            </div>

            {/* Chat message input form */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-gray-150 bg-white flex items-center gap-2">
              <input 
                type="text"
                placeholder="Type your reply to your barrister..."
                value={chatMessage}
                onChange={(e) => setChatMessage(e.target.value)}
                className="flex-1 text-xs px-3 py-2.5 bg-slate-50 border border-gray-150 outline-none rounded-xl focus:bg-white focus:border-emerald-600 transition-colors"
              />
              <button 
                type="submit"
                className="bg-[#007A5E] hover:bg-emerald-850 p-2.5 text-white rounded-xl transition-colors shrink-0 cursor-pointer"
              >
                <Send className="h-4 w-4" />
              </button>
            </form>

          </div>

        </div>

        {/* WORKFLOW SIMULATION MODAL SUBSETS */}
        {activeWorkflow && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-3xl max-w-md w-full p-6 border border-gray-150 shadow-2xl relative">
              <button 
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
                onClick={() => setActiveWorkflow(null)}
              >
                <X className="h-5 w-5" />
              </button>

              <div className="mb-4">
                <span className="text-[9px] font-bold bg-[#007A5E]/10 text-[#007A5E] uppercase px-2.5 py-1 rounded block w-max">
                  Verified Compliance Workflow
                </span>
                <h3 className="text-base font-bold text-gray-950 mt-2 font-display">
                  {activeWorkflow === "cac" && "Request Additional Limited CAC Filing"}
                  {activeWorkflow === "land" && "Order Verified Property Land Registry Check"}
                  {activeWorkflow === "will" && "Initiate Inheritance Legal Strategy Setup"}
                </h3>
                <p className="text-xs text-gray-500 mt-1">
                  Connect with vetted command specialists instantly. Escrow payout only on completion.
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">
                    {activeWorkflow === "cac" && "Company/Partnership Name Preferred"}
                    {activeWorkflow === "land" && "Parcel Plot Location & LGA Coordinate Address"}
                    {activeWorkflow === "will" && "Preferred Personal Next of Kin Entity Name"}
                  </label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Acme Tech Solutions LLC / Plot 49 Lekki Phase 1" 
                    className="w-full text-xs p-2.5 bg-slate-50 border border-gray-150 rounded-lg outline-none focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1">State Target</label>
                  <select className="w-full text-xs p-2.5 bg-slate-50 border border-gray-150 rounded-lg outline-none">
                    <option>Lagos State</option>
                    <option>Abuja (FCT)</option>
                    <option>Rivers (Port Harcourt)</option>
                    <option>Kano City</option>
                  </select>
                </div>

                <div className="p-3 bg-amber-50 rounded-xl text-[10px] text-amber-800 flex items-start gap-2 border border-amber-100">
                  <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                  <span>
                    Your request starting cost is calculated based on legal escrow tables. Deposit guarantees safety.
                  </span>
                </div>
              </div>

              <div className="mt-6 flex gap-3">
                <button 
                  onClick={() => setActiveWorkflow(null)}
                  className="flex-1 py-2.5 text-xs bg-gray-50 text-gray-700 hover:bg-gray-100 font-bold rounded-xl"
                >
                  Cancel
                </button>
                <button 
                  onClick={() => {
                    alert("Filing Request successfully queued! Barr. Adenike will update your legal dashboard shortly.");
                    setActiveWorkflow(null);
                  }}
                  className="flex-1 py-2.5 text-xs bg-[#007A5E] hover:bg-[#005f48] text-white font-bold rounded-xl shadow-sm"
                >
                  Initiate Filing Workflow
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
