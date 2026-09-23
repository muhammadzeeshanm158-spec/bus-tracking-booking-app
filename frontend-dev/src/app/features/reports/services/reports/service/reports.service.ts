/**
 * @file reports.service.ts
 * @description Service for handling Reports API communications
 */

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { ReportsApiResponse } from '../../../models/reports.model'; // Report data models import kiye hain

@Injectable({
  providedIn: 'root' // Yeh service puri application mein globally available (singleton) hogi
})
export class ReportsService {
  
  // Dependency Injection: API requests bhejne ke liye Angular ka HttpClient
  private http = inject(HttpClient);
  
  // Backend API Endpoint URL (Reports summary fetch karne ka route)
  private apiUrl = 'http://localhost:5000/api/v1/reports/summary'; // Apna backend URL zaroorat ke mutabiq check kar lein

  /**
   * GET REPORT SUMMARY: Backend server se reports summary ka data fetch karne ke liye function
   * @returns Observable<ReportsApiResponse>
   */
  getReportSummary(): Observable<ReportsApiResponse> {
    return this.http.get<ReportsApiResponse>(this.apiUrl);
  }
}