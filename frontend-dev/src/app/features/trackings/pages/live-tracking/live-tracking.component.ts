import { Component, OnInit, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TrackingService } from '../../services/tracking.service';
import { TrackingInfo } from '../../models/tracking.model';
import { HttpErrorResponse } from '@angular/common/http';
import * as L from 'leaflet'; // Leaflet map library import ki gayi hai

@Component({
  selector: 'app-live-tracking',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './live-tracking.component.html',
  styleUrl: './live-tracking.component.css'
})
export class LiveTrackingComponent implements OnInit, AfterViewInit {
  // TrackingService ko modern 'inject' function ke zariye load kiya gaya hai
  private trackingService = inject(TrackingService);

  // Component State Variables
  trackingList: TrackingInfo[] = []; // Tamam active buses ki live telemetry list
  isLoading = true;                  // Data load honay tak spinner dikhane ke liye flag
  errorMessage = '';                 // Server error handle karne ke liye message variable

  // Map variables (Strictly typed - No any/unknown types used)
  private map!: L.Map;
  lat = 24.8607; // Default Latitude (Karachi coordinates)
  lng = 67.0011; // Default Longitude

  /**
   * LIFECYCLE HOOK: ngOnInit
   * Component initialize hotay hi live tracking data fetch karne ka function call hota hai
   */
  ngOnInit(): void {
    this.fetchLiveTrackings();
  }

  /**
   * LIFECYCLE HOOK: ngAfterViewInit
   * DOM/View mukammal render hone ke baad Interactive Map ko load karne ke liye
   */
  ngAfterViewInit(): void {
    this.initMap();
  }

  /**
   * FETCH LIVE TRACKINGS
   * Backend API se tamam active buses ki telemetry list mangwanay ka function
   */
  fetchLiveTrackings(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.trackingService.getAllLiveTrackings().subscribe({
      next: (data: TrackingInfo[]) => {
        this.trackingList = data; // Data milne par array mein save karna
        this.isLoading = false;   // Loader ko band karna
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching live tracking data:', err);
        this.errorMessage = 'Failed to load live tracking data. Please try again.';
        this.isLoading = false;   // Error aane par bhi loader band karna
      }
    });
  }

  /**
   * INIT MAP METHOD
   * Leaflet map ko initialize karta hai aur marker drop karta hai
   */
  private initMap(): void {
    // Map container ki ID 'map' ke sath view set karna
    this.map = L.map('map').setView([this.lat, this.lng], 13);

    // OpenStreetMap free tiles layer add karna
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    // Custom Bus Marker Icon setup
    const busIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    });

    // Map par marker place karna aur popup bind karna
    L.marker([this.lat, this.lng], { icon: busIcon })
      .addTo(this.map)
      .bindPopup('<b>Bus Live Location</b><br>Speed: 40 km/h')
      .openPopup();
  }

  // ==========================================
  // STATS GETTERS (Top Summary Cards ke liye)
  // ==========================================

  /** On Time buses ki total ginti return karta hai */
  get onTimeBusesCount(): number {
    return this.trackingList.filter(t => t.status === 'On Time').length;
  }

  /** Delayed (late) buses ki total ginti return karta hai */
  get delayedBusesCount(): number {
    return this.trackingList.filter(t => t.status === 'Delayed').length;
  }

  /** Stopped ya Reached buses ki total ginti return karta hai */
  get stoppedReachedBusesCount(): number {
    return this.trackingList.filter(t => t.status === 'Stopped' || t.status === 'Reached').length;
  }
}