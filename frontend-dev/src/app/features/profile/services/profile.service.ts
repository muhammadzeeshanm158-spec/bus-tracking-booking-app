import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { UserProfile } from '../models/profile.model';

@Injectable({
  providedIn: 'root' // Yeh service poori application mein globally available hogi (Root injector)
})
export class ProfileService {
  // Dependency Injection: Angular ka modern inject function use kar ke HttpClient service hasil karna
  private http = inject(HttpClient);
  
  // Backend server ka base API endpoint jahan se user profile ki requests process hongi
  private apiUrl = 'http://localhost:5000/api/v1/profile'; 

  /**
   * 1. GET USER PROFILE
   * Backend server se logged-in user ki profile ki details (naam, email, phone, etc.) fetch karna
   */
  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.apiUrl);
  }

  /**
   * 2. UPDATE USER PROFILE
   * User ki modified profile details (Partial object) backend par bhej kar database mein update karna
   */
  updateProfile(profileData: Partial<UserProfile>): Observable<UserProfile> {
    return this.http.put<UserProfile>(this.apiUrl, profileData);
  }
}