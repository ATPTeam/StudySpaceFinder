import express from 'express';
import {
  loginOrRegisterStudent,
  getCurrentStudentSession,
  handleCheckIn,
  handleCheckOut
} from '../controllers/studentController.js';

const router = express.Router();

router.post('/login', loginOrRegisterStudent);
router.get('/me/:studentId', getCurrentStudentSession);
router.post('/check-in', handleCheckIn);
router.post('/check-out', handleCheckOut);

export default router;