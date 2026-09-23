import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { TrackingService } from '../../services/tracking.service';
import { TrackingInfo } from '../../models/tracking.model';
import { HttpErrorResponse } from '@angular/common/http';
import * as L from 'leaflet';

@Component({
  selector: 'app-bus-detail-tracking',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './bus-detail-tracking.component.html',
  styleUrl: './bus-detail-tracking.component.css'
})
export class BusDetailTrackingComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private trackingService = inject(TrackingService);

  busDetail: TrackingInfo | null = null;
  isLoading = true;
  errorMessage = '';
  
  private map: L.Map | null = null;

  ngOnInit(): void {
    const busId = this.route.snapshot.paramMap.get('id');
    
    if (busId) {
      this.fetchBusDetail(busId);
    } else {
      this.errorMessage = 'Invalid or missing bus ID in route.';
      this.isLoading = false;
    }
  }

  fetchBusDetail(id: string): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.trackingService.getTrackingById(id).subscribe({
      next: (data: TrackingInfo) => {
        this.busDetail = data;
        this.isLoading = false;
        
        setTimeout(() => {
          this.initMap();
        }, 100);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching bus detail:', err);
        this.errorMessage = 'Failed to load specific bus tracking details. Please try again.';
        this.isLoading = false;
      }
    });
  }

  private initMap(): void {
    if (this.map) {
      this.map.remove();
    }

    const currentLocation = this.busDetail?.currentLocation;
    if (!currentLocation) {
      return;
    }

    const lat = currentLocation.lat;
    const lng = currentLocation.lng;

    this.map = L.map('busMap').setView([lat, lng], 13);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; OpenStreetMap contributors'
    }).addTo(this.map);

    const busIcon = L.icon({
      iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
      shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    });

    L.marker([lat, lng], { icon: busIcon })
      .addTo(this.map)
      .bindPopup(`<b>Bus: ${this.busDetail?.busNumber}</b><br>Speed: ${this.busDetail?.speedKmH} km/h`)
      .openPopup();
  }
}