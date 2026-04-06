import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from '../../header/header.component';
import { FooterComponent } from '../../footer/footer.component';
<<<<<<< HEAD
import { ScrollToTopComponent } from '../../scroll-to-top/scroll-to-top.component';
=======
>>>>>>> dedb69f02061182b9ae37476fee45e26cf25e284

/**
 * Main Layout Component
 * 
 * Responsibility: Provide common layout structure
 * - Header (fixed navigation)
 * - Main content area (router-outlet)
 * - Footer
<<<<<<< HEAD
 * - Scroll to top button
=======
>>>>>>> dedb69f02061182b9ae37476fee45e26cf25e284
 * 
 * Usage: Wrap pages that need header & footer
 */
@Component({
  selector: 'app-main-layout',
  standalone: true,
<<<<<<< HEAD
  imports: [RouterOutlet, HeaderComponent, FooterComponent, ScrollToTopComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {}
=======
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  templateUrl: './main-layout.component.html',
  styleUrl: './main-layout.component.scss'
})
export class MainLayoutComponent {}
>>>>>>> dedb69f02061182b9ae37476fee45e26cf25e284
