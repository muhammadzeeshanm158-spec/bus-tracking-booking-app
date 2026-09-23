/**
 * =========================================================================
 * REPORT & ANALYTICS DATA MODELS
 * Transport management application ke reports aur statistics ke liye interfaces
 * =========================================================================
 */

// 1. Top Route Interface: Sab se zyada perform karne wale routes ki details
export interface TopRoute {
  routeName: string;      // Route ka naam ya code (e.g. "Karachi - Lahore")
  revenue: number;        // Us route se generate honay wali total revenue
  occupancy: number;      // Average occupancy percentage
  passengers: number;     // Us route par safar karne wale kul مسافر (passengers)
  percentage: number;     // Overall share percentage
}

// 2. Daily Operation Interface: Roz marrah ki operations aur performance ka data
export interface DailyOperation {
  date: string;           // Operation ki tareekh (e.g. "2026-09-03")
  trips: number;          // Us din lagne walay kul trips
  passengers: number;     // Us din ke kul passengers
  occupancyRate: number;  // Us din ki average occupancy rate
  onTimeRate: number;     // Buses ki waqt par chalne ki percentage (On-time arrivals)
  revenue: number;        // Us din ki total aamdani (revenue)
}

// 3. Report Summary Interface: Dashboard ya main reports page ke liye complete summary data
export interface ReportSummary {
  totalRevenue: number;         // Kul aamdani
  revenueGrowth: string;        // Revenue mein izafa ya kami (e.g. "+12.5%")
  totalBookings: number;        // Kul bookings ki tadaad
  bookingGrowth: string;        // Bookings ki growth percentage
  avgOccupancy: number;         // Overall average occupancy rate
  distanceDriven: number;       // Kul tay kiya gaya safar (kilometers mein)
  fuelUsed: number;             // Kul istemal hone wala fuel (liters mein)
  topRoutes: TopRoute[];        // Top routes ki list
  dailyOperations: DailyOperation[]; // Rozana ke operations ki history/list
}

/**
 * =========================================================================
 * API RESPONSE MODELS
 * Backend server se aane wale raw data ko handle karne ke liye interfaces
 * =========================================================================
 */

// Backend se jo direct response object a raha hai (Raw data structure)
export interface RawReportSummaryResponse {
  totalRevenue?: number;    // Optional total revenue from backend
  totalBookings?: number;   // Optional total bookings from backend
  totalBuses?: number;      // Optional total active/inactive buses
  totalCustomers?: number;  // Optional total registered customers
}

// Complete Reports API Response Wrapper
export interface ReportsApiResponse {
  success: boolean;               // Request kamyab hui ya nahi (true/false)
  message: string;                // Server ka response message
  data: RawReportSummaryResponse; // Asli report data payload
}