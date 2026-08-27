// backend/models/Student.js
import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    studentId: {
      type: String,
      required: [true, 'Student ID / Roll number is required'],
      unique: true,
      trim: true
    },
    name: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true
    },
    department: {
      type: String,
      default: 'Engineering'
    },
    currentCheckedInSpace: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'StudySpace',
      default: null
    }
  },
  {
    timestamps: true
  }
);

const Student = mongoose.model('Student', studentSchema);

export default Student;