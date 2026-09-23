import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { SidebarService } from '../../../core/sidebarService/sidebar.service';
import { AuthService } from '../../../core/authService/auth.service';

// Navigation link ke structure ko type-safe banane ke liye Interface
interface NavItem {
  label: string;
  route: string;
  icon: string;
  exact?: boolean; // Exact route matching ke liye optional flag
}

// Sidebar ke bottom par actions (jaise Logout) ke liye Interface
interface ActionItem {
  label: string;
  icon: string;
  action: string;
  cssClass: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.css'
})
export class SidebarComponent {
  // Dependency Injection: Routing, Sidebar state management aur Authentication services ke liye
  private router = inject(Router);
  private sidebarService = inject(SidebarService);
  private authService = inject(AuthService);

  /**
   * SIDEBAR OPEN/CLOSE STATE GETTER
   * Sidebar ki open/close state ko service ke signal se yahan link kar rahe hain
   */
  get isSidebarOpen(): boolean {
    return this.sidebarService.isOpen(); 
  }

  // 1. NAVIGATION ITEMS LIST (Dashboard aur tamam modules ke links, routes aur Material icons)
  navItems: NavItem[] = [
    {label: 'Admin Panel', route: '/admin-panel', icon: 'admin_panel_settings' },
    { label: 'Dashboard', route: '/dashboard', icon: 'dashboard', exact: true },
    { label: 'Bus Management', route: '/bus', icon: 'directions_bus' },
    { label: 'Route Management', route: '/routes', icon: 'route' },
    { label: 'Driver Management', route: '/drivers', icon: 'badge' },
    { label: 'Schedule Management', route: '/schedules', icon: 'schedule' },
    { label: 'Booking Management', route: '/bookings', icon: 'confirmation_number' },
    { label: 'Payments', route: '/payments/checkout', icon: 'payments' },
    { label: 'Customer Management', route: '/customers', icon: 'groups' },
    { label: 'Live Tracking', route: '/tracking', icon: 'location_on' },
    { label: 'Reports & Analytics', route: '/reports', icon: 'analytics' },
    { label: 'Settings', route: '/settings', icon: 'settings' }
  ];

  /**
   * FILTERED NAV ITEMS (Role-Based Access Control)
   * User ke role (Admin, Driver, Customer) ke mutabiq sidebar links filter karne ke liye
   */
  get filteredNavItems(): NavItem[] {
    const currentUser = this.authService.currentUser();
    const role = currentUser?.role || 'customer'; // Default role customer set karna agar undefined ho

    return this.navItems.filter(item => {
      // Admin sab kuch dekh sakta hai (Full Access)
      if (role === 'admin') return true;

      // Driver ke liye allowed modules ki list
      if (role === 'driver') {
        return ['Dashboard', 'Schedule Management', 'Live Tracking'].includes(item.label);
      }

      // Customer ke liye allowed modules ki list
      if (role === 'customer') {
        return ['Dashboard', 'Booking Management', 'Payments'].includes(item.label);
      }

      return false;
    });
  }

  // 2. BOTTOM ACTION BUTTONS (Jaise Logout button aur uski styling)
  bottomActions: ActionItem[] = [
    {
      label: 'Logout',
      icon: 'logout',
      action: 'logout',
      cssClass: 'text-rose-400 hover:bg-rose-500/10 hover:text-rose-300'
    }
  ];

  /**
   * HANDLE ACTION
   * Bottom actions ko trigger karne ke liye generic router/handler method
   * @param actionName - Action ki string identifier (jaise 'logout')
   */
  handleAction(actionName: string): void {
    if (actionName === 'logout') {
      this.logout();
    }
  }

  /**
   * LOGOUT FUNCTION
   * AuthService ke zariye user session terminate karna aur login page par redirect karna
   */
  logout(): void {
    this.authService.logout(); 
  }
}