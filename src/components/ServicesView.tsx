import React, { useState } from "react";
import { 
  Building2, Home, FileClock, ShieldCheck, Search, ChevronDown, Check,
  AlertOctagon, Plus, Minus, ArrowRight, ShieldAlert, FileText, HeartHandshake, HelpCircle, GraduationCap
} from "lucide-react";

interface ServicesViewProps {
  openWaitlist: () => void;
  openEmergency: () => void;
  onSelectServiceWorkflow: (title: string, label: string, placeholder: string) => void;
  openFindLawyer: (category: string) => void;
}

export default function ServicesView({ openWaitlist, openEmergency, onSelectServiceWorkflow, openFindLawyer }: ServicesViewProps) {
  const [selectedCategory, setSelectedCategory] = useState("CAC Registration");
  const [selectedState, setSelectedState] = useState("Lagos [LAG]");

  // Interactive FAQ accordion state
  const [faqOpen, setFaqOpen] = useState<{ [key: number]: boolean }>({
    1: true,
    2: false,
    3: false
  });

  const toggleFaq = (idx: number) => {
    setFaqOpen({ ...faqOpen, [idx]: !faqOpen[idx] });
  };

  const handleSearch = () => {
    openFindLawyer(selectedCategory);
  };

  const serviceCards = [
    {
      num: "01",
      title: "CAC Registration",
      desc: "Register your business quickly with expert guidance and corporate strategy filings in Nigeria.",
      buttonText: "Start Registration",
      fieldLabel: "Proposed Business Name",
      placeholder: "e.g. Sterling Fintech Ventures Limited",
      iconName: "building"
    },
    {
      num: "02",
      title: "Property Verification",
      desc: "Verify land titles, C of O, and search registry records across Lagos and Abuja state lands.",
      buttonText: "Verify Property",
      fieldLabel: "Property Plot & Registration State",
      placeholder: "e.g. Block 7, Aloko Estate, Abuja Phase 2",
      iconName: "home"
    },
    {
      num: "03",
      title: "Vehicle Documentation",
      desc: "Verify vehicle licenses, hackney permits, token custom clearance, and ownership transfers.",
      buttonText: "Get Document",
      fieldLabel: "License plate & Chassis number",
      placeholder: "e.g. Toyt-493, CH-82949-AAB",
      iconName: "vehicle"
    },
    {
      num: "04",
      title: "Contract Review",
      desc: "Get service agreements, NDA, deeds of assignment reviewed by seasoned corporate lawyers.",
      buttonText: "Review Contract",
      fieldLabel: "Type of agreement to review",
      placeholder: "e.g. Land Purchase Agreement Review",
      iconName: "contract"
    },
    {
      num: "05",
      title: "Family & Personal Law",
      desc: "Support for legal estates, marriage settlements, wills draft, and domestic arbitration with discretion.",
      buttonText: "Get Help",
      fieldLabel: "Inquiry or counsel type",
      placeholder: "e.g. Will draft or dispute arbitration",
      iconName: "family"
    },
    {
      num: "06",
      title: "Legal Consultation",
      desc: "Secure private video or chat sessions with certified attorneys matching your exact needs.",
      buttonText: "Book Session",
      fieldLabel: "Topic you need advice on",
      placeholder: "e.g. Foreign investment guidelines in Nigeria",
      iconName: "consultation"
    }
  ];

  return (
    <div className="bg-slate-50 min-h-screen">
      
      {/* 1. HERO SECTION */}
      <section className="relative bg-slate-900 text-white py-24 px-4 overflow-hidden">
        {/* Background Overlay */}
        <div className="absolute inset-0 z-0">
          <img 
            referrerPolicy="no-referrer"
            src="https://images.unsplash.com/photo-1450133064473-71024230f91b?q=80&w=1200&auto=format&fit=crop" 
            alt="Law scales shadow visual" 
            className="w-full h-full object-cover opacity-20"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/90 to-slate-900/50" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold uppercase tracking-wider mb-5">
            <ShieldCheck className="h-4 w-4" /> Verified Legal Professionals • Secure Escrow
          </span>

          <h1 className="text-4xl sm:text-5xl font-extrabold font-display leading-tight">
            OUR SERVICES
          </h1>
          <p className="mt-4 text-xs sm:text-sm text-gray-300 max-w-xl mx-auto leading-relaxed">
            Access trusted legal services designed to meet your personal and business needs across Nigeria. Safe payment hold guaranteed.
          </p>

          {/* Search Criteria Bar */}
          <div className="mt-8 max-w-3xl mx-auto bg-white rounded-2xl p-4 shadow-xl border border-gray-100 flex flex-col md:flex-row gap-4 items-center">
            
            <div className="w-full md:flex-1 text-left">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 px-1">Legal Category</label>
              <div className="relative">
                <select 
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 text-xs font-semibold py-3 pl-3 pr-8 rounded-xl border border-gray-100 outline-none focus:border-emerald-600 appearance-none cursor-pointer"
                >
                  <option>CAC Registration</option>
                  <option>Property Verification</option>
                  <option>Vehicle Documentation</option>
                  <option>Contract Strategy</option>
                  <option>Family & Estate Counsel</option>
                  <option>Litigation Support</option>
                </select>
                <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <div className="w-full md:w-56 text-left">
              <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider mb-1 px-1">State Focus</label>
              <div className="relative">
                <select 
                  value={selectedState}
                  onChange={(e) => setSelectedState(e.target.value)}
                  className="w-full bg-slate-50 text-slate-900 text-xs font-semibold py-3 pl-3 pr-8 rounded-xl border border-gray-100 outline-none focus:border-emerald-600 appearance-none cursor-pointer"
                >
                  <option>Lagos [LAG]</option>
                  <option>Abuja [FCT]</option>
                  <option>Rivers [PHC]</option>
                  <option>Kano [KAN]</option>
                  <option>Oyo [IBD]</option>
                </select>
                <ChevronDown className="absolute right-3 top-3.5 h-4 w-4 text-gray-400 pointer-events-none" />
              </div>
            </div>

            <button 
              onClick={handleSearch}
              className="w-full md:w-auto bg-[#007A5E] hover:bg-[#005f48] text-white text-xs font-bold px-6 py-3.5 rounded-xl transition-all shadow-md shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <Search className="h-4 w-4" />
              Find a Lawyer
            </button>
          </div>

          <div className="mt-8 text-xs text-gray-400 flex items-center justify-center gap-4">
            <span>• Transparent & Reliable Legal Service</span>
            <span>• Scroll Down ↓</span>
          </div>

        </div>
      </section>

      {/* 2. SERVICES GRID */}
      <section className="py-20 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {serviceCards.map((card, idx) => (
            <div key={idx} className="bg-white border border-gray-150 rounded-2xl p-6.5 hover:shadow-lg transition-all flex flex-col justify-between group">
              <div>
                <div className="flex justify-between items-start mb-5">
                  <div className="text-xs font-mono font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                    {card.num}
                  </div>
                  <div className="h-10 w-10 text-emerald-800 bg-emerald-50 rounded-xl flex items-center justify-center">
                    {card.iconName === "building" && <Building2 className="w-5 h-5" />}
                    {card.iconName === "home" && <Home className="w-5 h-5" />}
                    {card.iconName === "vehicle" && <FileClock className="w-5 h-5" />}
                    {card.iconName === "contract" && <FileText className="w-5 h-5" />}
                    {card.iconName === "family" && <HeartHandshake className="w-5 h-5" />}
                    {card.iconName === "consultation" && <GraduationCap className="w-5 h-5" />}
                  </div>
                </div>

                <h3 className="text-lg font-bold text-gray-900 font-display group-hover:text-[#007A5E] transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                  {card.desc}
                </p>
              </div>

              <button 
                onClick={() => onSelectServiceWorkflow(card.title, card.fieldLabel, card.placeholder)}
                className="w-full mt-6 bg-white border border-emerald-500/20 text-[#007A5E] group-hover:bg-[#007A5E] group-hover:text-white text-xs font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <span>{card.buttonText}</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* 3. STAGE STEPS TIMELINE */}
      <section className="bg-white py-20 px-4 border-y border-gray-100 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
          
          <h2 className="text-3xl font-extrabold font-display text-slate-900">
            Getting Legal Help, Made Simple
          </h2>
          <p className="text-xs text-gray-500 mt-2 max-w-sm mx-auto">
            Our optimized three-tiered workflow routes matching parameters in seconds.
          </p>

          <div className="relative mt-16 max-w-3xl mx-auto h-[450px] md:h-[400px] flex items-center justify-center">
            
            {/* Dashed trail line circles vector style with CSS */}
            <div className="absolute inset-0 border-2 border-dashed border-emerald-100 rounded-full scale-90 -z-10 animate-spin-slow pointer-events-none invisible md:block" />

            {/* STAGE 01 (Top-Right Offset) */}
            <div className="absolute top-4 right-4 md:right-12 w-72 bg-[#009B84] text-white p-5 rounded-2xl shadow-xl border border-emerald-400/20 text-left transition-transform hover:scale-102">
              <span className="text-[10px] font-bold text-emerald-100 uppercase tracking-wider block">STAGE 01</span>
              <h3 className="text-md font-bold font-display mt-1">Choose a Service</h3>
              <p className="text-[11px] text-emerald-55 mt-1 leading-snug">
                Select from our corporate filing, property checks or personal advice offerings. Input parameters in under 2 minutes.
              </p>
            </div>

            {/* STAGE 02 (Middle-Left Offset) */}
            <div className="absolute top-36 left-4 md:left-12 w-72 bg-[#006050] text-white p-5 rounded-2xl shadow-xl border border-emerald-500/10 text-left transition-transform hover:scale-102">
              <span className="text-[10px] font-bold text-emerald-200 uppercase tracking-wider block">STAGE 02</span>
              <h3 className="text-md font-bold font-display mt-1">Get Matched with a Legal Expert</h3>
              <p className="text-[11px] text-emerald-100 mt-1 leading-snug">
                We immediately match your checklist files with a vetted and state-licensed Nigerian attorney experienced in that local command.
              </p>
            </div>

            {/* STAGE 03 (Bottom Offset) */}
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 w-72 bg-[#EAB308] text-slate-950 p-5 rounded-2xl shadow-xl border border-amber-400/20 text-left transition-transform hover:scale-102">
              <span className="text-[10px] font-bold text-amber-950 uppercase tracking-wider block">STAGE 03</span>
              <h3 className="text-md font-bold font-display mt-1">Resolve Legal Matters Securely</h3>
              <p className="text-[11px] text-amber-900 mt-1 leading-snug font-medium">
                Your payment is held in neutral 9ja Escrow. Work is submitted and examined, and funds are only disbursed on client approval.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* 4. CALL TO ACTION BANNER (Need help choosing) */}
      <section className="bg-slate-50 py-16 px-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-gradient-to-br from-[#007A5E] to-[#046A52] rounded-3xl p-8 sm:p-12 text-white relative overflow-hidden shadow-xl flex flex-col md:flex-row items-center justify-between gap-10">
            <div className="max-w-xl text-center md:text-left flex gap-5 items-center">
              
              {/* Glossy Yellow Question Mark Concept */}
              <div className="h-16 w-16 bg-gradient-to-b from-amber-400 to-amber-500 rounded-full flex items-center justify-center font-display text-4xl font-extrabold text-slate-950 shadow-lg shadow-amber-500/20 shrink-0">
                ?
              </div>

              <div>
                <h2 className="text-2xl font-extrabold font-display leading-tight">
                  Need help choosing the right legal service?
                </h2>
                <p className="text-xs text-emerald-100 mt-1.5 leading-relaxed font-sans font-light">
                  We're here to guide you every step of the way. Chat with a supervisor or submit a custom advice ticket.
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3.5 shrink-0 w-full sm:w-auto">
              <button 
                onClick={openWaitlist}
                className="bg-white hover:bg-slate-100 text-emerald-950 font-bold transition-all py-3.5 px-6 rounded-xl text-xs text-center cursor-pointer flex items-center justify-center gap-1.5"
              >
                Join The Waitlist
              </button>
              <button 
                onClick={() => openFindLawyer("All")}
                className="bg-[#044c3c] hover:bg-[#033b2e] text-white border border-emerald-500/20 font-bold transition-all py-3.5 px-6 rounded-xl text-xs text-center cursor-pointer flex items-center justify-center gap-1.5"
              >
                Find a Lawyer
              </button>
            </div>
          </div>

        </div>
      </section>

      {/* 5. FAQs & EMERGENCY SECTION */}
      <section className="py-20 px-4 max-w-7xl mx-auto sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          
          {/* FAQs List Accordion (2/3 width on desktop) */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <span className="text-xs font-bold text-emerald-700 tracking-wider uppercase bg-emerald-50 px-3 py-1 rounded-full">
                Common Concerns
              </span>
              <h2 className="text-2xl font-extrabold font-display text-slate-900 mt-2">
                Frequently Asked
              </h2>
            </div>

            <div className="space-y-4">
              {/* FAQ 1 */}
              <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm transition-all">
                <button 
                  onClick={() => toggleFaq(1)}
                  className="w-full p-5.5 text-left flex justify-between items-center font-bold text-gray-900 text-sm font-display cursor-pointer hover:bg-gray-50/50"
                >
                  <span>How are lawyers verified?</span>
                  <div className="h-6 w-6 rounded-lg bg-gray-100 text-gray-650 flex items-center justify-center shrink-0">
                    {faqOpen[1] ? <Minus className="h-3.5 w-3.5 font-bold" /> : <Plus className="h-3.5 w-3.5 font-bold" />}
                  </div>
                </button>
                {faqOpen[1] && (
                  <div className="p-5.5 border-t border-gray-100 text-xs text-gray-600 leading-relaxed font-sans bg-slate-50/40">
                    Our service fees are highly transparent and depend purely on the type of legal service you need. Each service displays its starting flat pricing upfront, so you will always verify the exact rates before launching a consultation or filing. There are strictly no hidden charges, and payments are held in a secure escrow account until your document or service is successfully delivered.
                  </div>
                )}
              </div>

              {/* FAQ 2 */}
              <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm transition-all">
                <button 
                  onClick={() => toggleFaq(2)}
                  className="w-full p-5.5 text-left flex justify-between items-center font-bold text-gray-900 text-sm font-display cursor-pointer hover:bg-gray-50/50"
                >
                  <span>How much do services cost?</span>
                  <div className="h-6 w-6 rounded-lg bg-gray-100 text-gray-650 flex items-center justify-center shrink-0">
                    {faqOpen[2] ? <Minus className="h-3.5 w-3.5 font-bold" /> : <Plus className="h-3.5 w-3.5 font-bold" />}
                  </div>
                </button>
                {faqOpen[2] && (
                  <div className="p-5.5 border-t border-gray-100 text-xs text-gray-600 leading-relaxed font-sans bg-slate-50/40">
                    Services cost flat, pre-agreed amounts based on typical regulatory charges (e.g., CAC filings are structured with government fee inclusive). No surprise bills are added. Standard listings let you preview initial tariffs before lawyer assignment starts.
                  </div>
                )}
              </div>

              {/* FAQ 3 */}
              <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-sm transition-all">
                <button 
                  onClick={() => toggleFaq(3)}
                  className="w-full p-5.5 text-left flex justify-between items-center font-bold text-gray-900 text-sm font-display cursor-pointer hover:bg-gray-50/50"
                >
                  <span>How operates the secure escrow?</span>
                  <div className="h-6 w-6 rounded-lg bg-gray-100 text-gray-650 flex items-center justify-center shrink-0">
                    {faqOpen[3] ? <Minus className="h-3.5 w-3.5 font-bold" /> : <Plus className="h-3.5 w-3.5 font-bold" />}
                  </div>
                </button>
                {faqOpen[3] && (
                  <div className="p-5.5 border-t border-gray-100 text-xs text-gray-600 leading-relaxed font-sans bg-slate-50/40">
                    When you book, your payment is deposited with our secure bank custodian. Escrow funds are strictly kept neutral. Your matched lawyer performs the deed verification or CAC filing, uploads confirmation drafts for your inspection, and once you click "Approved", our system automatically pays the lawyer.
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Urgent Legal Assistance banner (1/3 width) */}
          <div className="h-full">
            <div className="bg-red-50/50 border border-red-200 rounded-3xl p-6.5 text-slate-900 flex flex-col justify-between h-full relative overflow-hidden">
              <div>
                {/* Red banner flag icon */}
                <div className="inline-flex bg-red-100 text-red-700 p-3 rounded-2xl mb-5">
                  <ShieldAlert className="h-6 w-6" />
                </div>

                <h3 className="text-lg font-bold text-red-950 font-display">
                  Need Urgent <br />
                  Legal Assistance?
                </h3>
                
                <p className="text-xs text-red-800 leading-relaxed mt-3">
                  Access emergency legal contacts, state public defenders, human rights assistance, and counsel guidance instantly during threats, harassment or arbitrary arrests across Nigeria.
                </p>
              </div>

              <div className="mt-8">
                <button 
                  onClick={openEmergency}
                  className="w-full bg-[#E11D48] hover:bg-red-750 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-colors shadow shadow-red-200 uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer"
                >
                  SOS Emergency Help
                </button>
              </div>
            </div>
          </div>

        </div>
      </section>

    </div>
  );
}
