/**
 * BusLocation Interface: Live GPS coordinates (Latitude aur Longitude) define karta hai
 */
export interface BusLocation {
  lat: number;                  // GPS Latitude (misal ke taur par: map par location ki north/south position)
  lng: number;                  // GPS Longitude (misal ke taur par: map par location ki east/west position)
}

/**
 * TrackingInfo Interface: Live bus tracking, speed, current city, aur trip status ki poori details
 */
export interface TrackingInfo {
  id: string;                   // Tracking record ki unique ID (misal ke taur par: "TRK-701")
  busId: string;                // Is tracking se linked specific Bus ki ID (misal ke taur par: "BUS-101")
  busNumber: string;            // Bus ka official registration number ya number plate (misal ke taur par: "LES-8821")
  scheduleId: string;           // Is active trip ya schedule ki ID (misal ke taur par: "SCH-501")
  
  driverName: string;           // Bus chalane walay driver ka poora naam
  driverPhone: string;          // Driver ka contact ya mobile number
  
  routeOrigin: string;          // Safar ka starting point / shuru hone wali city (misal ke taur par: "Karachi")
  routeDestination: string;     // Safar ki manzil / aakhri city (misal ke taur par: "Lahore")
  
  // Live Telemetry Data (Real-time GPS aur sensor data)
  currentLocation: BusLocation; // Bus ke current lat/lng coordinates (BusLocation interface object)
  currentCity: string;          // Bus is waqt kis city ya area se guzar rahi hai (misal ke taur par: "Sukkur")
  speedKmH: number;             // Bus ki current raftar kilometers per hour mein (misal ke taur par: 85 km/h)
  heading: number;              // Bus kis direction ya angle par chal rahi hai degrees mein (0 se 360 tak)
  
  estimatedArrivalTime: string; // Manzil par pohanchnay ka andazay ka waqt (misal ke taur par: "11:45 AM")
  distanceRemainingKm: number;  // Manzil tak pohanchnay ke liye abhi kitne kilometers baqi hain (misal ke taur par: 450 km)
  
  // Trip Operational Tracking Status (Trip ki current condition)
  status: 'On Time' | 'Delayed' | 'Stopped' | 'Reached'; // Trip waqt par hai, late hai, ruki hui hai, ya pohanch chuki hai
  lastUpdated: string;          // Aakhri baar GPS signal ya ping kab receive hua tha (Timestamp)
}