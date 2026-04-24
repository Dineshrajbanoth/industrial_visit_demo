const positiveKeywords = [
  'excellent',
  'great',
  'awesome',
  'good',
  'informative',
  'useful',
  'inspiring',
  'amazing',
  'helpful',
  'best',
  'fantastic',
  'well-organized',
];

const negativeKeywords = [
  'bad',
  'poor',
  'boring',
  'waste',
  'disappointing',
  'average',
  'crowded',
  'worst',
  'confusing',
  'slow',
  'unhelpful',
];

function classifySentiment(comment = '') {
  const normalized = comment.toLowerCase();

  let positiveScore = 0;
  let negativeScore = 0;

  for (const word of positiveKeywords) {
    if (normalized.includes(word)) positiveScore += 1;
  }

  for (const word of negativeKeywords) {
    if (normalized.includes(word)) negativeScore += 1;
  }

  if (positiveScore > negativeScore) return 'Positive';
  if (negativeScore > positiveScore) return 'Negative';
  return 'Neutral';
}

module.exports = { classifySentiment };
