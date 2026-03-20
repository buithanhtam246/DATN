import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  showSuccess(message: string): void {
    window.alert(message);
  }

  showError(message: string): void {
    window.alert(message);
  }
}
