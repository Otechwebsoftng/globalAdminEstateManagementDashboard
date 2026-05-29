import React, { useState } from "react";
import { 
  Check, ShieldCheck, Scale, Award, Star, Info, HelpCircle, Flame, Building
} from "lucide-react";

interface PricingViewProps {
  openWaitlist: () => void;
}

export default function PricingView({ openWaitlist }: PricingViewProps) {
  const [billingPeriod, setBillingPeriod] = useState<"monthly" | "yearly">("monthly");

  return (
    <div className="bg-slate-50 min-h-screen py-16 px-4">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        
        {/* Upper heading tags */}
        <span className="text-xs font-bold text-emerald-700 tracking-widest uppercase bg-emerald-50 px-3 py-1 rounded-full">
          Pricing Plans
        </span>
        <h1 className="text-4xl sm:text-5xl font-extrabold font-display text-slate-900 mt-4 tracking-tight leading-tight">
          Scale Your Legal Practice <br />
          Across Nigeria
        </h1>
        <p className="mt-4 text-xs sm:text-sm text-gray-500 max-w-xl mx-auto leading-relaxed">
          Connect with thousands of proactive clients and manage your verified court records with our dedicated digital growth workspace.
        </p>

        {/* Toggle with SAVE indicator */}
        <div className="mt-8 flex flex-col items-center justify-center">
          
          <div className="bg-slate-100 rounded-xl p-1 flex items-center border border-gray-200">
            <button
              onClick={() => setBillingPeriod("monthly")}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                billingPeriod === "monthly" 
                  ? "bg-white text-emerald-950 shadow-sm" 
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setBillingPeriod("yearly")}
              className={`px-5 py-2 rounded-lg text-xs font-bold transition-all ${
                billingPeriod === "yearly" 
                  ? "bg-white text-emerald-950 shadow-sm" 
                  : "text-gray-500 hover:text-gray-900"
              }`}
            >
              Yearly
            </button>
          </div>

          <div className="mt-3 inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-[10px] font-bold uppercase tracking-wider">
            <span>🎉 Save 2 Months with Yearly Bill</span>
          </div>
        </div>

        {/* Two pricing cards layout */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto text-left items-stretch">
          
          {/* Plan 1: Standard (Entry Level) */}
          <div className="bg-white border border-gray-150 rounded-2xl p-8 flex flex-col justify-between shadow-sm relative hover:border-emerald-200 transition-all">
            
            <div className="space-y-6">
              {/* Header tags */}
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-gray-400 uppercase tracking-widest flex items-center gap-1">
                  <Scale className="h-3.5 w-3.5" />
                  Entry Level
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded font-bold font-mono">BETA</span>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 font-display">Standard</h3>
                
                <div className="mt-3 flex items-baseline">
                  <span className="text-4xl sm:text-5xl font-extrabold text-gray-900 font-mono">Free</span>
                  <span className="text-xs text-gray-400 font-medium ml-1.5">/month</span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1 leading-normal">Perfect for newly qualified legal practitioners starting state litigation.</p>
              </div>

              {/* CTA */}
              <button 
                onClick={openWaitlist}
                className="w-full bg-slate-50 hover:bg-slate-100 text-[#007A5E] font-bold py-3.5 rounded-xl border border-gray-200 text-xs transition-colors cursor-pointer text-center block"
              >
                Get Started Free
              </button>

              {/* Features line */}
              <div className="border-t border-gray-100 pt-6">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mb-4">Included Features</p>
                <ul className="space-y-3">
                  {[
                    "Basic Profile Visibility",
                    "Standard Search Listing",
                    "Direct Client Messaging",
                    "Access To Legal Forum"
                  ].map((feat, i) => (
                    <li key={i} className="flex gap-2.5 items-start text-xs text-gray-600">
                      <div className="h-4.5 w-4.5 rounded bg-emerald-55 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                      <span className="font-light">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-100 flex items-center gap-2 text-[10px] text-gray-400">
              <Info className="h-3.5 w-3.5 text-gray-450 shrink-0" />
              <span>Standard local data listing regulations apply.</span>
            </div>
          </div>

          {/* Plan 2: Premium (Growth Plan) */}
          <div className="bg-white border-2 border-emerald-600 rounded-2xl p-8 flex flex-col justify-between shadow-lg relative hover:shadow-xl transition-all overflow-hidden">
            
            {/* Green Popular Banner Tag */}
            <div className="absolute top-0 right-0">
              <div className="bg-emerald-600 text-white text-[9px] font-bold tracking-widest uppercase px-9 py-1 rotate-45 translate-x-7 translate-y-3 text-center w-28 shadow-sm">
                POPULAR
              </div>
            </div>

            <div className="space-y-6">
              {/* Header tags */}
              <div className="flex justify-between items-center text-xs">
                <span className="font-bold text-emerald-700 uppercase tracking-widest flex items-center gap-1">
                  <Star className="h-3.5 w-3.5 fill-emerald-600 text-emerald-600" />
                  Growth Plan
                </span>
                <div className="flex items-center gap-0.5 mr-10">
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                  <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                </div>
              </div>

              <div>
                <h3 className="text-2xl font-bold text-gray-900 font-display">Premium</h3>
                
                <div className="mt-3 flex items-baseline">
                  <span className="text-4xl sm:text-5xl font-extrabold text-emerald-800 font-mono">
                    {billingPeriod === "monthly" ? "₦15,000" : "₦137,500"}
                  </span>
                  <span className="text-xs text-gray-400 font-medium ml-1.5">
                    {billingPeriod === "monthly" ? "/month" : "/year"}
                  </span>
                </div>
                <p className="text-[11px] text-gray-400 mt-1 leading-normal">Best for scaling firms and individuals looking to get top litigation visibility.</p>
              </div>

              {/* CTA */}
              <button 
                onClick={openWaitlist}
                className="w-full bg-[#007A5E] hover:bg-[#005f48] text-white font-bold py-3.5 rounded-xl text-xs transition-colors shadow-lg shadow-emerald-100 cursor-pointer text-center block"
              >
                Upgrade To Premium
              </button>

              {/* Features line */}
              <div className="border-t border-gray-100 pt-6">
                <p className="text-[10px] font-bold text-emerald-700 uppercase tracking-wider mb-4">Elite Features</p>
                <ul className="space-y-3">
                  {[
                    "Top Search Priority",
                    "Verified Professional Badge",
                    "Client Analytics Dashboard",
                    "Featured Profile Placement",
                    "Priority 24/7 Concierge"
                  ].map((feat, i) => (
                    <li key={i} className="flex gap-2.5 items-start text-xs text-gray-650">
                      <div className="h-4.5 w-4.5 rounded bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
                        <Check className="h-3 w-3 stroke-[3]" />
                      </div>
                      <span className="font-medium">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-8 pt-4 border-t border-gray-100 flex items-center gap-2 text-[10px] text-gray-400">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Full compliance and money-back guarantee protection details.</span>
            </div>
          </div>

        </div>

        {/* Subtle decorative items on left background and right background */}
        <div className="mt-16 text-xs text-gray-400 max-w-sm mx-auto leading-relaxed border-t border-gray-200/50 pt-8">
          <p>Join over 350 active chambers across Lagos and FCT leveraging our escrow platform to capture trust.</p>
        </div>

      </div>
    </div>
  );
}
