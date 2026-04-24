import clsx from 'clsx';

const map = {
  Positive: 'bg-emerald-100 text-emerald-700',
  Neutral: 'bg-amber-100 text-amber-700',
  Negative: 'bg-rose-100 text-rose-700',
};

function Badge({ label }) {
  return (
    <span className={clsx('rounded-full px-3 py-1 text-xs font-semibold', map[label] || 'bg-slate-100 text-slate-700')}>
      {label}
    </span>
  );
}

export default Badge;
