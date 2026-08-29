import express from "express";
import {
  loginStudent,
  getStudentProfile,
  checkIn,
  checkOut,
} from "../controllers/studentController.js";

const router = express.Router();
router.post("/login", loginStudent);
router.get("/me/:studentId", getStudentProfile);
router.post("/check-in", checkIn);
router.post("/check-out", checkOut);

export default router;