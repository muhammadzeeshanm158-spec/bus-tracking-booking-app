/**
 * @file booking.model.ts
 * @description Ticket Booking aur uski payment/status details ke liye strict TypeScript Interface (MySQL Aligned).
 */

export interface Booking {
  id?: number | string;                 // MySQL primary key
  booking_number: string;               // Unique Booking Number
  userId: number;                      // Linked User ID
  scheduleId: number;                  // Linked Bus Schedule ID
  booking_date?: string;                // Booking timestamp
  totalAmount: number;                 // Total Fare / Price
  bookingStatus: 'Pending' | 'Confirmed' | 'Cancelled' | 'Completed'; 
  
  // Optional / Extended UI & Database fields (Strictly Typed)
  payment_status?: 'Pending' | 'Paid' | 'Refunded';
  paymentStatus?: 'Pending' | 'Paid' | 'Refunded';
  
  customerName?: string; 
  customer_name?: string;

  customerPhone?: string; 
  customer_phone?: string;

  busNumber?: string; 
  bus_number?: string;

  routeOrigin?: string; 
  route_origin?: string;

  routeDestination?: string; 
  route_destination?: string;

  seat_numbers?: number[];              
  seatNumbers?: number[];

  seat_fare?: number;                   
  created_at?: string; 
  createdAt?: string;

  departure_time?: string;
  departureTime?: string;

  travel_date?: string;
  travelDate?: string;
cnic?: string; // Yeh line add kar lein
  cnic_number?: string;
  cnicNumber?: string;

  payment_method?: string;
  paymentMethod?: string;
}