/**
 * @file route.service.ts
 * @description Service for handling Route API CRUD communications (Strictly Typed, No 'any')
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';
import { Route } from '../models/route.model';

// Backend response standard interface
export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

// City interface for dropdowns
export interface City {
  id: number;
  name: string;
  province: string;
}

// Strict Payload Interface for Form Data mapping
export interface RouteFormPayload {
  routeName?: string;
  sourceCityId?: string | number;
  destinationCityId?: string | number;
  distanceKm?: number;
  estimatedHours?: string | number;
  estimatedDurationMinutes?: string | number;
  status?: string;
  farePrice?: number;
  stops?: string[];
  [key: string]: unknown; 
}

@Injectable({
  providedIn: 'root'
})
export class RouteService {
  
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/v1/routes';

  // =========================================================================
  // CENTRALIZED PAKISTAN CITIES DATASET (For Dropdowns)
  // =========================================================================
  private pakistanCities: City[] = [
    { id: 1, name: 'Karachi', province: 'Sindh' },
    { id: 2, name: 'Lahore', province: 'Punjab' },
    { id: 3, name: 'Islamabad / Rawalpindi', province: 'Punjab / ICT' },
    { id: 4, name: 'Faisalabad', province: 'Punjab' },
    { id: 5, name: 'Multan', province: 'Punjab' },
    { id: 6, name: 'Peshawar', province: 'KPK' },
    { id: 7, name: 'Quetta', province: 'Balochistan' },
    { id: 8, name: 'Hyderabad', province: 'Sindh' },
    { id: 9, name: 'Sukkur', province: 'Sindh' },
    { id: 10, name: 'Abbottabad', province: 'KPK' }
  ];

  /**
   * Response wrapper ko handle karne ke liye generic helper function
   */
  private extractData<T>(response: ApiResponse<T> | T): T {
    if (response && typeof response === 'object' && 'data' in response) {
      return (response as ApiResponse<T>).data;
    }
    return response as T;
  }

  /**
   * Helper: Frontend ke camelCase data ko Backend ke snake_case payload mein safely map karta hai
   */
  private mapToBackendPayload(routeData: RouteFormPayload) {
    let durationMinutes = 60;
    
    if (routeData.estimatedDurationMinutes !== undefined) {
      durationMinutes = Number(routeData.estimatedDurationMinutes);
    } else if (routeData.estimatedHours) {
      const parsedHours = parseFloat(String(routeData.estimatedHours));
      if (!isNaN(parsedHours)) {
        durationMinutes = Math.round(parsedHours * 60);
      }
    }

    return {
      route_name: routeData.routeName,
      source_city_id: routeData.sourceCityId,
      destination_city_id: routeData.destinationCityId,
      distance_km: routeData.distanceKm,
      estimated_duration_minutes: durationMinutes,
      is_active: routeData.status === 'Active' ? 1 : 0,
      fare_price: routeData.farePrice,
      stops: routeData.stops
    };
  }

  /**
   * 0. GET CITIES LIST (For Dropdowns)
   */
  getCities(): Observable<City[]> {
    return of(this.pakistanCities);
  }

  /**
   * 1. GET ALL ROUTES
   */
getAllRoutes(): Observable<Route[]> {
  return this.http.get<unknown>(this.apiUrl).pipe(
    map(response => {
      if (Array.isArray(response)) {
        return response as Route[];
      }
      
      const res = response as Record<string, unknown>;
      const data = res['data'] || res['routes'];
      
      return Array.isArray(data) ? (data as Route[]) : [];
    })
  );
}

  /**
   * 2. GET SINGLE ROUTE BY ID
   */
  getRouteById(id: string | number): Observable<Route> {
    return this.http.get<ApiResponse<Route> | Route>(`${this.apiUrl}/${id}`).pipe(
      map(response => this.extractData<Route>(response))
    );
  }

  /**
   * 3. ADD NEW ROUTE
   */
  createRoute(routeData: RouteFormPayload): Observable<Route> {
    const payload = this.mapToBackendPayload(routeData);
    return this.http.post<ApiResponse<Route> | Route>(this.apiUrl, payload).pipe(
      map(response => this.extractData<Route>(response))
    );
  }

  /**
   * 4. UPDATE EXISTING ROUTE
   */
  updateRoute(id: string | number, routeData: RouteFormPayload): Observable<Route> {
    const payload = this.mapToBackendPayload(routeData);
    return this.http.put<ApiResponse<Route> | Route>(`${this.apiUrl}/${id}`, payload).pipe(
      map(response => this.extractData<Route>(response))
    );
  }

  /**
   * 5. DELETE ROUTE
   */
  deleteRoute(id: string | number): Observable<unknown> {
    return this.http.delete<ApiResponse<unknown> | unknown>(`${this.apiUrl}/${id}`).pipe(
      map(response => this.extractData<unknown>(response))
    );
  }
}