const mongoose = require('mongoose');

const visitSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    date: {
      type: Date,
      required: true,
      index: true,
    },
    department: {
      type: String,
      trim: true,
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
    location: {
      type: String,
      required: true,
      trim: true,
    },
    studentsCount: {
      type: Number,
      required: true,
      min: 0,
    },
    images: {
      type: [String],
      default: [],
    },
  },
  { timestamps: true }
);

visitSchema.pre('validate', function normalizeDepartment(next) {
  if (!this.department && this.branch) {
    this.department = this.branch;
  }

  next();
});

module.exports = mongoose.model('Visit', visitSchema);
