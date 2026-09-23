import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { BusService } from '../../services/bus.service';
import { Bus } from '../../models/bus.model'; // Aapke folder structure ke mutabiq path
import { HttpErrorResponse } from '@angular/common/http';
import * as L from 'leaflet'; // Leaflet map library import

@Component({
  selector: 'app-view-bus',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './view-bus.component.html',
  styleUrl: './view-bus.component.css'
})
export class ViewBusComponent implements OnInit {
  // Services Injection
  private route = inject(ActivatedRoute);
  private busService = inject(BusService);

  // Component State Variables
  bus: Bus | null = null;
  isLoading = true;
  errorMessage = '';

  // Leaflet Map variables
  private map!: L.Map;
  busId!: string;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.busId = idParam;
      this.fetchBusDetail(this.busId);
    } else {
      this.errorMessage = 'Invalid Bus ID found in route.';
      this.isLoading = false;
    }
  }

  /**
   * Real BusService se single bus ki details fetch karna
   */
  fetchBusDetail(id: string): void {
    this.isLoading = true;
    
    this.busService.getBusById(id).subscribe({
      next: (data: Bus) => {
        this.bus = data;
        this.isLoading = false;
        
        // Data milne aur DOM render hone ke baad map initialize karna
        setTimeout(() => {
          const busWithCoords = this.bus as Bus & { latitude?: number; longitude?: number };
          const lat = Number(busWithCoords?.latitude || 24.8607);
          const lng = Number(busWithCoords?.longitude || 67.0011);
          this.initMap(lat, lng);
        }, 200);
      },
      error: (err: HttpErrorResponse) => {
        console.error('Error fetching bus detail:', err);
        this.errorMessage = 'Failed to load bus details from server.';
        this.isLoading = false;
      }
    });
  }

  /**
   * Leaflet Map Setup for Single Bus
   */
  private initMap(lat: number, lng: number): void {
    const mapElement = document.getElementById('map');
    if (!mapElement) return;

    // Agar map pehle se bana ho toh remove kar dein
    if (this.map) {
      this.map.remove();
    }

    this.map = L.map('map').setView([lat, lng], 14);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '© OpenStreetMap contributors'
    }).addTo(this.map);

    const busIcon = L.icon({
      iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
      iconSize: [25, 41],
      iconAnchor: [12, 41]
    });

    const busNameText = this.bus?.bus_name || 'Bus View';
    const regNumberText = this.bus?.registration_number || '';

    L.marker([lat, lng], { icon: busIcon })
      .addTo(this.map)
      .bindPopup(`<b>${busNameText}</b><br>Reg: ${regNumberText}`)
      .openPopup();

    // Zaroori step: Map container ka size recalculate karne ke liye
    setTimeout(() => {
      if (this.map) {
        this.map.invalidateSize();
      }
    }, 100);
  }
}