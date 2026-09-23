import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DriverService } from '../../services/driver.service';
import { Driver } from '../../models/driver.model';

@Component({
  selector: 'app-view-driver',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './view-driver.component.html',
  styleUrl: './view-driver.component.css'
})
export class ViewDriverComponent implements OnInit {
  
  // Dependency Injection (Route parameter read karne aur DriverService use karne ke liye)
  private route = inject(ActivatedRoute);
  private driverService = inject(DriverService);

  // Component State Variables
  driver: Driver | null = null; // Single driver ka data store karne ke liye
  isLoading = true;              // Data load hote waqt loading spinner dikhane ke liye
  errorMessage = '';             // Agar server se error aaye toh message show karne ke liye

  // =========================================================================
  // LIFECYCLE HOOK: ngOnInit
  // Component load hotay hi route se driver ID nikal kar details fetch karna
  // =========================================================================
  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.loadDriverDetails(idParam);
    } else {
      this.errorMessage = 'Invalid driver ID specified.';
      this.isLoading = false;
    }
  }

  /**
   * 1. LOAD DRIVER DETAILS: Service call ke zariye specific driver ki details server se lana
   */
  loadDriverDetails(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.driverService.getDriverById(id).subscribe({
      next: (data) => {
        this.driver = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load driver details:', err);
        this.errorMessage = 'Failed to load driver details from the server.';
        this.isLoading = false;
      }
    });
  }

  /**
   * 2. GET INITIAL: Driver ke naam ka pehla harf ya initials nikal kar avatar mein dikhane ke liye helper function
   * Example: "Ali Khan" -> "AK"
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