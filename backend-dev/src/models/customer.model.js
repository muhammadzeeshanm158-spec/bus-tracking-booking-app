import db from '../database/db.js'; // Database connection import kar rahe hain

class CustomerModel {

  // Helper function: Frontend Interface ke mutabiq object mapping
  static #mapToFrontendFormat(row) {
    if (!row) return null;
    return {
      id: row.id,
      first_name: row.first_name,
      last_name: row.last_name,
      name: `${row.first_name || ''} ${row.last_name || ''}`.trim(), // Combined full name for Frontend
      email: row.email,
      phone: row.phone,
      phone_number: row.phone,
      cnic: row.cnic,
      gender: row.gender,
      dob: row.dob,
      emergencyContactName: row.emergency_contact_name,
      emergency_contact_name: row.emergency_contact_name,
      emergencyContactPhone: row.emergency_contact_phone,
      emergency_contact_phone: row.emergency_contact_phone,
      status: row.is_active ? 'Active' : 'Inactive',
      is_active: row.is_active,
      address: row.address,
      joinedDate: row.created_at,
      created_at: row.created_at
    };
  }

  // 1. TAMAM CUSTOMERS KO GET KARNE KE LIYE (FETCH ALL)
  // Yeh query database se tamam active aur inactive customers ka data lati hai
  static async getAll() {
    const query = `
      SELECT id, first_name, last_name, email, phone, cnic, gender, dob, 
             emergency_contact_name, emergency_contact_phone, address, is_active, created_at 
      FROM customers 
      ORDER BY id DESC
    `;
    const [rows] = await db.execute(query);
    return rows.map(row => this.#mapToFrontendFormat(row));
  }

  // 2. ID KE ZARIYE EK CUSTOMER KO FIND KARNE KE LIYE (FETCH BY ID)
  // Specific Customer Details view karne ke liye yeh query chalti hai
  static async getById(id) {
    const query = `
      SELECT id, first_name, last_name, email, phone, cnic, gender, dob, 
             emergency_contact_name, emergency_contact_phone, address, is_active, created_at 
      FROM customers 
      WHERE id = ?
    `;
    const [rows] = await db.execute(query, [id]);
    return this.#mapToFrontendFormat(rows[0]);
  }

  // 3. NAYA CUSTOMER CREATE / ADD KARNE KE LIYE (INSERT)
  // Form se aaya naya customer data database mein insert hota hai
  static async create(customerData) {
    const first_name = customerData.first_name || null;
    const last_name = customerData.last_name || null;
    const email = customerData.email || null;
    const phone = customerData.phone || null;
    const cnic = customerData.cnic || null;
    const gender = customerData.gender || 'Male';
    const dob = customerData.dob || null;
    const emergency_contact_name = customerData.emergency_contact_name || null;
    const emergency_contact_phone = customerData.emergency_contact_phone || null;
    const address = customerData.address || null;
    const is_active = customerData.is_active !== undefined ? customerData.is_active : true;

    const query = `
      INSERT INTO customers (
        first_name, last_name, email, phone, cnic, gender, dob, 
        emergency_contact_name, emergency_contact_phone, address, is_active
      ) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      first_name, last_name, email, phone, cnic, gender, dob, 
      emergency_contact_name, emergency_contact_phone, address, is_active
    ];
    
    const [result] = await db.execute(query, values);
    
    // Freshly created customer DB se re-fetch karke formatted structure mein return karta hai
    return this.getById(result.insertId);
  }

  // 4. EXISTING CUSTOMER DETAILS UPDATE KARNE KE LIYE (UPDATE)
  // Pehle se majood customer ki details ko modify karne ki query
  static async update(id, customerData) {
    const first_name = customerData.first_name || null;
    const last_name = customerData.last_name || null;
    const email = customerData.email || null;
    const phone = customerData.phone || null;
    const cnic = customerData.cnic || null;
    const gender = customerData.gender || 'Male';
    const dob = customerData.dob || null;
    const emergency_contact_name = customerData.emergency_contact_name || null;
    const emergency_contact_phone = customerData.emergency_contact_phone || null;
    const address = customerData.address || null;
    const is_active = customerData.is_active !== undefined ? customerData.is_active : true;

    const query = `
      UPDATE customers 
      SET first_name = ?, 
          last_name = ?, 
          email = ?, 
          phone = ?, 
          cnic = ?, 
          gender = ?, 
          dob = ?,
          emergency_contact_name = ?,
          emergency_contact_phone = ?,
          address = ?, 
          is_active = ?, 
          updated_at = NOW() 
      WHERE id = ?
    `;

    const values = [
      first_name, last_name, email, phone, cnic, gender, dob, 
      emergency_contact_name, emergency_contact_phone, address, is_active, id
    ];
    
    const [result] = await db.execute(query, values);
    return result.affectedRows > 0; // Agar record update ho gaya toh true return karega
  }

  // 5. CUSTOMER RECORD DELETE KARNE KE LIYE (DELETE)
  // Selected Customer ko database se permanent remove karne ke liye
  static async delete(id) {
    const query = `DELETE FROM customers WHERE id = ?`;
    const [result] = await db.execute(query, [id]);
    return result.affectedRows > 0; // Agar record delete ho gaya toh true return karega
  }
}

export default CustomerModel;