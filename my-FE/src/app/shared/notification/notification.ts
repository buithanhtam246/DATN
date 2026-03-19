import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { NotificationService } from '../../core/services/notification.service';

@Component({
  selector: 'app-notification',
  imports: [CommonModule],
  templateUrl: './notification.html',
  styleUrl: './notification.scss',
})
export class Notification implements OnInit, OnDestroy {
  errorMessage: string = '';
  successMessage: string = '';
  private subscriptions: Subscription = new Subscription();

  constructor(private notificationService: NotificationService) {}

  ngOnInit() {
    this.subscriptions.add(
      this.notificationService.errorMessage$.subscribe(message => {
        this.errorMessage = message;
      })
    );

    this.subscriptions.add(
      this.notificationService.successMessage$.subscribe(message => {
        this.successMessage = message;
      })
    );
  }

  ngOnDestroy() {
    this.subscriptions.unsubscribe();
  }

  closeError() {
    this.notificationService.clearError();
  }

  closeSuccess() {
    this.notificationService.clearSuccess();
  }
}
