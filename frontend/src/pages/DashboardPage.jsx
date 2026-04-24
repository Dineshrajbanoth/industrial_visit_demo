import { useEffect, useMemo, useState } from 'react';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import MetricCard from '../components/MetricCard';
import VisitsLineChart from '../components/charts/VisitsLineChart';
import RatingsBarChart from '../components/charts/RatingsBarChart';
import SentimentPieChart from '../components/charts/SentimentPieChart';
import { visitApi } from '../services/api';

function DashboardPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const { data } = await visitApi.analytics();
        setData(data);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  const cards = useMemo(() => {
    if (!data) return [];
    return [
      { label: 'Total Visits', value: data.cards.totalVisits, accent: 'ocean' },
      { label: 'Average Rating', value: data.cards.averageRating, accent: 'coral' },
      { label: 'Total Students', value: data.cards.totalStudents, accent: 'emerald' },
      { label: 'Unique Companies', value: data.cards.uniqueCompanies, accent: 'indigo' },
    ];
  }, [data]);

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-4">
          {Array.from({ length: 4 }).map((_, idx) => (
            <Skeleton key={idx} className="h-28" />
          ))}
        </div>
        <Skeleton className="h-72" />
      </div>
    );
  }

  if (!data) {
    return <EmptyState title="No analytics available" subtitle="Please add visit and feedback data." />;
  }

  return (
    <div className="space-y-5">
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {cards.map((card) => (
          <MetricCard key={card.label} label={card.label} value={card.value} accent={card.accent} />
        ))}
      </section>

      <section className="grid gap-4 xl:grid-cols-3">
        <VisitsLineChart data={data.charts.visitsPerMonth} />
        <RatingsBarChart data={data.charts.ratingsDistribution} />
        <SentimentPieChart data={data.charts.sentimentBreakdown} />
      </section>

      <Card>
        <h3 className="font-heading text-lg font-semibold">Top Visited Companies</h3>
        <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-5">
          {data.topCompanies.map((item) => (
            <div key={item.companyName} className="rounded-lg border border-slate-200 bg-white p-3">
              <p className="font-semibold text-ink">{item.companyName}</p>
              <p className="text-sm text-slate-500">Visits: {item.count}</p>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

export default DashboardPage;
