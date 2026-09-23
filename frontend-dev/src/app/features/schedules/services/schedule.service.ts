import { Injectable, inject } from '@angular/core';
import { Observable } from 'rxjs';
import { Schedule } from '../models/schedule.model';
import { ApiService } from '../../../core/apiService/api.service'; // Apne project ke path ke mutabiq check kar lein

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  // ApiService ko inject karna HTTP requests bhejne ke liye
  private apiService = inject(ApiService);
  
  // Backend API ka base endpoint schedules ke liye
  private endpoint = 'schedules'; // Backend API endpoint

  /**
   * 1. Saare schedules ki list lene ke liye (GET API)
   * Server se tamam trip schedules fetch karta hai
   */
  getSchedules(): Observable<Schedule[]> {
    return this.apiService.get<Schedule[]>(this.endpoint);
  }

  /**
   * 2. Specific Schedule ID ke zariye single schedule lene ke liye (GET by ID API)
   * Di gayi unique ID ki base par specific schedule ki tafseel lata hai
   */
  getScheduleById(id: string): Observable<Schedule> {
    return this.apiService.get<Schedule>(`${this.endpoint}/${id}`);
  }

  /**
   * 3. Naya schedule add karne ke liye (POST API)
   * Naya trip schedule create karne ke liye data server par bhejta hai (id aur scheduleCode skip karke)
   */
  addSchedule(schedule: Omit<Schedule, 'id' | 'scheduleCode'>): Observable<Schedule> {
    return this.apiService.post<Schedule, Omit<Schedule, 'id' | 'scheduleCode'>>(this.endpoint, schedule);
  }

  /**
   * 4. Existing schedule update karne ke liye (PUT API)
   * Mojooda schedule ki details ko ID ke zariye update ya modify karta hai
   */
  updateSchedule(id: string, updatedData: Partial<Schedule>): Observable<Schedule> {
    return this.apiService.put<Schedule, Partial<Schedule>>(`${this.endpoint}/${id}`, updatedData);
  }

  /**
   * 5. Schedule ko delete karne ke liye (DELETE API)
   * Di gayi ID wale schedule ko database/server se remove karta hai
   */
  deleteSchedule(id: string): Observable<void> {
    return this.apiService.delete<void>(`${this.endpoint}/${id}`);
  }
}