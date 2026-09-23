/**
 * @file admin.service.ts
 * @description Strictly Typed Service for Admin Panel Communications
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Admin } from '../models/admin.model'; // Corrected from Admin to User

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  // admin.service.ts ke andar
private apiUrl = 'http://localhost:5000/api/v1/users'; // <-- yahan /v1/ add kar dein

  private http = inject(HttpClient);

  // Helper method to get authorization headers
  private getHeaders() {
    const token = localStorage.getItem('token') || '';
    return {
      headers: new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      })
    };
  }

  // Saare users ki list fetch karne ke liye
  getAllUsers(): Observable<{ success: boolean; data: Admin[] }> {
    return this.http.get<{ success: boolean; data: Admin[] }>(this.apiUrl, this.getHeaders());
  }

  // User ki details ya role update karne ke liye
  updateUser(userId: number | string, userData: Partial<Admin>): Observable<{ success: boolean; data: Admin }> {
    return this.http.put<{ success: boolean; data: Admin }>(`${this.apiUrl}/${userId}`, userData, this.getHeaders());
  }

  // User delete karne ke liye
  deleteUser(userId: number | string): Observable<{ success: boolean; message: string }> {
    return this.http.delete<{ success: boolean; message: string }>(`${this.apiUrl}/${userId}`, this.getHeaders());
  }
}