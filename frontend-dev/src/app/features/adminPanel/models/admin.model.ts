/**
 * @file admin.model.ts
 * @description TypeScript Interface/Model for User and Admin Panel Management
 */

export interface Admin {
  id?: number;          // Database primary key ID
  user_id?: number;     // Alternative ID field support
  full_name: string;    // User ka poora naam
  email: string;        // User ki email address
  role: 'Admin' | 'Driver' | 'Customer'; // System roles jo aapne define kiye hain
  phone_number?: string;// Contact number (11-20 digits)
  gender?: 'Male' | 'Female' | 'Other'; // Gender selection
  account_status?: 'active' | 'inactive'; // Account status
  created_at?: string;  // Creation timestamp
  updated_at?: string;  // Last update timestamp
}

// Admin Dashboard stats ya summary ke liye model (agar zaroorat paray)
export interface AdminDashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalBuses: number;
  totalSchedules: number;
}







