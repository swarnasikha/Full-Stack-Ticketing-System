import { useState, useMemo } from 'react';
import { useTickets }  from '../hooks/useTickets';
import { useAgents }   from '../hooks/useAgents';
import {
  updateTicketStatus, assignAgent, scheduleTicket,
  startEvaluation, acceptTicket, rejectTicket,
  dispatchTicket, markServiceExecution, markResolutionPending, resolveTicket,
} from '../services/ticketService';
import { TICKET_STATUSES, SERVICE_TYPES, STEPPER_STAGES, getStepperIndex } from '../utils/constants';
import {
  HiOutlineX, HiOutlineUser,
  HiOutlineCalendar, HiOutlineLocationMarker, HiOutlineEye,
  HiOutlineTicket, HiOutlineClock, HiOutlineCheckCircle,
  HiOutlineSwitchHorizontal, HiOutlineLockClosed,
  HiOutlineClipboardCheck, HiOutlineThumbDown, HiOutlineThumbUp,
  HiOutlineTruck, HiOutlineCog, HiOutlineBadgeCheck,
} from 'react-icons/hi';


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

/* ── Status styles ─────────────────────────────────────────────────────── */
const STATUS_STYLE = {
  'PendingReview':     { bg: '#fef9c3', color: '#854d0e',  label: 'Pending Review'     },
  'Evaluating':        { bg: '#e0f2fe', color: '#0369a1',  label: 'Evaluating'         },
  'Accepted':          { bg: '#dcfce7', color: '#166534',  label: 'Accepted'           },
  'Rejected':          { bg: '#fee2e2', color: '#991b1b',  label: 'Rejected'           },
  'Scheduled':         { bg: '#ede9fe', color: '#5b21b6',  label: 'Scheduled'          },
  'InProgress':        { bg: '#eef2ff', color: '#4338ca',  label: 'In Progress'        },
  'ServiceExecution':  { bg: '#fff7ed', color: '#9a3412',  label: 'Service Execution'  },
  'ResolutionPending': { bg: '#fdf4ff', color: '#7e22ce',  label: 'Resolution Pending' },
  'Resolved':          { bg: '#f0fdf4', color: '#14532d',  label: 'Resolved'           },
  // Backward compat for old Firestore tickets
  'Created':           { bg: B[100],    color: B[700],    label: 'Pending Review'      },
  'Assigned':          { bg: '#e0f2fe', color: '#0369a1', label: 'Accepted'            },
  'In Progress':       { bg: '#eef2ff', color: '#4338ca', label: 'In Progress'         },
  'Completed':         { bg: '#dcfce7', color: '#166534', label: 'Resolved'            },
  'Closed':            { bg: '#f1f5f9', color: '#475569', label: 'Closed'              },
  'Cancelled':         { bg: '#fee2e2', color: '#991b1b', label: 'Rejected'            },
};

/* ── TicketCard (horizontal single-column row) ─────────────────────────── */
function TicketCard({ ticket, onEvaluate, onAccept, onReject, onSchedule, onDispatch, onView, onReassign, onClose, agents, busy }) {
  const agentName  = agents.find(a => a.id === ticket.assignedAgentId)?.name || 'Unassigned';
  const normStatus = (ticket.status || '').toString().toLowerCase().replace(/[\s_.-]+/g, '');
  const isTerminal = ['rejected', 'closed', 'cancelled'].includes(normStatus);
  const s = STATUS_STYLE[ticket.status] || STATUS_STYLE['PendingReview'];

  return (
    <div
      className="animate-fade-in ticket-card"
      style={{
        background: '#fff',
        border: `1.5px solid ${isTerminal ? '#e2e8f0' : B[100]}`,
        borderRadius: '14px',
        padding: '0.85rem 1.25rem',
        boxShadow: `0 2px 8px ${B[50]}`,
        transition: 'all 0.22s ease',
        opacity: isTerminal ? 0.6 : 1,
        filter: isTerminal ? 'grayscale(0.2)' : 'none',
        position: 'relative',
      }}
      onMouseEnter={e => {
        if (!isTerminal) {
          e.currentTarget.style.boxShadow = `0 6px 20px ${B[200]}`;
          e.currentTarget.style.borderColor = B[300];
          e.currentTarget.style.transform = 'translateY(-2px)';
          e.currentTarget.style.background = B[50];
        }
      }}
      onMouseLeave={e => {
        e.currentTarget.style.boxShadow = `0 2px 8px ${B[50]}`;
        e.currentTarget.style.borderColor = isTerminal ? '#e2e8f0' : B[100];
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.background = '#fff';
      }}
    >
      {/* ── Row 1: Header — ID, Title, Status, Locked badge ── */}
      <div className="ticket-card-header" style={{
        display: 'flex', alignItems: 'center', gap: '0.6rem',
        marginBottom: '0.5rem', flexWrap: 'wrap',
      }}>
        <span style={{
          background: B[100], color: B[700],
          padding: '3px 10px', borderRadius: '6px',
          fontSize: '10px', fontWeight: 800, fontFamily: 'monospace', letterSpacing: '0.04em',
          flexShrink: 0,
        }}>
          #TF-{ticket.id.slice(0, 8).toUpperCase()}
        </span>

        <h3 style={{
          fontWeight: 800, color: B[900], fontSize: '0.95rem',
          lineHeight: 1.35, margin: 0, flex: 1, minWidth: 0,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {ticket.description?.split('\n')[0] || 'Service Request'}
        </h3>

        <div className="status-badges" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
          <span style={{
            background: s.bg, color: s.color,
            padding: '3px 10px', borderRadius: '6px',
            fontSize: '9.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
          }}>
            {s.label}
          </span>
          {isTerminal && (
            <span style={{
              display: 'flex', alignItems: 'center', gap: 4,
              background: '#f1f5f9', border: '1px solid #e2e8f0',
              borderRadius: 6, padding: '3px 8px',
              fontSize: '8px', fontWeight: 900, color: '#94a3b8',
              textTransform: 'uppercase', letterSpacing: '.1em',
            }}>
              <HiOutlineLockClosed size={10} /> Locked
            </span>
          )}
        </div>
      </div>

      {/* ── Unified Box: Stepper + Details Grid ── */}
      <div className="ticket-unified-box" style={{
        background: B[50],
        borderRadius: '10px',
        border: `1px solid ${B[100]}`,
        padding: '0.6rem 0.75rem',
        marginBottom: '0.55rem',
      }}>

        <TicketStepper ticket={ticket} isTerminal={isTerminal} />

        <div className="ticket-detail-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(145px, 1fr))',
          gap: '0.35rem 1.2rem',
          marginTop: '0.5rem',
        }}>
        <DetailCell icon={<HiOutlineUser size={13}/>}   label="Client"    value={ticket.name || '—'} />
        <DetailCell icon={<HiOutlineUser size={13}/>}   label="Agent"     value={agentName} highlight />
        <DetailCell icon={<HiOutlineTicket size={13}/>} label="Service"   value={ticket.serviceType || '—'} />
        <DetailCell icon={<HiOutlineClock size={13}/>}  label="Created"   value={ticket.createdAt?.toLocaleDateString() || '—'} />
        <DetailCell icon={<HiOutlineCalendar size={13}/>} label="Scheduled" value={ticket.scheduledAt?.toLocaleDateString() || '—'} />
        <DetailCell icon={<HiOutlineClock size={13}/>}  label="Updated"   value={ticket.updatedAt?.toLocaleDateString() || '—'} />
        <DetailCell icon={<HiOutlineUser size={13}/>}   label="Phone"     value={ticket.phoneNo || '—'} />
        <DetailCell icon={<HiOutlineUser size={13}/>}   label="Email"     value={ticket.email || '—'} />
        {(ticket.location?.address || ticket.location?.city) && (
          <DetailCell
            icon={<HiOutlineLocationMarker size={13}/>}
            label="Location"
            value={`${ticket.location?.address || ''}${ticket.location?.city ? ', ' + ticket.location.city : ''}`}
            wide
          />
        )}
        </div>
      </div>

      {/* ── Row 3: Actions bar ── */}
      <div className="ticket-actions-bar" style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        gap: '0.5rem', flexWrap: 'wrap',
      }}>
        {/* ── Flow-based action buttons ── */}
        {normStatus === 'pendingreview' || normStatus === 'created' || normStatus === 'open' || normStatus === 'pending' ? (
          <FlowBtn icon={<HiOutlineClipboardCheck size={13}/>} label="Start Review"
            color="#1d4ed8" hover="#1e40af"
            onClick={() => onEvaluate(ticket.id)} busy={busy} />

        ) : normStatus === 'evaluating' ? (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <FlowBtn  label="Accept"
              color="#166534" hover="#14532d"
              onClick={() => onAccept(ticket.id)} busy={busy} />
            <FlowBtn  label="Reject"
              color="#991b1b" hover="#7f1d1d"
              onClick={() => onReject(ticket.id)} busy={busy} />
          </div>

        ) : normStatus === 'accepted' || normStatus === 'assigned' ? (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <FlowBtn icon={<HiOutlineCalendar size={13}/>} label="Schedule"
              color="#5b21b6" hover="#4c1d95"
              onClick={() => onSchedule(ticket.id)} busy={busy} />
            <FlowBtn icon={<HiOutlineSwitchHorizontal size={13}/>} label="Reassign"
              color="#92400e" hover="#78350f" bg="#fef3c7" border="#fde68a"
              onClick={() => onReassign(ticket.id)} busy={busy} />
          </div>

        ) : normStatus === 'scheduled' ? (
          <span style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            fontSize: '10px', fontWeight: 800, color: '#7c3aed',
            textTransform: 'uppercase', letterSpacing: '0.1em',
            background: '#ede9fe', border: '1px solid #ddd6fe',
            borderRadius: '8px', padding: '6px 12px',
          }}>
            <HiOutlineClock size={12} />
            Waiting for update from agent
          </span>

        ) : normStatus === 'inprogress' || normStatus === 'serviceexecution' ? (
          <span style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            fontSize: '10px', fontWeight: 800, color: '#f59e0b',
            textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>
            <HiOutlineClock size={12} />
            Awaiting Agent Update
          </span>

        ) : normStatus === 'resolutionpending' || normStatus === 'resolved' || normStatus === 'completed' ? (
          <FlowBtn icon={<HiOutlineCheckCircle size={13}/>} label="Close Ticket"
            color="#0f172a" hover="#000000"
            onClick={() => onClose(ticket.id)} busy={busy} />

        ) : (
          <span style={{
            display: 'flex', alignItems: 'center', gap: '4px',
            fontSize: '10px', fontWeight: 800, color: '#94a3b8',
            textTransform: 'uppercase', letterSpacing: '0.1em',
          }}>
            <HiOutlineLockClosed size={12} />
            {normStatus === 'closed' ? 'Ticket Closed' : 'No Actions Available'}
          </span>
        )}

        {/* Right: view details */}
        <button
          onClick={() => onView(ticket)}
          style={{
            display: 'flex', alignItems: 'center', gap: '5px',
            color: B[600], fontSize: '10px', fontWeight: 800,
            background: B[50], border: `1px solid ${B[200]}`,
            borderRadius: '8px', padding: '6px 14px',
            cursor: 'pointer',
            textTransform: 'uppercase', letterSpacing: '0.06em',
            transition: 'all 0.15s',
          }}
          onMouseEnter={e => { e.currentTarget.style.background = B[100]; e.currentTarget.style.borderColor = B[300]; }}
          onMouseLeave={e => { e.currentTarget.style.background = B[50]; e.currentTarget.style.borderColor = B[200]; }}
        >
          <HiOutlineEye size={13}/> View Details
        </button>
      </div>
    </div>
  );
}

/* ── Detail cell (used inside the detail grid) ─────────────────────────── */
function DetailCell({ icon, label, value, highlight, wide }) {
  return (
    <div className="detail-cell" style={{
      display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
      gridColumn: wide ? '1 / -1' : undefined,
      minWidth: 0,
    }}>
      <span style={{
        color: highlight ? B[500] : B[400],
        flexShrink: 0, marginTop: '1px',
      }}>{icon}</span>
      <div style={{ minWidth: 0 }}>
        <div className="detail-label" style={{
          fontSize: '9px', fontWeight: 800, color: B[400],
          textTransform: 'uppercase', letterSpacing: '0.1em',
          marginBottom: '2px',
        }}>
          {label}
        </div>
        <div className="detail-value" style={{
          fontSize: '12px', fontWeight: 600, color: '#334155',
          lineHeight: 1.35,
          overflow: 'hidden', textOverflow: 'ellipsis',
          whiteSpace: wide ? 'normal' : 'nowrap',
        }}>
          {value}
        </div>
      </div>
    </div>
  );
}
/* ── FlowBtn — reusable action button for flow stages ───────────────────── */
function FlowBtn({ icon, label, onClick, busy, color, hover, bg, border }) {
  const isFilled = !bg;
  return (
    <button
      onClick={onClick}
      disabled={busy}
      style={{
        display: 'flex', alignItems: 'center', gap: '5px',
        padding: '6px 14px',
        background: bg || color, color: bg ? color : '#fff',
        border: border ? `1px solid ${border}` : 'none',
        borderRadius: '8px', fontSize: '10px', fontWeight: 800,
        textTransform: 'uppercase', letterSpacing: '0.06em',
        cursor: busy ? 'not-allowed' : 'pointer', transition: 'all 0.15s',
        boxShadow: isFilled ? `0 2px 6px ${color}55` : 'none',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = hover || color;
        e.currentTarget.style.color = '#fff';
        e.currentTarget.style.transform = 'translateY(-1px)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = bg || color;
        e.currentTarget.style.color = bg ? color : '#fff';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {icon}{label}
    </button>
  );
}

/* ── TicketStepper — visual flow progress bar ─────────────────────── */
function TicketStepper({ ticket, isTerminal }) {
  const currentIndex = getStepperIndex(ticket.status);
  const isRejected = ticket.status.toLowerCase().includes('reject') || ticket.status.toLowerCase().includes('cancel');

  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', width: '100%', margin: '4px 0 6px 0', padding: '0 8px' }}>
      {STEPPER_STAGES.map((step, idx) => {
        // If the ticket is permanently closed, the 'Closed' step itself should show up as completed (green check)
        const isClosedTask = ticket.status.toLowerCase().replace(/[\s_.-]+/g, '') === 'closed';
        const isCompleted = (idx === 0 || idx < currentIndex || (idx === currentIndex && isClosedTask)) && !isRejected;
        
        const isActive = idx === currentIndex && !isTerminal;
        const isPastOrActive = idx <= currentIndex;

        // Fetch timestamp from status history log
        let timeStr = null;
        if (ticket.statusHistory && Array.isArray(ticket.statusHistory)) {
          const log = ticket.statusHistory.find(h => step.statuses.includes(h.status.toLowerCase().replace(/[\s_.-]+/g, '')));
          if (log && log.timestamp) {
            const dateObj = log.timestamp.toDate ? log.timestamp.toDate() : new Date(log.timestamp);
            timeStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
          }
        }
        // Fallback for the Created step
        if (idx === 0 && !timeStr && ticket.createdAt) {
          const dateObj = typeof ticket.createdAt.toDate === 'function' ? ticket.createdAt.toDate() : new Date(ticket.createdAt);
          timeStr = dateObj.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
        }

        return (
          <div key={step.id} style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', flex: 1 }}>
            {/* Connecting Line perfectly spanning to the center of the next node */}
            {idx < STEPPER_STAGES.length - 1 && (
              <div style={{
                position: 'absolute', top: '9px', left: '50%', width: '100%', height: '2.5px',
                background: isCompleted ? '#22c55e' : '#f1f5f9', zIndex: 0
              }} />
            )}
            
            {/* Step Node Circle (elevated above the line) */}
            <div style={{
              width: '18px', height: '18px', borderRadius: '50%',
              background: isRejected && isActive ? '#ef4444' : isActive ? B[600] : isCompleted ? '#22c55e' : '#e2e8f0',
              border: isActive ? `3.5px solid ${B[200]}` : 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              zIndex: 1, position: 'relative',
            }}>
              {isCompleted && <HiOutlineCheckCircle color="#fff" size={12} />}
              {isRejected && isActive && <HiOutlineX color="#fff" size={12} />}
            </div>

            {/* Labels and Timestamps below */}
            <span style={{
              fontSize: '8px', fontWeight: isPastOrActive ? 800 : 700,
              color: isRejected && isActive ? '#b91c1c' : isActive ? B[800] : isCompleted ? '#166534' : '#94a3b8',
              marginTop: '3px', textAlign: 'center', textTransform: 'uppercase', letterSpacing: '0.02em',
              lineHeight: '1.2', zIndex: 1, position: 'relative', minWidth: '40px'
            }}>
              {step.label}
            </span>
            {timeStr && (
              <span style={{ fontSize: '7px', color: '#64748b', marginTop: '2px', textAlign: 'center', fontWeight: 600, zIndex: 1, position: 'relative' }}>
                {timeStr}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

/* ── Modal shell ───────────────────────────────────────────────────────── */
function Modal({ onClose, title, children, footer, wide }) {
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
          width: '100%', maxWidth: wide ? '560px' : '480px',
          boxShadow: '0 25px 60px rgba(0,0,0,0.18)',
          overflow: 'hidden',
          border: `1.5px solid ${B[100]}`,
        }}
        onClick={e => e.stopPropagation()}
      >
        <div style={{
          padding: '1.1rem 1.5rem',
          borderBottom: `1px solid ${B[100]}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: B[50],
        }}>
          <h3 style={{ fontSize: '0.72rem', fontWeight: 900, color: B[600], textTransform: 'uppercase', letterSpacing: '0.14em' }}>
            {title}
          </h3>
          <button onClick={onClose} style={{
            background: B[100], border: 'none', borderRadius: '8px',
            width: '28px', height: '28px', display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', color: B[500], transition: 'all 0.15s',
          }}>
            <HiOutlineX size={16}/>
          </button>
        </div>
        <div style={{ padding: '1.5rem' }}>{children}</div>
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
  const [localSearch, setLocalSearch] = useState('');
  const [statusFilter, setStatusFilter]   = useState('');
  const [serviceFilter, setServiceFilter] = useState('');
  
  const isSearching = localSearch.trim().length > 0 || statusFilter !== '' || serviceFilter !== '';
  const { tickets: realTickets, loading, loadMore, hasMore } = useTickets(isSearching);
  
  const { agents: realAgents }= useAgents();

  /* ── Dummy preview data (remove when done reviewing) ──────────────── */
  const DUMMY_AGENTS = [
    { id: 'agent-001', name: 'Anahitta Sharma', email: 'anahitta@company.com' },
    { id: 'agent-002', name: 'Ravi Kumar', email: 'ravi.kumar@company.com' },
  ];

  const DUMMY_TICKETS = [
    {
      id: 'a1b2c3d4e5f6',
      description: 'AC not cooling properly — customer reports warm air from vents despite thermostat set to 18°C',
      name: 'Yuvraj Singh',
      status: 'Created',
      serviceType: 'Technical Support',
      assignedAgentId: 'agent-001',
      phoneNo: '9315853964',
      email: 'yuvraj.steampro@gmail.com',
      createdAt: new Date('2026-03-31'),
      updatedAt: new Date('2026-03-31'),
      scheduledAt: new Date('2026-04-01'),
      location: { address: 'Sector 45', city: 'Noida' },
    },
    {
      id: 'f7e8d9c0b1a2',
      description: 'Feature request: Add dark mode support to the mobile application',
      name: 'Sikha Patel',
      status: 'Assigned',
      serviceType: 'Feature Request',
      assignedAgentId: 'agent-001',
      phoneNo: '698745321',
      email: 'swarnasikha666@gmail.com',
      createdAt: new Date('2026-03-31'),
      updatedAt: new Date('2026-03-31'),
      scheduledAt: new Date('2026-04-14'),
      location: { address: 'Bmsit', city: 'Bengaluru' },
    },
    {
      id: 'c3d4e5f6a7b8',
      description: 'Complaint against Steam — unauthorized charges on account for 3 consecutive months',
      name: 'Mithi Verma',
      status: 'Completed',
      serviceType: 'Complaint',
      assignedAgentId: 'agent-002',
      phoneNo: '9608743040',
      email: 'swarnasikha37@gmail.com',
      createdAt: new Date('2026-03-31'),
      updatedAt: new Date('2026-03-31'),
      scheduledAt: new Date('2026-04-10'),
      location: { address: 'nitte Meenakshi', city: 'Dhanbad' },
    },
    {
      id: 'c3d4e5f6a7b8',
      description: 'Complaint against Steam — unauthorized charges on account for 3 consecutive months',
      name: 'Mithi Verma',
      status: 'Completed',
      serviceType: 'Complaint',
      assignedAgentId: 'agent-002',
      phoneNo: '9608743040',
      email: 'swarnasikha37@gmail.com',
      createdAt: new Date('2026-03-31'),
      updatedAt: new Date('2026-03-31'),
      scheduledAt: new Date('2026-04-10'),
      location: { address: 'nitte Meenakshi', city: 'Dhanbad' },
    },
    {
      id: 'c3d4e5f6a7b8',
      description: 'Complaint against Steam — unauthorized charges on account for 3 consecutive months',
      name: 'Mithi Verma',
      status: 'Completed',
      serviceType: 'Complaint',
      assignedAgentId: 'agent-002',
      phoneNo: '9608743040',
      email: 'swarnasikha37@gmail.com',
      createdAt: new Date('2026-03-31'),
      updatedAt: new Date('2026-03-31'),
      scheduledAt: new Date('2026-04-10'),
      location: { address: 'nitte Meenakshi', city: 'Dhanbad' },
    },
    {
      id: 'a1b2c3d4e5f6',
      description: 'AC not cooling properly — customer reports warm air from vents despite thermostat set to 18°C',
      name: 'Yuvraj Singh',
      status: 'Created',
      serviceType: 'Technical Support',
      assignedAgentId: 'agent-001',
      phoneNo: '9315853964',
      email: 'yuvraj.steampro@gmail.com',
      createdAt: new Date('2026-03-31'),
      updatedAt: new Date('2026-03-31'),
      scheduledAt: new Date('2026-04-01'),
      location: { address: 'Sector 45', city: 'Noida' },
    },
    {
      id: 'f7e8d9c0b1a2',
      description: 'Feature request: Add dark mode support to the mobile application',
      name: 'Sikha Patel',
      status: 'Assigned',
      serviceType: 'Feature Request',
      assignedAgentId: 'agent-001',
      phoneNo: '698745321',
      email: 'swarnasikha666@gmail.com',
      createdAt: new Date('2026-03-31'),
      updatedAt: new Date('2026-03-31'),
      scheduledAt: new Date('2026-04-14'),
      location: { address: 'Bmsit', city: 'Bengaluru' },
    },
    {
      id: 'a1b2c3d4e5f6',
      description: 'AC not cooling properly — customer reports warm air from vents despite thermostat set to 18°C',
      name: 'Yuvraj Singh',
      status: 'Created',
      serviceType: 'Technical Support',
      assignedAgentId: 'agent-001',
      phoneNo: '9315853964',
      email: 'yuvraj.steampro@gmail.com',
      createdAt: new Date('2026-03-31'),
      updatedAt: new Date('2026-03-31'),
      scheduledAt: new Date('2026-04-01'),
      location: { address: 'Sector 45', city: 'Noida' },
    },
    {
      id: 'f7e8d9c0b1a2',
      description: 'Feature request: Add dark mode support to the mobile application',
      name: 'Sikha Patel',
      status: 'Assigned',
      serviceType: 'Feature Request',
      assignedAgentId: 'agent-001',
      phoneNo: '698745321',
      email: 'swarnasikha666@gmail.com',
      createdAt: new Date('2026-03-31'),
      updatedAt: new Date('2026-03-31'),
      scheduledAt: new Date('2026-04-14'),
      location: { address: 'Bmsit', city: 'Bengaluru' },
    },
    {
      id: 'a1b2c3d4e5f6',
      description: 'AC not cooling properly — customer reports warm air from vents despite thermostat set to 18°C',
      name: 'Yuvraj Singh',
      status: 'Created',
      serviceType: 'Technical Support',
      assignedAgentId: 'agent-001',
      phoneNo: '9315853964',
      email: 'yuvraj.steampro@gmail.com',
      createdAt: new Date('2026-03-31'),
      updatedAt: new Date('2026-03-31'),
      scheduledAt: new Date('2026-04-01'),
      location: { address: 'Sector 45', city: 'Noida' },
    },
    {
      id: 'f7e8d9c0b1a2',
      description: 'Feature request: Add dark mode support to the mobile application',
      name: 'Sikha Patel',
      status: 'Assigned',
      serviceType: 'Feature Request',
      assignedAgentId: 'agent-001',
      phoneNo: '698745321',
      email: 'swarnasikha666@gmail.com',
      createdAt: new Date('2026-03-31'),
      updatedAt: new Date('2026-03-31'),
      scheduledAt: new Date('2026-04-14'),
      location: { address: 'Bmsit', city: 'Bengaluru' },
    },
  ];

  // PREVIEW: always show dummy tickets alongside real ones (remove when done reviewing)
  const tickets = [...realTickets]; 
  // const tickets = [...DUMMY_TICKETS];
  const agents  = [...realAgents];

  const [selectedTicket, setSelectedTicket] = useState(null);
  const [assignId, setAssignId]       = useState(null);
  const [reassignId, setReassignId]   = useState(null);
  const [scheduleId, setScheduleId]   = useState(null);
  const [scheduleDate, setScheduleDate] = useState('');
  const [busy, setBusy]= useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const _norm = (s) => (s || '').toLowerCase().replace(/[\s_.-]+/g, '');
  const _filterNorm  = _norm(statusFilter);
  const _filterStage = STEPPER_STAGES.find(stage => stage.statuses.includes(_filterNorm));

  const NEW_STATUSES = new Set(['pendingreview', 'created', 'open', 'pending']);
  const isNewTicket  = (t) => NEW_STATUSES.has(_norm(t.status));

  // Always-visible new tickets section (no filter applied)
  const newTickets = useMemo(() => tickets.filter(isNewTicket), [tickets]);

  // Active queue: excludes new tickets, respects all filters
  const filtered = useMemo(() => tickets.filter(t => {
    if (isNewTicket(t)) return false; // already shown in new section
    if (statusFilter) {
      const ticketNorm = _norm(t.status);
      if (_filterStage) {
        if (!_filterStage.statuses.includes(ticketNorm)) return false;
      } else {
        if (ticketNorm !== _filterNorm) return false;
      }
    }
    if (serviceFilter && t.serviceType !== serviceFilter) return false;
    if (localSearch) {
      const lq = localSearch.toLowerCase().replace(/^#tf-/i, '');
      const displayId = t.id.slice(0, 8).toLowerCase();
      return (
        displayId.includes(lq) ||
        t.id.toLowerCase().includes(lq) ||
        t.description?.toLowerCase().includes(lq) ||
        t.serviceType?.toLowerCase().includes(lq) ||
        t.name?.toLowerCase().includes(lq) ||
        t.phoneNo?.toLowerCase().includes(lq) ||
        t.email?.toLowerCase().includes(lq)
      );
    }
    return true;
  }), [tickets, statusFilter, serviceFilter, localSearch]);

  const handleStatusChange = async (id, status) => {
    setBusy(true);
    try { await updateTicketStatus(id, status); } catch(e) { console.error(e); }
    setBusy(false);
  };

  const handleAction = async (actionPromise) => {
    setBusy(true);
    try { await actionPromise; } catch(e) { console.error(e); }
    setBusy(false);
  };

  const handleAssign = async (agentId) => {
    setBusy(true);
    try { 
      // Accepting a ticket also assigns the agent simultaneously in the flow
      await acceptTicket(assignId, agentId); 
      setAssignId(null); 
    } catch(e) { console.error(e); }
    setBusy(false);
  };

  const handleReassign = async (agentId) => {
    setBusy(true);
    try { await assignAgent(reassignId, agentId); setReassignId(null); } catch(e) { console.error(e); }
    setBusy(false);
  };

  // Returns true if the given datetime-local string is the same calendar day as today
  const isSameDay = (dateStr) => {
    if (!dateStr) return false;
    const selected = new Date(dateStr);
    const today = new Date();
    return (
      selected.getFullYear() === today.getFullYear() &&
      selected.getMonth()    === today.getMonth()    &&
      selected.getDate()     === today.getDate()
    );
  };

  const handleSchedule = async () => {
    if (!scheduleDate) return;
    if (isSameDay(scheduleDate)) return; // blocked — cannot schedule for today
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

  /* find current agent for reassign ticket */
  const reassignTicket = reassignId ? tickets.find(t => t.id === reassignId) : null;
  const reassignCurrentAgent = reassignTicket?.assignedAgentId;

  return (
    <div className="ticket-page" style={{ width: '100%', maxWidth: '1100px', margin: '0 auto' }}>

      {/* ── Compact Filter + Search Bar ── */}
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
        <div className="filter-title" style={{ flexShrink: 0 }}>
          <span style={{ fontSize: '11px', fontWeight: 900, color: B[600], textTransform: 'uppercase', letterSpacing: '0.12em' }}>
            Active Queue
          </span>
          <span style={{ fontSize: '10px', fontWeight: 600, color: B[400], marginLeft: '0.5rem' }}>
            {filtered.length}/{tickets.length - newTickets.length}
          </span>
        </div>

        {/* Search input (takes remaining space) */}
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
            placeholder="Search tickets..."
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

        {/* Filter dropdowns */}
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={selectStyle}>
          <option value="">ALL STATUS</option>
          {TICKET_STATUSES.map(s => <option key={s} value={s}>{(STATUS_STYLE[s]?.label || s).toUpperCase()}</option>)}
        </select>
        <select value={serviceFilter} onChange={e => setServiceFilter(e.target.value)} style={selectStyle}>
          <option value="">ALL SERVICES</option>
          {SERVICE_TYPES.map(s => <option key={s} value={s}>{s.toUpperCase()}</option>)}
        </select>

        {(statusFilter || serviceFilter || localSearch) && (
          <button
            onClick={() => { setStatusFilter(''); setServiceFilter(''); setLocalSearch(''); }}
            style={{
              padding: '0.35rem 0.75rem',
              background: B[600], color: '#fff',
              border: 'none', borderRadius: '8px',
              fontSize: '10px', fontWeight: 800, cursor: 'pointer',
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

      {/* ══ NEW TICKETS SECTION ══ */}
      {newTickets.length > 0 && (
        <div style={{ marginBottom: '1.1rem' }}>
          {/* Section header */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.6rem',
            marginBottom: '0.55rem',
          }}>
            <div style={{
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              background: '#fffbeb', border: '1.5px solid #fde68a',
              borderRadius: '10px', padding: '0.35rem 0.85rem',
            }}>
              <span style={{
                width: '7px', height: '7px', borderRadius: '50%',
                background: '#f59e0b',
                boxShadow: '0 0 0 3px #fde68a',
                display: 'inline-block', flexShrink: 0,
                animation: 'pulse 1.5s ease-in-out infinite',
              }} />
              <span style={{ fontSize: '11px', fontWeight: 900, color: '#92400e', textTransform: 'uppercase', letterSpacing: '0.12em' }}>
                New Tickets
              </span>
              <span style={{
                background: '#f59e0b', color: '#fff',
                borderRadius: '999px', padding: '1px 8px',
                fontSize: '10px', fontWeight: 900,
              }}>{newTickets.length}</span>
            </div>
            <span style={{ fontSize: '10px', color: B[300], fontWeight: 600 }}>Awaiting review — start ticket flow to proceed</span>
          </div>

          {/* New ticket cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
            {newTickets.map(t => (
              <div key={t.id} style={{
                borderLeft: '3.5px solid #f59e0b',
                borderRadius: '14px',
                overflow: 'hidden',
              }}>
                <TicketCard
                  ticket={t} agents={agents} busy={busy}
                  onAssign={id => setAssignId(id)}
                  onReassign={id => setReassignId(id)}
                  onSchedule={id => setScheduleId(id)}
                  onView={setSelectedTicket}
                  onClose={id => handleStatusChange(id, 'Closed')}
                  onEvaluate={id => handleAction(startEvaluation(id))}
                  onAccept={id => setAssignId(id)}
                  onReject={id => handleAction(rejectTicket(id))}
                  onDispatch={id => handleAction(dispatchTicket(id))}
                  onExecution={id => handleAction(markServiceExecution(id))}
                  onResolution={id => handleAction(markResolutionPending(id))}
                  onResolve={id => handleAction(resolveTicket(id))}
                />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ══ ACTIVE QUEUE SECTION ══ */}
      {/* Section header (only show if there are new tickets above, so user knows this is a different section) */}
      {newTickets.length > 0 && filtered.length > 0 && (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.55rem' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '0.5rem',
            background: B[50], border: `1.5px solid ${B[100]}`,
            borderRadius: '10px', padding: '0.35rem 0.85rem',
          }}>
            <span style={{ fontSize: '11px', fontWeight: 900, color: B[600], textTransform: 'uppercase', letterSpacing: '0.12em' }}>
              Active Queue
            </span>
            <span style={{ background: B[500], color: '#fff', borderRadius: '999px', padding: '1px 8px', fontSize: '10px', fontWeight: 900 }}>
              {filtered.length}
            </span>
          </div>
        </div>
      )}

      {/* ── Ticket List ── */}
      {filtered.length === 0 && newTickets.length === 0 ? (
        <div style={{
          background: '#fff', border: `1.5px solid ${B[100]}`,
          borderRadius: '20px', padding: '5rem 2rem',
          textAlign: 'center', boxShadow: `0 2px 12px ${B[50]}`,
        }}>
          <HiOutlineTicket size={48} style={{ margin: '0 auto 1rem', display: 'block', color: B[200] }} />
          <p style={{ fontWeight: 800, color: B[400], fontSize: '0.9rem' }}>Queue is empty</p>
          <p style={{ fontSize: '0.8rem', color: B[300], marginTop: '0.25rem' }}>No tickets in the system yet</p>
        </div>
      ) : filtered.length === 0 ? (
        <div style={{
          background: B[50], border: `1.5px dashed ${B[200]}`,
          borderRadius: '14px', padding: '2rem',
          textAlign: 'center',
        }}>
          <p style={{ fontWeight: 700, color: B[300], fontSize: '0.85rem' }}>No active tickets match your filters</p>
        </div>
      ) : (
        <div className="ticket-list-scroll" style={{
          maxHeight: '80vh',
          overflowY: 'auto',
          padding: '4px',
          scrollBehavior: 'smooth',
        }}>
        <div className="ticket-list" style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.55rem',
        }}>
          {filtered.map(t => (
            <TicketCard
              key={t.id} ticket={t} agents={agents} busy={busy}
              onAssign={id => setAssignId(id)}
              onReassign={id => setReassignId(id)}
              onSchedule={id => setScheduleId(id)}
              onView={setSelectedTicket}
              onClose={id => handleStatusChange(id, 'Closed')}
              onEvaluate={id => handleAction(startEvaluation(id))}
              onAccept={id => setAssignId(id)}
              onReject={id => handleAction(rejectTicket(id))}
              onDispatch={id => handleAction(dispatchTicket(id))}
              onExecution={id => handleAction(markServiceExecution(id))}
              onResolution={id => handleAction(markResolutionPending(id))}
              onResolve={id => handleAction(resolveTicket(id))}
            />
          ))}
        </div>
        
        {hasMore && (
          <button
            onClick={loadMore}
            disabled={busy}
            style={{
              width: '100%', marginTop: '1rem', padding: '0.85rem',
              background: '#eff6ff', color: '#3b82f6',
              border: '1.5px dashed #93c5fd', borderRadius: '14px',
              fontSize: '11px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.1em',
              cursor: busy ? 'wait' : 'pointer', transition: 'all 0.2s'
            }}
            onMouseEnter={e => { e.currentTarget.style.background = '#dbeafe'; e.currentTarget.style.borderColor = '#60a5fa'; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#eff6ff'; e.currentTarget.style.borderColor = '#93c5fd'; }}
          >
            {busy ? 'Loading...' : 'Load More Tickets ▼'}
          </button>
        )}
        </div>
      )}

      {/* ── Assign Modal (new assignment) ── */}
      {assignId && (
        <Modal title="Assign Personnel" onClose={() => setAssignId(null)}>
          <div style={{ maxHeight: '350px', overflowY: 'auto', margin: '-0.25rem' }}>
            {agents.length === 0 ? (
              <p style={{ textAlign: 'center', color: B[300], fontSize: '0.8rem', padding: '3rem 0' }}>No active agents</p>
            ) : (
              agents.map(a => (
                <button key={a.id} onClick={() => handleAssign(a.id)} disabled={busy}
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
                    flexShrink: 0,
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

      {/* ── Reassign Modal ── */}
      {reassignId && (
        <Modal title="Reassign to Another Agent" onClose={() => setReassignId(null)} wide>
          {reassignCurrentAgent && (
            <div style={{
              background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 10,
              padding: '0.65rem 1rem', marginBottom: '1rem',
              display: 'flex', alignItems: 'center', gap: '0.5rem',
              fontSize: '11px', fontWeight: 700, color: '#92400e',
            }}>
              <HiOutlineSwitchHorizontal size={14} />
              Currently assigned to: <strong>{agents.find(a => a.id === reassignCurrentAgent)?.name || 'Unknown'}</strong>
            </div>
          )}
          <p style={{ fontSize: '10px', fontWeight: 900, color: B[400], textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: '.75rem' }}>
            Select new agent
          </p>
          <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
            {agents.filter(a => a.id !== reassignCurrentAgent).length === 0 ? (
              <p style={{ textAlign: 'center', color: B[300], fontSize: '0.8rem', padding: '2rem 0' }}>No other agents available</p>
            ) : (
              agents.filter(a => a.id !== reassignCurrentAgent).map(a => (
                <button key={a.id} onClick={() => handleReassign(a.id)} disabled={busy}
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
                    flexShrink: 0,
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
            <div>
              {scheduleDate && isSameDay(scheduleDate) && (
                <div style={{
                  display: 'flex', alignItems: 'center', gap: '6px',
                  background: '#fef2f2', border: '1px solid #fecaca',
                  borderRadius: '10px', padding: '0.55rem 0.85rem',
                  marginBottom: '0.65rem',
                  fontSize: '11px', fontWeight: 700, color: '#b91c1c',
                }}>
                  <HiOutlineX size={13} />
                  Cannot schedule for today — please select a future date.
                </div>
              )}
              <button
                onClick={handleSchedule}
                disabled={!scheduleDate || busy || isSameDay(scheduleDate)}
                style={{
                  width: '100%', padding: '0.75rem',
                  background: (scheduleDate && !busy && !isSameDay(scheduleDate)) ? B[600] : B[200],
                  color: '#fff', border: 'none', borderRadius: '12px',
                  fontSize: '11px', fontWeight: 900,
                  textTransform: 'uppercase', letterSpacing: '0.12em',
                  cursor: (scheduleDate && !busy && !isSameDay(scheduleDate)) ? 'pointer' : 'not-allowed',
                  transition: 'all 0.2s',
                }}
              >
                {busy ? 'Processing...' : 'Confirm Schedule'}
              </button>
            </div>
          }
        >
          <div>
            <p style={{ fontSize: '10px', fontWeight: 900, color: B[400], textTransform: 'uppercase', letterSpacing: '0.14em', marginBottom: '0.5rem' }}>
              Arrival Window
            </p>
            <input
              type="datetime-local"
              value={scheduleDate}
              min={(() => { const d = new Date(); d.setDate(d.getDate() + 1); d.setSeconds(0, 0); return d.toISOString().slice(0, 16); })()}
              onChange={e => setScheduleDate(e.target.value)}
              style={{
                width: '100%', background: B[50],
                border: `1.5px solid ${scheduleDate && isSameDay(scheduleDate) ? '#fca5a5' : B[200]}`, borderRadius: '12px',
                padding: '0.85rem 1rem', fontSize: '0.875rem',
                color: B[900], outline: 'none', transition: 'all 0.2s',
              }}
              onFocus={e => { e.currentTarget.style.border = `1.5px solid ${B[400]}`; e.currentTarget.style.boxShadow = `0 0 0 3px ${B[100]}`; e.currentTarget.style.background = '#fff'; }}
              onBlur={e => { e.currentTarget.style.border = `1.5px solid ${scheduleDate && isSameDay(scheduleDate) ? '#fca5a5' : B[200]}`; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = B[50]; }}
            />
            <p style={{ fontSize: '10px', color: B[300], marginTop: '0.4rem', fontWeight: 600 }}>
              Earliest available: tomorrow onwards
            </p>
          </div>
        </Modal>
      )}

      {/* ── Detail Modal ── */}
      {selectedTicket && (() => {
        const s = STATUS_STYLE[selectedTicket.status] || STATUS_STYLE['Created'];
        const detailIsClosed = ['Closed', 'Cancelled'].includes(selectedTicket.status);
        const detailIsCompleted = selectedTicket.status === 'Completed';
        return (
          <Modal
            title="Case Review"
            onClose={() => setSelectedTicket(null)}
            wide
            footer={
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '0.5rem' }}>
                {detailIsCompleted && (
                  <button
                    onClick={() => { handleStatusChange(selectedTicket.id, 'Closed'); setSelectedTicket(null); }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: '5px',
                      padding: '0.55rem 1.25rem',
                      background: '#166534', color: '#fff',
                      border: 'none', borderRadius: '10px',
                      fontSize: '11px', fontWeight: 900,
                      textTransform: 'uppercase', letterSpacing: '0.08em',
                      cursor: 'pointer', transition: 'all 0.15s',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.background = '#15803d'; }}
                    onMouseLeave={e => { e.currentTarget.style.background = '#166534'; }}
                  >
                    <HiOutlineCheckCircle size={14} /> Close Ticket
                  </button>
                )}
                <button onClick={() => setSelectedTicket(null)}
                  style={{
                    padding: '0.6rem 1.5rem', marginLeft: 'auto',
                    background: B[50], color: B[600],
                    border: `1.5px solid ${B[200]}`, borderRadius: '10px',
                    fontSize: '11px', fontWeight: 800,
                    textTransform: 'uppercase', letterSpacing: '0.1em',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = B[100]; }}
                  onMouseLeave={e => { e.currentTarget.style.background = B[50]; }}
                >
                  Return to Queue
                </button>
              </div>
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
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                {detailIsClosed && (
                  <span style={{
                    display: 'flex', alignItems: 'center', gap: 3,
                    background: '#f1f5f9', border: '1px solid #e2e8f0',
                    borderRadius: 6, padding: '2px 8px',
                    fontSize: '8px', fontWeight: 900, color: '#94a3b8',
                    textTransform: 'uppercase', letterSpacing: '.1em',
                  }}>
                    <HiOutlineLockClosed size={10} /> Locked
                  </span>
                )}
                <span style={{
                  background: s.bg, color: s.color,
                  padding: '3px 10px', borderRadius: '6px',
                  fontSize: '9.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
                }}>
                  {s.label}
                </span>
              </div>
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