import { useState } from 'react';
import { useFeedback } from '../hooks/useFeedback';
import { HiOutlineChatAlt2, HiStar, HiOutlineStar } from 'react-icons/hi';

/* ── Blue palette ────────────────────────────────────────────────────────── */
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

/* Rating → label + colour (still amber for stars — universally understood) */
function ratingMeta(rating) {
  if (rating >= 5) return { label: 'Excellent', color: '#f59e0b' };
  if (rating >= 4) return { label: 'Good',      color: '#f59e0b' };
  if (rating >= 3) return { label: 'Average',   color: '#f59e0b' };
  if (rating >= 2) return { label: 'Poor',      color: '#ef4444' };
  return                  { label: 'Terrible',  color: '#ef4444' };
}

function Stars({ rating, size = 15 }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {[1,2,3,4,5].map(n =>
        n <= rating
          ? <HiStar       key={n} size={size} style={{ color: '#f59e0b' }} />
          : <HiOutlineStar key={n} size={size} style={{ color: B[200] }} />
      )}
    </div>
  );
}

/* Average rating from list */
function avgRating(feedbacks) {
  if (!feedbacks.length) return 0;
  return (feedbacks.reduce((s, f) => s + (f.rating || 0), 0) / feedbacks.length).toFixed(1);
}

export default function Feedback() {
  const { feedbacks, loading } = useFeedback();
  const [localSearch, setLocalSearch]   = useState('');
  const [ratingFilter, setRatingFilter] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);

  const filtered = feedbacks.filter(f => {
    if (ratingFilter && f.rating !== Number(ratingFilter)) return false;
    return (
      f.comment?.toLowerCase().includes(localSearch.toLowerCase()) ||
      f.ticketId?.toLowerCase().includes(localSearch.toLowerCase())
    );
  });

  const avg = avgRating(feedbacks);

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
    <div style={{ width: '100%', maxWidth: '900px', margin: '0 auto' }}>

     

      {/* ── Summary Stats ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.25rem', marginBottom: '2rem', padding: '1rem' }}>
        {/* Average rating card */}
        {[
          {
            label: 'Average Rating',
            value: feedbacks.length ? `${avg} / 5` : '—',
            sub: feedbacks.length ? ratingMeta(Math.round(avg)).label : 'No data',
            shade: { bg: B[50], border: B[200], icon: B[500], val: B[700] },
          },
          {
            label: 'Total Reviews',
            value: feedbacks.length,
            sub: `${filtered.length} shown`,
            shade: { bg: '#e0f2fe', border: '#7dd3fc', icon: '#0284c7', val: '#0c4a6e' },
          },
          {
            label: '5-Star Reviews',
            value: feedbacks.filter(f => f.rating === 5).length,
            sub: feedbacks.length
              ? `${Math.round((feedbacks.filter(f => f.rating === 5).length / feedbacks.length) * 100)}% of total`
              : 'No data',
            shade: { bg: '#f0f9ff', border: '#bae6fd', icon: '#0369a1', val: '#0c4a6e' },
          },
        ].map(({ label, value, sub, shade: c }) => (
          <div
            key={label}
            className="animate-fade-in"
            style={{
              background: '#fff', border: `1.5px solid ${c.border}`,
              borderRadius: '16px', padding: '1.4rem 1.5rem',
              boxShadow: `0 2px 8px ${c.border}66`, transition: 'all 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = c.bg; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 8px 24px ${c.border}99`; }}
            onMouseLeave={e => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 2px 8px ${c.border}66`; }}
          >
            <p style={{ fontSize: '0.68rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: c.icon, marginBottom: '0.4rem', opacity: 0.8 }}>{label}</p>
            <p style={{ fontSize: '1.9rem', fontWeight: 900, color: c.val, lineHeight: 1, letterSpacing: '-0.02em' }}>{value}</p>
            <p style={{ fontSize: '10px', color: c.icon, fontWeight: 600, marginTop: '0.3rem', opacity: 0.7 }}>{sub}</p>
          </div>
        ))}
      </div>

      {/* ── Feed Container ── */}
      <div style={{
        background: '#fff', border: `1.5px solid ${B[100]}`,
        borderRadius: '20px', overflow: 'hidden',
        boxShadow: `0 2px 12px ${B[50]}`,
      }}>
        {/* Section header */}
        <div style={{
          padding: '1.1rem 1.75rem', borderBottom: `1px solid ${B[100]}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          background: B[50], flexWrap: 'wrap', gap: '0.75rem',
        }}>
          <div>
            <h3 style={{ fontSize: '0.72rem', fontWeight: 900, color: B[500], textTransform: 'uppercase', letterSpacing: '0.14em' }}>
              Latest Reviews
            </h3>
            <span style={{ fontSize: '0.7rem', fontWeight: 600, color: B[400] }}>
              {filtered.length} {filtered.length === 1 ? 'entry' : 'entries'}
            </span>
          </div>

          {/* Rating filter pills */}
          <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap' }}>
            {['', '5', '4', '3', '2', '1'].map(r => (
              <button
                key={r}
                onClick={() => setRatingFilter(r)}
                style={{
                  padding: '3px 10px',
                  background: ratingFilter === r ? B[600] : '#fff',
                  color: ratingFilter === r ? '#fff' : B[500],
                  border: `1.5px solid ${ratingFilter === r ? B[600] : B[200]}`,
                  borderRadius: '8px', fontSize: '10px', fontWeight: 800,
                  cursor: 'pointer', transition: 'all 0.15s',
                  textTransform: 'uppercase', letterSpacing: '0.05em',
                }}
              >
                {r ? `${r}★` : 'All'}
              </button>
            ))}
          </div>
        </div>

        {/* Search bar */}
        <div style={{ padding: '1rem 1.75rem', borderBottom: `1px solid ${B[50]}` }}>
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
              placeholder="Search by comment or ticket ID..."
              style={{ flex: 1, border: 'none', outline: 'none', background: 'transparent', fontSize: '0.875rem', color: B[900], fontWeight: 500 }}
              value={localSearch}
              onFocus={() => setSearchFocused(true)}
              onBlur={() => setSearchFocused(false)}
              onChange={e => setLocalSearch(e.target.value)}
            />
            {localSearch && (
              <button onClick={() => setLocalSearch('')} style={{
                background: B[100], border: 'none', borderRadius: '50%',
                width: '20px', height: '20px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', color: B[600], fontSize: '11px', fontWeight: 700, flexShrink: 0,
              }}>✕</button>
            )}
          </div>
        </div>

        {/* Feedback list */}
        <div style={{ padding: '1.5rem 1.75rem' }}>
          {filtered.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
              <HiOutlineChatAlt2 size={48} style={{ margin: '0 auto 1rem', display: 'block', color: B[200] }} />
              <p style={{ fontWeight: 800, color: B[400], fontSize: '0.9rem' }}>No feedback entries found</p>
              <p style={{ fontSize: '0.8rem', color: B[300], marginTop: '0.25rem' }}>Try adjusting your search or filter</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {filtered.map(f => {
                const meta = ratingMeta(f.rating);
                return (
                  <div
                    key={f.id}
                    className="animate-fade-in"
                    style={{
                      background: '#fff', border: `1.5px solid ${B[100]}`,
                      borderRadius: '14px', padding: '1.25rem 1.5rem',
                      boxShadow: `0 2px 6px ${B[100]}`, transition: 'all 0.2s',
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
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                        <Stars rating={f.rating} />
                        <span style={{
                          background: B[100], color: B[700],
                          padding: '2px 8px', borderRadius: '6px',
                          fontSize: '9.5px', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.06em',
                        }}>
                          {meta.label}
                        </span>
                      </div>
                      <span style={{ fontFamily: 'monospace', fontSize: '9.5px', fontWeight: 700, color: B[300], textTransform: 'uppercase' }}>
                        Ticket #{f.ticketId?.slice(-8)}
                      </span>
                    </div>

                    {/* Comment */}
                    <p style={{
                      fontSize: '0.875rem', color: '#334155',
                      lineHeight: 1.65, fontStyle: 'italic',
                      borderLeft: `3px solid ${B[200]}`,
                      paddingLeft: '0.85rem',
                      margin: '0 0 0.85rem 0',
                    }}>
                      "{f.comment || 'No comment provided'}"
                    </p>

                    {/* Footer */}
                    <div style={{
                      paddingTop: '0.7rem', borderTop: `1px solid ${B[100]}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <div style={{
                          width: '24px', height: '24px', borderRadius: '50%',
                          background: B[100], border: `1px solid ${B[200]}`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '9px', fontWeight: 900, color: B[600],
                        }}>
                          {f.userId?.[0]?.toUpperCase() || 'U'}
                        </div>
                        <span style={{ fontSize: '10px', fontWeight: 700, color: B[400], textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                          Verified Client
                        </span>
                      </div>
                      <span style={{ fontSize: '10px', color: B[300], fontWeight: 500 }}>
                        {f.createdAt?.toLocaleDateString()}
                      </span>
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
