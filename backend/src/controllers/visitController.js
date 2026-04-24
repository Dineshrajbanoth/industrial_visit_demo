const fs = require('fs');
const path = require('path');

const Visit = require('../models/Visit');
const Feedback = require('../models/Feedback');
const { cloudinary, hasCloudinaryConfig } = require('../config/cloudinary');

function normalizeValue(value) {
  return String(value || '').trim();
}

function normalizeUpper(value) {
  return normalizeValue(value).toUpperCase();
}

function getVisitScope(req) {
  if (req.user?.role === 'student') {
    return {
      branch: req.user.branch,
      section: req.user.section,
    };
  }

  return {};
}

function applySearchFilters(filter, query = {}) {
  const { search = '', department, company, branch, section, startDate, endDate } = query;

  if (search) {
    filter.$or = [
      { companyName: { $regex: search, $options: 'i' } },
      { location: { $regex: search, $options: 'i' } },
      { department: { $regex: search, $options: 'i' } },
      { branch: { $regex: search, $options: 'i' } },
      { section: { $regex: search, $options: 'i' } },
    ];
  }

  if (department) filter.department = { $regex: department, $options: 'i' };
  if (company) filter.companyName = { $regex: company, $options: 'i' };
  if (branch) filter.branch = normalizeUpper(branch);
  if (section) filter.section = normalizeUpper(section);

  if (startDate || endDate) {
    filter.date = {};
    if (startDate) filter.date.$gte = new Date(startDate);
    if (endDate) filter.date.$lte = new Date(endDate);
  }

  return filter;
}

function buildSortMap(sort) {
  const sortMap = {
    latest: { date: -1 },
    oldest: { date: 1 },
    company_asc: { companyName: 1 },
    company_desc: { companyName: -1 },
  };

  return sortMap[sort] || sortMap.latest;
}

async function attachFeedbackStats(visits) {
  if (!visits.length) {
    return [];
  }

  const visitIds = visits.map((visit) => visit._id);

  const feedbackAgg = await Feedback.aggregate([
    { $match: { visitId: { $in: visitIds } } },
    {
      $group: {
        _id: '$visitId',
        avgRating: { $avg: '$rating' },
        totalFeedback: { $sum: 1 },
      },
    },
  ]);

  const feedbackMap = feedbackAgg.reduce((acc, item) => {
    acc[item._id.toString()] = {
      avgRating: Number(item.avgRating.toFixed(2)),
      totalFeedback: item.totalFeedback,
    };
    return acc;
  }, {});

  return visits.map((visit) => {
    const meta = feedbackMap[visit._id.toString()] || { avgRating: 0, totalFeedback: 0 };
    return { ...visit, ...meta };
  });
}

async function uploadToCloudinary(localPath) {
  const result = await cloudinary.uploader.upload(localPath, {
    folder: 'industrial-visits',
  });
  return result.secure_url;
}

async function persistImageUrls(files = []) {
  if (!files.length) return [];

  if (!hasCloudinaryConfig) {
    return files.map((file) => `/uploads/${file.filename}`);
  }

  const urls = [];
  for (const file of files) {
    const url = await uploadToCloudinary(file.path);
    urls.push(url);
    fs.unlinkSync(file.path);
  }
  return urls;
}

function extractPublicId(url) {
  const parts = url.split('/');
  const fileName = parts[parts.length - 1];
  const folder = parts[parts.length - 2];
  return `${folder}/${fileName.split('.')[0]}`;
}

async function removeImageByUrl(imageUrl) {
  if (!imageUrl) return;

  if (imageUrl.startsWith('/uploads/')) {
    const localPath = path.join(process.cwd(), imageUrl.replace('/uploads/', 'uploads/'));
    if (fs.existsSync(localPath)) {
      fs.unlinkSync(localPath);
    }
    return;
  }

  if (hasCloudinaryConfig && imageUrl.includes('res.cloudinary.com')) {
    const publicId = extractPublicId(imageUrl);
    await cloudinary.uploader.destroy(publicId);
  }
}

async function getVisits(req, res) {
  const filter = applySearchFilters({}, req.query);
  const visits = await Visit.find(filter).sort(buildSortMap(req.query.sort || 'latest')).lean();
  let response = await attachFeedbackStats(visits);

  if ((req.query.sort || 'latest') === 'highest_rated') {
    response = response.sort((a, b) => b.avgRating - a.avgRating);
  }

  res.json(response);
}

async function getStudentVisits(req, res) {
  const filter = applySearchFilters(getVisitScope(req), req.query);
  const visits = await Visit.find(filter).sort(buildSortMap(req.query.sort || 'latest')).lean();
  let response = await attachFeedbackStats(visits);

  if ((req.query.sort || 'latest') === 'highest_rated') {
    response = response.sort((a, b) => b.avgRating - a.avgRating);
  }

  res.json(response);
}

async function getVisitById(req, res) {
  const visit = await Visit.findById(req.params.id).lean();

  if (!visit) {
    return res.status(404).json({ message: 'Visit not found.' });
  }

  if (req.user?.role === 'student') {
    const { branch, section } = req.user;
    if (visit.branch !== branch || visit.section !== section) {
      return res.status(403).json({ message: 'This visit is not assigned to your section.' });
    }
  }

  const feedback = await Feedback.find({ visitId: visit._id }).sort({ createdAt: -1 }).lean();
  const avgRating = feedback.length
    ? Number((feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length).toFixed(2))
    : 0;

  return res.json({
    ...visit,
    avgRating,
    feedbackCount: feedback.length,
    feedback,
  });
}

async function createVisit(req, res) {
  const { companyName, date, department, branch, section, location, studentsCount } = req.body;

  const normalizedBranch = normalizeUpper(branch || department);
  const normalizedSection = normalizeUpper(section);
  const normalizedDepartment = normalizeValue(department || branch || normalizedBranch);

  if (!companyName || !date || !normalizedBranch || !normalizedSection || !location || !studentsCount) {
    return res.status(400).json({ message: 'Please provide all required fields.' });
  }

  const imageUrls = await persistImageUrls(req.files || []);

  const visit = await Visit.create({
    companyName: normalizeValue(companyName),
    date,
    department: normalizedDepartment,
    branch: normalizedBranch,
    section: normalizedSection,
    location: normalizeValue(location),
    studentsCount: Number(studentsCount),
    images: imageUrls,
  });

  return res.status(201).json(visit);
}

async function updateVisit(req, res) {
  const { id } = req.params;
  const updates = { ...req.body };

  const visit = await Visit.findById(id);
  if (!visit) {
    return res.status(404).json({ message: 'Visit not found.' });
  }

  const nextBranch = normalizeUpper(updates.branch || updates.department || visit.branch);
  const nextSection = normalizeUpper(updates.section || visit.section);
  const nextDepartment = normalizeValue(updates.department || visit.department || nextBranch);

  updates.companyName = normalizeValue(updates.companyName || visit.companyName);
  updates.location = normalizeValue(updates.location || visit.location);
  updates.department = nextDepartment;
  updates.branch = nextBranch;
  updates.section = nextSection;
  updates.studentsCount = updates.studentsCount ? Number(updates.studentsCount) : visit.studentsCount;

  const newImageUrls = await persistImageUrls(req.files || []);
  if (newImageUrls.length) {
    updates.images = [...visit.images, ...newImageUrls];
  }

  Object.assign(visit, updates);
  await visit.save();

  return res.json(visit);
}

async function deleteVisit(req, res) {
  const { id } = req.params;

  const visit = await Visit.findById(id);
  if (!visit) {
    return res.status(404).json({ message: 'Visit not found.' });
  }

  for (const imageUrl of visit.images) {
    await removeImageByUrl(imageUrl);
  }

  await Feedback.deleteMany({ visitId: id });
  await visit.deleteOne();

  return res.json({ message: 'Visit and related feedback deleted successfully.' });
}

async function deleteVisitImage(req, res) {
  const { id } = req.params;
  const { imageUrl } = req.body;

  if (!imageUrl) {
    return res.status(400).json({ message: 'imageUrl is required.' });
  }

  const visit = await Visit.findById(id);
  if (!visit) {
    return res.status(404).json({ message: 'Visit not found.' });
  }

  visit.images = visit.images.filter((img) => img !== imageUrl);
  await visit.save();
  await removeImageByUrl(imageUrl);

  return res.json({ message: 'Image deleted successfully.', images: visit.images });
}

async function getDashboardAnalytics(req, res) {
  const [
    totalVisits,
    visits,
    feedback,
    studentAgg,
    topCompanies,
    visitsPerMonth,
    ratingDistribution,
    sentimentBreakdown,
  ] = await Promise.all([
    Visit.countDocuments(),
    Visit.find({}, 'companyName').lean(),
    Feedback.find({}, 'rating sentiment').lean(),
    Visit.aggregate([{ $group: { _id: null, totalStudents: { $sum: '$studentsCount' } } }]),
    Visit.aggregate([
      { $group: { _id: '$companyName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 },
    ]),
    Visit.aggregate([
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]),
    Feedback.aggregate([
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]),
    Feedback.aggregate([
      { $group: { _id: '$sentiment', count: { $sum: 1 } } },
    ]),
  ]);

  const avgRating = feedback.length
    ? Number((feedback.reduce((sum, item) => sum + item.rating, 0) / feedback.length).toFixed(2))
    : 0;

  const monthlyChart = visitsPerMonth.map((item) => ({
    month: `${item._id.year}-${String(item._id.month).padStart(2, '0')}`,
    visits: item.count,
  }));

  const ratingChart = [1, 2, 3, 4, 5].map((rating) => {
    const found = ratingDistribution.find((item) => item._id === rating);
    return { rating: `${rating} Star`, count: found ? found.count : 0 };
  });

  const sentimentChart = ['Positive', 'Neutral', 'Negative'].map((key) => {
    const found = sentimentBreakdown.find((item) => item._id === key);
    return { name: key, value: found ? found.count : 0 };
  });

  return res.json({
    cards: {
      totalVisits,
      averageRating: avgRating,
      totalStudents: studentAgg[0]?.totalStudents || 0,
      uniqueCompanies: [...new Set(visits.map((visit) => visit.companyName))].length,
    },
    topCompanies: topCompanies.map((item) => ({ companyName: item._id, count: item.count })),
    charts: {
      visitsPerMonth: monthlyChart,
      ratingsDistribution: ratingChart,
      sentimentBreakdown: sentimentChart,
    },
  });
}

module.exports = {
  getVisits,
  getStudentVisits,
  getVisitById,
  createVisit,
  updateVisit,
  deleteVisit,
  deleteVisitImage,
  getDashboardAnalytics,
};
