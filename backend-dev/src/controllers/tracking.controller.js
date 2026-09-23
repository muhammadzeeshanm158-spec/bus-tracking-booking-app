import Tracking from '../models/tracking.model.js';

// Sabhi buses ki live locations get karne ke liye
export const getAllLiveLocations = async (req, res) => {
  try {
    const locations = await Tracking.getAllLiveLocations();
    res.status(200).json(locations);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Kisi single bus ki location get karne ke liye
export const getBusLocationById = async (req, res) => {
  try {
    const { id } = req.params;
    const location = await Tracking.getBusLocationById(id);
    if (!location) {
      return res.status(404).json({ error: 'Live tracking data not found for this bus' });
    }
    res.status(200).json(location);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Bus ki location update/insert karne ke liye (GPS tracker ya driver app se call hogi)
export const updateBusLocation = async (req, res) => {
  try {
    const { id } = req.params; // bus_id
    const { latitude, longitude, speed, heading } = req.body;

    if (!latitude || !longitude) {
      return res.status(400).json({ error: 'Latitude and Longitude are required' });
    }

    await Tracking.updateLocation(id, { latitude, longitude, speed, heading });
    res.status(200).json({ message: 'Location updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};