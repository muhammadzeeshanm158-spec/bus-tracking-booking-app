/**
 * Driver Interface: Transport system ke driver ki personal, license, aur operational details define karta hai
 */
export interface Driver {
  id: number | string;       // Unique Driver ID (Backend se number aa sakta hai)
  user_id?: number;           // Backend user table foreign key reference
  name: string;              // Driver Full Name (joined from users)
  email: string;             // Driver Email Address (joined from users)
  phone: string;             // Contact Phone Number (joined from users)
  cnic?: string;             // Pakistani CNIC number (Optional / Users table)
  address?: string;          // Residential Address (Optional / Users table)
  
  // =========================================================================
  // LICENSE & EXPERIENCE DETAILS (Driver ka driving license aur tajruba)
  // =========================================================================
  licenseNumber: string;     // License details (matches DB license_number)
  licenseCategory?: string;  // License type e.g., "HTV", "LTV" (Optional)
  experienceYears: number;   // Driving experience in years (matches experience_years)
  
  // =========================================================================
  // BUS ASSIGNMENT TRACKING (Kis bus par driver duty de raha hai)
  // =========================================================================
  assignedBusId?: string;       // Currently assigned bus ID (Optional)
  assignedBusNumber?: string;   // Currently assigned bus registration number (Optional)
  
  // =========================================================================
  // OPERATIONAL STATUS (Driver ki maujooda duty ki haalat)
  // =========================================================================
  isAvailable?: boolean | number; // Database field mapping (1 or 0)
  status?: 'Available' | 'On Duty' | 'On Leave' | 'Inactive' | 'Suspended'; // 'Inactive' yahan add kar diya gaya hai
  joiningDate: string;          // Company join karne ki tareekh (matches joining_date)
}