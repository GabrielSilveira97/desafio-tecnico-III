import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

export interface NotificationMessage {
  type: 'success' | 'error' | 'info' | 'warning';
  message: string;
  duration?: number;
}

@Injectable({
  providedIn: 'root',
})
export class NotificationService {
  private notificationSubject = new Subject<NotificationMessage>();
  public notification$ = this.notificationSubject.asObservable();

  success(message: string, duration: number = 3000) {
    this.notificationSubject.next({ type: 'success', message, duration });
  }

  error(message: string, duration: number = 5000) {
    this.notificationSubject.next({ type: 'error', message, duration });
  }

  info(message: string, duration: number = 3000) {
    this.notificationSubject.next({ type: 'info', message, duration });
  }

  warning(message: string, duration: number = 4000) {
    this.notificationSubject.next({ type: 'warning', message, duration });
  }
}
