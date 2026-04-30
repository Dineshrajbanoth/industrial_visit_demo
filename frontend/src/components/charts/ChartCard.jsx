import Card from '../ui/Card';

function ChartCard({ title, children }) {
  return (
    <Card>
      <h3 className="mb-4 font-heading text-lg font-bold text-slate-900">{title}</h3>
      <div className="h-[280px] w-full">{children}</div>
    </Card>
  );
}

export default ChartCard;
