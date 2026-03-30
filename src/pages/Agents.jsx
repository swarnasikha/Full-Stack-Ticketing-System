import { useState } from 'react';
import { useAgents } from '../hooks/useAgents';
import { useTickets } from '../hooks/useTickets';
import { addAgent, removeAgent } from '../services/agentService';
import {
  HiOutlineUserAdd,
  HiOutlineTrash,
  HiOutlineX,
  HiOutlineMail,
  HiOutlinePhone,
  HiOutlineTicket,
  HiOutlineUserGroup,
  HiOutlineTrendingUp,
} from 'react-icons/hi';

const B = {
  50: '#eff6ff', 100: '#dbeafe', 200: '#bfdbfe', 300: '#93c5fd',
  400: '#60a5fa', 500: '#3b82f6', 600: '#2563eb', 700: '#1d4ed8',
  800: '#1e40af', 900: '#1e3a8a',
};

const SHADES = [
  { bg: B[50], border: B[200], icon: B[500], val: B[700] },
  { bg: '#e0f2fe', border: '#7dd3fc', icon: '#0284c7', val: '#0c4a6e' },
  { bg: '#f0f9ff', border: '#bae6fd', icon: '#0369a1', val: '#0c4a6e' },
];

function BlueStat({ label, value, icon: Icon, idx }) {
  const c = SHADES[idx % SHADES.length];
  return (
    <div
      className="animate-fade-in"
      style={{
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

export default function Agents() {
  const { agents, loading } = useAgents();
  const { tickets } = useTickets();
  const [localSearch, setLocalSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '' });
  const [formBusy, setFormBusy] = useState(false);
  const [formErr, setFormErr] = useState('');

  const active = id => tickets.filter(t => t.assignedAgentId === id && !['Completed', 'Closed', 'Cancelled'].includes(t.status)).length;

  const filtered = agents.filter(a =>
    a.name?.toLowerCase().includes(localSearch.toLowerCase()) ||
    a.email?.toLowerCase().includes(localSearch.toLowerCase()) ||
    a.id.toLowerCase().includes(localSearch.toLowerCase())
  );

  const handleAdd = async e => {
    e.preventDefault();
    if (!form.name || !form.email) { setFormErr('Name and email required.'); return; }
    if (!form.password || form.password.length < 6) { setFormErr('Password min 6 chars.'); return; }
    setFormBusy(true); setFormErr('');
    try { await addAgent(form); setForm({ name: '', email: '', phone: '', password: '' }); setShowAdd(false); }
    catch (err) { setFormErr(err.message); }
    setFormBusy(false);
  };

  const handleRemove = async (id, name) => {
    if (!window.confirm(`Remove agent "${name}"?`)) return;
    try { await removeAgent(id); } catch (e) { console.error(e); }
  };

  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400 }}>
      <div style={{ width: 40, height: 40, border: `4px solid ${B[100]}`, borderTopColor: B[500], borderRadius: '50%', animation: 'spin .8s linear infinite' }} />
    </div>
  );

  return (
    <div style={{ width: '100%', maxWidth: 1100, margin: '0 auto' }}>

      {/* ── Stats row ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '1.25rem', marginBottom: '1.75rem', padding: '1rem' }}>
        <BlueStat label="Total Staff" value={agents.length} icon={HiOutlineUserGroup} idx={0} />
        <BlueStat label="On-Mission" value={agents.filter(a => active(a.id) > 0).length} icon={HiOutlineTrendingUp} idx={1} />
        <BlueStat label="Available" value={agents.filter(a => active(a.id) === 0).length} icon={HiOutlineUserAdd} idx={2} />
      </div>

      {/* ── Roster panel ── */}
      <div style={{ background: '#fff', border: `1.5px solid ${B[100]}`, borderRadius: 20, overflow: 'hidden', boxShadow: `0 2px 12px ${B[50]}` }}>

        {/* Panel header */}
        <div style={{ padding: '1.1rem 1.75rem', borderBottom: `1px solid ${B[100]}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: B[50], flexWrap: 'wrap', gap: '.75rem' }}>
          <div>
            <h3 style={{ fontSize: '.72rem', fontWeight: 900, color: B[500], textTransform: 'uppercase', letterSpacing: '.14em' }}>Agent Roster</h3>
            <span style={{ fontSize: '.7rem', fontWeight: 600, color: B[400] }}>{filtered.length} {filtered.length === 1 ? 'agent' : 'agents'} found</span>
          </div>
          <button
            onClick={() => setShowAdd(true)}
            style={{ display: 'flex', alignItems: 'center', gap: '.5rem', background: B[600], color: '#fff', border: 'none', borderRadius: 10, padding: '.55rem 1.1rem', fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.1em', cursor: 'pointer', transition: 'all .2s', boxShadow: `0 4px 14px ${B[300]}` }}
            onMouseEnter={e => { e.currentTarget.style.background = B[700]; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={e => { e.currentTarget.style.background = B[600]; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <HiOutlineUserAdd size={14} /> Register Agent
          </button>
        </div>

        {/* Search bar */}
        <div style={{ padding: '1rem 1.75rem', borderBottom: `1px solid ${B[50]}` }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: '.75rem',
            background: searchFocused ? '#fff' : B[50],
            border: `1.5px solid ${searchFocused ? B[400] : B[200]}`,
            borderRadius: 12, padding: '0 1rem', height: 48, width: '100%',
            transition: 'all .2s', boxShadow: searchFocused ? `0 0 0 3px ${B[100]}` : 'none',
          }}>
            <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 30 30" fill={searchFocused ? B[500] : B[300]} style={{ flexShrink: 0, transition: 'fill .2s' }}>
              <path d="M13 3C7.489 3 3 7.489 3 13s4.489 10 10 10a9.95 9.95 0 0 0 6.322-2.264l5.971 5.971a1 1 0 1 0 1.414-1.414l-5.97-5.97A9.95 9.95 0 0 0 23 13c0-5.511-4.489-10-10-10m0 2c4.43 0 8 3.57 8 8s-3.57 8-8 8-8-3.57-8-8 3.57-8 8-8" />
            </svg>
            <input type="text" placeholder="Search agents by name or email..." style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '.875rem', color: B[900], fontWeight: 500 }} value={localSearch} onFocus={() => setSearchFocused(true)} onBlur={() => setSearchFocused(false)} onChange={e => setLocalSearch(e.target.value)} />
            {localSearch && <button onClick={() => setLocalSearch('')} style={{ background: B[100], border: 'none', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: B[600], fontSize: 11, fontWeight: 700, flexShrink: 0 }}>✕</button>}
          </div>
        </div>

        {/* Agent cards */}
        <div style={{ padding: '1.5rem 1.75rem' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <HiOutlineUserGroup size={48} style={{ margin: '0 auto 1rem', display: 'block', color: B[200] }} />
              <p style={{ fontWeight: 800, color: B[400], fontSize: '.9rem' }}>No agents found</p>
              <p style={{ fontSize: '.8rem', color: B[300], marginTop: '.25rem' }}>Try adjusting your search</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {filtered.map(agent => {
                const tasks = active(agent.id);
                const busy = tasks > 0;
                return (
                  <div key={agent.id} className="animate-fade-in" style={{ background: '#fff', border: `1.5px solid ${B[100]}`, borderRadius: 16, padding: '1.25rem 1.4rem', display: 'flex', flexDirection: 'column', boxShadow: `0 2px 8px ${B[50]}`, transition: 'all .2s' }}
                    onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 8px 24px ${B[200]}`; e.currentTarget.style.borderColor = B[300]; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.background = B[50]; }}
                    onMouseLeave={e => { e.currentTarget.style.boxShadow = `0 2px 8px ${B[50]}`; e.currentTarget.style.borderColor = B[100]; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.background = '#fff'; }}
                  >
                    {/* Avatar + remove */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1rem' }}>
                      <div style={{ width: 48, height: 48, borderRadius: 14, background: B[100], border: `1px solid ${B[200]}`, display: 'flex', alignItems: 'center', justifyContent: 'center', color: B[600], fontWeight: 900, fontSize: 16 }}>
                        {agent.name?.[0]?.toUpperCase() || '?'}
                      </div>
                      <button onClick={() => handleRemove(agent.id, agent.name)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: B[200], borderRadius: 8, padding: 4, transition: 'all .15s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                        onMouseEnter={e => { e.currentTarget.style.color = '#ef4444'; e.currentTarget.style.background = '#fef2f2'; }}
                        onMouseLeave={e => { e.currentTarget.style.color = B[200]; e.currentTarget.style.background = 'none'; }}
                      >
                        <HiOutlineTrash size={16} />
                      </button>
                    </div>

                    {/* Info */}
                    <div style={{ flex: 1 }}>
                      <h3 style={{ fontWeight: 900, color: B[900], fontSize: '.95rem', marginBottom: '.2rem' }}>{agent.name}</h3>
                      <p style={{ fontSize: '9.5px', fontWeight: 800, color: B[400], textTransform: 'uppercase', letterSpacing: '.1em', marginBottom: '.75rem' }}>{agent.role || 'Service Agent'}</p>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '.35rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                          <HiOutlineMail size={12} style={{ color: B[300], flexShrink: 0 }} />
                          <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.email}</span>
                        </div>
                        {agent.phone && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                            <HiOutlinePhone size={12} style={{ color: B[300], flexShrink: 0 }} />
                            <span style={{ fontSize: 11, fontWeight: 600, color: '#64748b' }}>{agent.phone}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Footer */}
                    <div style={{ marginTop: '1rem', paddingTop: '.75rem', borderTop: `1px solid ${B[100]}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '.4rem' }}>
                        <HiOutlineTicket size={13} style={{ color: busy ? '#f59e0b' : B[400] }} />
                        <span style={{ fontSize: 10, fontWeight: 800, color: B[500], textTransform: 'uppercase', letterSpacing: '.06em' }}>{tasks} Task{tasks !== 1 ? 's' : ''}</span>
                      </div>
                      <span style={{ background: busy ? '#fef3c7' : B[50], color: busy ? '#92400e' : B[600], padding: '2px 9px', borderRadius: 6, fontSize: '9.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                        {busy ? 'Busy' : 'Free'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Add Agent Modal ── */}
      {showAdd && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem', background: 'rgba(15,23,42,.45)', backdropFilter: 'blur(6px)' }} onClick={() => setShowAdd(false)}>
          <div className="animate-fade-in" style={{ background: '#fff', borderRadius: 20, width: '100%', maxWidth: 440, boxShadow: '0 25px 60px rgba(0,0,0,.18)', border: `1.5px solid ${B[100]}`, overflow: 'hidden' }} onClick={e => e.stopPropagation()}>

            {/* Modal head */}
            <div style={{ padding: '1.1rem 1.5rem', borderBottom: `1px solid ${B[100]}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: B[50] }}>
              <div>
                <h3 style={{ fontSize: '.72rem', fontWeight: 900, color: B[600], textTransform: 'uppercase', letterSpacing: '.14em' }}>Onboard Personnel</h3>
                <p style={{ fontSize: '9.5px', color: B[400], fontWeight: 700, marginTop: 2, textTransform: 'uppercase', letterSpacing: '.08em' }}>System Access Provisioning</p>
              </div>
              <button onClick={() => setShowAdd(false)} style={{ background: B[100], border: 'none', borderRadius: 8, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: B[500] }}>
                <HiOutlineX size={16} />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleAdd} style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {formErr && <div style={{ padding: '.65rem 1rem', background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: 10, fontSize: 11, fontWeight: 700, color: '#991b1b', textTransform: 'uppercase', letterSpacing: '.04em' }}>{formErr}</div>}

              {[
                { id: 'ag-n', label: 'Legal Name', type: 'text', key: 'name', ph: 'e.g. John Doe' },
                { id: 'ag-e', label: 'Access Email', type: 'email', key: 'email', ph: 'doe@system.co' },
                { id: 'ag-p', label: 'Cellular', type: 'tel', key: 'phone', ph: '+91 00000 00000' },
                { id: 'ag-w', label: 'Access Code', type: 'password', key: 'password', ph: 'Min. 6 characters' },
              ].map(f => (
                <div key={f.id}>
                  <label htmlFor={f.id} style={{ display: 'block', fontSize: '9.5px', fontWeight: 900, color: B[400], textTransform: 'uppercase', letterSpacing: '.12em', marginBottom: '.35rem' }}>{f.label}</label>
                  <input id={f.id} type={f.type} value={form[f.key]} onChange={e => setForm({ ...form, [f.key]: e.target.value })} placeholder={f.ph}
                    style={{ width: '100%', background: B[50], border: `1.5px solid ${B[200]}`, borderRadius: 10, padding: '.7rem 1rem', fontSize: '.875rem', color: B[900], outline: 'none', transition: 'all .2s' }}
                    onFocus={e => { e.currentTarget.style.border = `1.5px solid ${B[400]}`; e.currentTarget.style.boxShadow = `0 0 0 3px ${B[100]}`; e.currentTarget.style.background = '#fff'; }}
                    onBlur={e => { e.currentTarget.style.border = `1.5px solid ${B[200]}`; e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.background = B[50]; }}
                  />
                </div>
              ))}

              <button type="submit" disabled={formBusy}
                style={{ width: '100%', padding: '.8rem', background: formBusy ? B[300] : B[600], color: '#fff', border: 'none', borderRadius: 12, fontSize: 11, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '.12em', cursor: formBusy ? 'not-allowed' : 'pointer', transition: 'all .2s', boxShadow: `0 4px 14px ${B[300]}`, marginTop: '.5rem' }}
                onMouseEnter={e => { if (!formBusy) e.currentTarget.style.background = B[700]; }}
                onMouseLeave={e => { if (!formBusy) e.currentTarget.style.background = B[600]; }}
              >
                {formBusy ? 'Processing...' : 'Register Professional'}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
