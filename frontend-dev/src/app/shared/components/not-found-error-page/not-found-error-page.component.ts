import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-not-found-error-page',
  imports: [CommonModule,RouterModule],
  templateUrl: './not-found-error-page.component.html',
  styleUrl: './not-found-error-page.component.css'
})
export class NotFoundErrorPageComponent {

}
