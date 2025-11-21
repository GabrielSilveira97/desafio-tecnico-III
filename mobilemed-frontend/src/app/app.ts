import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { NotificationDisplayComponent } from './core/components/notification-display/notification-display.component';
import { LoadingSpinnerComponent } from './core/components/loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-root',
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    MatIconModule,
    NotificationDisplayComponent,
    LoadingSpinnerComponent
  ],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {

   isSidebarOpen = false;

   constructor() {}
    
}
