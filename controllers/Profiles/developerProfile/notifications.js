const {
  getNotificationSettings,
  createDefaultNotificationSettings,
  updateNotificationSettings,
} = require('../../../services/Profiles/developerProfile/notifications');

// Get current settings
const getSettings = async (req, res) => {
  const developerId = req.user.id;

  try {
    await createDefaultNotificationSettings(developerId); // Ensure row exists
    const settings = await getNotificationSettings(developerId);
    res.status(200).json(settings);
  } catch (err) {
    console.error('❌ Get Notification Settings:', err.message);
    res.status(500).json({ message: 'Failed to get settings' });
  }
};

// Update settings
const updateSettings = async (req, res) => {
  const developerId = req.user.id;
  const settings = req.body;

  try {
    await updateNotificationSettings(developerId, settings);
    res.status(200).json({ message: 'Settings updated successfully' });
  } catch (err) {
    console.error('❌ Update Notification Settings:', err.message);
    res.status(500).json({ message: 'Failed to update settings' });
  }
};

module.exports = {
  getSettings,
  updateSettings,
};
