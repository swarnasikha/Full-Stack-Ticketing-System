export default function StatCard({ icon, title, value, gradient, delay = 0 }) {
  return (
    <div
      className={`glass-card p-6 animate-fade-in stagger-${delay}`}
      style={{ animationDelay: `${delay * 0.1}s` }}
    >
      <div className="flex items-center justify-between mb-4">
        <div className={`${gradient} p-3 rounded-xl text-white text-xl`}>
          {icon}
        </div>
      </div>
      <p className="text-sm text-[var(--color-text-muted)] mb-1">{title}</p>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
