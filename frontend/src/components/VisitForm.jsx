import { useEffect, useState } from 'react';
import Button from './ui/Button';

const branchOptions = ['CSE', 'ECE', 'EEE', 'IT', 'MECH', 'CIVIL'];
const sectionOptions = ['A', 'B', 'C'];

const initialForm = {
  companyName: '',
  date: '',
  branch: 'CSE',
  section: 'A',
  location: '',
  studentsCount: '',
};

function VisitForm({ onSubmit, loading, initialValues, submitLabel = 'Save Visit' }) {
  const [form, setForm] = useState(initialForm);
  const [files, setFiles] = useState([]);

  useEffect(() => {
    if (initialValues) {
      setForm({
        companyName: initialValues.companyName || '',
        date: initialValues.date ? initialValues.date.slice(0, 10) : '',
        branch: initialValues.branch || initialValues.department || 'CSE',
        section: initialValues.section || 'A',
        location: initialValues.location || '',
        studentsCount: initialValues.studentsCount || '',
      });
    }
  }, [initialValues]);

  const handleSubmit = (event) => {
    event.preventDefault();
    const formData = new FormData();

    Object.entries(form).forEach(([key, value]) => formData.append(key, value));
    for (const file of files) {
      formData.append('images', file);
    }

    onSubmit(formData, () => {
      setForm(initialForm);
      setFiles([]);
    });
  };

  return (
    <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
      {[
        ['companyName', 'Company Name', 'text'],
        ['date', 'Date', 'date'],
        ['location', 'Location', 'text'],
        ['studentsCount', 'Student Count', 'number'],
      ].map(([key, label, type]) => (
        <label key={key} className="text-sm font-medium text-slate-600">
          {label}
          <input
            required
            type={type}
            value={form[key]}
            onChange={(e) => setForm((prev) => ({ ...prev, [key]: e.target.value }))}
            className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-ocean"
          />
        </label>
      ))}

      <label className="text-sm font-medium text-slate-600">
        Branch
        <select
          required
          value={form.branch}
          onChange={(e) => setForm((prev) => ({ ...prev, branch: e.target.value }))}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-ocean"
        >
          {branchOptions.map((branch) => (
            <option key={branch} value={branch}>
              {branch}
            </option>
          ))}
        </select>
      </label>

      <label className="text-sm font-medium text-slate-600">
        Section
        <select
          required
          value={form.section}
          onChange={(e) => setForm((prev) => ({ ...prev, section: e.target.value }))}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2 outline-none transition focus:border-ocean"
        >
          {sectionOptions.map((section) => (
            <option key={section} value={section}>
              {section}
            </option>
          ))}
        </select>
      </label>

      <label className="md:col-span-2 text-sm font-medium text-slate-600">
        Upload Images
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={(e) => setFiles(Array.from(e.target.files || []))}
          className="mt-1 w-full rounded-lg border border-slate-300 bg-white px-3 py-2"
        />
      </label>

      <div className="md:col-span-2">
        <Button type="submit" disabled={loading}>
          {loading ? 'Saving...' : submitLabel}
        </Button>
      </div>
    </form>
  );
}

export default VisitForm;
