import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Brands Component
 * 
 * Responsibility: Display featured brand logos
 * - Show major brands (Adidas, Nike, Jordan)
 * - Highlight brand partnerships
 * - Link to brand-specific collections
 */
@Component({
  selector: 'app-brands',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './brands.component.html',
  styleUrl: './brands.component.scss'
})
export class BrandsComponent {
  public readonly brands = [
    {
      name: 'ADIDAS',
      logo: '/assets/images/brands/adidas-logo.png',
      url: '/brands/adidas'
    },
    {
      name: 'NIKE',
      logo: '/assets/images/brands/nike-logo.png',
      url: '/brands/nike'
    },
    {
      name: 'JORDAN',
      logo: '/assets/images/brands/jordan-logo.png',
      url: '/brands/jordan'
    }
  ];
}