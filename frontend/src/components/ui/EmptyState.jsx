function EmptyState({ title, subtitle }) {
  return (
    <div className="rounded-xl2 border border-dashed border-slate-300 bg-white/75 p-8 text-center">
      <h3 className="font-heading text-lg font-semibold text-ink">{title}</h3>
      <p className="mt-2 text-sm text-slate-500">{subtitle}</p>
    </div>
  );
}

export default EmptyState;
