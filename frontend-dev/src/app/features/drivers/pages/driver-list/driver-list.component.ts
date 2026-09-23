import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router, NavigationEnd } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { filter } from 'rxjs/operators';
import { DriverService } from '../../services/driver.service';
import { Driver } from '../../models/driver.model';

@Component({
  selector: 'app-driver-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './driver-list.component.html',
  styleUrl: './driver-list.component.css'
})
export class DriverListComponent implements OnInit {
  
  // Dependency Injection
  private driverService = inject(DriverService);
  private router = inject(Router);

  // Component State Variables
  drivers: Driver[] = [];
  isLoading = true;
  errorMessage = '';

  // Filter & Search Variables
  searchTerm = '';
  selectedStatus = '';

 ngOnInit(): void {
    this.loadDrivers();

    // Har dafa jab bhi navigation khatam ho aur hum /drivers par hon
    this.router.events.pipe(
      filter((event): event is NavigationEnd => event instanceof NavigationEnd)
    ).subscribe((event: NavigationEnd) => {
      // Agar URL exact ya base drivers path par ho (edit ya add se wapas aate waqt)
      if (event.url === '/drivers' || event.url.startsWith('/drivers?')) {
        this.loadDrivers();
      }
    });
  }
  /**
   * 1. LOAD DRIVERS: Backend se saare drivers fetch karna
   */
  loadDrivers(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.driverService.getDrivers().subscribe({
      next: (data) => {
        this.drivers = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load drivers:', err);
        this.errorMessage = 'Failed to load drivers from server.';
        this.isLoading = false;
      }
    });
  }

  /**
   * 2. DELETE DRIVER: Confirmation ke baad driver delete karna
   */
  deleteDriver(id: number | string): void {
    if (confirm('Are you sure you want to delete this driver?')) {
      this.driverService.deleteDriver(id).subscribe({
        next: () => {
          this.drivers = this.drivers.filter(d => d.id !== id);
        },
        error: (err) => {
          console.error('Failed to delete driver:', err);
          alert('Failed to delete driver.');
        }
      });
    }
  }

  /**
   * COMPUTED / FILTERED DRIVERS LIST
   */
  get filteredDrivers(): Driver[] {
    return this.drivers.filter(driver => {
      const matchesSearch = 
        driver.name.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        driver.phone.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        driver.licenseNumber.toLowerCase().includes(this.searchTerm.toLowerCase()) ||
        String(driver.id).toLowerCase().includes(this.searchTerm.toLowerCase());

      const matchesStatus = this.selectedStatus ? driver.status === this.selectedStatus : true;

      return matchesSearch && matchesStatus;
    });
  }

  // STATS GETTERS
  get totalDriversCount(): number {
    return this.drivers.length;
  }

  get availableDriversCount(): number {
    return this.drivers.filter(d => d.status === 'Available').length;
  }

  get onDutyDriversCount(): number {
    return this.drivers.filter(d => d.status === 'On Duty').length;
  }

  /**
   * 3. GET INITIALS: Avatar ke liye initials generate karna
   */
  getInitial(name?: string): string {
    if (!name) return 'D';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
  }
}