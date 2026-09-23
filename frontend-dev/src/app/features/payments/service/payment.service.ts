import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Payment } from '../model/payment.model';

@Injectable({
  providedIn: 'root' // Yeh service poori application mein globally available hogi (Root injector)
})
export class PaymentService {
  // Dependency Injection: Angular ka modern inject function use kar ke HttpClient service hasil karna
  private http = inject(HttpClient);
  
  // Backend server ka base API endpoint jahan se payment requests process hongi
  private apiUrl = 'http://localhost:5000/api/v1/payments'; 

  /**
   * 1. PROCESS PAYMENT
   * Nayi payment details (amount, method, booking ID waghera) backend server par bhej kar transaction execute karna
   */
  processPayment(paymentData: Payment): Observable<Payment> {
    return this.http.post<Payment>(this.apiUrl, paymentData);
  }

  /**
   * 2. GET PAYMENT BY ID
   * Diye gaye payment ID ki bunyad par server se specific transaction ki poori details fetch karna
   */
  getPaymentById(id: string): Observable<Payment> {
    return this.http.get<Payment>(`${this.apiUrl}/${id}`);
  }
}