import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-payment-success',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './payment-success.component.html',
  styleUrl: './payment-success.component.css'
})
export class PaymentSuccessComponent implements OnInit {
  private router = inject(Router);

  transactionId = 'TXN-' + Math.floor(100000 + Math.random() * 900000);
  bookingReference = '';
  paymentMethod = '';
  paidAmount = 0;

  ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || history.state;
    const payment = state?.['paymentData'] || state || {};

    // 1. Pehle state / response object se data dhoondein
    this.bookingReference = payment.booking_id || payment.bookingId || payment.booking_reference;
    this.paidAmount = payment.payment_amount || payment.amount || payment.paid_amount;
    this.paymentMethod = payment.payment_method || payment.paymentMethod;
    this.transactionId = payment.transaction_id || payment.id || this.transactionId;

    // 2. Agar state se na mile, toh localStorage se fallback utha lein
    if (!this.bookingReference) {
      this.bookingReference = localStorage.getItem('last_booking_id') || '3';
    }
    if (!this.paidAmount || this.paidAmount === 0) {
      this.paidAmount = Number(localStorage.getItem('last_amount')) || 10000;
    }
    if (!this.paymentMethod) {
      this.paymentMethod = localStorage.getItem('last_method') || 'Card';
    }
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  printReceipt(): void {
    window.print();
  }
}