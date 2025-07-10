const {pool} = require('../../../config/db');

// Get settings for a developer
const getNotificationSettings = async (developerId) => {
  const result = await pool.query(
    `SELECT * FROM developer_notification_settings WHERE developer_id = $1`,
    [developerId]
  );
  return result.rows[0];
};

// Create default settings if not exist
const createDefaultNotificationSettings = async (developerId) => {
  await pool.query(
    `INSERT INTO developer_notification_settings (developer_id) VALUES ($1) ON CONFLICT (developer_id) DO NOTHING`,
    [developerId]
  );
};

// Update settings
const updateNotificationSettings = async (developerId, settings) => {
  const {
    special_offers,
    sound,
    vibrate,
    general_notifications,
    promo_and_discount,
    payment_options,
    app_updates,
    new_service_available,
    new_tips_available,
  } = settings;

  await pool.query(
    `UPDATE developer_notification_settings SET
      special_offers = $1,
      sound = $2,
      vibrate = $3,
      general_notifications = $4,
      promo_and_discount = $5,
      payment_options = $6,
      app_updates = $7,
      new_service_available = $8,
      new_tips_available = $9,
      updated_at = NOW()
    WHERE developer_id = $10`,
    [
      special_offers,
      sound,
      vibrate,
      general_notifications,
      promo_and_discount,
      payment_options,
      app_updates,
      new_service_available,
      new_tips_available,
      developerId
    ]
  );
};

module.exports = {
  getNotificationSettings,
  createDefaultNotificationSettings,
  updateNotificationSettings,
};
