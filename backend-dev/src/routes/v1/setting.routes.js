import express from 'express';
import { getSettings, updateSettings } from '../../controllers/setting.controller.js';
import { updateSettingsValidation } from '../../validations/settings.validation.js';

const router = express.Router();

router.get('/', getSettings);
router.put('/', updateSettingsValidation, updateSettings);

export default router;