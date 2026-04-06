/// <reference types="jasmine" />

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../core/services/notification.service';
import { Router } from '@angular/router';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let mockAuthService: jasmine.SpyObj<AuthService>;
  let mockRouter: jasmine.SpyObj<Router>;
  let mockNotificationService: jasmine.SpyObj<NotificationService>;

  beforeEach(async () => {
    // Create mock services
    mockAuthService = jasmine.createSpyObj('AuthService', ['isLoggedIn', 'isAdmin', 'login']);
    mockRouter = jasmine.createSpyObj('Router', ['navigate']);
    mockNotificationService = jasmine.createSpyObj('NotificationService', ['showError', 'showSuccess']);

    // Set default return values
    mockAuthService.isLoggedIn.and.returnValue(false);
    mockAuthService.isAdmin.and.returnValue(false);

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: NotificationService, useValue: mockNotificationService }
      ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have empty email and password on init', () => {
    expect(component.email).toBe('');
    expect(component.password).toBe('');
  });

  it('should not have valid form when email or password is empty', () => {
    component.email = '';
    component.password = 'password123';
    expect(component.isFormValid).toBeFalsy();
  });

  it('should have valid form when both email and password are filled', () => {
    component.email = 'test@example.com';
    component.password = 'password123';
    expect(component.isFormValid).toBeTruthy();
  });
});
