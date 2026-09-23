import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AdminService } from '../../services/admin.service';
import { Admin } from '../../models/admin.model';

@Component({
  selector: 'app-admin-panel',
  standalone: true,
  imports: [CommonModule, FormsModule], // RouterLink hata diya kyunki use nahi ho raha tha
  templateUrl: './admin-panel.component.html',
  styleUrl: './admin-panel.component.css'
})
export class AdminPanelComponent implements OnInit {
  
  private adminService = inject(AdminService);

  // ESLint fix: Type inference automatically handles these
  users: Admin[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.loadUsers();
  }
loadUsers(): void {
    this.isLoading = true;
    this.adminService.getAllUsers().subscribe({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      next: (response: any) => {
        console.log('API Response:', response);

        // Backend response structure ke mutabiq safely users array nikalna
        if (Array.isArray(response)) {
          this.users = response;
        } else if (response?.data?.users && Array.isArray(response.data.users)) {
          this.users = response.data.users;
        } else if (response?.data && Array.isArray(response.data)) {
          this.users = response.data;
        } else {
          this.users = [];
        }

        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading users:', error);
        this.errorMessage = 'An error occurred while loading users.';
        this.isLoading = false;
      }
    });
  }

  updateUserRole(user: Admin): void {
    const userId = user.id || user.user_id;
    if (!userId) return;

    this.adminService.updateUser(userId, { role: user.role }).subscribe({
      next: () => { // Unused 'res' parameter hata diya
        this.successMessage = `User role successfully updated to ${user.role}!`;
        setTimeout(() => this.successMessage = '', 3000);
        this.loadUsers();
      },
      error: (err) => {
        console.error('Error updating role:', err);
        alert(err.error?.message || 'Role update karne mein nakami hui.');
      }
    });
  }


deleteUser(user: Admin): void {
    const userId = user.id || user.user_id;
    if (!userId) return;

    if (confirm(`Kya aap waqai "${user.full_name}" ko delete karna chahte hain?`)) {
      this.adminService.deleteUser(userId).subscribe({
        next: () => {
          this.successMessage = 'User successfully delete ho gaya!';
          setTimeout(() => this.successMessage = '', 3000);
          this.loadUsers(); // List ko refresh karne ke liye
        },
        error: (err) => {
          console.error('Error deleting user:', err);
          alert(err.error?.message || 'User delete karne mein nakami hui.');
        }
      });
    }
  }

}