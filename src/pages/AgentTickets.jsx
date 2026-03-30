import { useState, useMemo } from 'react';
import { useTickets } from '../hooks/useTickets';
import { useAuth } from '../context/AuthContext';
import { updateTicketStatus } from '../services/ticketService';
import {
  HiOutlineTicket, HiOutlineLocationMarker,
  HiOutlineCalendar, HiOutlineUser, HiOutlineCheckCircle,
  HiOutlineClock, HiOutlineTrendingUp,
} from 'react-icons/hi';

/* ── Orange palette (matching Dashboard) ───────────────────────────────── */
const B = {
  50: '#fff7ed', 100: '#ffedd5', 200: '#fed7aa', 300: '#fdba74',
  400: '#fb923c', 500: '#f97316', 600: '#ea580c', 700: '#c2410c',
  800: '#9a3412', 900: '#7c2d12',
};

const AGENT_TRANSITIONS = {
  'Assigned':    ['In Progress', 'Cancelled'],
  'Scheduled':   ['In Progress', 'Cancelled'],
  'In Progress': ['Completed'],
  'Completed':   ['Closed'],
};

const STATUS_STYLE = {
  'Assigned':    { bg: B[100], color: B[700], label: 'Assigned' },
  'Scheduled':   { bg: B[50],  color: B[600], label: 'Scheduled' },
  'In Progress': { bg: '#fef3c7', color: '#92400e', label: 'In Progress' },
  'Completed':   { bg: '#dcfce7', color: '#166534', label: 'Completed' },
  'Closed':      { bg: '#f1f5f9', color: '#475569', label: 'Closed' },
  'Cancelled':   { bg: '#fee2e2', color: '#991b1b', label: 'Cancelled' },
};

const SHADES = [
  { bg: B[50], border: B[200], icon: B[500], val: B[700] },
  { bg: '#fef3c7', border: '#fde68a', icon: '#d97706', val: '#92400e' },
  { bg: '#fff7ed', border: '#fed7aa', icon: '#ea580c', val: '#7c2d12' },
];

function BlueStat({ label, value, icon: Icon, idx }) {
  const c = SHADES[idx % SHADES.length];
  return (
    <div className="animate-fade-in" style={{
      background: '#fff', border: `1.5px solid ${c.border}`, borderRadius: 16,
      padding: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      boxShadow: `0 2px 8px ${c.border}66`, transition: 'all .2s', cursor: 'default',
    }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 24px ${c.border}99`; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.background = c.bg; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 2px 8px ${c.border}66`; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#fff'; }}
    >
      <div>
        <p style={{ fontSize: '.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.1em', color: c.icon, marginBottom: '.5rem', opacity: .8 }}>{label}</p>
        <p style={{ fontSize: '2.1rem', fontWeight: 900, color: c.val, lineHeight: 1 }}>{value}</p>
      </div>
      <div style={{ width: 52, height: 52, borderRadius: 14, background: c.bg, border: `1px solid ${c.border}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: c.icon, flexShrink: 0 }}>
        <Icon size={22} />
      </div>
    </div>
  );
}

export default function AgentTickets() {
  const { user } = useAuth();
  const { tickets, loading } = useTickets();
  const [busy, setBusy] = useState(null);
  const [filter, setFilter] = useState('active');

  const myTickets = useMemo(() =>
    tickets.filter(t => t.assignedAgentId === user?.uid),
    [tickets, user]
  );

  const displayed = useMemo(() =>
    filter === 'active'
      ? myTickets.filter(t => !['Closed', 'Cancelled'].includes(t.status))
      : myTickets,
    [myTickets, filter]
  );

  const handleUpdate = async (ticketId, newStatus) => {
    setBusy(ticketId);
    try { await updateTicketStatus(ticketId, newStatus); } catch (e) { console.error(e); }
    setBusy(null);
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
      <div style={{ width: 40, height: 40, border: `4px solid ${B[100]}`, borderTopColor: B[500], borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
    </div>
  );

  const done = myTickets.filter(t => ['Completed', 'Closed'].includes(t.status)).length;
  const activeCt = myTickets.filter(t => !['Closed', 'Cancelled', 'Completed'].includes(t.status)).length;

  return (
    <div style={{ width: '100%', maxWidth: 1100, margin: '0 auto' }}>

      {/* ── Stats row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem', marginBottom: '1.75rem', padding: '1rem' }}>
        <BlueStat label="Tasks Pending" value={activeCt} icon={HiOutlineClock} idx={0} />
        <BlueStat label="Successful" value={done} icon={HiOutlineCheckCircle} idx={1} />
        <BlueStat label="Life Record" value={myTickets.length} icon={HiOutlineTicket} idx={2} />
      </div>

      {/* ── Tickets panel ── */}
      <div style={{ background: '#fff', border: `1.5px solid ${B[100]}`, borderRadius: 20, overflow: 'hidden', boxShadow: `0 2px 12px ${B[50]}` }}>

        {/* Panel header */}
        <div style={{ padding: '1.1rem 1.75rem', borderBottom: `1px solid ${B[100]}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: B[50], flexWrap: 'wrap', gap: '.75rem' }}>
          <div>
            <h3 style={{ fontSize: '.72rem', fontWeight: 900, color: B[600], textTransform: 'uppercase', letterSpacing: '.14em' }}>
              My Assignments
            </h3>
            <span style={{ fontSize: '.7rem', fontWeight: 600, color: B[400] }}>
              {displayed.length} {displayed.length === 1 ? 'ticket' : 'tickets'}
            </span>
          </div>

          {/* Toggle: Active / All */}
          <div style={{ display: 'flex', gap: '.35rem', background: '#fff', border: `1.5px solid ${B[200]}`, borderRadius: 10, padding: 3 }}>
            {[['active', 'Pending'], ['all', 'All Logs']].map(([v, l]) => (
              <button key={v} onClick={() => setFilter(v)} style={{
                padding: '5px 14px', borderRadius: 8, fontSize: 10, fontWeight: 900,
                textTransform: 'uppercase', letterSpacing: '.08em',
                border: 'none', cursor: 'pointer', transition: 'all .15s',
                background: filter === v ? B[600] : 'transparent',
                color: filter === v ? '#fff' : B[400],
              }}>
                {l}
              </button>
            ))}
          </div>
        </div>

        {/* Ticket list */}
        <div style={{ padding: '1.5rem 1.75rem' }}>
          {displayed.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <HiOutlineCheckCircle size={48} style={{ margin: '0 auto 1rem', display: 'block', color: B[200] }} />
              <p style={{ fontWeight: 800, color: B[500], fontSize: '.9rem' }}>
                {filter === 'active' ? 'All caught up — no pending tasks!' : 'No records available'}
              </p>
              <p style={{ fontSize: '.8rem', color: B[300], marginTop: '.25rem' }}>Your resolved tickets will appear here</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {displayed.map(ticket => {
                const transitions = AGENT_TRANSITIONS[ticket.status] || [];
                const isBusy = busy === ticket.id;
                const s = STATUS_STYLE[ticket.status] || STATUS_STYLE['Assigned'];
                const isClosed = ['Closed', 'Cancelled'].includes(ticket.status);

                return (
                  <div key={ticket.id} className="animate-fade-in" style={{
                    background: '#fff', border: `1.5px solid ${B[100]}`, borderRadius: 16,
                    padding: '1.25rem 1.5rem',
                    boxShadow: `0 2px 8px ${B[50]}`, transition: 'all .2s',
                    opacity: isClosed ? 0.65 : 1,
                  }}
                    onMouseEnter={e => { if (!isClosed) { e.currentTarget.style.boxShadow = `0 8px 24px ${B[200]}`; e.currentTarget.style.borderColor = B[300]; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.background = B[50]; } }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 2px 8px ${B[50]}`; e.currentTarget.style.borderColor = B[100]; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#fff'; }}
                  >
                    <div style={{ display: 'flex', flexDirection: 'row', gap: '1.5rem', alignItems: 'flex-start' }}>

                      {/* Left: ticket info */}
                      <div style={{ flex: 1, minWidth: 0 }}>
                        {/* ID + status + service type */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '.75rem', flexWrap: 'wrap', gap: '.5rem' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '.5rem' }}>
                            <span style={{ background: B[100], color: B[700], padding: '2px 8px', borderRadius: 6, fontSize: '9.5px', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '.04em' }}>
                              #TF-{ticket.id.slice(0, 8).toUpperCase()}
                            </span>
                            <span style={{ background: s.bg, color: s.color, padding: '2px 9px', borderRadius: 6, fontSize: '9.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                              {s.label}
                            </span>
                          </div>
                          <span style={{ fontSize: 10, color: B[400], fontWeight: 700, textTransform: 'uppercase', letterSpacing: '.07em' }}>{ticket.serviceType}</span>
                        </div>

                        {/* Title + description */}
                        <h3 style={{ fontWeight: 900, color: B[900], fontSize: '1.05rem', marginBottom: '.35rem', lineHeight: 1.3 }}>
                          {ticket.description?.split('\n')[0] || 'Service Call'}
                        </h3>
                        <p style={{ fontSize: '.8rem', color: '#64748b', lineHeight: 1.55, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '.75rem' }}>
                          {ticket.description}
                        </p>

                        {/* Meta info */}
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
                          {ticket.location?.address && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '.35rem' }}>
                              <HiOutlineLocationMarker size={13} style={{ color: B[400] }} />
                              <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>{ticket.location.address}</span>
                            </div>
                          )}
                          {ticket.scheduledAt && (
                            <div style={{ display: 'flex', alignItems: 'center', gap: '.35rem' }}>
                              <HiOutlineCalendar size={13} style={{ color: B[400] }} />
                              <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>{ticket.scheduledAt.toLocaleString()}</span>
                            </div>
                          )}
                          <div style={{ display: 'flex', alignItems: 'center', gap: '.35rem' }}>
                            <HiOutlineUser size={13} style={{ color: B[300] }} />
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>Client: {ticket.userId?.slice(-6)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Right: action panel */}
                      {transitions.length > 0 && (
                        <div style={{
                          width: 200, flexShrink: 0,
                          background: B[50], border: `1px solid ${B[100]}`,
                          borderRadius: 14, padding: '1rem',
                        }}>
                          <p style={{ fontSize: '9.5px', fontWeight: 900, color: B[400], textTransform: 'uppercase', letterSpacing: '.14em', textAlign: 'center', marginBottom: '.65rem' }}>
                            Update Status
                          </p>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '.5rem' }}>
                            {transitions.map(status => {
                              const isClose = status === 'Closed';
                              const isComplete = status === 'Completed';
                              const isCancel = status === 'Cancelled';
                              let btnBg = '#fff';
                              let btnColor = B[800];
                              let btnBorder = B[200];

                              if (isComplete) { btnBg = '#dcfce7'; btnColor = '#166534'; btnBorder = '#bbf7d0'; }
                              else if (isClose) { btnBg = B[600]; btnColor = '#fff'; btnBorder = B[600]; }
                              else if (isCancel) { btnBg = '#fee2e2'; btnColor = '#991b1b'; btnBorder = '#fca5a5'; }

                              return (
                                <button key={status} onClick={() => handleUpdate(ticket.id, status)} disabled={isBusy}
                                  style={{
                                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    gap: '.4rem', padding: '.55rem .75rem',
                                    background: btnBg, border: `1.5px solid ${btnBorder}`,
                                    color: btnColor, borderRadius: 10,
                                    fontSize: 10, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.08em',
                                    cursor: isBusy ? 'not-allowed' : 'pointer', transition: 'all .15s',
                                  }}
                                  onMouseEnter={e => { if (!isClose) { e.currentTarget.style.borderColor = B[400]; e.currentTarget.style.transform = 'translateY(-1px)'; } }}
                                  onMouseLeave={e => { if (!isClose) { e.currentTarget.style.borderColor = btnBorder; e.currentTarget.style.transform = 'translateY(0)'; } }}
                                >
                                  {isBusy && <div style={{ width: 10, height: 10, border: `2px solid ${B[200]}`, borderTopColor: B[600], borderRadius: '50%', animation: 'spin .6s linear infinite' }} />}
                                  {isClose && <HiOutlineCheckCircle size={13} />}
                                  {status}
                                </button>
                              );
                            })}
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
      </div>
    </div>
  );
}