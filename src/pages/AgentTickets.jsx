import { useState, useMemo } from 'react';
import { useTickets } from '../hooks/useTickets';
import { useAuth }    from '../context/AuthContext';
import { updateTicketStatus } from '../services/ticketService';
import {
  HiOutlineTicket, HiOutlineLocationMarker,
  HiOutlineCalendar, HiOutlineUser, HiOutlineCheckCircle,
  HiOutlineClock, HiOutlineTrendingUp, HiOutlineX
} from 'react-icons/hi';

const AGENT_TRANSITIONS = {
  'Assigned':    ['In Progress', 'Cancelled'],
  'Scheduled':   ['In Progress', 'Cancelled'],
  'In Progress': ['Completed'],
  'Completed':   ['Closed'],
};

function StatCard({ label, value, icon: Icon }) {
  return (
    <div className="stat-card-horizontal animate-fade-in bg-white group hover:border-blue-100 transition-all">
      <div className="flex justify-between items-center w-full">
        <div className="space-y-1">
          <p className="label">{label}</p>
          <p className="value group-hover:text-blue-600 transition-colors">{value}</p>
        </div>
        <div className="p-3 rounded-xl bg-slate-50 text-slate-300 group-hover:bg-blue-50 group-hover:text-blue-500 transition-all">
          <Icon size={20} />
        </div>
      </div>
    </div>
  );
}

export default function AgentTickets() {
  const { user } = useAuth();
  const { tickets, loading } = useTickets();
  const [busy, setBusy]   = useState(null);
  const [filter, setFilter] = useState('active');

  const myTickets = useMemo(() =>
    tickets.filter(t => t.assignedAgentId === user?.uid),
    [tickets, user]
  );

  const displayed = useMemo(() =>
    filter === 'active'
      ? myTickets.filter(t => !['Closed', 'Cancelled', 'Completed'].includes(t.status))
      : myTickets,
    [myTickets, filter]
  );

  const handleUpdate = async (ticketId, newStatus) => {
    setBusy(ticketId);
    try { await updateTicketStatus(ticketId, newStatus); } catch (e) { console.error(e); }
    setBusy(null);
  };

  if (loading) return <div className="flex items-center justify-center min-h-[400px]"><div className="w-10 h-10 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin" /></div>;

  const done    = myTickets.filter(t => ['Completed', 'Closed'].includes(t.status)).length;
  const active  = myTickets.filter(t => !['Closed', 'Cancelled', 'Completed'].includes(t.status)).length;

  return (
    <div className="max-w-5xl mx-auto space-y-10 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
        <div className="space-y-1">
          <h1 className="text-3xl font-black text-slate-900 tracking-tight">Active Assignments</h1>
          <p className="text-slate-500 font-medium">Manage your active service queue and status updates.</p>
        </div>

        <div className="flex items-center gap-1 bg-white border border-slate-100 rounded-xl p-1 shadow-sm self-start sm:self-center">
          {[['active', 'Pending'], ['all', 'All Logs']].map(([v, l]) => (
            <button
              key={v}
              onClick={() => setFilter(v)}
              className={`px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all
                ${filter === v ? 'bg-slate-900 text-white shadow-xl shadow-slate-900/10' : 'text-slate-400 hover:text-slate-600'}`}
            >
              {l}
            </button>
          ))}
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <StatCard label="Tasks Pending" value={active} icon={HiOutlineClock} />
        <StatCard label="Successful" value={done} icon={HiOutlineCheckCircle} />
        <StatCard label="Life Record" value={myTickets.length} icon={HiOutlineTicket} />
      </div>

      {/* List */}
      {displayed.length === 0 ? (
        <div className="premium-card p-24 flex flex-col items-center justify-center text-center space-y-6 bg-white/50 border-dashed">
            <HiOutlineCheckCircle size={48} className="text-slate-200" />
            <p className="font-bold text-slate-400">
              {filter === 'active' ? "All caught up" : "No record available"}
            </p>
        </div>
      ) : (
        <div className="space-y-8">
          {displayed.map((ticket, i) => {
            const transitions = AGENT_TRANSITIONS[ticket.status] || [];
            const isBusy = busy === ticket.id;

            return (
              <div key={ticket.id} className="premium-card bg-white animate-fade-in group">
                <div className="flex flex-col lg:flex-row lg:items-start gap-8">
                  <div className="flex-1 space-y-5">
                    <div className="flex items-center justify-between">
                       <div className="flex items-center gap-3">
                        <span className="bg-slate-50 text-slate-400 px-2 py-1 rounded text-[10px] font-bold font-mono border border-slate-100">
                          #TF-{ticket.id.slice(0, 8)}
                        </span>
                        <span className={`badge-pill ${
                          ticket.status === 'In Progress' ? 'badge-pending' :
                          ticket.status === 'Completed' ? 'badge-resolved' : 'badge-open'
                        }`}>
                          {ticket.status}
                        </span>
                      </div>
                      <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{ticket.serviceType}</span>
                    </div>

                    <div className="space-y-1">
                        <h3 className="text-slate-900 font-black text-xl leading-tight tracking-tight">{ticket.description?.split('\n')[0] || 'Service Call'}</h3>
                        <p className="text-slate-500 text-sm leading-relaxed">{ticket.description}</p>
                    </div>

                    <div className="flex flex-wrap gap-x-8 gap-y-3 pt-2">
                        {ticket.location?.address && <Meta icon={<HiOutlineLocationMarker size={14}/>} text={ticket.location.address} color="text-emerald-500" />}
                        {ticket.scheduledAt && <Meta icon={<HiOutlineCalendar size={14}/>} text={ticket.scheduledAt.toLocaleString()} color="text-blue-500" />}
                        <Meta icon={<HiOutlineUser size={14}/>} text={`Client ID: ${ticket.userId?.slice(-6)}`} />
                    </div>
                  </div>

                  {transitions.length > 0 && (
                     <div className="lg:w-64 space-y-3 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.2em] text-center mb-1">Update Mission</p>
                        <div className="flex flex-col gap-2">
                            {transitions.map(status => (
                                <button
                                    key={status}
                                    onClick={() => handleUpdate(ticket.id, status)}
                                    disabled={isBusy}
                                    className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white border border-slate-200 text-slate-900 text-[10px] font-black uppercase tracking-widest rounded-xl hover:border-slate-900 transition-all shadow-sm"
                                >
                                    {isBusy && busy === ticket.id && <div className="w-3 h-3 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />}
                                    {status}
                                </button>
                            ))}
                        </div>
                     </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function Meta({ icon, text, color = 'text-slate-300' }) {
  return (
    <div className="flex items-center gap-2 text-[11px] text-slate-500 font-bold tracking-tight">
      <span className={color}>{icon}</span>
      <span className="truncate">{text}</span>
    </div>
  );
}
