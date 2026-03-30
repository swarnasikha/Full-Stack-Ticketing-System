import { STATUS_COLORS } from '../utils/constants';

export default function StatusBadge({ status }) {
  const colorClass = STATUS_COLORS[status] || 'status-created';

  return (
    <span
      className={`${colorClass} inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold text-white tracking-wide uppercase`}
    >
      {status}
    </span>
  );
}
