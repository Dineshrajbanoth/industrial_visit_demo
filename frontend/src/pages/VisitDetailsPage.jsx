import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Skeleton from '../components/ui/Skeleton';
import FeedbackForm from '../components/FeedbackForm';
import ImageGallery from '../components/ImageGallery';
import EmptyState from '../components/ui/EmptyState';
import { useAuth } from '../context/AuthContext';
import { feedbackApi, visitApi } from '../services/api';

function VisitDetailsPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const [visit, setVisit] = useState(null);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);

  const loadData = async () => {
    setLoading(true);
    setAccessDenied(false);
    try {
      const [visitRes, feedbackRes] = await Promise.all([visitApi.getOne(id), feedbackApi.byVisit(id)]);
      setVisit(visitRes.data);
      setFeedbackStats(feedbackRes.data);
    } catch (error) {
      if (error.response?.status === 403) {
        setAccessDenied(true);
        setVisit(null);
        setFeedbackStats(null);
      } else {
        toast.error(error.response?.data?.message || 'Failed to load visit details.');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [id]);

  const handleFeedbackSubmit = async (payload, done) => {
    setSubmitting(true);
    try {
      await feedbackApi.create(payload);
      toast.success('Feedback submitted successfully.');
      done();
      await loadData();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to submit feedback.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <Skeleton className="h-72" />;
  }

  if (accessDenied) {
    return <EmptyState title="Visit unavailable" subtitle="This visit is not assigned to your section." />;
  }

  if (!visit) {
    return <EmptyState title="Visit not found" subtitle="This visit may have been removed." />;
  }

  const hasSubmitted = feedbackStats?.hasSubmitted || feedbackStats?.feedback?.some((item) => item.rollNo === user?.rollNo);

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="font-heading text-2xl font-semibold">{visit.companyName}</h2>
        <p className="mt-2 text-slate-600">{visit.location} | {visit.branch} | Section {visit.section}</p>
        <p className="mt-1 text-slate-600">Visit Date: {new Date(visit.date).toLocaleDateString()}</p>
        <p className="mt-1 text-slate-600">Students Participated: {visit.studentsCount}</p>
        <p className="mt-3 text-lg font-semibold text-ocean">Average Rating: {visit.avgRating}</p>
      </Card>

      <Card>
        <h3 className="mb-3 font-heading text-lg font-semibold">Photo Gallery</h3>
        <ImageGallery images={visit.images} />
      </Card>

      <div className="grid gap-4 xl:grid-cols-2">
        <Card>
          <h3 className="mb-3 font-heading text-lg font-semibold">Add Feedback</h3>
          {user?.role === 'student' ? (
            hasSubmitted ? (
              <EmptyState title="Feedback already submitted" subtitle="You can only submit feedback once per visit." />
            ) : (
              <FeedbackForm visitId={id} onSubmit={handleFeedbackSubmit} loading={submitting} />
            )
          ) : (
            <EmptyState title="Student feedback only" subtitle="Admin accounts can review feedback but not submit it." />
          )}
        </Card>

        <Card>
          <h3 className="mb-3 font-heading text-lg font-semibold">Rating Distribution</h3>
          <div className="space-y-2 text-sm">
            {feedbackStats?.ratingDistribution?.map((item) => (
              <div key={item.star} className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2">
                <span>{item.star} Star</span>
                <span className="font-semibold">{item.count}</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card>
        <h3 className="mb-3 font-heading text-lg font-semibold">Feedback List</h3>
        {!feedbackStats?.feedback?.length ? (
          <EmptyState title="No feedback yet" subtitle="Be the first to share your experience." />
        ) : (
          <div className="space-y-3">
            {feedbackStats.feedback.map((item) => (
              <div key={item._id} className="rounded-lg border border-slate-200 bg-white p-3">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-ink">{item.rating} / 5 {item.rollNo ? `- ${item.rollNo}` : ''}</p>
                  <Badge label={item.sentiment} />
                </div>
                <p className="mt-2 text-sm text-slate-600">{item.comment}</p>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}

export default VisitDetailsPage;
