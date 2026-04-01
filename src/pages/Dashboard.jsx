import { useState } from 'react';
import { useTickets } from '../hooks/useTickets';
import {
  HiOutlineTicket,
  HiOutlineClock,
  HiOutlineCheckCircle,
  HiOutlineExclamationCircle,
} from 'react-icons/hi';

/* ── Blue-shade palette ─────────────────────────────────────────────────── */
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
// const B = {
//   50:  '#fff7ed',
//   100: '#ffedd5',
//   200: '#fed7aa',
//   300: '#fdba74',
//   400: '#fb923c',
//   500: '#f97316',
//   600: '#ea580c',
//   700: '#c2410c',
//   800: '#9a3412',
//   900: '#7c2d12'
// };

/* four distinct blue shades for the 4 stat cards */
const STAT_SHADES = [
  { bg: B[50],  border: B[200], icon: B[500], val: B[700] },   // sky-blue
  { bg: '#e0f2fe', border: '#7dd3fc', icon: '#0284c7', val: '#0c4a6e' }, // cyan-blue
  { bg: '#eef2ff', border: '#c7d2fe', icon: '#4f46e5', val: '#312e81' }, // indigo-blue
  { bg: '#f0f9ff', border: '#bae6fd', icon: '#0369a1', val: '#0c4a6e' }, // deep sky
];

function StatCard({ label, value, icon: Icon, shadeIdx = 0 }) {
  const c = STAT_SHADES[shadeIdx % STAT_SHADES.length];
  return (
    <div
      className="animate-fade-in"
      style={{
        background: '#fff',
        border: `1.5px solid ${c.border}`,
        borderRadius: '16px',
        padding: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        boxShadow: `0 2px 8px ${c.border}66`,
        transition: 'all 0.2s ease',
        cursor: 'default',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = `0 8px 24px ${c.border}99`;
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.background = c.bg;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = `0 2px 8px ${c.border}66`;
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.background = '#fff';
      }}
    >
      <div>
        <p style={{
          fontSize: '0.68rem',
          fontWeight: 700,
          textTransform: 'uppercase',
          letterSpacing: '0.1em',
          color: c.icon,
          marginBottom: '0.5rem',
          opacity: 0.8,
        }}>{label}</p>
        <p style={{
          fontSize: '2.1rem',
          fontWeight: 900,
          color: c.val,
          lineHeight: 1,
          letterSpacing: '-0.02em',
        }}>{value}</p>
      </div>
      <div style={{
        width: '52px',
        height: '52px',
        borderRadius: '14px',
        background: c.bg,
        border: `1px solid ${c.border}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: c.icon,
        flexShrink: 0,
      }}>
        <Icon size={22} />
      </div>
    </div>
  );
}

/* status badge colours — all in blue family */
const STATUS_BADGE = {
  'PendingReview':     { bg: '#fef9c3', color: '#854d0e', label: 'Pending Review' },
  'Evaluating':        { bg: '#e0f2fe', color: '#0369a1', label: 'Evaluating' },
  'Accepted':          { bg: '#dcfce7', color: '#166534', label: 'Accepted' },
  'Rejected':          { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
  'Scheduled':         { bg: '#ede9fe', color: '#5b21b6', label: 'Scheduled' },
  'InProgress':        { bg: '#eef2ff', color: '#4338ca', label: 'In Progress' },
  'ServiceExecution':  { bg: '#fff7ed', color: '#9a3412', label: 'Execution' },
  'ResolutionPending': { bg: '#fdf4ff', color: '#7e22ce', label: 'Resolution Pending' },
  'Resolved':          { bg: '#f0fdf4', color: '#14532d', label: 'Resolved' },
  // backward compat
  'Created':     { bg: '#dbeafe', color: '#1d4ed8', label: 'Pending Review' },
  'Assigned':    { bg: '#e0f2fe', color: '#0369a1', label: 'Accepted' },
  'In Progress': { bg: '#eef2ff', color: '#4338ca', label: 'In Progress' },
  'Completed':   { bg: '#f0fdf4', color: '#166534', label: 'Resolved' },
  'Closed':      { bg: '#f1f5f9', color: '#475569', label: 'Closed' },
  'Cancelled':   { bg: '#fee2e2', color: '#991b1b', label: 'Rejected' },
};

function TicketRow({ ticket }) {
  const s = STATUS_BADGE[ticket.status] || STATUS_BADGE['Created'];
  return (
    <div
      className="animate-fade-in"
      style={{
        background: '#fff',
        border: `1.5px solid ${B[100]}`,
        borderRadius: '14px',
        padding: '1.1rem 1.3rem',
        boxShadow: `0 2px 6px ${B[100]}`,
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.boxShadow = `0 6px 18px ${B[200]}`;
        e.currentTarget.style.borderColor = B[300];
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.background = B[50];
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = `0 2px 6px ${B[100]}`;
        e.currentTarget.style.borderColor = B[100];
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.background = '#fff';
      }}
    >
      {/* Top row */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.65rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <span style={{
            background: B[100],
            color: B[700],
            padding: '2px 8px',
            borderRadius: '6px',
            fontSize: '9.5px',
            fontWeight: 800,
            fontFamily: 'monospace',
            letterSpacing: '0.04em',
          }}>
            #TF-{ticket.id.slice(0, 8).toUpperCase()}
          </span>
          <span style={{
            background: s.bg,
            color: s.color,
            padding: '2px 8px',
            borderRadius: '6px',
            fontSize: '9.5px',
            fontWeight: 800,
            textTransform: 'uppercase',
            letterSpacing: '0.06em',
          }}>
            {s.label}
          </span>
        </div>
        <span style={{ fontSize: '10px', color: B[400], fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.07em' }}>
          {ticket.serviceType}
        </span>
      </div>

      {/* Title */}
      <h3 style={{
        fontWeight: 800,
        color: B[900],
        fontSize: '0.88rem',
        marginBottom: '0.3rem',
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {ticket.description?.split('\n')[0] || 'Support Request'}
      </h3>
      <p style={{
        fontSize: '0.78rem',
        color: '#64748b',
        lineHeight: 1.55,
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
      }}>
        {ticket.description}
      </p>

      {/* Footer */}
      <div style={{
        marginTop: '0.85rem',
        paddingTop: '0.7rem',
        borderTop: `1px solid ${B[100]}`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
          <div style={{
            width: '22px', height: '22px', borderRadius: '50%',
            background: B[100],
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '9px', fontWeight: 900, color: B[600],
          }}>
            {ticket.userId?.[0]?.toUpperCase() || 'U'}
          </div>
          <span style={{ fontSize: '10px', fontWeight: 700, color: B[400], textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Client: {ticket.userId?.slice(-6) || '—'}
          </span>
        </div>
        <span style={{ fontSize: '10px', color: B[300], fontWeight: 500 }}>
          {ticket.createdAt?.toLocaleDateString()}
        </span>
      </div>
    </div>
  );
}

/* ── Main Page ─────────────────────────────────────────────────────────── */
export default function Dashboard() {
  const [localSearch, setLocalSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const { tickets, loading: tlod, loadMore, hasMore } = useTickets(localSearch.trim().length > 0);

  const filteredTickets = tickets.filter(t =>
    t.description?.toLowerCase().includes(localSearch.toLowerCase()) ||
    t.serviceType?.toLowerCase().includes(localSearch.toLowerCase()) ||
    t.status?.toLowerCase().includes(localSearch.toLowerCase()) ||
    t.id.toLowerCase().includes(localSearch.toLowerCase())
  );

  const total    = tickets.length;
  const open     = tickets.filter(t => ['Created', 'PendingReview', 'Evaluating'].includes(t.status)).length;
  const pending  = tickets.filter(t => ['Assigned', 'Accepted', 'Scheduled', 'In Progress', 'InProgress', 'ServiceExecution'].includes(t.status)).length;
  const resolved = tickets.filter(t => ['Completed', 'Closed', 'Resolved', 'ResolutionPending'].includes(t.status)).length;

  if (tlod) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <div style={{
          width: '40px', height: '40px',
          border: `4px solid ${B[100]}`,
          borderTopColor: B[500],
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite',
        }} />
      </div>
    );
  }

  return (
    <div className="ticket-page" style={{ width: '100%', maxWidth: '1100px', margin: '0 auto' }}>

      {/* ── Compact Search Bar (matches Tickets page) ── */}
      <div className="ticket-filter-bar" style={{
        background: '#fff',
        border: `1.5px solid ${B[100]}`,
        borderRadius: '14px',
        boxShadow: `0 2px 8px ${B[50]}`,
        marginBottom: '0.85rem',
        padding: '0.6rem 1rem',
        display: 'flex', alignItems: 'center', gap: '0.75rem',
        flexWrap: 'wrap',
      }}>
        {/* Title + count */}
        <div style={{ flexShrink: 0 }}>
          <span style={{ fontSize: '11px', fontWeight: 900, color: B[600], textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Live Ticket Feed
          </span>
          <span style={{ fontSize: '10px', fontWeight: 600, color: B[400], marginLeft: '0.5rem' }}>
            {filteredTickets.length}/{tickets.length}
          </span>
        </div>

        {/* Search input */}
        <div style={{
          flex: 1, minWidth: '180px',
          display: 'flex', alignItems: 'center', gap: '0.5rem',
          background: searchFocused ? '#fff' : B[50],
          border: `1.5px solid ${searchFocused ? B[400] : B[200]}`,
          borderRadius: '10px', padding: '0 0.75rem', height: '36px',
          transition: 'all 0.2s',
          boxShadow: searchFocused ? `0 0 0 2px ${B[100]}` : 'none',
        }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 30 30"
            fill={searchFocused ? B[500] : B[300]} style={{ flexShrink: 0, transition: 'fill 0.2s' }}>
            <path d="M13 3C7.489 3 3 7.489 3 13s4.489 10 10 10a9.95 9.95 0 0 0 6.322-2.264l5.971 5.971a1 1 0 1 0 1.414-1.414l-5.97-5.97A9.95 9.95 0 0 0 23 13c0-5.511-4.489-10-10-10m0 2c4.43 0 8 3.57 8 8s-3.57 8-8 8-8-3.57-8-8 3.57-8 8-8"/>
          </svg>
          <input
            type="text"
            placeholder="Search tickets, IDs, service type or status..."
            style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '13px', color: B[900], fontWeight: 500 }}
            value={localSearch}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            onChange={e => setLocalSearch(e.target.value)}
          />
          {localSearch && (
            <button onClick={() => setLocalSearch('')} style={{
              background: B[100], border: 'none', borderRadius: '50%',
              width: '18px', height: '18px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: B[600], fontSize: '10px', fontWeight: 700, flexShrink: 0,
            }}>✕</button>
          )}
        </div>

        {/* Live pulse */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', flexShrink: 0 }}>
          <div style={{
            width: '8px', height: '8px', borderRadius: '50%',
            background: B[500],
            boxShadow: `0 0 0 3px ${B[200]}`,
            animation: 'pulse 2s ease-in-out infinite',
          }} />
          <span style={{ fontSize: '10px', color: B[400], fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Live</span>
        </div>
      </div>

      {/* ── Ticket Feed Container ── */}
      <div style={{
        background: '#fff',
        border: `1.5px solid ${B[100]}`,
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: `0 2px 12px ${B[100]}`,
      }}>
        {/* Section label row inside container */}
        <div style={{
          padding: '0.7rem 1rem',
          borderBottom: `1px solid ${B[100]}`,
          background: B[50],
        }}>
          <span style={{ fontSize: '9px', fontWeight: 900, color: B[400], textTransform: 'uppercase', letterSpacing: '0.14em' }}>
            {filteredTickets.length} {filteredTickets.length === 1 ? 'result' : 'results'}
          </span>
        </div>

        {/* ── Ticket List (horizontal single-column, responsive) ── */}
        <div className="ticket-list-scroll" style={{
          maxHeight: '80vh',
          overflowY: 'auto',
          padding: '1rem',
          scrollBehavior: 'smooth',
        }}>
          {filteredTickets.length > 0 ? (
            <>
              <div className="ticket-list" style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.85rem',
              }}>
                {filteredTickets.map(t => <TicketRow key={t.id} ticket={t} />)}
              </div>
              {hasMore && (
                <button
                  onClick={loadMore}
                  style={{
                    width: '100%', marginTop: '1rem', padding: '0.85rem',
                    background: '#eff6ff', color: '#3b82f6',
                    border: '1.5px dashed #93c5fd', borderRadius: '14px',
                    fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
                    cursor: 'pointer', transition: 'all 0.2s',
                    display: 'block'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#dbeafe'; e.currentTarget.style.borderColor = '#60a5fa'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#93c5fd'; }}
                >
                  Load More Tickets ▼
                </button>
              )}
            </>
          ) : (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <HiOutlineTicket size={48} style={{ margin: '0 auto 1rem', display: 'block', color: B[200] }} />
              <p style={{ fontWeight: 700, fontSize: '0.9rem', color: B[400] }}>No tickets matching your search</p>
              <p style={{ fontSize: '0.8rem', marginTop: '0.25rem', color: B[300] }}>Try adjusting your search query</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}