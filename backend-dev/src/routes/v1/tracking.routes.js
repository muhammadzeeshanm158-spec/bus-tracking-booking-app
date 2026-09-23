import express from 'express';
import { 
  getAllLiveLocations, 
  getBusLocationById, 
  updateBusLocation 
} from '../../controllers/tracking.controller.js';
import { updateTrackingValidation } from '../../validations/tracking.validation.js';

const router = express.Router();

// GET all active buses live locations
router.get('/', getAllLiveLocations);

// GET specific bus live location by bus ID
router.get('/:id', getBusLocationById);

// PUT / POST update bus GPS coordinates
router.put('/:id', updateTrackingValidation, updateBusLocation);

export default router;