import { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import Card from '../components/ui/Card';
import Button from '../components/ui/Button';
import Modal from '../components/ui/Modal';
import VisitForm from '../components/VisitForm';
import EmptyState from '../components/ui/EmptyState';
import { feedbackApi, visitApi } from '../services/api';

function AdminPage() {
  const [visits, setVisits] = useState([]);
  const [selectedEdit, setSelectedEdit] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedbackMap, setFeedbackMap] = useState({});

  const loadAll = async () => {
    const { data } = await visitApi.getAll({ sort: 'latest' });
    setVisits(data);

    const details = await Promise.all(data.map((visit) => feedbackApi.byVisit(visit._id)));
    const map = {};
    details.forEach((result, idx) => {
      map[data[idx]._id] = result.data.feedback;
    });
    setFeedbackMap(map);
  };

  useEffect(() => {
    loadAll();
  }, []);

  const createVisit = async (formData, done) => {
    setLoading(true);
    try {
      await visitApi.create(formData);
      toast.success('Visit created.');
      done();
      await loadAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create visit.');
    } finally {
      setLoading(false);
    }
  };

  const updateVisit = async (formData, done) => {
    if (!selectedEdit) return;
    setLoading(true);
    try {
      await visitApi.update(selectedEdit._id, formData);
      toast.success('Visit updated.');
      done();
      setSelectedEdit(null);
      await loadAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to update visit.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteVisit = async (id) => {
    if (!confirm('Delete this visit and related feedback?')) return;

    try {
      await visitApi.delete(id);
      toast.success('Visit deleted.');
      await loadAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete visit.');
    }
  };

  const handleDeleteImage = async (visitId, imageUrl) => {
    try {
      await visitApi.deleteImage(visitId, imageUrl);
      toast.success('Image removed.');
      await loadAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove image.');
    }
  };

  const handleDeleteFeedback = async (id) => {
    try {
      await feedbackApi.delete(id);
      toast.success('Feedback removed.');
      await loadAll();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to remove feedback.');
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <h3 className="mb-4 font-heading text-xl font-semibold">Add New Industrial Visit</h3>
        <VisitForm onSubmit={createVisit} loading={loading} submitLabel="Create Visit" />
      </Card>

      {!visits.length ? (
        <EmptyState title="No visits available" subtitle="Create a new visit to manage data." />
      ) : (
        <div className="space-y-3">
          {visits.map((visit) => (
            <Card key={visit._id}>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h4 className="font-heading text-lg font-semibold">{visit.companyName}</h4>
                  <p className="text-sm text-slate-500">{visit.branch} | Section {visit.section} | {visit.location}</p>
                </div>
                <div className="flex gap-2">
                  <Button variant="secondary" onClick={() => setSelectedEdit(visit)}>Edit</Button>
                  <Button variant="danger" onClick={() => handleDeleteVisit(visit._id)}>Delete</Button>
                </div>
              </div>

              <div className="mt-3">
                <p className="mb-2 text-sm font-semibold text-slate-700">Images</p>
                {!visit.images?.length ? (
                  <p className="text-sm text-slate-500">No images uploaded.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                    {visit.images.map((img) => (
                      <div key={img} className="rounded-lg border border-slate-200 p-2">
                        <p className="truncate text-xs text-slate-500">{img.split('/').pop()}</p>
                        <Button className="mt-2 w-full" variant="secondary" onClick={() => handleDeleteImage(visit._id, img)}>
                          Remove
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="mt-4">
                <p className="mb-2 text-sm font-semibold text-slate-700">Feedback</p>
                {!feedbackMap[visit._id]?.length ? (
                  <p className="text-sm text-slate-500">No feedback available.</p>
                ) : (
                  <div className="space-y-2">
                    {feedbackMap[visit._id].map((fb) => (
                      <div key={fb._id} className="flex items-center justify-between rounded-lg border border-slate-200 p-2">
                        <p className="text-sm">{fb.rating}/5 - {fb.rollNo} - {fb.comment}</p>
                        <Button variant="secondary" onClick={() => handleDeleteFeedback(fb._id)}>Delete</Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      <Modal open={!!selectedEdit} onClose={() => setSelectedEdit(null)} title="Edit Visit">
        <VisitForm
          onSubmit={updateVisit}
          loading={loading}
          initialValues={selectedEdit}
          submitLabel="Save Changes"
        />
      </Modal>
    </div>
  );
}

export default AdminPage;
