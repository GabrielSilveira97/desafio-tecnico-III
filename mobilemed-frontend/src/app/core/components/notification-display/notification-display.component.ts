import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { NotificationService, NotificationMessage } from '../../services/notification/notification.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'app-notification-display',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="fixed top-4 right-4 z-50 space-y-2">
      <div
        *ngFor="let notification of notifications"
        [ngClass]="{
          'bg-green-500': notification.type === 'success',
          'bg-red-500': notification.type === 'error',
          'bg-blue-500': notification.type === 'info',
          'bg-yellow-500': notification.type === 'warning'
        }"
        class="text-white px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slideIn"
      >
        <span *ngIf="notification.type === 'success'" class="text-xl">✓</span>
        <span *ngIf="notification.type === 'error'" class="text-xl">✕</span>
        <span *ngIf="notification.type === 'info'" class="text-xl">ℹ</span>
        <span *ngIf="notification.type === 'warning'" class="text-xl">⚠</span>
        <span>{{ notification.message }}</span>
      </div>
    </div>
  `,
  styles: [`
    :host ::ng-deep .animate-slideIn {
      animation: slideIn 0.3s ease-in;
    }
    @keyframes slideIn {
      from {
        transform: translateX(400px);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
  `],
})
export class NotificationDisplayComponent implements OnInit, OnDestroy {
  private notificationService = inject(NotificationService);
  private destroy$ = new Subject<void>();

  notifications: NotificationMessage[] = [];

  ngOnInit() {
    this.notificationService.notification$
      .pipe(takeUntil(this.destroy$))
      .subscribe((notification) => {
        this.notifications.push(notification);
        if (notification.duration) {
          setTimeout(() => {
            this.notifications = this.notifications.filter((n) => n !== notification);
          }, notification.duration);
        }
      });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
