import mongoose from "mongoose";
import Student from "../models/Student.js";
import Space from "../models/Space.js";

// Helper to find a space by MongoDB _id or custom id
const findSpace = async (spaceId) => {
  if (mongoose.Types.ObjectId.isValid(spaceId)) {
    const space = await Space.findById(spaceId);
    if (space) return space;
  }
  return await Space.findOne({ id: spaceId });
};

// POST /api/students/login
export const loginStudent = async (req, res) => {
  try {
    const { studentId, name } = req.body;
    if (!studentId || !name) {
      return res.status(400).json({ success: false, message: "Student ID and Name are required" });
    }

    let student = await Student.findOne({ studentId }).populate("currentCheckedInSpace");
    if (!student) {
      student = await Student.create({ studentId, name });
    }

    res.status(200).json({ success: true, data: student });
  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ success: false, message: "Login failed", error: error.message });
  }
};

// GET /api/students/me/:studentId
export const getStudentProfile = async (req, res) => {
  try {
    const student = await Student.findOne({ studentId: req.params.studentId }).populate("currentCheckedInSpace");
    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }
    res.status(200).json({ success: true, data: student });
  } catch (error) {
    console.error("Profile Error:", error);
    res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// POST /api/students/check-in
export const checkIn = async (req, res) => {
  try {
    const { studentId, spaceId } = req.body;

    if (!studentId || !spaceId) {
      return res.status(400).json({ success: false, message: "Missing studentId or spaceId" });
    }

    // Auto-create student record if session lost
    let student = await Student.findOne({ studentId });
    if (!student) {
      student = await Student.create({ studentId, name: "Student" });
    }

    // If currently checked in elsewhere, release previous seat
    if (student.currentCheckedInSpace) {
      const oldSpace = await Space.findById(student.currentCheckedInSpace);
      if (oldSpace && oldSpace._id.toString() !== spaceId.toString()) {
        oldSpace.occupiedSeats = Math.max(0, (oldSpace.occupiedSeats || 0) - 1);
        oldSpace.lastUpdated = new Date();
        await oldSpace.save();

        const io = req.app.get("io");
        if (io) io.emit("spaceUpdated", oldSpace);
      }
    }

    const space = await findSpace(spaceId);
    if (!space) {
      return res.status(404).json({ success: false, message: "Space not found" });
    }

    const total = space.totalSeats || 40;
    const occupied = space.occupiedSeats || 0;

    if (occupied >= total) {
      return res.status(400).json({ success: false, message: "Room is already at full capacity" });
    }

    // Increment seat count
    space.occupiedSeats = occupied + 1;
    space.lastUpdated = new Date();
    await space.save();

    student.currentCheckedInSpace = space._id;
    await student.save();

    // Broadcast live change via Socket.io
    const io = req.app.get("io");
    if (io) {
      io.emit("spaceUpdated", space);
    }

    const populatedStudent = await Student.findById(student._id).populate("currentCheckedInSpace");

    return res.status(200).json({
      success: true,
      data: {
        student: populatedStudent,
        space,
      },
    });
  } catch (error) {
    console.error("Check-in Error in Controller:", error);
    return res.status(500).json({ success: false, message: "Check-in failed", error: error.message });
  }
};

// POST /api/students/check-out
export const checkOut = async (req, res) => {
  try {
    const { studentId } = req.body;

    const student = await Student.findOne({ studentId });
    if (!student || !student.currentCheckedInSpace) {
      return res.status(400).json({ success: false, message: "You are not checked in anywhere" });
    }

    const space = await Space.findById(student.currentCheckedInSpace);
    if (space) {
      space.occupiedSeats = Math.max(0, (space.occupiedSeats || 0) - 1);
      space.lastUpdated = new Date();
      await space.save();

      const io = req.app.get("io");
      if (io) io.emit("spaceUpdated", space);
    }

    student.currentCheckedInSpace = null;
    await student.save();

    return res.status(200).json({ success: true, data: { student } });
  } catch (error) {
    console.error("Check-out Error:", error);
    return res.status(500).json({ success: false, message: "Check-out failed", error: error.message });
  }
};