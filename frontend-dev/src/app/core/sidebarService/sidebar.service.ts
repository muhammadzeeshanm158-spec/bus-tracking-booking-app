/**
 * @file sidebar.service.ts
 * @description Sidebar ka state (open/close) manage karne ke liye Service jo Angular Signals ka istemaal karti hai.
 */

import { Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SidebarService {
  // Private signal jo sidebar ki initial state (by default open/true) ko store karta hai
  private isOpenSignal = signal<boolean>(true);
  
  // Readonly version jo components mein state ko read karne ke liye expose kiya jata hai (direct mutation rokne ke liye)
  isOpen = this.isOpenSignal.asReadonly();

  /**
   * @method toggle
   * @description Sidebar ki state ko flip/toggle karta hai (true ko false aur false ko true banata hai)
   */
  toggle() {
    this.isOpenSignal.update(value => !value);
  }
}