import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { RouterLink, ActivatedRoute } from '@angular/router';

import { Customer } from '../../models/customer.model';
import { CustomerService } from '../../services/customer.service.ts';

@Component({
  selector: 'app-view-customer',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './view-customer.component.html',
  styleUrls: ['./view-customer.component.css']
})
export class ViewCustomerComponent implements OnInit {
  
  // =========================================================================
  // COMPONENT STATE PROPERTIES
  // =========================================================================
  customer: Customer | null = null;
  isLoading = true;
  errorMessage = '';
  customerId: string | null = null;

  // =========================================================================
  // DEPENDENCY INJECTION
  // =========================================================================
  private route = inject(ActivatedRoute);
  private customerService = inject(CustomerService);

  // =========================================================================
  // LIFECYCLE HOOK: ngOnInit
  // =========================================================================
  ngOnInit(): void {
    this.customerId = this.route.snapshot.paramMap.get('id');
    if (this.customerId) {
      this.fetchCustomer(this.customerId);
    } else {
      this.isLoading = false;
      this.errorMessage = 'Invalid customer ID provided.';
    }
  }

  // =========================================================================
  // FETCH CUSTOMER METHOD
  // =========================================================================
  fetchCustomer(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.customerService.getCustomerById(id).subscribe({
      next: (data: Customer) => {
        this.customer = data || null;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to fetch customer profile:', err);
        this.errorMessage = 'Failed to load customer details from server. Please try again.';
        this.isLoading = false;
      }
    });
  }

  // =========================================================================
  // HELPER METHOD: getInitial
  // =========================================================================
  getInitial(name?: string): string {
    if (!name) return 'C';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}