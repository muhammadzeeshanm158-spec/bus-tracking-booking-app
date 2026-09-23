import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { Router } from '@angular/router';
import { NavbarComponent } from '../../navbar/navbar.component';
import { SidebarComponent } from '../../sidebar/sidebar.component';
import { FooterComponent } from '../../footer/footer.component';
import { RouterOutlet } from '@angular/router';
import { SidebarService } from '../../../../core/sidebarService/sidebar.service';
import { SocketService } from '../../../../core/services/socket.service';
import { Subscription } from 'rxjs';

/**
 * Strict Interfaces for Socket Event Payloads (No 'any' or 'unknown')
 */
interface CurrentUserPayload {
  role?: string;
  id?: number | string;
}

interface ForceLogoutPayload {
  message: string;
}

interface ScheduleEventPayload {
  message: string;
  action?: string;
  scheduleId?: number | string;
}

interface SeatBookedPayload {
  message?: string;
  scheduleId?: number | string;
  bookingId?: number | string;
  seatNumbers?: string[];
}

interface ProfileSyncedPayload {
  success: boolean;
  message: string;
}

@Component({
  selector: 'app-dashboard-layout',
  imports: [NavbarComponent, SidebarComponent, FooterComponent, RouterOutlet],
  templateUrl: './dashboard-layout.component.html',
  styleUrl: './dashboard-layout.component.css'
})
export class DashboardLayoutComponent implements OnInit, OnDestroy {
  
  sidebarService = inject(SidebarService);
  private socketService = inject(SocketService);
  private router = inject(Router);
  private subs: Subscription[] = [];

  ngOnInit(): void {
    // 1. LocalStorage se user data ko strictly cast karna
    const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}') as CurrentUserPayload;
    const userRole = currentUser.role ? `${currentUser.role.toLowerCase()}-room` : 'customers-room';
    const userId = currentUser.id;

    // 2. Rooms join karwana
    this.socketService.joinRoom(userRole);
    if (userId !== undefined) {
      this.socketService.joinRoom(`user_${userId}`);
    }

    // 3. Live Socket Listeners with Strict Types

    // A. Force Logout Event
    this.subs.push(
      this.socketService.onEvent<ForceLogoutPayload>('force_logout').subscribe((data) => {
        alert(data.message);
        localStorage.clear();
        this.router.navigate(['/auth/login']);
      })
    );

    // B. Schedule Live Updates
    this.subs.push(
      this.socketService.onEvent<ScheduleEventPayload>('schedule_updated').subscribe((data) => {
        console.log('📅 Schedule Live Update:', data.message);
      })
    );

    // C. Seat / Booking Live Sync
    this.subs.push(
      this.socketService.onEvent<SeatBookedPayload>('seat_booked').subscribe((data) => {
        console.log('🎫 Seat Booking Live Sync:', data.message);
      })
    );

    // D. Profile Synced
    this.subs.push(
      this.socketService.onEvent<ProfileSyncedPayload>('profile_synced').subscribe((data) => {
        console.log('👤 Profile Synced:', data.message);
      })
    );
  }

  ngOnDestroy(): void {
    this.subs.forEach(sub => sub.unsubscribe());
    this.socketService.disconnect();
  }
}