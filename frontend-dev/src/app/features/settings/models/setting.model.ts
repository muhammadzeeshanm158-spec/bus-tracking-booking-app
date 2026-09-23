// =========================================================================
// APPLICATION SETTINGS INTERFACE MODEL                                     
// =========================================================================
export interface Setting {
  id?: number;                  // Setting record ki unique primary key (optional)
  company_name: string;         // Transport company ya business ka naam
  support_email: string;        // Customer support ya inquiry email address
  contact_phone: string;        // Official contact ya helpline phone number
  currency: string;             // System ki default currency (misal ke taur par: PKR, USD)
  tax_percentage: number;       // Ticket booking par lagne wala tax ya GST percentage
  allow_online_booking: boolean;// Kya users online bookings kar sakte hain ya nahi (true/false)
  cancellation_hours_limit: number; // Safar ya departure se kitne ghante pehle cancellation allowed hai
  address: string;              // Company ka physical office address
  updated_at?: string;          // Aakhri baar settings kab update huin (timestamp / optional)
}