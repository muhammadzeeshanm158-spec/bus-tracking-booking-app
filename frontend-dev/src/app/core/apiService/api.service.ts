/**
 * @file api.service.ts
 * @description Centralized Generic API Service jo poori application ke liye HTTP requests (GET, POST, PUT, DELETE) handle karta hai.
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ApiService {
  // Environment file se backend ka base URL fetch kar rahe hain
  private baseUrl = environment.apiUrl;
  
  // Modern Angular inject function ka istemaal karke HttpClient instance la rahe hain
  private http = inject(HttpClient);

  /**
   * @method get
   * @description Generic GET Method: Server se data fetch karne ke liye (Optional query parameters support ke sath)
   * @param endpoint API ka endpoint (e.g., 'buses', 'routes')
   * @param params Query parameters object (optional)
   */
  get<T>(
    endpoint: string,
    params?: Record<string, string | number | boolean | null | undefined>,
  ): Observable<T> {
    let httpParams = new HttpParams();

    // Agar parameters pass kiye gaye hain, toh unhein loop karke HttpParams mein convert karna
    if (params) {
      Object.keys(params).forEach((key) => {
        const value = params[key];
        // Null ya undefined values ko skip kar rahe hain taaki URL clean rahe
        if (value !== null && value !== undefined) {
          httpParams = httpParams.append(key, value.toString());
        }
      });
    }

    // HttpClient get request bhej raha hai base URL aur endpoint ko combine karke
    return this.http.get<T>(`${this.baseUrl}/${endpoint}`, {
      params: httpParams,
    });
  }

  /**
   * @method post
   * @description Generic POST Method: Server par naya data create ya submit karne ke liye
   * @param endpoint API ka endpoint
   * @param body Request body payload jo server ko bhejna hai
   */
  post<T, B = unknown>(endpoint: string, body: B): Observable<T> {
    return this.http.post<T>(`${this.baseUrl}/${endpoint}`, body);
  }

  /**
   * @method put
   * @description Generic PUT Method: Existing data ko update ya modify karne ke liye
   * @param endpoint API ka endpoint (e.g., 'profile', 'bus/1')
   * @param body Updated data payload
   */
  put<T, B = unknown>(endpoint: string, body: B): Observable<T> {
    return this.http.put<T>(`${this.baseUrl}/${endpoint}`, body);
  }

  /**
   * @method delete
   * @description Generic DELETE Method: Server se kisi record ko delete karne ke liye
   * @param endpoint API ka endpoint with ID (e.g., 'bus/5')
   */
  delete<T>(endpoint: string): Observable<T> {
    return this.http.delete<T>(`${this.baseUrl}/${endpoint}`);
  }
}