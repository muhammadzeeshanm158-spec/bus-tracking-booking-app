/**
 * @file auth.service.ts
 * @description User Authentication Service (Login, Register, Session Storage, aur Signals management ke liye)
 */

import { Injectable, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { ApiService } from '../apiService/api.service';
import { Observable, tap } from 'rxjs';
import { User, AuthResponse, LoginRequest, RegisterRequest } from '../../features/auth/models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  // Signals state management: Current logged-in user aur authentication status track karne ke liye
  currentUser = signal<User | null>(this.getUserFromStorage());
  isAuthenticated = signal<boolean>(!!this.getToken());

  // Modern inject function ka istemaal karke ApiService aur Router instance la rahe hain
  private apiService = inject(ApiService);
  private router = inject(Router);

  /**
   * @method login
   * @description User credentials bhej kar login karta hai aur successful response par session set karta hai
   */
  login(credentials: LoginRequest): Observable<{ success: boolean; message: string; data: AuthResponse }> {
    return this.apiService.post<{ success: boolean; message: string; data: AuthResponse }>('auth/login', credentials).pipe(
      tap((response) => {
        // Backend response ke structure ke mutabiq data extract kar rahe hain safely
        const authData = response.data; 

        if (authData && authData.token && authData.user) {
          this.setSession({
            token: authData.token,
            user: authData.user
          });
        }
      })
    );
  }

  /**
   * @method register
   * @description Naya user account create karne ke liye request bhejta hai
   */
  register(userData: RegisterRequest): Observable<AuthResponse> {
    return this.apiService.post<AuthResponse>('auth/register', userData);
  }

  /**
   * @method setSession
   * @description Token aur user details ko localStorage mein save karta hai aur signals update karta hai
   */
  private setSession(authResult: { token: string; user: User }): void {
    localStorage.setItem('token', authResult.token);
    localStorage.setItem('user', JSON.stringify(authResult.user));
    
    // Signals ki values update kar rahe hain taaki poori app mein state sync rahe
    this.currentUser.set(authResult.user);
    this.isAuthenticated.set(true);
  }

  /**
   * @method logout
   * @description User session khatam karta hai (localStorage clear, signals reset, aur login page par redirect)
   */
  logout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Signals ko reset kar rahe hain
    this.currentUser.set(null);
    this.isAuthenticated.set(false);
    
    // User ko wapas login page par bhej rahe hain aur history replace kar rahe hain
    this.router.navigate(['/auth/login'], { replaceUrl: true });
  }   

  /**
   * @method getToken
   * @description LocalStorage se JWT token nikal kar return karta hai
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * @method getUserFromStorage
   * @description LocalStorage se saved user data parse karke nikalta hai (initial state ke liye)
   */
  private getUserFromStorage(): User | null {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  }
}