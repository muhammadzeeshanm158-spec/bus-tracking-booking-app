import db from '../database/db.js';

export default class Setting {
  static async getSettings() {
    const [rows] = await db.execute('SELECT * FROM settings WHERE id = 1');
    return rows[0];
  }
static async updateSettings(data) {
    const allowedFields = [
      'company_name',
      'support_email',
      'contact_phone',
      'currency',
      'tax_percentage',
      'allow_online_booking',
      'cancellation_hours_limit',
      'address'
    ];

    const updates = [];
    const values = [];

    // Seedha data object se check kar rahe hain, koi unused variable nahi bachega
    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        updates.push(`${field} = ?`);
        
        // Boolean value ko 1 ya 0 mein convert karna
        if (field === 'allow_online_booking') {
          values.push(data[field] ? 1 : 0);
        } else {
          values.push(data[field]);
        }
      }
    }

    if (updates.length === 0) {
      throw new Error("No valid fields provided for update");
    }

    values.push(1); // WHERE id = 1 ke liye

    const query = `UPDATE settings SET ${updates.join(', ')} WHERE id = 1`;
    const [result] = await db.execute(query, values);

    return result;
  }
}
