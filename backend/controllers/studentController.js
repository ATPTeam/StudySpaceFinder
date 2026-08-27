import Student from '../models/Student.js';
import StudySpace from '../models/StudySpace.js';
import CheckInLog from '../models/CheckInLog.js';

// 1. Student Login / Register
export const loginOrRegisterStudent = async (req, res) => {
  try {
    const { studentId, name, department } = req.body;

    if (!studentId || !name) {
      return res.status(400).json({
        success: false,
        message: 'Student ID and Name are required'
      });
    }

    let student = await Student.findOne({ studentId }).populate('currentCheckedInSpace');

    if (!student) {
      student = await Student.create({
        studentId,
        name,
        department: department || 'Engineering'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Student authenticated successfully',
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Authentication failed',
      error: error.message
    });
  }
};

// 2. Fetch Active Student Session (For React Page Refresh)
export const getCurrentStudentSession = async (req, res) => {
  try {
    const { studentId } = req.params;

    const student = await Student.findOne({ studentId }).populate('currentCheckedInSpace');

    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    res.status(200).json({
      success: true,
      data: student
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to restore session',
      error: error.message
    });
  }
};

// 3. Student Check-In (Atomic & Safe)
export const handleCheckIn = async (req, res) => {
  try {
    const { studentId, spaceId } = req.body;

    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (student.currentCheckedInSpace) {
      return res.status(400).json({
        success: false,
        message: 'You are already checked in to another space. Please check out first.'
      });
    }

    const space = await StudySpace.findById(spaceId);
    if (!space) {
      return res.status(404).json({ success: false, message: 'Study space not found' });
    }

    if (space.occupiedSeats >= space.totalSeats) {
      return res.status(400).json({
        success: false,
        message: 'This space is currently at maximum capacity!'
      });
    }

    space.occupiedSeats += 1;
    space.lastUpdated = new Date();
    space.calculateStatus();
    await space.save();

    student.currentCheckedInSpace = space._id;
    await student.save();

    await CheckInLog.create({
      student: student._id,
      studySpace: space._id,
      action: 'CHECK_IN'
    });

    const io = req.app.get('socketio');
    if (io) {
      io.emit('spaceUpdated', space);
    }

    res.status(200).json({
      success: true,
      message: `Checked in to ${space.name}`,
      data: { space, student }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Check-in failed',
      error: error.message
    });
  }
};

// 4. Student Check-Out (Safe bounds)
export const handleCheckOut = async (req, res) => {
  try {
    const { studentId } = req.body;

    const student = await Student.findOne({ studentId });
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (!student.currentCheckedInSpace) {
      return res.status(400).json({
        success: false,
        message: 'You are not currently checked in anywhere.'
      });
    }

    const space = await StudySpace.findById(student.currentCheckedInSpace);
    if (space) {
      if (space.occupiedSeats > 0) {
        space.occupiedSeats -= 1;
      }
      space.lastUpdated = new Date();
      space.calculateStatus();
      await space.save();

      await CheckInLog.create({
        student: student._id,
        studySpace: space._id,
        action: 'CHECK_OUT'
      });

      const io = req.app.get('socketio');
      if (io) {
        io.emit('spaceUpdated', space);
      }
    }

    student.currentCheckedInSpace = null;
    await student.save();

    res.status(200).json({
      success: true,
      message: 'Checked out successfully',
      data: { space, student }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Check-out failed',
      error: error.message
    });
  }
};