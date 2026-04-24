const Feedback = require('../models/Feedback');
const Visit = require('../models/Visit');
const { classifySentiment } = require('../utils/sentiment');

function normalizeUpper(value) {
  return String(value || '').trim().toUpperCase();
}

function canAccessVisit(visit, user) {
  if (!user || user.role !== 'student') {
    return true;
  }

  return visit.branch === user.branch && visit.section === user.section;
}

async function addFeedback(req, res) {
  const { visitId, rating, comment } = req.body;
  const rollNo = normalizeUpper(req.user?.rollNo);

  if (!visitId || !rating || !comment) {
    return res.status(400).json({ message: 'visitId, rating and comment are required.' });
  }

  if (!rollNo || req.user?.role !== 'student') {
    return res.status(403).json({ message: 'Only students can submit feedback.' });
  }

  const visit = await Visit.findById(visitId).lean();
  if (!visit) {
    return res.status(404).json({ message: 'Visit not found.' });
  }

  if (!canAccessVisit(visit, req.user)) {
    return res.status(403).json({ message: 'This visit is not assigned to your section.' });
  }

  const existingFeedback = await Feedback.findOne({ rollNo, visitId });
  if (existingFeedback) {
    return res.status(409).json({ message: 'You have already submitted feedback for this visit.' });
  }

  const numericRating = Number(rating);
  if (Number.isNaN(numericRating) || numericRating < 1 || numericRating > 5) {
    return res.status(400).json({ message: 'Rating must be between 1 and 5.' });
  }

  const feedback = await Feedback.create({
    rollNo,
    visitId,
    rating: numericRating,
    comment: String(comment).trim(),
    sentiment: classifySentiment(comment),
  });

  return res.status(201).json(feedback);
}

async function getFeedbackByVisit(req, res) {
  const { visitId } = req.params;
  const visit = await Visit.findById(visitId).lean();

  if (!visit) {
    return res.status(404).json({ message: 'Visit not found.' });
  }

  if (!canAccessVisit(visit, req.user)) {
    return res.status(403).json({ message: 'This visit is not assigned to your section.' });
  }

  const list = await Feedback.find({ visitId }).sort({ createdAt: -1 }).lean();
  const submittedByMe = req.user?.role === 'student'
    ? list.some((item) => item.rollNo === normalizeUpper(req.user.rollNo))
    : false;

  const ratingDistribution = [1, 2, 3, 4, 5].map((star) => ({
    star,
    count: list.filter((item) => item.rating === star).length,
  }));

  const sentimentCount = {
    Positive: 0,
    Neutral: 0,
    Negative: 0,
  };

  for (const item of list) {
    sentimentCount[item.sentiment] = (sentimentCount[item.sentiment] || 0) + 1;
  }

  return res.json({
    feedback: list,
    ratingDistribution,
    sentimentCount,
    hasSubmitted: submittedByMe,
  });
}

async function deleteFeedback(req, res) {
  const { id } = req.params;
  const feedback = await Feedback.findById(id);

  if (!feedback) {
    return res.status(404).json({ message: 'Feedback not found.' });
  }

  await feedback.deleteOne();
  return res.json({ message: 'Feedback deleted successfully.' });
}

module.exports = {
  addFeedback,
  getFeedbackByVisit,
  deleteFeedback,
};
