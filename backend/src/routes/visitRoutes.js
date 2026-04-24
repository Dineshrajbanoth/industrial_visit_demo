const express = require('express');
const {
  getVisits,
  getStudentVisits,
  getVisitById,
  createVisit,
  updateVisit,
  deleteVisit,
  deleteVisitImage,
  getDashboardAnalytics,
} = require('../controllers/visitController');
const { authenticate } = require('../middleware/authMiddleware');
const { requireRole } = require('../middleware/roleMiddleware');
const { upload } = require('../middleware/uploadMiddleware');
const asyncHandler = require('../middleware/asyncHandler');

const router = express.Router();

router.get('/', authenticate, requireRole('admin'), asyncHandler(getVisits));
router.get('/student', authenticate, requireRole('student'), asyncHandler(getStudentVisits));
router.get('/analytics/overview', authenticate, requireRole('admin'), asyncHandler(getDashboardAnalytics));
router.get('/:id', authenticate, asyncHandler(getVisitById));
router.post('/', authenticate, requireRole('admin'), upload.array('images', 8), asyncHandler(createVisit));
router.put('/:id', authenticate, requireRole('admin'), upload.array('images', 8), asyncHandler(updateVisit));
router.delete('/:id', authenticate, requireRole('admin'), asyncHandler(deleteVisit));
router.delete('/:id/images', authenticate, requireRole('admin'), asyncHandler(deleteVisitImage));

module.exports = router;
