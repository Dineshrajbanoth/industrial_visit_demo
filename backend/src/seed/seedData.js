const dotenv = require('dotenv');
dotenv.config();

const connectDB = require('../config/db');
const Visit = require('../models/Visit');
const Feedback = require('../models/Feedback');
const Student = require('../models/Student');
const { classifySentiment } = require('../utils/sentiment');

const visitSeed = [
  {
    companyName: 'Infosys',
    date: new Date('2026-01-12'),
    department: 'CSE',
    branch: 'CSE',
    section: 'A',
    location: 'Bengaluru',
    studentsCount: 82,
    images: [],
  },
  {
    companyName: 'Tata Steel',
    date: new Date('2026-02-04'),
    department: 'MECH',
    branch: 'MECH',
    section: 'B',
    location: 'Jamshedpur',
    studentsCount: 65,
    images: [],
  },
  {
    companyName: 'HCL Technologies',
    date: new Date('2026-02-25'),
    department: 'IT',
    branch: 'IT',
    section: 'A',
    location: 'Noida',
    studentsCount: 74,
    images: [],
  },
  {
    companyName: 'Larsen & Toubro',
    date: new Date('2026-03-10'),
    department: 'CIVIL',
    branch: 'CIVIL',
    section: 'C',
    location: 'Chennai',
    studentsCount: 59,
    images: [],
  },
  {
    companyName: 'Bosch',
    date: new Date('2026-03-28'),
    department: 'EEE',
    branch: 'EEE',
    section: 'B',
    location: 'Coimbatore',
    studentsCount: 68,
    images: [],
  },
];

const studentSeed = [
  { rollNo: '22CSE001', branch: 'CSE', section: 'A' },
  { rollNo: '22CSE002', branch: 'CSE', section: 'A' },
  { rollNo: '22MECH001', branch: 'MECH', section: 'B' },
  { rollNo: '22MECH002', branch: 'MECH', section: 'B' },
  { rollNo: '22IT001', branch: 'IT', section: 'A' },
  { rollNo: '22IT002', branch: 'IT', section: 'A' },
  { rollNo: '22CIVIL001', branch: 'CIVIL', section: 'C' },
  { rollNo: '22CIVIL002', branch: 'CIVIL', section: 'C' },
  { rollNo: '22EEE001', branch: 'EEE', section: 'B' },
  { rollNo: '22EEE002', branch: 'EEE', section: 'B' },
  { rollNo: '22CSE003', branch: 'CSE', section: 'A' },
  { rollNo: '22MECH003', branch: 'MECH', section: 'B' },
];

const feedbackTemplates = [
  { rating: 5, comment: 'Excellent exposure and very informative sessions.' },
  { rating: 4, comment: 'Great visit and helpful technical briefing.' },
  { rating: 3, comment: 'Average experience, but learned a few useful things.' },
  { rating: 2, comment: 'The visit felt crowded and confusing at times.' },
  { rating: 5, comment: 'Amazing industrial workflow demonstration and best practices.' },
  { rating: 4, comment: 'Well-organized itinerary and good support from mentors.' },
  { rating: 1, comment: 'Poor coordination and disappointing session quality.' },
  { rating: 3, comment: 'Neutral overall experience with moderate practical value.' },
  { rating: 4, comment: 'Inspiring teams and fantastic production floor tour.' },
  { rating: 2, comment: 'Slow onboarding and unhelpful explanations in some areas.' },
  { rating: 5, comment: 'Awesome learning opportunity with excellent guidance.' },
  { rating: 4, comment: 'Useful insights on safety and process optimization.' },
];

async function seed() {
  await connectDB();

  await Feedback.deleteMany({});
  await Student.deleteMany({});
  await Visit.deleteMany({});

  const insertedStudents = await Student.insertMany(studentSeed);
  const insertedVisits = await Visit.insertMany(visitSeed);

  const feedbackSeed = feedbackTemplates.map((item, index) => {
    const visit = insertedVisits[index % insertedVisits.length];
    const student = insertedStudents[index];
    return {
      rollNo: student.rollNo,
      visitId: visit._id,
      rating: item.rating,
      comment: item.comment,
      sentiment: classifySentiment(item.comment),
    };
  });

  await Feedback.insertMany(feedbackSeed);

  console.log('Seed completed successfully.');
  process.exit(0);
}

seed().catch((error) => {
  console.error('Seed failed:', error.message);
  process.exit(1);
});
