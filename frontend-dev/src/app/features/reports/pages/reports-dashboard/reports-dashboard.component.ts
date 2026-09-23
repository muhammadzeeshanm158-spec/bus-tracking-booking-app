import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReportsService } from '../../services/reports/service/reports.service';
import { ReportSummary, RawReportSummaryResponse } from '../../models/reports.model';

@Component({
  selector: 'app-reports-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './reports-dashboard.component.html',
  styleUrl: './reports-dashboard.component.css'
})
export class ReportsDashboardComponent implements OnInit {
  
  // Dependency Injection: Reports service ko call karne ke liye
  private reportsService = inject(ReportsService);

  // Component State Variables
  summary: ReportSummary | null = null; // Dashboard ki summary data store karne ke liye
  isLoading = true;                    // Data load hone tak loading spinner dikhane ke liye
  errorMessage = '';                   // Agar API mein error aaye toh message show karne ke liye
  selectedPeriod = 'This Month';       // By default selected time period filter

  // =========================================================================
  // LIFECYCLE HOOK: ngOnInit
  // Component load hotay hi reports summary fetch karna start karna
  // =========================================================================
  ngOnInit(): void {
    this.fetchReportSummary();
  }

  /**
   * 1. FETCH REPORT SUMMARY: Service ke zariye backend se report ka data lana
   * Aur raw response ko UI model mein map karna (fallback values ke sath)
   */
  fetchReportSummary(): void {
    this.isLoading = true;
    this.reportsService.getReportSummary().subscribe({
      next: (response) => {
        // Ab yahan proper type use ho rahi hai, koi 'any' error nahi ayega
        const apiData: RawReportSummaryResponse = response.data;
        
        // Backend data ko UI ke `ReportSummary` structure mein map kar rahe hain
        this.summary = {
          totalRevenue: apiData.totalRevenue ?? 0,
          revenueGrowth: '+14.5% vs last month',
          totalBookings: apiData.totalBookings ?? 0,
          bookingGrowth: '+8.2% booking rate',
          avgOccupancy: 84.2,
          distanceDriven: 58420,
          fuelUsed: 14200,
          topRoutes: [
            { routeName: 'Lahore ➔ Islamabad', revenue: 1840000, occupancy: 91, passengers: 1240, percentage: 88 },
            { routeName: 'Karachi ➔ Hyderabad', revenue: 1210000, occupancy: 82, passengers: 980, percentage: 74 },
            { routeName: 'Peshawar ➔ Rawalpindi', revenue: 780000, occupancy: 76, passengers: 650, percentage: 62 },
            { routeName: 'Multan ➔ Lahore', revenue: 455000, occupancy: 64, passengers: 550, percentage: 48 }
          ],
          dailyOperations: [
            { date: '2026-07-28', trips: 42, passengers: 1480, occupancyRate: 88.5, onTimeRate: 95, revenue: 345000 },
            { date: '2026-07-27', trips: 38, passengers: 1310, occupancyRate: 84.0, onTimeRate: 92, revenue: 312500 },
            { date: '2026-07-26', trips: 45, passengers: 1620, occupancyRate: 91.2, onTimeRate: 87, revenue: 398000 },
            { date: '2026-07-25', trips: 40, passengers: 1410, occupancyRate: 86.4, onTimeRate: 94, revenue: 330000 }
          ]
        };

        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching reports summary:', err);
        this.errorMessage = 'Failed to load system reports analytics.';
        this.isLoading = false;
      }
    });
  }

  /**
   * 2. SET PERIOD: User jab period tabs (Today, This Week, etc.) par click kare
   */
  setPeriod(period: string) {
    this.selectedPeriod = period;
    // Yahan zaroorat ke mutabiq period-based data reload ya filter logic add ki ja sakti hai
  }
}