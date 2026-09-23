/**
 * Schedule Interface: Transport system mein buses ki trip timing, route, fare, aur seat tracking ko define karta hai
 */
export interface Schedule {
  // Database ki unique identifier ID
  id: string;
  
  // Schedule ka user-friendly unique code (e.g., "SCH-101")
  scheduleCode: string;           

  // --- Bus details mapping ---
  busId: string;                  // Bus ki unique ID
  busNumber: string;              // Bus ka registration number (e.g., "BSA-786")
  busType: string;                // Bus ki category/type (e.g., "Executive", "Sleeper")
  
  // --- Route details mapping ---
  routeId: string;                // Route ki unique ID
  routeName: string;              // Route ka naam ya path (e.g., "Karachi to Lahore")
  
  // --- Assigned Driver details (Optional) ---
  driverId?: string;              // Muqarar kardah driver ki ID
  driverName?: string;            // Driver ka naam
  
  // --- Travel routing & timing ---
  departureCity: string;          // Safar shuru honay wala shehar (Origin)
  arrivalCity: string;            // Manzil ya pohanchnay wala shehar (Destination)
  departureTime: string;          // Rawangi ka waqt (ISO date string ya HH:mm)
  arrivalTime: string;            // Pohanchnay ka mutawaqa waqt
  departureDate: string;          // Safar ki tareekh (e.g., "2026-08-10")
  
  // --- Pricing aur Seat capacity ---
  fare: number;                   // Ek ticket ki keemat PKR mein
  totalSeats: number;             // Bus ki kul seat capacity
  availableSeats: number;         // Baqi rehnay wali khali seats ki tadad
  
  // --- Operational Trip Status ---
  // Trip ki mojooda operational halat
  status: 'Scheduled' | 'On-Time' | 'Delayed' | 'Completed' | 'Cancelled';
  
  // Record banne ki tareekh aur waqt (Optional)
  created_at?: string;
}