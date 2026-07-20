import { ChangeDetectionStrategy, Component } from '@angular/core';

import { NotificationService } from '../notification.service';

@Component({
  selector: 'app-toast',
  templateUrl: './toast.component.html',
  styleUrl: './toast.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastComponent {
  constructor(readonly notificationService: NotificationService) {}
}
