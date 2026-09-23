import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TrackingInfo } from '../models/tracking.model';

@Injectable({
  providedIn: 'root'
})
export class TrackingService {
  private http = inject(HttpClient);
  
  // 🔴 Yahan 'v1' add karein taaki route backend se match ho jaye
  private apiUrl = 'http://localhost:5000/api/v1/tracking'; 

  getAllLiveTrackings(): Observable<TrackingInfo[]> {
    return this.http.get<TrackingInfo[]>(this.apiUrl);
  }

  getTrackingById(id: string): Observable<TrackingInfo> {
    return this.http.get<TrackingInfo>(`${this.apiUrl}/${id}`);
  }

  updateTracking(id: string, data: Partial<TrackingInfo>): Observable<{ message: string; data?: TrackingInfo }> {
    return this.http.put<{ message: string; data?: TrackingInfo }>(`${this.apiUrl}/${id}`, data);
  }
}