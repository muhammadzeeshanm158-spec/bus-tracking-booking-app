import { Component, HostListener, inject } from '@angular/core';
import { Router } from '@angular/router';
import { SidebarService } from '../../../core/sidebarService/sidebar.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {
  // Dependency Injection: Sidebar state control karne ke liye SidebarService aur routing ke liye Router
  private sidebarService = inject(SidebarService);
  private router = inject(Router);

  // Component State: User profile dropdown menu open ya close hone ki state track karne ke liye
  isDropdownOpen = false;

  /**
   * SIDEBAR TOGGLE
   * Sidebar ko collapse ya expand karne ke liye SidebarService ka toggle method call karna.
   * Yeh mobile aur desktop dono screens par sidebar drawer ko control karta hai.
   */
  toggleSidebar(): void {
    this.sidebarService.toggle();
  }

  /**
   * DROPDOWN TOGGLE
   * User avatar/profile menu ko open ya close karna.
   * @param event - Click event jo event bubbling ko rokne ke liye use hota hai.
   */
  toggleDropdown(event: Event): void {
    event.stopPropagation(); // Event bubbling rokne ke liye taake document click trigger na ho
    this.isDropdownOpen = !this.isDropdownOpen;
  }

  /**
   * NAVIGATE TO PROFILE PAGE
   * Dropdown close kar ke user ko profile settings page par redirect karna.
   */
  goToProfile(): void {
    this.isDropdownOpen = false;
    this.router.navigate(['/profile']); // Profile route par navigate karna
  }

  /**
   * LOGOUT HANDLER
   * Dropdown close kar ke user session terminate karna, local storage clear karna 
   * aur user ko login screen par redirect karna.
   */
  logout(): void {
    this.isDropdownOpen = false;
    
    // Session / Token clear karna taake user securely logout ho jaye
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    
    console.log('Logged out successfully');
    
    // Auth login route par redirect karna
    this.router.navigate(['/auth/login']);
  }

  /**
   * GLOBAL CLICK LISTENER (@HostListener)
   * Agar user dropdown menu ke baahar kahin bhi screen par click kare, 
   * toh automatically dropdown menu close ho jaye (Better UX).
   */
  @HostListener('document:click')
  onDocumentClick(): void {
    if (this.isDropdownOpen) {
      this.isDropdownOpen = false;
    }
  }
}