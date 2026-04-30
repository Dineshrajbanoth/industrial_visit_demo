const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema(
  {
    rollNo: {
      type: String,
      required: true,
      trim: true,
      unique: true,
      index: true,
    },
    branch: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    section: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    // Optional fields for authentication
    name: {
      type: String,
      trim: true,
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      index: true,
      sparse: true,
    },
    password: {
      type: String,
      select: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Student', studentSchema);