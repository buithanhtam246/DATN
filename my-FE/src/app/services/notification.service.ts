import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  constructor() { }

  showSuccess(message: string) {
    console.log('✓ Success:', message);
    alert(message);
  }

  showError(message: string) {
    console.error('✗ Error:', message);
    alert(message);
  }

  showInfo(message: string) {
    console.info('ℹ Info:', message);
    alert(message);
  }

  showWarning(message: string) {
    console.warn('⚠ Warning:', message);
    alert(message);
  }
}
