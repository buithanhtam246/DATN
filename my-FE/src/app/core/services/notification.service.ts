import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private errorMessageSubject = new BehaviorSubject<string>('');
  private successMessageSubject = new BehaviorSubject<string>('');

  public errorMessage$ = this.errorMessageSubject.asObservable();
  public successMessage$ = this.successMessageSubject.asObservable();

  showError(message: string, duration: number = 3000) {
    this.errorMessageSubject.next(message);
    if (duration > 0) {
      setTimeout(() => {
        this.clearError();
      }, duration);
    }
  }

  showSuccess(message: string, duration: number = 3000) {
    this.successMessageSubject.next(message);
    if (duration > 0) {
      setTimeout(() => {
        this.clearSuccess();
      }, duration);
    }
  }

  clearError() {
    this.errorMessageSubject.next('');
  }

  clearSuccess() {
    this.successMessageSubject.next('');
  }
}