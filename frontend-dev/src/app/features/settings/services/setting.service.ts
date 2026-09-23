import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Setting } from '../models/setting.model';

@Injectable({
  providedIn: 'root'
})
export class SettingService {
  // Dependency Injection: HTTP requests bhejne ke liye HttpClient service inject karna
  private http = inject(HttpClient);
  
  // Backend API URL: Settings management ke liye server ka endpoint
  private apiUrl = 'http://localhost:5000/api/v1/settings'; 

  // constructor() { }

  /**
   * GET SETTINGS
   * Backend server se application ki current settings / configuration fetch karna
   */
  getSettings(): Observable<Setting> {
    return this.http.get<Setting>(this.apiUrl);
  }

  /**
   * UPDATE SETTINGS
   * Server par settings update ya modify karna (yahan 'any' ki bajaye proper Setting model type use kiya gaya hai)
   */
  updateSettings(data: Setting): Observable<{ message: string; data?: Setting }> {
    return this.http.put<{ message: string; data?: Setting }>(this.apiUrl, data);
  }
}