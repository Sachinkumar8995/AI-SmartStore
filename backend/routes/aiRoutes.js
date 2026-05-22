import express from 'express';
import {
  aiGenerateDescription,
  aiGenerateTags,
  aiGenerateCaption,
  aiGenerateAll,
  aiGetSuggestions,
  aiGetPricing
} from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

router.post('/generate-description', aiGenerateDescription);
router.post('/generate-tags', aiGenerateTags);
router.post('/generate-caption', aiGenerateCaption);
router.post('/generate-all', aiGenerateAll);
router.get('/suggestions', aiGetSuggestions);
router.get('/pricing/:productId', aiGetPricing);

export default router;
