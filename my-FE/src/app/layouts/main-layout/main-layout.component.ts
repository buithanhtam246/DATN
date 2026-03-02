import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../header/header.component';
import { FooterComponent } from '../../footer/footer.component';

/**
 * Main Layout Component
 * 
 * Responsibility: Provide common layout structure
 * - Header (fixed navigation)
 * - Main content area (router-outlet)
 * - Footer
 * 
 * Usage: Wrap pages that need header & footer
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {}
