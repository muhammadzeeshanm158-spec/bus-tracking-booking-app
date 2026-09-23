import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Customer } from '../models/customer.model';

// Backend Response Structure
interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data: T;
}

@Injectable({
  providedIn: 'root'
})
export class CustomerService {
  
  // =========================================================================
  // DEPENDENCY INJECTION & CONFIGURATION
  // HttpClient service ko inject karna aur backend API ka base URL set karna
  // =========================================================================
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5000/api/v1/customers'; // Fixed API path v1 added

  // =========================================================================
  // GET ALL CUSTOMERS METHOD: getCustomers
  // Server se saare registered customers ki list fetch karne ke liye
  // =========================================================================
  getCustomers(): Observable<Customer[]> {
    return this.http.get<ApiResponse<Customer[]>>(this.apiUrl).pipe(
      map(response => response.data)
    );
  }

  // =========================================================================
  // GET CUSTOMER BY ID METHOD: getCustomerById
  // Specific Customer ID ke zariye customer ki poori profile aur bookings nikalne ke liye
  // =========================================================================
  getCustomerById(id: string | number): Observable<Customer> {
    return this.http.get<ApiResponse<Customer>>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  // =========================================================================
  // CREATE CUSTOMER METHOD: createCustomer
  // Naya customer record database mein add karne ke liye POST request bhejna
  // =========================================================================
  createCustomer(customerData: Partial<Customer>): Observable<Customer> {
    return this.http.post<ApiResponse<Customer>>(this.apiUrl, customerData).pipe(
      map(response => response.data)
    );
  }

  // =========================================================================
  // UPDATE CUSTOMER METHOD: updateCustomer
  // Existing customer ki details ko ID ke zariye update karne ke liye PUT request
  // =========================================================================
  updateCustomer(id: string | number, customerData: Partial<Customer>): Observable<Customer> {
    return this.http.put<ApiResponse<Customer>>(`${this.apiUrl}/${id}`, customerData).pipe(
      map(response => response.data)
    );
  }

  // =========================================================================
  // DELETE CUSTOMER METHOD: deleteCustomer
  // Specific customer ko database se delete karne ke liye DELETE request
  // =========================================================================
  deleteCustomer(id: string | number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}