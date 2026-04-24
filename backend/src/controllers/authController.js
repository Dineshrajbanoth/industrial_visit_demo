const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const Student = require('../models/Student');

const JWT_SECRET = process.env.JWT_SECRET || 'dev_jwt_secret_change_in_production';

let cachedHashedPassword = null;

async function getAdminHash() {
  const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';

  if (!cachedHashedPassword) {
    cachedHashedPassword = await bcrypt.hash(adminPassword, 10);
  }

  return cachedHashedPassword;
}

function normalizeValue(value) {
  return String(value || '').trim();
}

function normalizeUpper(value) {
  return normalizeValue(value).toUpperCase();
}

function getAdminIdentifiers() {
  const configuredEmail = normalizeValue(process.env.ADMIN_EMAIL).toLowerCase();
  const configuredUsername = normalizeValue(process.env.ADMIN_USERNAME).toLowerCase();
  const fallbackUsername = configuredEmail.includes('@') ? configuredEmail.split('@')[0] : '';

  const identifiers = new Set([
    configuredEmail,
    configuredUsername,
    fallbackUsername,
    'admin',
  ].filter(Boolean));

  return {
    primaryEmail: configuredEmail || `${configuredUsername || 'admin'}@example.com`,
    identifiers,
  };
}

function issueToken(payload) {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });
}

async function adminLogin(req, res) {
  const { email, password, username } = req.body;
  const loginEmail = normalizeValue(email || username).toLowerCase();

  if (!loginEmail || !password) {
    return res.status(400).json({ message: 'Email and password are required.' });
  }

  const { primaryEmail, identifiers } = getAdminIdentifiers();
  const adminHash = await getAdminHash();
  const isPasswordValid = await bcrypt.compare(password, adminHash);

  if (!identifiers.has(loginEmail) || !isPasswordValid) {
    return res.status(401).json({ message: 'Invalid credentials.' });
  }

  const token = issueToken({ role: 'admin', email: primaryEmail });

  return res.json({
    message: 'Login successful',
    token,
    user: { email: primaryEmail, role: 'admin' },
  });
}

async function studentLogin(req, res) {
  const rollNo = normalizeUpper(req.body.rollNo);
  const branch = normalizeUpper(req.body.branch);
  const section = normalizeUpper(req.body.section);

  if (!rollNo || !branch || !section) {
    return res.status(400).json({ message: 'Roll number, branch and section are required.' });
  }

  let student = await Student.findOne({ rollNo });

  if (student) {
    const storedBranch = normalizeUpper(student.branch);
    const storedSection = normalizeUpper(student.section);

    if (storedBranch !== branch || storedSection !== section) {
      return res.status(401).json({ message: 'Invalid student details.' });
    }

    // Keep existing student records normalized for future auth checks.
    if (student.branch !== storedBranch || student.section !== storedSection || student.rollNo !== rollNo) {
      student.branch = storedBranch;
      student.section = storedSection;
      student.rollNo = rollNo;
      await student.save();
    }
  } else {
    student = await Student.create({ rollNo, branch, section });
  }

  const token = issueToken({
    role: 'student',
    studentId: student._id.toString(),
    rollNo: student.rollNo,
    branch: student.branch,
    section: student.section,
  });

  return res.json({
    message: 'Student login successful',
    token,
    user: {
      role: 'student',
      studentId: student._id.toString(),
      rollNo: student.rollNo,
      branch: student.branch,
      section: student.section,
    },
  });
}

module.exports = {
  adminLogin,
  studentLogin,
  login: adminLogin,
};
