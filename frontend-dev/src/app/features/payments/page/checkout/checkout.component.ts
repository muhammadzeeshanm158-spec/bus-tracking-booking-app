import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { PaymentService } from '../../service/payment.service';
import { Payment } from '../../model/payment.model';

@Component({
  selector: 'app-checkout',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './checkout.component.html',
  styleUrl: './checkout.component.css'
})
export class CheckoutComponent implements OnInit {
  private fb = inject(FormBuilder);
  private paymentService = inject(PaymentService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  isLoading = false;      
  errorMessage = '';      

  checkoutForm: FormGroup = this.fb.group({
    booking_id: ['', [Validators.required]],                             
    payment_amount: [0, [Validators.required, Validators.min(100)]],                 
    payment_method: ['Card', [Validators.required]], 
    
    // Card fields
    card_number: ['', [Validators.required, Validators.pattern('^[0-9]{16}$')]],  
    expiry_date: ['', [Validators.required, Validators.pattern('^(0[1-9]|1[0-2])\\/([0-9]{2})$')]], 
    cvv_code: ['', [Validators.required, Validators.pattern('^[0-9]{3,4}$')]],

    // Mobile account field
    mobile_number: ['']
  });
ngOnInit(): void {
    const navigation = this.router.getCurrentNavigation();
    const state = navigation?.extras?.state || history.state;

    if (state && state['bookingId']) {
      this.checkoutForm.patchValue({
        booking_id: state['bookingId'],
        payment_amount: state['amount'] || 0
      });
    } else if (history.state && history.state['bookingId']) {
      this.checkoutForm.patchValue({
        booking_id: history.state['bookingId'],
        payment_amount: history.state['amount'] || 0
      });
    } else {
      this.route.queryParams.subscribe(params => {
        if (params['bookingId']) {
          this.checkoutForm.patchValue({
            booking_id: params['bookingId'],
            payment_amount: params['amount'] || 0
          });
        } else {
          // Yahan check lagayen: Agar na state ho aur na query param, toh redirect kar dein!
          // Lekin pehle check karein ke localStorage mein last booking thi ya nahi
          const lastBookingId = localStorage.getItem('last_booking_id');
          const lastAmount = localStorage.getItem('last_amount');
          
          if (lastBookingId && this.router.url.includes('direct-test')) {
            // Optional: Agar aap khud testing ke liye khol rahe hain
            this.checkoutForm.patchValue({
              booking_id: lastBookingId,
              payment_amount: Number(lastAmount) || 0
            });
          } else {
            // Asli user ke liye: Agar koi data nahi, toh booking page par wapas bhej do
            alert('No active booking found. Please complete a booking first.');
            this.router.navigate(['/bookings']); // Apna route yahan adjust kar sakte hain
          }
        }
      });
    }
  }

  setPaymentMethod(method: string) {
    this.checkoutForm.get('payment_method')?.setValue(method);
    this.errorMessage = ''; 

    const cardNumberControl = this.checkoutForm.get('card_number');
    const expiryControl = this.checkoutForm.get('expiry_date');
    const cvvControl = this.checkoutForm.get('cvv_code');
    const mobileControl = this.checkoutForm.get('mobile_number');

    if (method === 'Card') {
      cardNumberControl?.setValidators([Validators.required, Validators.pattern('^[0-9]{16}$')]);
      expiryControl?.setValidators([Validators.required, Validators.pattern('^(0[1-9]|1[0-2])\\/([0-9]{2})$')]);
      cvvControl?.setValidators([Validators.required, Validators.pattern('^[0-9]{3,4}$')]);
      mobileControl?.clearValidators();
      mobileControl?.setValue('');
    } else {
      cardNumberControl?.clearValidators();
      expiryControl?.clearValidators();
      cvvControl?.clearValidators();
      
      cardNumberControl?.setValue('');
      expiryControl?.setValue('');
      cvvControl?.setValue('');

      mobileControl?.setValidators([Validators.required, Validators.pattern('^03[0-9]{9}$')]);
    }

    cardNumberControl?.updateValueAndValidity();
    expiryControl?.updateValueAndValidity();
    cvvControl?.updateValueAndValidity();
    mobileControl?.updateValueAndValidity();
  }
   
  onSubmit() {
    if (this.checkoutForm.invalid) {
      this.checkoutForm.markAllAsTouched();
      this.errorMessage = 'Please fix the errors in the form before submitting.';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const paymentPayload = this.checkoutForm.value;

    // Backup ke liye localStorage me save karna taake success page par data miss na ho
    localStorage.setItem('last_booking_id', paymentPayload.booking_id);
    localStorage.setItem('last_amount', paymentPayload.payment_amount);
    localStorage.setItem('last_method', paymentPayload.payment_method);

    this.paymentService.processPayment(paymentPayload).subscribe({
      next: (response: Payment) => {
        this.isLoading = false;
        
        this.router.navigate(['/payments/success'], { 
          state: { paymentData: response } 
        });
      },
      error: (err) => {
        this.isLoading = false;
        this.errorMessage = err.error?.message || 'Payment processing failed. Please try again.';
      }
    });
  }
}