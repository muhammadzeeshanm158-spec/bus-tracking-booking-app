import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Bus } from '../models/bus.model';
import { environment } from '../../../../environments/environment.development';

// Backend response ke wrapper structure ke liye generic interface
interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class BusService {
  
  // =========================================================================
  // DEPENDENCY INJECTION & CONFIGURATION
  // =========================================================================
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/buses`; // Express backend ka buses API endpoint URL

  // =========================================================================
  // 1. GET ALL BUSES
  // Server se saari active/inactive buses ki list fetch karne ke liye
  // =========================================================================
  getBuses(): Observable<Bus[]> {
    return this.http.get<ApiResponse<Bus[]>>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  // =========================================================================
  // 2. GET BUSES LIST (ALTERNATIVE ALIAS)
  // Agar kisi component mein getBusesList() call ho raha ho toh yeh method use hoga
  // =========================================================================
  getBusesList(): Observable<Bus[]> {
    return this.getBuses();
  }

  // =========================================================================
  // 3. GET SINGLE BUS BY ID
  // Kisi aik specific bus ki details ID ke zariye mangwane ke liye
  // =========================================================================
  getBusById(id: string): Observable<Bus> {
    return this.http.get<ApiResponse<Bus>>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  // =========================================================================
  // 4. CREATE A NEW BUS
  // Nayi bus register/add karne ke liye (ID backend par generate hogi isliye Omit use kiya hai)
  // =========================================================================
  createBus(busData: Omit<Bus, 'id'>): Observable<Bus> {
    return this.http.post<ApiResponse<Bus>>(this.apiUrl, busData).pipe(
      map(response => response.data)
    );
  }

  // =========================================================================
  // 5. UPDATE AN EXISTING BUS
  // Pehle se mojood bus ki tafseelaat update ya edit karne ke liye
  // =========================================================================
  updateBus(id: string, busData: Partial<Bus>): Observable<Bus> {
    return this.http.put<ApiResponse<Bus>>(`${this.apiUrl}/${id}`, busData).pipe(
      map(response => response.data)
    );
  }

  // =========================================================================
  // 6. DELETE A BUS
  // Kisi bus ko system se remove/delete karne ke liye
  // =========================================================================
  deleteBus(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}