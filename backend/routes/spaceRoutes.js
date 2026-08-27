import express from 'express';
import {
  getSpaces,
  getSpaceMetadata,
  getSpaceById,
  pingVerification
} from '../controllers/spaceController.js';

const router = express.Router();

router.get('/meta', getSpaceMetadata);
router.get('/', getSpaces);
router.get('/:id', getSpaceById);
router.post('/:id/ping', pingVerification);

export default router;