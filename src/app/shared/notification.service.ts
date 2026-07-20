import { Injectable, signal } from '@angular/core';

export type NotificationSeverity = 'success' | 'info' | 'warn' | 'error';

export interface ShoplyNotification {
  id: number;
  severity: NotificationSeverity;
  summary: string;
  detail: string;
}

export type NewShoplyNotification = Omit<ShoplyNotification, 'id'>;

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private nextId = 0;
  private readonly notificationsState = signal<ShoplyNotification[]>([]);
  readonly notifications = this.notificationsState.asReadonly();

  add(notification: NewShoplyNotification): void {
    const id = ++this.nextId;
    this.notificationsState.update((current) => [...current, { ...notification, id }]);
    window.setTimeout(() => this.dismiss(id), 4500);
  }

  dismiss(id: number): void {
    this.notificationsState.update((current) => current.filter((item) => item.id !== id));
  }
}
