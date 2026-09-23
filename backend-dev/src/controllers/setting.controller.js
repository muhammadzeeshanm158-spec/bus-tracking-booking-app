import Setting from '../models/setting.model.js';

export const getSettings = async (req, res) => {
  try {
    const settings = await Setting.getSettings();
    if (!settings) {
      return res.status(404).json({ error: 'Settings not found' });
    }
    res.status(200).json(settings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateSettings = async (req, res) => {
  try {
    await Setting.updateSettings(req.body);
    res.status(200).json({ message: 'Settings updated successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};