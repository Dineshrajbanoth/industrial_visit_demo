import { useState } from 'react';
import { FiStar } from 'react-icons/fi';
import Button from './ui/Button';

function FeedbackForm({ visitId, onSubmit, loading, disabled = false, alreadySubmitted = false }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit(
      { visitId, rating: Number(rating), comment },
      () => {
        setRating(5);
        setComment('');
      }
    );
  };

  const isDisabled = loading || disabled || alreadySubmitted;

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <div className="block text-sm font-medium text-slate-600">
        Rating
        <div className="mt-2 flex items-center gap-2">
          {Array.from({ length: 5 }).map((_, idx) => {
            const starValue = idx + 1;
            return (
              <button
                key={starValue}
                type="button"
                disabled={isDisabled}
                onClick={() => setRating(starValue)}
                className={`flex h-10 w-10 items-center justify-center rounded-full border transition ${rating >= starValue ? 'border-amber-400 bg-amber-100 text-amber-500' : 'border-slate-300 bg-white text-slate-300'} ${isDisabled ? 'cursor-not-allowed opacity-60' : 'hover:border-amber-400 hover:text-amber-500'}`}
                aria-label={`${starValue} star rating`}
              >
                <FiStar className={rating >= starValue ? 'fill-current' : ''} />
              </button>
            );
          })}
        </div>
      </div>

      <label className="block text-sm font-medium text-slate-600">
        Comment
        <textarea
          required
          rows="3"
          value={comment}
          disabled={isDisabled}
          onChange={(e) => setComment(e.target.value)}
          className="mt-1 w-full rounded-lg border border-slate-300 px-3 py-2 disabled:cursor-not-allowed disabled:bg-slate-100"
        />
      </label>

      <Button type="submit" disabled={isDisabled}>
        {alreadySubmitted ? 'Feedback Submitted' : loading ? 'Submitting...' : 'Add Feedback'}
      </Button>
    </form>
  );
}

export default FeedbackForm;
