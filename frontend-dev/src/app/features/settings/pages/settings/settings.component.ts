/**
 * @file settings.component.ts
 * @description System Settings Component jo company profile aur transport fleet operational rules ko manage aur update karta hai.
 */

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SettingService } from '../../services/setting.service';
import { Setting } from '../../models/setting.model';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.component.html',
  styleUrl: './settings.component.css'
})
export class SettingsComponent implements OnInit {
  // Service Injection
  private settingService = inject(SettingService);

  // Settings Data Model
  settingsData: Setting = {
    company_name: '',
    support_email: '',
    contact_phone: '',
    currency: 'PKR',
    tax_percentage: 0,
    allow_online_booking: true,
    cancellation_hours_limit: 24,
    address: ''
  };

  // Component UI States
  isLoading = true;
  isSaving = false;
  successMessage = '';
  errorMessage = '';

  /**
   * @method ngOnInit
   * @description Component mount hote hi settings fetch karta hai
   */
  ngOnInit(): void {
    this.fetchSettings();
  }

  /**
   * @method fetchSettings
   * @description Backend se current system configurations load karta hai
   */
  fetchSettings(): void {
    this.isLoading = true;
    this.errorMessage = '';
    
    this.settingService.getSettings().subscribe({
      next: (data: Setting) => {
        this.settingsData = data;
        this.isLoading = false;
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching settings:', err);
        this.errorMessage = 'Failed to load system settings.';
        this.isLoading = false;
      }
    });
  }

  /**
   * @method onSaveSettings
   * @description Updated settings ko server par save/update karta hai
   */
  onSaveSettings(): void {
    this.isSaving = true;
    this.successMessage = '';
    this.errorMessage = '';

    this.settingService.updateSettings(this.settingsData).subscribe({
      next: (res) => {
        this.successMessage = res?.message || 'Settings updated successfully!';
        this.isSaving = false;
        
        // 4 seconds baad success message automatically hide ho jaye ga
        setTimeout(() => {
          this.successMessage = '';
        }, 4000);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error updating settings:', err);
        this.errorMessage = err.error?.message || 'Failed to update settings. Please try again.';
        this.isSaving = false;
      }
    });
  }
}