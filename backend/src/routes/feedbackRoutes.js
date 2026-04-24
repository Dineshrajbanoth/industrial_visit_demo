const express = require('express');
const { addFeedback, getFeedbackByVisit, deleteFeedback } = require('../controllers/feedbackController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.post('/', authenticate, requireRole('student'), asyncHandler(addFeedback));
router.get('/:visitId', authenticate, asyncHandler(getFeedbackByVisit));
router.delete('/:id', authenticate, requireRole('admin'), asyncHandler(deleteFeedback));

module.exports = router;
