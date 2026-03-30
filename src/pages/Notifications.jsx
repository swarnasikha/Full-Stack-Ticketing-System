import { useState } from 'react';
import { useTickets } from '../hooks/useTickets';
import { HiOutlineBell, HiOutlineTicket, HiOutlineUserGroup, HiOutlineChatAlt2, HiOutlineX } from 'react-icons/hi';

export default function Notifications() {
  const { loading } = useTickets();
  const [notifications] = useState([]);
  const unreadCount = 0;

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin" /></div>;

  return (
    <div className="max-w-4xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col gap-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Alerts</h1>
          <p className="text-slate-500 font-medium">Critical updates and network operations notifications.</p>
      </div>

      <div className="premium-card p-24 flex flex-col items-center justify-center text-center space-y-6 bg-white/50 border-dashed">
          <div className="w-20 h-20 rounded-3xl bg-slate-50 flex items-center justify-center text-slate-200 border border-slate-100 rotate-3">
              <HiOutlineBell size={40} />
          </div>
          <div className="space-y-2">
            <p className="text-lg font-black text-slate-900 tracking-tight">All systems operational</p>
            <p className="text-sm text-slate-400 max-w-xs mx-auto">No new alerts or critical notifications detected at this time.</p>
          </div>
          <button className="px-8 py-3 bg-slate-900 text-white text-[10px] font-black uppercase tracking-[0.2em] rounded-xl shadow-2xl shadow-slate-900/20 active:scale-95 transition-all">
            Refresh Stream
          </button>
      </div>
    </div>
  );
}
