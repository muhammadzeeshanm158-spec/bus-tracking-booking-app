export interface Route {
  id?: string | number;        // Optional kar diya taake missing hone par error na aaye
  _id?: string;                // MongoDB ki default ID support ke liye
  routeName?: string;          
  sourceCityId?: number;       
  destinationCityId?: number;  
  origin?: string;             
  destination?: string;        
  distanceKm: number;          
  estimatedDurationMinutes?: number; 
  estimatedHours: string;      
  stops?: string[];            
  farePrice: number;           
  status: 'Active' | 'Inactive'; 
}