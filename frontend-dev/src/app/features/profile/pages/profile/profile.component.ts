import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router'; // Navigation aur Logout ke liye Router import kiya
import { ProfileService } from '../../services/profile.service';
import { UserProfile } from '../../models/profile.model';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {
  // Dependency Injection: Form Builder, Profile Service, aur Router
  private fb = inject(FormBuilder);
  private profileService = inject(ProfileService);
  private router = inject(Router);

  // Component States
  profileForm!: FormGroup;
  isEditing = false;     // Edit mode check karne ke liye flag
  isLoading = false;     // API request loading state

  ngOnInit(): void {
    // Component load hotay hi form create karein aur user data fetch karein
    this.initForm();
    this.loadUserProfile();
  }

  /**
   * FORM INITIALIZATION
   * Profile form group ko define karna aur default values set karna.
   */
/**
   * FORM INITIALIZATION
   * Profile form group ko define karna aur default values set karna.
   */
  initForm(data: Partial<UserProfile> = {}): void {
    this.profileForm = this.fb.group({
      // 'name' ki jagah 'full_name' kar diya taake interface se match ho
      full_name: [{ value: data.full_name || '', disabled: true }, [Validators.required, Validators.minLength(3)]],
      email: [{ value: data.email || '', disabled: true }, [Validators.required, Validators.email]],
      // 'phone' ki jagah 'phone_number' kar diya
      phone_number: [{ value: data.phone_number || '', disabled: true }, [Validators.required]],
      gender: [{ value: data.gender || '', disabled: true }, [Validators.required]]
    });
  }

  /**
   * LOAD USER PROFILE
   * Backend API se current logged-in user ki profile details fetch karna.
   */
  loadUserProfile(): void {
    this.profileService.getProfile().subscribe({
      next: (res: UserProfile) => {
        this.initForm(res);
      },
      error: (err) => {
        console.error('Error fetching profile:', err);
      }
    });
  }

  /**
   * TOGGLE EDIT MODE
   * Form ko editable ya read-only (locked) banane ke liye.
   */
  toggleEdit(): void {
    this.isEditing = !this.isEditing;
    if (this.isEditing) {
      this.profileForm.enable();
    } else {
      this.profileForm.disable();
      this.loadUserProfile(); // Cancel karne par purana data restore karna
    }
  }

  /**
   * SUBMIT / UPDATE PROFILE
   * Updated data ko backend par bhej kar save karna.
   */
  onSubmit(): void {
    if (this.profileForm.invalid) {
      this.profileForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const updatedData: Partial<UserProfile> = this.profileForm.getRawValue();

    this.profileService.updateProfile(updatedData).subscribe({
      next: (res) => {
        this.isLoading = false;
        this.isEditing = false;
        this.profileForm.disable(); // Save hone ke baad form dubara lock kar dena
        console.log('Profile updated successfully:', res);
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error updating profile:', err);
      }
    });
  }

  /**
   * NAVIGATE TO PROFILE
   * Explicitly profile page par move karne ke liye method.
   */
  goToProfile(): void {
    this.router.navigate(['/profile']);
  }

  /**
   * LOGOUT HANDLER
   * Local storage clear karke user ko login page par redirect karna.
   */
  onLogout(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
    this.router.navigate(['/auth/login']); // Login page par redirecting
  }
}