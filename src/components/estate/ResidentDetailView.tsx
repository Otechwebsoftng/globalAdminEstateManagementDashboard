import React, { useState } from "react";
import { 
  Users, UserCheck, ShieldCheck, KeyRound, Clock, 
  Phone, Mail, MapPin, ArrowLeft, ChevronRight, 
  MoreVertical, Search, Plus, Ban, Trash2, 
  Eye, Edit, UserX, UserPlus, History, ShieldAlert, X
} from "lucide-react";

interface ResidentDetailViewProps {
  resident: any;
  onBack: () => void;
  onEdit?: (resident: any) => void;
}

export default function ResidentDetailView({ resident, onBack }: ResidentDetailViewProps) {
  const [activeTab, setActiveTab] = useState<"staff" | "visitors" | "logs">("staff");
  const [selectedStaff, setSelectedStaff] = useState<any>(null);
  const [selectedVisitorCode, setSelectedVisitorCode] = useState<any>(null);

  // Mock data for internal tabs
  const domesticStaff = [
    { id: 1, name: "Chikwendu Emmanuel", role: "Chef", phone: "+234 803 587 6754", status: "Active", added: "Mar 14, 2026" },
    { id: 2, name: "Chikwendu Emmanuel", role: "Cleaner", phone: "+234 803 587 6754", status: "Active", added: "Mar 14, 2026" },
    { id: 3, name: "Chikwendu Emmanuel", role: "Driver", phone: "+234 803 587 6754", status: "Active", added: "Mar 14, 2026" },
  ];

  const visitorCodes = [
    { id: 1, code: "A8F3-K9L2", name: "Emmanuel", validity: "3 Hours", status: "Active", created: "10:00AM, Mar 14, 2026" },
    { id: 2, code: "A8F3-K9L2", name: "Emmanuel", validity: "3 Hours", status: "Expired", created: "10:00AM, Mar 14, 2025" },
    { id: 3, code: "A8F3-K9L2", name: "Emmanuel", validity: "3 Hours", status: "Revoked", created: "10:00AM, Mar 14, 2025" },
    { id: 4, code: "A8F3-K9L2", name: "Emmanuel", validity: "3 Hours", status: "Active", created: "10:00AM, Mar 14, 2026" },
  ];

  const accessLogs = [
    { id: 1, type: "Entry", time: "10:00PM, Today", officer: "Officer Emmanuel Stark", gate: "Gate A" },
    { id: 2, type: "Exit", time: "09:00AM, Today", officer: "Officer Emmanuel Stark", gate: "Gate A" },
    { id: 3, type: "Entry", time: "08:00PM, Yesterday", officer: "Officer Emmanuel Stark", gate: "Gate A" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "staff":
        return (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-wider bg-slate-50/30">
                    <th className="py-4 px-6">Staff Name</th>
                    <th className="py-4 px-6">Role</th>
                    <th className="py-4 px-6">Phone</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6">Date Added</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {domesticStaff.map((staff) => (
                    <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">{staff.name}</td>
                      <td className="py-4 px-6 font-bold text-blue-600">{staff.role}</td>
                      <td className="py-4 px-6 font-bold text-gray-500 font-mono">{staff.phone}</td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                          <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                          {staff.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-400">{staff.added}</td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => setSelectedStaff(staff)}
                          className="text-gray-300 hover:text-slate-900 p-1"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "visitors":
        return (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-wider bg-slate-50/30">
                    <th className="py-4 px-6">Code</th>
                    <th className="py-4 px-6">Visitor Name</th>
                    <th className="py-4 px-6">Validity</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6">Date Created</th>
                    <th className="py-4 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {visitorCodes.map((v) => (
                    <tr key={v.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-black text-slate-900 font-mono tracking-tight">{v.code}</td>
                      <td className="py-4 px-6 font-bold text-gray-500">{v.name}</td>
                      <td className="py-4 px-6 font-bold text-slate-700">{v.validity}</td>
                      <td className="py-4 px-6 text-center">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full border ${
                          v.status === 'Active' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 
                          v.status === 'Expired' ? 'text-rose-600 bg-rose-50 border-rose-100' : 
                          'text-amber-600 bg-amber-50 border-amber-100'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                             v.status === 'Active' ? 'bg-emerald-500' : 
                             v.status === 'Expired' ? 'bg-rose-500' : 
                             'bg-amber-500'
                          }`} />
                          {v.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-400">{v.created}</td>
                      <td className="py-4 px-6 text-right">
                        <button 
                          onClick={() => setSelectedVisitorCode(v)}
                          className="text-gray-300 hover:text-slate-900 p-1"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "logs":
        return (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-wider bg-slate-50/30">
                    <th className="py-4 px-6">Log Type</th>
                    <th className="py-4 px-6">Time</th>
                    <th className="py-4 px-6">Gate</th>
                    <th className="py-4 px-6">Security Officer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {accessLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full border ${
                          log.type === 'Entry' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 
                          'text-amber-600 bg-amber-50 border-amber-100'
                        }`}>
                          {log.type}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-slate-900 font-mono">{log.time}</td>
                      <td className="py-4 px-6 font-bold text-slate-700">{log.gate}</td>
                      <td className="py-4 px-6 font-bold text-gray-400 uppercase tracking-tighter">{log.officer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Breadcrumb & Actions */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <button 
            onClick={onBack}
            className="h-10 w-10 bg-white border border-gray-200 rounded-2xl flex items-center justify-center text-slate-600 hover:bg-slate-50 transition-colors shadow-sm"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Residents</span>
              <ChevronRight className="h-3 w-3 text-gray-300" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">View Resident</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-0.5">Resident Details</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl text-xs font-black text-amber-700 hover:bg-amber-100 transition-all">
            <Ban className="h-3.5 w-3.5" />
            Suspend
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 border border-rose-100 rounded-xl text-xs font-black text-rose-700 hover:bg-rose-100 transition-all">
            <UserX className="h-3.5 w-3.5" />
            Deactivate
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content Area */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm relative overflow-hidden">
            <div className="flex items-center gap-4 relative z-10">
              <div className="h-16 w-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center font-black text-2xl border border-blue-100">
                CE
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-xl font-black text-slate-900">{resident.name}</h3>
                  <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase">● Active</span>
                </div>
                <span className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-tight block">
                  Unit 12A • {resident.estate}
                </span>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4 mt-8">
              {[
                { label: "House Hold", val: "6", icon: Users, color: "blue" },
                { label: "Visitors Received", val: "50", icon: ShieldCheck, color: "emerald" },
                { label: "Code Generated", val: "50", icon: KeyRound, color: "indigo" },
                { label: "Domestic Staff", val: "3", icon: UserCheck, color: "amber" },
                { label: "Active Personnel", val: "3", icon: ShieldAlert, color: "rose" },
              ].map((kpi, i) => (
                <div key={i} className="bg-slate-50/50 rounded-2xl p-4 border border-slate-100 group hover:border-blue-200 transition-colors">
                  <div className={`h-8 w-8 bg-${kpi.color}-50 text-${kpi.color}-600 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <kpi.icon className="h-4 w-4" />
                  </div>
                  <span className="text-xl font-black text-slate-900 block leading-none">{kpi.val}</span>
                  <span className="text-[9px] font-black text-gray-400 uppercase tracking-widest mt-1.5 block leading-tight">{kpi.label}</span>
                </div>
              ))}
            </div>

            {/* Background Decoration */}
            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
              <Users className="h-32 w-32 rotate-12" />
            </div>
          </div>

          {/* Sub-Tabs */}
          <div className="flex items-center gap-8 border-b border-gray-100 overflow-x-auto pb-px">
            {(["staff", "visitors", "logs"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`text-xs font-black uppercase tracking-widest pb-4 relative transition-colors ${
                  activeTab === tab ? "text-blue-600" : "text-gray-400 hover:text-slate-600"
                }`}
              >
                {tab === 'staff' ? 'Domestic Staff' : tab === 'visitors' ? 'Visitors Codes' : 'Access Log'}
                {activeTab === tab && (
                  <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full shadow-[0_-2px_8px_rgba(37,99,235,0.4)]" />
                )}
              </button>
            ))}
          </div>

          <div>{renderTabContent()}</div>
        </div>

        {/* Right Sidebar - Info Panel */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-blue-600 rounded-[32px] p-6 text-white shadow-xl shadow-blue-100 relative overflow-hidden group">
            <div className="relative z-10">
              <div className="flex justify-between items-start mb-6">
                <h4 className="text-base font-black uppercase tracking-widest">Basic Info</h4>
                <div className="bg-white/20 px-3 py-1 rounded-lg text-[10px] font-black uppercase">12A</div>
              </div>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-[10px] font-bold opacity-60 uppercase">House Unit</span>
                  <span className="text-xs font-black">12A</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-white/10">
                  <span className="text-[10px] font-bold opacity-60 uppercase">Last Entry</span>
                  <span className="text-xs font-black">Yesterday</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-[10px] font-bold opacity-60 uppercase">Date Joined</span>
                  <span className="text-xs font-black">Jun 14, 2026</span>
                </div>
              </div>

              <div className="mt-8 bg-white/10 rounded-2xl p-4 border border-white/20">
                <span className="text-[10px] font-black uppercase tracking-widest mb-3 block opacity-80">Contact Details</span>
                <div className="space-y-3">
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-3.5 w-3.5 opacity-60" />
                    <span className="text-xs font-bold">+234 803 - 587 - 6754</span>
                  </div>
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-3.5 w-3.5 opacity-60" />
                    <span className="text-xs font-bold truncate">youremail@gmail.com</span>
                  </div>
                </div>
              </div>
            </div>
            {/* Decoration */}
            <div className="absolute -bottom-8 -right-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
              <ShieldCheck className="h-48 w-48" />
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm">
             <div className="flex items-center gap-3 mb-6">
              <img 
                src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                className="h-10 w-10 rounded-full border-2 border-slate-50"
                alt="Admin"
              />
              <div>
                <span className="text-xs font-black text-slate-900 block">Emmanuel Stark</span>
                <span className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter block leading-none">Global Administrator</span>
              </div>
            </div>
            <p className="text-[11px] text-gray-500 font-medium leading-relaxed italic">
              "Verifying resident credentials and domestic staff clearance for secure residential access control."
            </p>
          </div>
        </div>
      </div>

      {/* Staff Profile Details Modal */}
      {selectedStaff && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300 px-4">
          <div className="bg-white rounded-[32px] w-full max-w-lg shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden relative">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-widest">Domestic Staff Profile Details</h3>
              <button onClick={() => setSelectedStaff(null)} className="text-gray-400 hover:text-slate-900"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-8 space-y-8">
              <div className="flex items-start gap-5">
                <img 
                  src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" 
                  className="h-20 w-20 rounded-2xl border-2 border-slate-50 shadow-sm"
                  alt="Staff"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h4 className="text-xl font-black text-slate-900">{selectedStaff.name}</h4>
                      <p className="text-[10px] text-gray-400 font-bold uppercase mt-0.5 tracking-tight">+234 803 587 6754 • Sunset Valley Residences</p>
                    </div>
                    <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase">● {selectedStaff.status}</span>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-y-4 mt-6">
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Role :</span>
                      <span className="text-xs font-black text-slate-700">{selectedStaff.role}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Date Added :</span>
                      <span className="text-xs font-black text-slate-700">{selectedStaff.added}</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Gender :</span>
                      <span className="text-xs font-black text-slate-700">Male</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Staff ID :</span>
                      <span className="text-xs font-black text-slate-700">12A1D345</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Shift :</span>
                      <span className="text-xs font-black text-slate-700 font-bold">Live - in</span>
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Assigned To :</span>
                      <span className="text-xs font-black text-blue-600">John Doe (A12)</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 block">Activity Logs</span>
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[11px] font-bold">
                    <span className="text-gray-400">TIME</span>
                    <span className="text-gray-400">ACTION</span>
                    <span className="text-gray-400">ASSIGNED TO</span>
                  </div>
                  <div className="h-px bg-slate-200/50" />
                  <div className="flex justify-between items-center text-[10px] font-black">
                    <span className="text-slate-900 opacity-30">-- --</span>
                    <span className="text-slate-900 opacity-30">-- --</span>
                    <span className="text-slate-900 opacity-30">-- --</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4 pt-2">
                <button className="flex-1 py-4 bg-rose-50 text-rose-600 text-xs font-black rounded-2xl hover:bg-rose-100 transition-colors flex items-center justify-center gap-2">
                  <UserX className="h-4 w-4" />
                  Deactivate
                </button>
                <button className="flex-1 py-4 bg-blue-600 text-white text-xs font-black rounded-2xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex items-center justify-center gap-2">
                  <Edit className="h-4 w-4" />
                  Edit Staff
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Visitor Code Details Modal */}
      {selectedVisitorCode && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300 px-4">
          <div className="bg-white rounded-[32px] w-full max-w-md shadow-2xl animate-in zoom-in-95 duration-300 overflow-hidden relative">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center">
              <h3 className="text-base font-black text-slate-900 uppercase tracking-widest">Visitor's Code Details</h3>
              <button onClick={() => setSelectedVisitorCode(null)} className="text-gray-400 hover:text-slate-900"><X className="h-5 w-5" /></button>
            </div>
            <div className="p-8 space-y-8">
              <div className="text-center">
                <div className="text-3xl font-black text-slate-900 font-mono tracking-widest mb-2">{selectedVisitorCode.code}</div>
                <span className="text-[9px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase">● {selectedVisitorCode.status}</span>
              </div>

              <div className="space-y-3 pt-6">
                {[
                  { label: "Visitor's Name :", val: selectedVisitorCode.name },
                  { label: "Date Created :", val: selectedVisitorCode.created },
                  { label: "Expiry Date :", val: "10:00AM, Mar 14, 2026" },
                  { label: "Validity :", val: "Multi Use (2 Days)" },
                ].map((item, i) => (
                  <div key={i} className="flex justify-between items-center py-1.5 text-xs">
                    <span className="text-gray-400 font-bold">{item.label}</span>
                    <span className="text-slate-900 font-black">{item.val}</span>
                  </div>
                ))}
              </div>

              <div className="bg-slate-50 rounded-2xl p-5 border border-slate-100 mt-6">
                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 block">Usage Logs</span>
                <div className="space-y-4">
                  <div className="flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-tighter">
                    <span>Entry Time</span>
                    <span>Verified By</span>
                    <span>Gate</span>
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-black">
                    <span className="text-slate-900">10:00AM</span>
                    <span className="text-slate-900">Guard Williams Chikwe</span>
                    <span className="text-slate-900 uppercase">Gate A</span>
                  </div>
                </div>
              </div>

              <button className="w-full py-4 bg-rose-600 text-white text-xs font-black rounded-2xl hover:bg-rose-700 transition-all shadow-lg shadow-rose-200 flex items-center justify-center gap-2">
                Revoke Code
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
