import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Router, RouterLink, NavigationEnd } from '@angular/router';
import { filter } from 'rxjs/operators';
import { BusService } from '../../services/bus.service';
import { Bus } from '../../models/bus.model';

@Component({
  selector: 'app-bus-list',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './bus-list.component.html',
  styleUrl: './bus-list.component.css',
})
export class BusListComponent implements OnInit {
  
  // =========================================================================
  // DEPENDENCY INJECTION
  // =========================================================================
  private busService = inject(BusService);
  private router = inject(Router); // <-- Router inject kiya hai

  // =========================================================================
  // COMPONENT STATE VARIABLES
  // =========================================================================
  buses: Bus[] = [];          // Original list from backend
  filteredBuses: Bus[] = [];  // Filtered list based on search/type
  searchTerm = '';            // Search input value
  selectedType = '';          // Bus type filter value
  isLoading = true;           // Loading indicator state
  errorMessage = '';          // Error message display state

  // =========================================================================
  // LIFECYCLE HOOK: ngOnInit
  // =========================================================================
  ngOnInit(): void {
    this.loadBuses();

    // <-- Yeh add kiya hai: Jab bhi wapas is route par navigate ho, list fresh load ho
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.loadBuses();
    });
  }

  // =========================================================================
  // FETCH BUSES METHOD: loadBuses
  // =========================================================================
  loadBuses(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.busService.getBuses().subscribe({
      next: (data: Bus[]) => {
        this.buses = data || [];
        this.filteredBuses = [...this.buses];
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching buses:', err);
        this.errorMessage = 'Failed to load buses fleet from server.';
        this.isLoading = false;
      },
    });
  }

  // =========================================================================
  // SEARCH & FILTER METHOD: applyFilter
  // =========================================================================
  onSearch(event: Event): void {
    const inputElement = event.target as HTMLInputElement;
    this.searchTerm = inputElement ? inputElement.value.toLowerCase() : '';
    this.filterBuses();
  }

  onTypeFilter(event: Event): void {
    const selectElement = event.target as HTMLSelectElement;
    this.selectedType = selectElement ? selectElement.value : '';
    this.filterBuses();
  }

  private filterBuses(): void {
    this.filteredBuses = this.buses.filter((bus) => {
      const matchesSearch = 
        (bus.bus_number && bus.bus_number.toLowerCase().includes(this.searchTerm)) || 
        (bus.bus_name && bus.bus_name.toLowerCase().includes(this.searchTerm)) ||
        (bus.registration_number && bus.registration_number.toLowerCase().includes(this.searchTerm));
      
      const matchesType = this.selectedType === '' || bus.bus_type === this.selectedType;

      return matchesSearch && matchesType;
    });
  }

  // =========================================================================
  // DELETE METHOD: deleteBus
  // =========================================================================
  deleteBus(id: string | undefined): void {
    if (!id) return;

    if (confirm('Are you sure you want to delete this bus?')) {
      this.busService.deleteBus(id).subscribe({
        next: () => {
          this.buses = this.buses.filter((b) => String(b.id) !== id);
          this.filteredBuses = this.filteredBuses.filter((b) => String(b.id) !== id);
        },
        error: (err: HttpErrorResponse) => {
          console.error('Error deleting bus:', err);
          alert('Failed to delete bus.');
        },
      });
    }
  }
}