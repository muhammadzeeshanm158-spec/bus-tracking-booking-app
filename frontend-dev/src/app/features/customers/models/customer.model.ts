/**
 * Customer Booking Interface: Customer ki past ya upcoming individual booking ki details
 */
export interface CustomerBooking {
  bookingId: string;                    // Booking ki unique identification code
  routeName: string;                    // Safar ka route (e.g. Lahore to Islamabad)
  busNumber: string;                    // Bus ka number ya fleet code
  seatNumber: string;                   // Book ki gayi seat ka number
  travelDate: string;                   // Safar ki tarikh (Date string)
  amount: number;                       // Is booking ka total fare / amount
  status: 'Upcoming' | 'Completed' | 'Cancelled' | string; // Booking ki current live status
}

/**
 * Customer Interface: Ek customer ki poori profile, contact info, aur travel statistics
 */
export interface Customer {
  id: string;                           // Customer ki unique ID (Database Primary Key)
  name: string;  
  first_name?: string; // Add this line
  last_name?: string;  // Add this line                       // Customer ka poora naam
  email: string;                        // Customer ka email address
  phone: string;                        // Primary phone number
  phone_number?: string;                // Backend compatibility ke liye alternative field
  cnic?: string;                        // Pakistani CNIC format support (e.g. 35202-1234567-1)
  gender?: 'male' | 'female' | 'other' | string; // Customer ki gender identity
  dob?: string;                         // Date of Birth (Pidaish ki tarikh)
  
  // Emergency Contact Details (Hangaami halat mein rabta karne ke liye)
  emergencyContactName?: string;        // Emergency contact person ka naam (CamelCase)
  emergencyContactPhone?: string;       // Emergency contact person ka phone number (CamelCase)
  emergency_contact_name?: string;      // Emergency contact naam (Backend snake_case compatibility)
  emergency_contact_phone?: string;     // Emergency contact phone (Backend snake_case compatibility)
  
  status: 'Active' | 'Inactive' | string; // Customer account ki operational status
  is_active?: boolean; // <-- Yeh line add kar dein
  address?: string;                     // Customer ka rihaishi pata (Address)
  joinedDate?: string;                  // Platform par register hone ki tarikh
  
  // UI Stats & Bookings History fields (Dashboard aur Profile view ke liye)
  avatarBg?: string;                    // Profile avatar ka background color class
  avatarTextBg?: string;                // Avatar ke text/icon ka color class
  totalRides?: number;                  // Customer ke total safar/rides ki ginti
  completedRides?: number;              // Mukammal hone wale rides ki ginti
  cancelledRides?: number;              // Mansookh hone wale rides ki ginti
  totalSpent?: number;                  // Customer ka total kharch kiya gaya amount
  bookings?: CustomerBooking[];         // Customer ki saari past aur upcoming bookings ki list
}