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
    },
    {
      name: 'NIKE',
      logo: '/assets/images/brands/nike-logo.png',
      filterValue: 'nike'
    },
    {
      name: 'JORDAN',
      logo: '/assets/images/brands/jordan-logo.png',
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