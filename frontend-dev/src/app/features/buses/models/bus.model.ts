/**
 * @file bus.model.ts
 * @description TypeScript Interface for Bus Model matching exact backend & database columns
 */

export interface Bus {
  id?: number;                         // Bus ki unique database ID
  bus_name: string;  
  bus_number: string;               //  bus_number: string;
  bus_type: 'Standard' | 'Executive' | 'Luxury'; // Bus ki category
  registration_number: string;         // Vehicle ki official number plate / registration ID
  total_seats: number;                 // Bus mein mojood kul seats ki tadaad
  is_active?: boolean;                 // Bus ki maujooda operational halat (Active/Inactive)
}