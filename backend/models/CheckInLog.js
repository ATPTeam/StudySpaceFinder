// backend/models/CheckInLog.js
import mongoose from 'mongoose';

const checkInLogSchema = new mongoose.Schema(
  {
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Student',
      required: true
    },
    studySpace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudySpace',
      required: true
    },
    action: {
      type: String,
      enum: ['CHECK_IN', 'CHECK_OUT'],
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  },
  {
    timestamps: true
  }
);

const CheckInLog = mongoose.model('CheckInLog', checkInLogSchema);

export default CheckInLog;