import { useState, useMemo } from 'react';
import { useTickets }  from '../hooks/useTickets';
import { useAgents }   from '../hooks/useAgents';
import { updateTicketStatus, assignAgent, scheduleTicket } from '../services/ticketService';
import { TICKET_STATUSES, STATUS_TRANSITIONS, SERVICE_TYPES } from '../utils/constants';
import {
  HiOutlineX, HiOutlineUser,
  HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineEye,
  HiOutlineTicket, HiOutlineClock
} from 'react-icons/hi';

/* ── Blue palette (same as Dashboard) ──────────────────────────────────── */
const B = {
  50:  '#eff6ff',
  100: '#dbeafe',
  200: '#bfdbfe',
  300: '#93c5fd',
  400: '#60a5fa',
  500: '#3b82f6',
  600: '#2563eb',
  700: '#1d4ed8',
  800: '#1e40af',
  900: '#1e3a8a',
};

/* ── Status styles — all blue-family ────────────────────────────────────── */
const STATUS_STYLE = {
  'Created':     { bg: B[100],    color: B[700],  label: 'Open'       },
  'Assigned':    { bg: '#e0f2fe', color: '#0369a1', label: 'Assigned' },
  'In Progress': { bg: '#eef2ff', color: '#4338ca', label: 'In Progress' },
  'Completed':   { bg: '#dcfce7', color: '#166534', label: 'Completed' },
  'Closed':      { bg: '#f1f5f9', color: '#475569', label: 'Closed'   },
};

/* ── TicketCard ─────────────────────────────────────────────────────────── */
function TicketCard({ ticket, onAssign, onSchedule, onView, agents, busy }) {
  const agentName = agents.find(a => a.id === ticket.assignedAgentId)?.name || 'Unassigned';
  const isClosed  = ['Completed', 'Closed', 'Cancelled'].includes(ticket.status);
  const s = STATUS_STYLE[ticket.status] || STATUS_STYLE['Created'];

  return (
    <div
      className="animate-fade-in"
      style={{
        background: '#fff',
        border: `1.5px solid ${B[100]}`,
        borderRadius: '16px',
        padding: '1.25rem 1.4rem',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: `0 2px 8px ${B[50]}`,
        transition: 'all 0.2s ease',
        opacity: isClosed ? 0.7 : 1,
      }}
      onMouseEnter={e => {
        if (!isClosed) {
          e.currentTarget.style.boxShadow = `0 8px 24px ${B[200]}`;
          e.currentTarget.style.borderColor = B[300];
          e.currentTarget.style.transform = 'translateY(-3px)';
          e.currentTarget.style.background = B[50];
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = `0 2px 8px ${B[50]}`;
        e.currentTarget.style.borderColor = B[100];
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.background = '#fff';
      }}
    >
      {/* Top row: ID + status */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
        <span style={{
          background: B[100], color: B[700],
          padding: '2px 8px', borderRadius: '6px',
          fontSize: '9.5px', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.04em',
        }}>
          #TF-{ticket.id.slice(0, 8).toUpperCase()}
        </span>
        <span style={{
          background: s.bg, color: s.color,
          padding: '2px 9px', borderRadius: '6px',
          fontSize: '9.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
        }}>
          {s.label}
        </span>
      </div>

      {/* Title */}
      <h3 style={{
        fontWeight: 800, color: B[900], fontSize: '0.9rem',
        lineHeight: 1.35, marginBottom: '0.75rem',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
      }}>
        {ticket.description?.split('\n')[0] || 'Service Request'}
      </h3>

      {/* Meta rows (HORIZONTAL + GRID BASED) */}
<div
  style={{
    flex: 1,
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    columnGap: '0.75rem',
    rowGap: '0.5rem',
    marginBottom: '0.9rem',
  }}
>

  <MetaRow icon={<HiOutlineUser size={12}/>} label="Client" value={ticket.name || '—'} />
  <MetaRow icon={<HiOutlineUser size={12}/>} label="Agent" value={agentName} highlight />

  <MetaRow icon={<HiOutlineTicket size={12}/>} label="Service" value={ticket.serviceType || '—'} />
  <MetaRow icon={<HiOutlineClock size={12}/>}
    label="Created"
    value={ticket.createdAt?.toDate?.().toLocaleDateString() || '—'} />

  <MetaRow icon={<HiOutlineCalendar size={12}/>}
    label="Scheduled"
    value={ticket.scheduledAt?.toDate?.().toLocaleDateString() || '—'} />

  <MetaRow icon={<HiOutlineClock size={12}/>}
    label="Updated"
    value={ticket.updatedAt?.toDate?.().toLocaleDateString() || '—'} />

  <MetaRow icon={<HiOutlineUser size={12}/>} label="Phone" value={ticket.phoneNo || '—'} />
  <MetaRow icon={<HiOutlineUser size={12}/>} label="Email" value={ticket.email || '—'} />

</div>

{/* Full width row for location */}
{(ticket.location?.address || ticket.location?.city) && (
  <div style={{ marginBottom: '0.75rem' }}>
    <MetaRow
      icon={<HiOutlineLocationMarker size={12}/>}
      label="Location"
      value={`${ticket.location?.address || ''}${ticket.location?.city ? ', ' + ticket.location.city : ''}`}
    />
  </div>
)}

      {/* Footer actions */}
      <div style={{
        paddingTop: '0.75rem',
        borderTop: `1px solid ${B[100]}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '0.5rem',
      }}>
        {!isClosed ? (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button
              onClick={() => onAssign(ticket.id)}
              disabled={busy}
              style={{
                padding: '5px 12px',
                background: B[50], color: B[700],
                border: `1px solid ${B[200]}`,
                borderRadius: '8px', fontSize: '9.5px', fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: '0.06em',
                cursor: busy ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = B[100]; }}
              onMouseLeave={e => { e.currentTarget.style.background = B[50]; }}
            >
              Assign
            </button>
            <button
              onClick={() => onSchedule(ticket.id)}
              disabled={busy}
              style={{
                padding: '5px 12px',
                background: B[600], color: '#fff',
                border: 'none',
                borderRadius: '8px', fontSize: '9.5px', fontWeight: 800,
                textTransform: 'uppercase', letterSpacing: '0.06em',
                cursor: busy ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = B[700]; }}
              onMouseLeave={e => { e.currentTarget.style.background = B[600]; }}
            >
              Schedule
            </button>
          </div>
        ) : (
          <span style={{ fontSize: '9.5px', fontWeight: 800, color: B[300], textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            Archived
          </span>
        )}

        <button
          onClick={() => onView(ticket)}
          style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            color: B[500], fontSize: '9.5px', fontWeight: 800,
            background: 'none', border: 'none', cursor: 'pointer',
            textTransform: 'uppercase', letterSpacing: '0.06em',
            transition: 'color 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.color = B[700]; }}
          onMouseLeave={e => { e.currentTarget.style.color = B[500]; }}
        >
          Details <HiOutlineEye size={12}/>
        </button>
      </div>
    </div>
  );
}

function MetaRow({ icon, label, value, highlight }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
      <span style={{ color: highlight ? B[400] : B[300], flexShrink: 0 }}>{icon}</span>
      <span style={{ fontSize: '10.5px', color: '#64748b', fontWeight: 600 }}>
        <span style={{ color: B[400], fontWeight: 700 }}>{label}:</span> {value}
      </span>
    </div>
  );
}

/* ── Shared modal shell ─────────────────────────────────────────────────── */
function Modal({ onClose, title, children, footer }) {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 50,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(15,23,42,0.45)',
        backdropFilter: 'blur(6px)',
      }}
      onClick={onClose}
    >
      <div
        className="animate-fade-in"
        style={{
          background: '#fff', borderRadius: '20px',
          width: '100%', maxWidth: '480px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.18)',
          overflow: 'hidden',
          border: `1.5px solid ${B[100]}`,
        }}
        onClick={e => e.stopPropagation()}
      >
        {/* Modal header */}
        <div style={{
          padding: '1.1rem 1.5rem',
          borderBottom: `1px solid ${B[100]}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: B[50],
        }}>
          <h3 style={{ fontSize: '0.72rem', fontWeight: 900, color: B[600], textTransform: 'uppercase', letterSpacing: '0.14em' }}>
            {title}
          </h3>
          <button
            onClick={onClose}
            style={{
              background: B[100], border: 'none', borderRadius: '8px',
              width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: B[500], transition: 'all 0.15s',
            }}
          >
            <HiOutlineX size={16}/>
          </button>
        </div>

        {/* Modal body */}
        <div style={{ padding: '1.5rem' }}>{children}</div>

        {/* Modal footer */}
        {footer && (
          <div style={{ padding: '1rem 1.5rem', borderTop: `1px solid ${B[50]}`, background: B[50] }}>
            {footer}
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Main page ──────────────────────────────────────────────────────────── */
export default function Tickets() {
  const { tickets, loading }          = useTickets();
  const { agents }                    = useAgents();
  const [localSearch, setLocalSearch] = useState('');
  const [statusFilter, setStatusFilter]   = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [assignId, setAssignId]       = useState(null);
  const [scheduleId, setScheduleId]   = useState(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [busy, setBusy]               = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const filtered = useMemo(() => tickets.filter(t => {
    if (statusFilter  && t.status      !== statusFilter)  return false;
    if (serviceFilter && t.serviceType !== serviceFilter) return false;
    if (localSearch) {
      const lq = localSearch.toLowerCase();
      return (
        t.description?.toLowerCase().includes(lq) ||
        t.serviceType?.toLowerCase().includes(lq) ||
        t.id.toLowerCase().includes(lq)
      );
    }
    return true;
  }), [tickets, statusFilter, serviceFilter, localSearch]);

  const handleStatusChange = async (id, status) => {
    setBusy(true);
    try { await updateTicketStatus(id, status); } catch(e) { console.error(e); }
    setBusy(false);
  };

  const handleAssign = async (agentId) => {
    setBusy(true);
    try { await assignAgent(assignId, agentId); setAssignId(null); } catch(e) { console.error(e); }
    setBusy(false);
  };

  const handleSchedule = async () => {
    if (!scheduleDate) return;
    setBusy(true);
    try { await scheduleTicket(scheduleId, scheduleDate); setScheduleId(null); setScheduleDate(''); } catch(e) { console.error(e); }
    setBusy(false);
  };

  const selectStyle = {
    background: '#fff',
    border: `1.5px solid ${B[200]}`,
    borderRadius: '10px',
    padding: '0.45rem 0.9rem',
    fontSize: '11px',
    fontWeight: 700,
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
    color: B[700],
    outline: 'none',
    cursor: 'pointer',
    appearance: 'none',
    paddingRight: '1.5rem',
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
      <div style={{
        width: '40px', height: '40px',
        border: `4px solid ${B[100]}`, borderTopColor: B[500],
        borderRadius: '50%', animation: 'spin 0.8s linear infinite',
      }} />
    </div>
  );

  return (
    <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto' }}>

      {/* ── Page Header ── */}
      

      {/* ── Filter + Search Container ── */}
      <div style={{
        background: '#fff',
        border: `1.5px solid ${B[100]}`,
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: `0 2px 12px ${B[50]}`,
        marginBottom: '1.75rem',
        padding: '1rem',
      }}>
        {/* Top row: title + filter dropdowns */}
        <div style={{
          padding: '1.1rem 1.75rem',
          borderBottom: `1px solid ${B[100]}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: B[50],
          flexWrap: 'wrap', gap: '0.75rem',
        }}>
          <div>
            <p style={{ fontSize: '0.72rem', fontWeight: 900, color: B[500], textTransform: 'uppercase', letterSpacing: '0.14em' }}>
              Ticket Queue
            </p>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: B[400] }}>
              {filtered.length} of {tickets.length} {tickets.length === 1 ? 'ticket' : 'tickets'}
            </span>
          </div>

          <div style={{ display: 'flex', gap: '0.65rem', flexWrap: 'wrap' }}>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
              <option value="">All Status</option>
              {TICKET_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={serviceFilter} onChange={e => setServiceFilter(e.target.value)} style={selectStyle}>
              <option value="">All Services</option>
              {SERVICE_TYPES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            {(statusFilter || serviceFilter || localSearch) && (
              <button
                onClick={() => { setStatusFilter(''); setServiceFilter(''); setLocalSearch(''); }}
                style={{
                  padding: '0.45rem 0.9rem',
                  background: B[600], color: '#fff',
                  border: 'none', borderRadius: '10px',
                  fontSize: '11px', fontWeight: 800, cursor: 'pointer',
                  textTransform: 'uppercase', letterSpacing: '0.06em',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = B[700]; }}
                onMouseLeave={e => { e.currentTarget.style.background = B[600]; }}
              >
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Search bar row */}
        <div style={{ padding: '1rem 1.75rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            background: searchFocused ? '#fff' : B[50],
            border: `1.5px solid ${searchFocused ? B[400] : B[200]}`,
            borderRadius: '12px', padding: '0 1rem', height: '48px',
            width: '100%', transition: 'all 0.2s',
            boxShadow: searchFocused ? `0 0 0 3px ${B[100]}` : 'none',
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 30 30"
              fill={searchFocused ? B[500] : B[300]} style={{ flexShrink: 0, transition: 'fill 0.2s' }}>
              <path d="M13 3C7.489 3 3 7.489 3 13s4.489 10 10 10a9.95 9.95 0 0 0 6.322-2.264l5.971 5.971a1 1 0 1 0 1.414-1.414l-5.97-5.97A9.95 9.95 0 0 0 23 13c0-5.511-4.489-10-10-10m0 2c4.43 0 8 3.57 8 8s-3.57 8-8 8-8-3.57-8-8 3.57-8 8-8"/>
            </svg>
            <input
              type="text"
              placeholder="Search by description, ID, or service type..."
              style={{
                flex: 1, border: 'none', outline: 'none',
                background: 'transparent', fontSize: '0.875rem',
                color: B[900], fontWeight: 500,
              }}
              value={localSearch}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onChange={e => setLocalSearch(e.target.value)}
            />
            {localSearch && (
              <button onClick={() => setLocalSearch('')} style={{
                background: B[100], border: 'none', borderRadius: '50%',
                width: '20px', height: '20px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: B[600], fontSize: '11px', fontWeight: 700, flexShrink: 0,
              }}>✕</button>
            )}
          </div>
        </div>
      </div>

      {/* ── Ticket Grid ── */}
      {filtered.length === 0 ? (
        <div style={{
          background: '#fff', border: `1.5px solid ${B[100]}`,
          borderRadius: '20px', padding: '5rem 2rem',
          textAlign: 'center', boxShadow: `0 2px 12px ${B[50]}`,
        }}>
          <HiOutlineTicket size={48} style={{ margin: '0 auto 1rem', display: 'block', color: B[200] }} />
          <p style={{ fontWeight: 800, color: B[400], fontSize: '0.9rem' }}>Queue is empty</p>
          <p style={{ fontSize: '0.8rem', color: B[300], marginTop: '0.25rem' }}>No tickets match your filters</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: '1rem',
        }}>
          {filtered.map(t => (
            <TicketCard
              key={t.id} ticket={t} agents={agents} busy={busy}
              onAssign={id => setAssignId(id)}
              onSchedule={id => setScheduleId(id)}
              onView={setSelectedTicket}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}

      {/* ── Assign Modal ── */}
      {assignId && (
        <Modal title="Assign Personnel" onClose={() => setAssignId(null)}>
          <div style={{ maxHeight: '350px', overflowY: 'auto', margin: '-0.25rem' }}>
            {agents.length === 0 ? (
              <p style={{ textAlign: 'center', color: B[300], fontSize: '0.8rem', padding: '3rem 0' }}>No active agents</p>
            ) : (
              agents.map(a => (
                <button
                  key={a.id}
                  onClick={() => handleAssign(a.id)}
                  disabled={busy}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center',
                    gap: '0.85rem', padding: '0.75rem 0.85rem',
                    borderRadius: '12px', border: 'none',
                    background: 'none', cursor: busy ? 'not-allowed' : 'pointer',
                    transition: 'background 0.15s', textAlign: 'left',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = B[50]; }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'none'; }}
                >
                  <div style={{
                    width: '40px', height: '40px', borderRadius: '12px',
                    background: B[100], display: 'flex', alignItems: 'center',
                    justifyContent: 'center', color: B[600], fontWeight: 900, fontSize: '13px',
                    flexShrink: 0, transition: 'all 0.15s',
                  }}>
                    {a.name?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div>
                    <p style={{ color: B[900], fontWeight: 700, fontSize: '0.875rem' }}>{a.name}</p>
                    <p style={{ fontSize: '11px', color: B[400], fontWeight: 500 }}>{a.email}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </Modal>
      )}

      {/* ── Schedule Modal ── */}
      {scheduleId && (
        <Modal
          title="Set Appointment"
          onClose={() => { setScheduleId(null); setScheduleDate(''); }}
          footer={
            <button
              onClick={handleSchedule}
              disabled={!scheduleDate || busy}
              style={{
                width: '100%', padding: '0.75rem',
                background: scheduleDate && !busy ? B[600] : B[200],
                color: '#fff', border: 'none', borderRadius: '12px',
                fontSize: '11px', fontWeight: 900,
                textTransform: 'uppercase', letterSpacing: '0.12em',
                cursor: scheduleDate && !busy ? 'pointer' : 'not-allowed',
                transition: 'all 0.2s',
              }}
            >
              {busy ? 'Processing...' : 'Confirm Dispatch'}
            </button>
          }
        >
          <div>
            <p style={{ fontSize: '10px', fontWeight: 900, color: B[400], textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '0.5rem' }}>
              Arrival Window
            </p>
            <input
              type="datetime-local"
              value={scheduleDate}
              onChange={e => setScheduleDate(e.target.value)}
              style={{
                width: '100%', background: B[50],
                border: `1.5px solid ${B[200]}`, borderRadius: '12px',
                padding: '0.85rem 1rem', fontSize: '0.875rem',
                color: B[900], outline: 'none',
                transition: 'all 0.2s',
              }}
              onFocus={e => {
                e.currentTarget.style.border = `1.5px solid ${B[400]}`;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${B[100]}`;
                e.currentTarget.style.background = '#fff';
              }}
              onBlur={e => {
                e.currentTarget.style.border = `1.5px solid ${B[200]}`;
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.background = B[50];
              }}
            />
          </div>
        </Modal>
      )}

      {/* ── Detail Modal ── */}
      {selectedTicket && (() => {
        const s = STATUS_STYLE[selectedTicket.status] || STATUS_STYLE['Created'];
        return (
          <Modal
            title="Case Review"
            onClose={() => setSelectedTicket(null)}
            footer={
              <button
                onClick={() => setSelectedTicket(null)}
                style={{
                  padding: '0.6rem 1.5rem',
                  background: B[50], color: B[600],
                  border: `1.5px solid ${B[200]}`, borderRadius: '10px',
                  fontSize: '11px', fontWeight: 800,
                  textTransform: 'uppercase', letterSpacing: '0.1em',
                  cursor: 'pointer', float: 'right', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { e.currentTarget.style.background = B[100]; }}
                onMouseLeave={e => { e.currentTarget.style.background = B[50]; }}
              >
                Return to Queue
              </button>
            }
          >
            {/* ID + status */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
              <span style={{
                fontFamily: 'monospace', fontSize: '10px', fontWeight: 800,
                background: B[100], color: B[700],
                padding: '3px 10px', borderRadius: '6px',
              }}>
                #{selectedTicket.id}
              </span>
              <span style={{
                background: s.bg, color: s.color,
                padding: '3px 10px', borderRadius: '6px',
                fontSize: '9.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
              }}>
                {s.label}
              </span>
            </div>

            {/* Detail grid */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.5rem' }}>
              {[
                ['Service Request', selectedTicket.serviceType || '—'],
                ['Entry Date',      selectedTicket.createdAt?.toLocaleDateString() || '—'],
                ['Assigned Rep',    agents.find(a => a.id === selectedTicket.assignedAgentId)?.name || 'Needs Assignment'],
                ['Dispatch Time',   selectedTicket.scheduledAt?.toLocaleString() || 'Not Scheduled'],
              ].map(([k, v]) => (
                <div key={k}>
                  <p style={{ fontSize: '9.5px', fontWeight: 900, color: B[300], textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.25rem' }}>{k}</p>
                  <p style={{ color: B[800], fontWeight: 700, fontSize: '0.875rem' }}>{v}</p>
                </div>
              ))}
            </div>

            {/* Description */}
            <div>
              <p style={{ fontSize: '9.5px', fontWeight: 900, color: B[300], textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.5rem' }}>
                Diagnostic Details
              </p>
              <div style={{
                background: B[50], border: `1px solid ${B[100]}`,
                borderRadius: '12px', padding: '1rem',
                fontSize: '0.85rem', color: '#334155',
                lineHeight: 1.6, maxHeight: '150px', overflowY: 'auto',
              }}>
                {selectedTicket.description}
              </div>
            </div>
          </Modal>
        );
      })()}
    </div>
  );
}
