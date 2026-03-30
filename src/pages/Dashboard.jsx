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
  'Created':     { bg: '#dbeafe', color: '#1d4ed8', label: 'Open' },
  'Assigned':    { bg: '#e0f2fe', color: '#0369a1', label: 'Assigned' },
  'In Progress': { bg: '#eef2ff', color: '#4338ca', label: 'In Progress' },
  'Completed':   { bg: '#f0fdf4', color: '#166534', label: 'Completed' },
  'Closed':      { bg: '#f1f5f9', color: '#475569', label: 'Closed' },
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
  const { tickets, loading: tlod } = useTickets();
  const [localSearch, setLocalSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const filteredTickets = tickets.filter(t =>
    t.description?.toLowerCase().includes(localSearch.toLowerCase()) ||
    t.serviceType?.toLowerCase().includes(localSearch.toLowerCase()) ||
    t.status?.toLowerCase().includes(localSearch.toLowerCase()) ||
    t.id.toLowerCase().includes(localSearch.toLowerCase())
  );

  const total    = tickets.length;
  const open     = tickets.filter(t => t.status === 'Created').length;
  const pending  = tickets.filter(t => ['Assigned', 'In Progress'].includes(t.status)).length;
  const resolved = tickets.filter(t => ['Completed', 'Closed'].includes(t.status)).length;

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
    <div style={{ width: '100%', maxWidth: '1100px', margin: '0 auto' }}>

  
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(4, 1fr)',
        gap: '1.25rem',
        marginBottom: '2.25rem',
        padding: '1rem',
      }}>
        <StatCard label="Total Volume"   value={total}    icon={HiOutlineTicket}           shadeIdx={0} />
        <StatCard label="Open Requests"  value={open}     icon={HiOutlineExclamationCircle} shadeIdx={1} />
        <StatCard label="In Progress"    value={pending}  icon={HiOutlineClock}             shadeIdx={2} />
        <StatCard label="Resolved"       value={resolved} icon={HiOutlineCheckCircle}       shadeIdx={3} />
      </div>

      {/* ── Ticket Feed Container ── */}
      <div style={{
        background: '#fff',
        border: `1.5px solid ${B[100]}`,
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: `0 2px 12px ${B[100]}`,
      }}>
        {/* Section header bar */}
        <div style={{
          padding: '1.1rem 1.75rem',
          borderBottom: `1px solid ${B[100]}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: B[50],
        }}>
          <div>
            <h3 style={{
              fontSize: '0.72rem',
              fontWeight: 900,
              color: B[500],
              textTransform: 'uppercase',
              letterSpacing: '0.14em',
            }}>
              Live Ticket Feed
            </h3>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: B[400] }}>
              {filteredTickets.length} {filteredTickets.length === 1 ? 'item' : 'items'} found
            </span>
          </div>
          {/* small live pulse dot */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
            <div style={{
              width: '8px', height: '8px', borderRadius: '50%',
              background: B[500],
              boxShadow: `0 0 0 3px ${B[200]}`,
              animation: 'pulse 2s ease-in-out infinite',
            }} />
            <span style={{ fontSize: '10px', color: B[400], fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Live</span>
          </div>
        </div>

        {/* ── Full-width Search Bar Row ── */}
        <div style={{ padding: '1rem 1.75rem', borderBottom: `1px solid ${B[50]}` }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              background: searchFocused ? '#fff' : B[50],
              border: `1.5px solid ${searchFocused ? B[400] : B[200]}`,
              borderRadius: '12px',
              padding: '0 1rem',
              height: '48px',
              width: '100%',
              transition: 'all 0.2s',
              boxShadow: searchFocused ? `0 0 0 3px ${B[100]}` : 'none',
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 30 30"
              fill={searchFocused ? B[500] : B[300]} style={{ flexShrink: 0, transition: 'fill 0.2s' }}>
              <path d="M13 3C7.489 3 3 7.489 3 13s4.489 10 10 10a9.95 9.95 0 0 0 6.322-2.264l5.971 5.971a1 1 0 1 0 1.414-1.414l-5.97-5.97A9.95 9.95 0 0 0 23 13c0-5.511-4.489-10-10-10m0 2c4.43 0 8 3.57 8 8s-3.57 8-8 8-8-3.57-8-8 3.57-8 8-8"/>
            </svg>
            <input
              type="text"
              placeholder="Search tickets, IDs, service type or status..."
              style={{
                flex: 1,
                border: 'none',
                outline: 'none',
                background: 'transparent',
                fontSize: '0.875rem',
                color: B[900],
                fontWeight: 500,
              }}
              value={localSearch}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onChange={e => setLocalSearch(e.target.value)}
            />
            {localSearch && (
              <button
                onClick={() => setLocalSearch('')}
                style={{
                  background: B[100],
                  border: 'none',
                  borderRadius: '50%',
                  width: '20px', height: '20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  cursor: 'pointer',
                  color: B[600],
                  fontSize: '11px',
                  fontWeight: 700,
                  flexShrink: 0,
                }}
              >✕</button>
            )}
          </div>
        </div>

        {/* ── Ticket Grid ── */}
        <div style={{ padding: '1.5rem 1.75rem' }}>
          {filteredTickets.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: '1rem',
            }}>
              {filteredTickets.map(t => <TicketRow key={t.id} ticket={t} />)}
            </div>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: '4rem 2rem',
            }}>
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