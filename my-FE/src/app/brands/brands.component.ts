<<<<<<< HEAD
import { Component, OnInit, inject } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ProductService } from '../core/services';

interface BrandItem {
  id?: number;
  name: string;
  logo?: string;
  filterValue: string;
}
=======
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
>>>>>>> dedb69f02061182b9ae37476fee45e26cf25e284

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
<<<<<<< HEAD
  imports: [CommonModule, RouterModule],
  templateUrl: './brands.component.html',
  styleUrl: './brands.component.scss'
})
export class BrandsComponent implements OnInit {
  private productService = inject(ProductService);

  public brands: BrandItem[] = [
    {
      name: 'ADIDAS',
      logo: '/assets/images/brands/adidas-logo.png',
      filterValue: 'adidas'
=======
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
>>>>>>> dedb69f02061182b9ae37476fee45e26cf25e284
    },
    {
      name: 'NIKE',
      logo: '/assets/images/brands/nike-logo.png',
<<<<<<< HEAD
      filterValue: 'nike'
=======
      url: '/brands/nike'
>>>>>>> dedb69f02061182b9ae37476fee45e26cf25e284
    },
    {
      name: 'JORDAN',
      logo: '/assets/images/brands/jordan-logo.png',
<<<<<<< HEAD
      filterValue: 'jordan'
    }
  ];

  ngOnInit(): void {
    this.productService.getBrands().subscribe({
      next: (response: any) => {
        const apiBrands = response?.data || response || [];
        if (!Array.isArray(apiBrands) || apiBrands.length === 0) return;

        this.brands = apiBrands.map((brand: any) => ({
          id: brand.id,
          name: (brand.name || '').toUpperCase(),
          filterValue: brand.id?.toString() || (brand.name || '').toLowerCase()
        }));
      },
      error: () => {
      }
    });
  }
}
=======
      url: '/brands/jordan'
    }
  ];
}
>>>>>>> dedb69f02061182b9ae37476fee45e26cf25e284
