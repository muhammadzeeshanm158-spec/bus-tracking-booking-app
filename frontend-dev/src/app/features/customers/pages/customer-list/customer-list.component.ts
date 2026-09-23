import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Customer } from '../../models/customer.model';
import { CustomerService } from '../../services/customer.service.ts';

@Component({
  selector: 'app-customer-list',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './customer-list.component.html',
  styleUrls: ['./customer-list.component.css']
})
export class CustomerListComponent implements OnInit {
  
  private customerService = inject(CustomerService);

  searchTerm = '';
  selectedStatus = 'All';

  totalCustomersCount = 0;
  activeCustomersCount = 0;
  inactiveCustomersCount = 0;

  customers: Customer[] = [];
  filteredCustomers: Customer[] = [];
  isLoading = true;
  errorMessage = '';

  ngOnInit(): void {
    this.loadCustomers();
  }

  // =========================================================================
  // FETCH CUSTOMERS
  // =========================================================================
  loadCustomers(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.customerService.getCustomers().subscribe({
      next: (data) => {
        this.customers = data || [];
        this.applyFilters();
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load customers:', err);
        this.errorMessage = 'Failed to load customers from server. Please refresh or try again later.';
        this.isLoading = false;
      }
    });
  }

  // =========================================================================
  // LIVE SEARCH & FILTERING (Patched against non-string field crashes)
  // =========================================================================
  applyFilters(): void {
    const term = this.searchTerm.trim().toLowerCase();

    this.filteredCustomers = this.customers.filter((customer) => {
      const customerId = String(customer.id || '').toLowerCase();
      const name = (customer.name || '').toLowerCase();
      const email = (customer.email || '').toLowerCase();
      const phone = (customer.phone || customer.phone_number || '');
      const cnic = (customer.cnic || '');

      const matchesSearch =
        !term ||
        name.includes(term) ||
        email.includes(term) ||
        phone.includes(term) ||
        cnic.includes(term) ||
        customerId.includes(term);

      // Status check handling (Active / Inactive / Boolean is_active fallback)
      const isCustomerActive = 
        customer.status?.toLowerCase() === 'active' || 
        customer.is_active === true;

      const matchesStatus =
        this.selectedStatus === 'All' ||
        (this.selectedStatus === 'Active' && isCustomerActive) ||
        (this.selectedStatus === 'Inactive' && !isCustomerActive);

      return matchesSearch && matchesStatus;
    });

    this.updateStats();
  }

  // =========================================================================
  // STATS COUNTERS
  // =========================================================================
  private updateStats(): void {
    this.totalCustomersCount = this.customers.length;
    this.activeCustomersCount = this.customers.filter(
      (c) => c.status?.toLowerCase() === 'active' || c.is_active === true
    ).length;
    
    this.inactiveCustomersCount = this.totalCustomersCount - this.activeCustomersCount;
  }

  // =========================================================================
  // DELETE CUSTOMER
  // =========================================================================
  deleteCustomer(id: string | number): void {
    const confirmDelete = confirm(`Are you sure you want to delete customer ID: ${id}?`);
    if (confirmDelete) {
      this.customerService.deleteCustomer(id).subscribe({
        next: () => {
          this.customers = this.customers.filter((c) => String(c.id) !== String(id));
          this.applyFilters();
        },
        error: (err) => {
          console.error('Failed to delete customer:', err);
          alert('Failed to delete customer from server.');
        }
      });
    }
  }

  // =========================================================================
  // AVATAR INITIALS HELPER
  // =========================================================================
  getInitial(name: string): string {
    if (!name) return 'C';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}