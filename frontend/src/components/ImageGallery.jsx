import { useState } from 'react';
import Modal from './ui/Modal';

function toAbsolute(url) {
  if (url.startsWith('http')) return url;
  const base = (import.meta.env.VITE_API_URL || 'http://localhost:5000/api').replace('/api', '');
  return `${base}${url}`;
}

function ImageGallery({ images = [] }) {
  const [selected, setSelected] = useState(null);

  if (!images.length) {
    return <p className="text-sm text-slate-500">No images uploaded for this visit.</p>;
  }

  return (
    <>
      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {images.map((img) => (
          <button
            key={img}
            onClick={() => setSelected(toAbsolute(img))}
            className="overflow-hidden rounded-lg border border-slate-200"
          >
            <img
              src={toAbsolute(img)}
              alt="visit"
              className="h-32 w-full object-cover transition-transform duration-300 hover:scale-110"
            />
          </button>
        ))}
      </div>

      <Modal open={!!selected} onClose={() => setSelected(null)} title="Image Preview">
        {selected && <img src={selected} alt="preview" className="max-h-[75vh] w-full rounded-lg object-contain" />}
      </Modal>
    </>
  );
}

export default ImageGallery;
