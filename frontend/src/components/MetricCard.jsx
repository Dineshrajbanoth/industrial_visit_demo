import { motion } from 'framer-motion';
import Card from './ui/Card';

const accentMap = {
  ocean: 'text-ocean',
  coral: 'text-coral',
  emerald: 'text-emerald-600',
  indigo: 'text-indigo-600',
};

function MetricCard({ label, value, accent = 'ocean' }) {
  return (
    <motion.div initial={{ y: 12, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ duration: 0.25 }}>
      <Card className="h-full">
        <p className="text-sm text-slate-500">{label}</p>
        <p className={`mt-3 font-heading text-3xl font-bold ${accentMap[accent] || accentMap.ocean}`}>{value}</p>
      </Card>
    </motion.div>
  );
}

export default MetricCard;
