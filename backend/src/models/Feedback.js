const mongoose = require('mongoose');

const feedbackSchema = new mongoose.Schema(
  {
    rollNo: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    visitId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Visit',
      required: true,
      index: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    comment: {
      type: String,
      required: true,
      trim: true,
      maxlength: 500,
    },
    sentiment: {
      type: String,
      enum: ['Positive', 'Neutral', 'Negative'],
      default: 'Neutral',
      index: true,
    },
  },
  { timestamps: true }
);

feedbackSchema.index({ rollNo: 1, visitId: 1 }, { unique: true });

module.exports = mongoose.model('Feedback', feedbackSchema);
