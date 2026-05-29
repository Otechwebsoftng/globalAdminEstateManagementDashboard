import React, { useState } from "react";
import { 
  Users, Building2, ShieldCheck, UserCheck, Edit, Ban, Trash2, 
  MapPin, Phone, Mail, Clock, Plus, Search, ChevronRight, 
  TrendingUp, ArrowLeft, MoreVertical, LayoutGrid, FileText
} from "lucide-react";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, 
  ResponsiveContainer, AreaChart, Area 
} from "recharts";

interface EstateDetailViewProps {
  estate: any;
  onBack: () => void;
  onEdit: (estate: any) => void;
}

const visitorTrendData = [
  { name: "Jan 04", visitors: 400 },
  { name: "Jan 08", visitors: 800 },
  { name: "Jan 12", visitors: 600 },
  { name: "Jan 16", visitors: 1100 },
  { name: "Jan 20", visitors: 900 },
  { name: "Jan 24", visitors: 1400 },
  { name: "Jan 28", visitors: 1200 },
];

export default function EstateDetailView({ estate, onBack, onEdit }: EstateDetailViewProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "residents" | "security" | "visitors" | "admins">("overview");

  // Mock data for internal tabs
  const residentsList = [
    { id: 1, name: "Chikwemedu Emmanuel", phone: "+234 803 587 6754", unit: "11B", status: "Active", joined: "Mar 14, 2026" },
    { id: 2, name: "Chikwemedu Emmanuel", phone: "+234 803 587 6754", unit: "11B", status: "Active", joined: "Mar 14, 2026" },
    { id: 3, name: "Chikwemedu Emmanuel", phone: "+234 803 587 6754", unit: "11B", status: "Active", joined: "Mar 14, 2026" },
    { id: 4, name: "Chikwemedu Emmanuel", phone: "+234 803 587 6754", unit: "11B", status: "Active", joined: "Mar 14, 2026" },
    { id: 5, name: "Chikwemedu Emmanuel", phone: "+234 803 587 6754", unit: "11B", status: "Active", joined: "Mar 14, 2026" },
  ];

  const securityStaff = [
    { id: 1, name: "Chikwemedu Emmanuel", shift: "Morning", gate: "Gate A", status: "Active" },
    { id: 2, name: "Chikwemedu Emmanuel", shift: "Night", gate: "Gate A", status: "Active" },
    { id: 3, name: "Chikwemedu Emmanuel", shift: "Morning", gate: "Gate A", status: "Active" },
    { id: 4, name: "Chikwemedu Emmanuel", shift: "Morning", gate: "Gate A", status: "Active" },
  ];

  const visitorLogs = [
    { id: 1, name: "Emmanuel", host: "Chikwemedu Emmanuel", entry: "10:00PM, Today", status: "In", officer: "Officer Emmanuel" },
    { id: 2, name: "Emmanuel", host: "Chikwemedu Emmanuel", entry: "10:00AM, Tomorrow", status: "Expected", officer: "Officer Emmanuel" },
    { id: 3, name: "Emmanuel", host: "Chikwemedu Emmanuel", entry: "10:00AM, May 14, 2026", status: "Out", officer: "Officer Emmanuel" },
  ];

  const estateAdmins = [
    { id: 1, name: "ADAM NAME", email: "youremail@gmail.com", role: "Estate Admin", status: "Active" },
    { id: 2, name: "ADAM NAME", email: "youremail@gmail.com", role: "Finance", status: "Active" },
    { id: 3, name: "ADAM NAME", email: "youremail@gmail.com", role: "Platform Masters", status: "Active" },
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case "overview":
        return (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {/* Left Column: Profile & Info */}
            <div className="lg:col-span-4 space-y-6">
              <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                <div className="flex flex-col items-center text-center">
                  <div className="h-24 w-24 bg-blue-50 rounded-3xl flex items-center justify-center mb-4">
                    <span className="text-3xl font-black text-blue-600">SV</span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900">{estate.name}</h3>
                  <span className="text-xs font-bold text-gray-400 mt-1 uppercase tracking-wider">LINCENSED RESIDENTIAL</span>
                </div>

                <div className="mt-8 space-y-5">
                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                      <MapPin className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Location</span>
                      <span className="text-xs font-bold text-slate-700 leading-tight block mt-0.5">
                        683, Marble Towers, Kingsway Road, Lagos, NG
                      </span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                      <Phone className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Contact</span>
                      <span className="text-xs font-bold text-slate-700 block mt-0.5">+234 803 587 6754</span>
                      <span className="text-[10px] text-gray-400 font-medium">youremail@gmail.com</span>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="h-8 w-8 rounded-xl bg-slate-50 flex items-center justify-center shrink-0">
                      <Clock className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <span className="text-[10px] font-bold text-gray-400 uppercase block">Joined</span>
                      <span className="text-xs font-bold text-slate-700 block mt-0.5">Mar 14, 2026</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Subscription Card */}
              <div className="bg-blue-600 rounded-3xl p-6 text-white shadow-lg shadow-blue-200 relative overflow-hidden group">
                <div className="relative z-10">
                  <span className="text-[10px] font-black uppercase tracking-widest opacity-80">Standard Plans</span>
                  <h4 className="text-lg font-black mt-1">Subscription Details</h4>
                  
                  <div className="mt-6 flex justify-between items-end">
                    <div>
                      <span className="text-[10px] font-bold opacity-70 block">Current Bill</span>
                      <span className="text-2xl font-black">₦234,355</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-bold opacity-70 block">Due Date</span>
                      <span className="text-xs font-black">Apr 14, 2026</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-2">
                    <button className="w-full bg-white text-blue-600 py-2.5 rounded-xl text-xs font-black transition-transform hover:scale-[1.02] active:scale-95">
                      Billing Dashboard
                    </button>
                    <button className="w-full bg-blue-500/30 text-white py-2.5 rounded-xl text-xs font-black border border-white/20 transition-transform hover:bg-blue-500/50">
                      Admin Dashboard
                    </button>
                  </div>
                </div>
                {/* Background Pattern */}
                <div className="absolute -right-8 -bottom-8 opacity-10 group-hover:scale-110 transition-transform duration-700">
                  <Building2 className="h-48 w-48" />
                </div>
              </div>
            </div>

            {/* Right Column: Chart & Recent activity */}
            <div className="lg:col-span-8 space-y-6">
              <div className="bg-white rounded-3xl border border-gray-100 p-8 shadow-sm">
                <div className="flex justify-between items-center mb-8">
                  <div>
                    <h3 className="text-lg font-black text-slate-900">Visitor Entries</h3>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Traffic overview for the last 30 days</p>
                  </div>
                  <div className="flex gap-2">
                    <select className="text-[10px] font-bold border border-gray-200 rounded-lg px-2 py-1 bg-slate-50 outline-none">
                      <option>Last 7 Days</option>
                      <option>Last 30 Days</option>
                      <option>Last 365 Days</option>
                    </select>
                  </div>
                </div>
                
                <div className="h-[300px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={visitorTrendData}>
                      <defs>
                        <linearGradient id="colorVisitors" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                          <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                      <XAxis 
                        dataKey="name" 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }} 
                        dy={10}
                      />
                      <YAxis 
                        axisLine={false} 
                        tickLine={false} 
                        tick={{ fontSize: 10, fontWeight: 700, fill: '#94a3b8' }}
                      />
                      <Tooltip 
                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                        itemStyle={{ fontSize: '12px', fontWeight: 800, color: '#2563eb' }}
                      />
                      <Area 
                        type="monotone" 
                        dataKey="visitors" 
                        stroke="#2563eb" 
                        strokeWidth={4} 
                        fillOpacity={1} 
                        fill="url(#colorVisitors)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Admin list summary */}
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
                <div className="text-[11px] text-gray-500 font-medium leading-relaxed">
                  Managing estate operations and security parameters for <span className="font-bold text-slate-900">Sunset Valley Residences</span>. 
                  Currently overseeing 12,532 registered residents and 12 security personnel.
                </div>
              </div>
            </div>
          </div>
        );
      
      case "residents":
        return (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-slate-50/30">
              <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search Residents..." 
                  className="w-full text-xs pl-9 pr-3 py-2 border border-gray-200 rounded-xl bg-white outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <button className="p-2 border border-gray-200 rounded-lg hover:bg-white text-gray-500">
                  <LayoutGrid className="h-4 w-4" />
                </button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                    <th className="py-4 px-6">Resident Name</th>
                    <th className="py-4 px-6">Phone</th>
                    <th className="py-4 px-6 text-center">Unit</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Date Joined</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {residentsList.map((res) => (
                    <tr key={res.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">{res.name}</td>
                      <td className="py-4 px-6 font-bold text-gray-500 font-mono">{res.phone}</td>
                      <td className="py-4 px-6 text-center font-black text-blue-600">{res.unit}</td>
                      <td className="py-4 px-6">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                          <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                          {res.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-400">{res.joined}</td>
                      <td className="py-4 px-6 text-right">
                        <button className="text-gray-300 hover:text-slate-900 p-1">
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

      case "security":
        return (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-slate-50/30">
              <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search Security Staff..." 
                  className="w-full text-xs pl-9 pr-3 py-2 border border-gray-200 rounded-xl bg-white outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex gap-2">
                <select className="text-[10px] font-bold border border-gray-200 rounded-lg px-2 py-1 bg-white outline-none">
                  <option>All Shift</option>
                  <option>Morning</option>
                  <option>Night</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                    <th className="py-4 px-6">Staff Name</th>
                    <th className="py-4 px-6">Shift</th>
                    <th className="py-4 px-6">Gate</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {securityStaff.map((staff) => (
                    <tr key={staff.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">{staff.name}</td>
                      <td className="py-4 px-6 font-bold text-blue-600">{staff.shift}</td>
                      <td className="py-4 px-6 font-bold text-gray-500">{staff.gate}</td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                          <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                          {staff.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className="text-gray-300 hover:text-slate-900 p-1">
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
             <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-slate-50/30">
              <div className="relative w-64">
                <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-gray-400" />
                <input 
                  type="text" 
                  placeholder="Search Visitor Logs..." 
                  className="w-full text-xs pl-9 pr-3 py-2 border border-gray-200 rounded-xl bg-white outline-none focus:ring-1 focus:ring-blue-500"
                />
              </div>
              <div className="flex items-center gap-3">
                <span className="text-[10px] font-black text-gray-400 uppercase">Filter:</span>
                <select className="text-[10px] font-bold border border-gray-200 rounded-lg px-2 py-1 bg-white outline-none">
                  <option>All Time</option>
                  <option>Today</option>
                  <option>This Week</option>
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                    <th className="py-4 px-6">Visitor Name</th>
                    <th className="py-4 px-6">Host</th>
                    <th className="py-4 px-6">Entry Time</th>
                    <th className="py-4 px-6">Status</th>
                    <th className="py-4 px-6">Security Officer</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {visitorLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">{log.name}</td>
                      <td className="py-4 px-6 font-bold text-gray-500">{log.host}</td>
                      <td className="py-4 px-6 font-bold text-slate-700 font-mono">{log.entry}</td>
                      <td className="py-4 px-6">
                        <span className={`inline-flex items-center gap-1.5 text-[10px] font-black px-2.5 py-1 rounded-full border ${
                          log.status === 'In' ? 'text-emerald-600 bg-emerald-50 border-emerald-100' : 
                          log.status === 'Expected' ? 'text-blue-600 bg-blue-50 border-blue-100' : 
                          'text-gray-500 bg-gray-50 border-gray-100'
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                             log.status === 'In' ? 'bg-emerald-500' : 
                             log.status === 'Expected' ? 'bg-blue-500' : 
                             'bg-gray-400'
                          }`} />
                          {log.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 font-bold text-gray-400 uppercase tracking-tighter">{log.officer}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case "admins":
        return (
          <div className="bg-white rounded-3xl border border-gray-100 overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-500">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-gray-50 text-[10px] font-black uppercase text-gray-400 tracking-wider">
                    <th className="py-4 px-6">Admin Name</th>
                    <th className="py-4 px-6">Email Address</th>
                    <th className="py-4 px-6">Role</th>
                    <th className="py-4 px-6 text-center">Status</th>
                    <th className="py-4 px-6 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {estateAdmins.map((adm) => (
                    <tr key={adm.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-4 px-6 font-bold text-slate-900">{adm.name}</td>
                      <td className="py-4 px-6 font-bold text-gray-500 font-mono">{adm.email}</td>
                      <td className="py-4 px-6 font-bold text-indigo-600">{adm.role}</td>
                      <td className="py-4 px-6 text-center">
                        <span className="inline-flex items-center gap-1.5 text-[10px] font-black text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                          <span className="h-1.5 w-1.5 bg-emerald-500 rounded-full" />
                          {adm.status}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <button className="text-gray-300 hover:text-slate-900 p-1">
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
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Estates Directory</span>
              <ChevronRight className="h-3 w-3 text-gray-300" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">View Estate</span>
            </div>
            <h2 className="text-2xl font-black text-slate-900 mt-0.5">{estate.name}</h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => onEdit(estate)}
            className="flex items-center gap-1.5 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-black text-slate-700 hover:bg-slate-50 shadow-sm transition-all"
          >
            <Edit className="h-3.5 w-3.5" />
            Edit Estate
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-amber-50 border border-amber-100 rounded-xl text-xs font-black text-amber-700 hover:bg-amber-100 transition-all">
            <Ban className="h-3.5 w-3.5" />
            Suspend
          </button>
          <button className="flex items-center gap-1.5 px-4 py-2 bg-rose-50 border border-rose-100 rounded-xl text-xs font-black text-rose-700 hover:bg-rose-100 transition-all">
            <Trash2 className="h-3.5 w-3.5" />
            Delete
          </button>
        </div>
      </div>

      {/* Primary KPI Deck */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:border-blue-200 transition-colors cursor-default group">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Users className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 flex items-center gap-0.5">
              <TrendingUp className="h-2.5 w-2.5" /> +12%
            </span>
          </div>
          <span className="text-2xl font-black text-slate-900 block leading-none">12,532</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 block">Active Residents</span>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:border-blue-200 transition-colors cursor-default group">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <Building2 className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 flex items-center gap-0.5">
              <TrendingUp className="h-2.5 w-2.5" /> +2%
            </span>
          </div>
          <span className="text-2xl font-black text-slate-900 block leading-none">12</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 block">Housing Units</span>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:border-blue-200 transition-colors cursor-default group">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 flex items-center gap-0.5">
              <TrendingUp className="h-2.5 w-2.5" /> +8%
            </span>
          </div>
          <span className="text-2xl font-black text-slate-900 block leading-none">1,234</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 block">Security Guards</span>
        </div>

        <div className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:border-blue-200 transition-colors cursor-default group">
          <div className="flex justify-between items-start mb-4">
            <div className="h-10 w-10 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
              <UserCheck className="h-5 w-5" />
            </div>
            <span className="text-[10px] font-black text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100 flex items-center gap-0.5">
               Online
            </span>
          </div>
          <span className="text-2xl font-black text-slate-900 block leading-none">3</span>
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-2 block">Active Admins</span>
        </div>
      </div>

      {/* Sub-Navigation Tabs */}
      <div className="flex items-center gap-6 border-b border-gray-200 overflow-x-auto pb-px scrollbar-hide">
        {(["overview", "residents", "security", "visitors", "admins"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`text-xs font-black uppercase tracking-widest pb-4 relative transition-colors ${
              activeTab === tab ? "text-blue-600" : "text-gray-400 hover:text-slate-600"
            }`}
          >
            {tab === 'visitors' ? 'Visitors Log' : tab}
            {activeTab === tab && (
              <span className="absolute bottom-0 left-0 w-full h-1 bg-blue-600 rounded-t-full shadow-[0_-2px_8px_rgba(37,99,235,0.4)]" />
            )}
          </button>
        ))}
      </div>

      {/* Active Tab View */}
      <div className="min-h-[500px]">
        {renderTabContent()}
      </div>

    </div>
  );
}
