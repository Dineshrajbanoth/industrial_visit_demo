import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiCalendar, FiMapPin, FiUsers } from 'react-icons/fi';
import { useAuth } from '../context/AuthContext';
import { visitApi } from '../services/api';
import Card from '../components/ui/Card';
import Skeleton from '../components/ui/Skeleton';
import EmptyState from '../components/ui/EmptyState';
import Button from '../components/ui/Button';

function StudentDashboard() {
  const { user } = useAuth();
  const [visits, setVisits] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const { data } = await visitApi.getStudent({ sort: 'latest' });
        setVisits(data);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-32" />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, idx) => (
            <Skeleton key={idx} className="h-56" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <Card className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-800 text-white">
        <p className="text-sm uppercase tracking-[0.2em] text-sky-200">Student Dashboard</p>
        <h2 className="mt-2 font-heading text-3xl font-semibold">Assigned visits for {user?.branch} - {user?.section}</h2>
        <p className="mt-2 max-w-2xl text-sm text-slate-200">
          Review only the visits assigned to your branch and section, then submit your feedback once per visit.
        </p>
      </Card>

      {!visits.length ? (
        <EmptyState
          title="No visits assigned to your section"
          subtitle="When an industrial visit is mapped to your branch and section, it will appear here automatically."
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {visits.map((visit) => (
            <Card key={visit._id} className="overflow-hidden transition hover:-translate-y-1 hover:shadow-xl">
              <div className="mb-4 h-40 overflow-hidden rounded-xl bg-slate-100">
                {visit.images?.[0] ? (
                  <img src={visit.images[0]} alt={visit.companyName} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-sm text-slate-400">No image</div>
                )}
              </div>

              <h3 className="font-heading text-lg font-semibold text-ink">{visit.companyName}</h3>
              <p className="mt-1 text-sm text-slate-500">{visit.branch} - Section {visit.section}</p>

              <div className="mt-4 space-y-2 text-sm text-slate-600">
                <div className="flex items-center gap-2">
                  <FiCalendar />
                  <span>{new Date(visit.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiMapPin />
                  <span>{visit.location}</span>
                </div>
                <div className="flex items-center gap-2">
                  <FiUsers />
                  <span>{visit.studentsCount} students</span>
                </div>
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <p className="text-sm font-semibold text-ocean">Avg Rating: {visit.avgRating || 0}</p>
                <Link to={`/visits/${visit._id}`}>
                  <Button variant="secondary">Give Feedback</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

export default StudentDashboard;