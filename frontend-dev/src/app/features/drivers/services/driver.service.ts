/**
 * @file driver.service.ts
 * @description Driver Management Service for communicating with Node.js/Express backend APIs.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Driver } from '../models/driver.model';

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  
  // Angular ka modern dependency injection (HttpClient ko inject karna)
  private http = inject(HttpClient);
  
  // Backend API ka base endpoint (Node.js/Express server URL)
  private apiUrl = 'http://localhost:5000/api/v1/drivers';

  /**
   * 1. Saare drivers ki list lene ke liye (GET Request)
   * Backend wrapper se data array extract kar rahe hain
   */
  getDrivers(): Observable<Driver[]> {
    return this.http.get<{ success: boolean; count: number; data: Driver[] }>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  /**
   * 2. Specific Driver ID ke zariye single driver ki details lene ke liye (GET by ID)
   */
  getDriverById(id: number | string): Observable<Driver> {
    return this.http.get<{ success: boolean; data: Driver }>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  /**
   * 3. Naya driver database mein add karne ke liye (POST Request)
   */
  addDriver(driver: Omit<Driver, 'id'>): Observable<Driver> {
    return this.http.post<{ success: boolean; data: Driver }>(this.apiUrl, driver).pipe(
      map(response => response.data)
    );
  }

  /**
   * 4. Existing driver ki details update karne ke liye (PUT Request)
   */
  updateDriver(id: number | string, updatedDriver: Partial<Driver>): Observable<Driver> {
    return this.http.put<{ success: boolean; data: Driver }>(`${this.apiUrl}/${id}`, updatedDriver).pipe(
      map(response => response.data)
    );
  }

  /**
   * 5. Database se driver ka profile remove (delete) karne ke liye (DELETE Request)
   */
  deleteDriver(id: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}