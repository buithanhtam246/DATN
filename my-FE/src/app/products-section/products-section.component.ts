import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ProductItem {
  id: string;
  title: string;
  category: string;
  price: string;
  imageUrl: string;
}

/**
 * Products Section Component
 * 
 * Responsibility: Display products grid section
 * - Show product listings in grid layout
 * - Navigate to product details
 */
@Component({
  selector: 'app-products-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './products-section.component.html',
  styleUrl: './products-section.component.scss'
})
export class ProductsSectionComponent implements OnInit {
  products: ProductItem[] = [];

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
    // Updated with correct image paths from public/assets/images/products/
    this.products = [
      {
        id: '1',
        title: 'Nike Air Force 1 \'07',
        category: 'AIR FORCE / Giày Nam',
        price: '2.695.000 VND',
        imageUrl: '/assets/images/products/nikeaf1.jpg'
      },
      {
        id: '2',
        title: 'Nike Air Jordan 1 Retro High',
        category: 'JORDAN / Giày Nam',
        price: '4.290.000 VND',
        imageUrl: '/assets/images/products/nikejd.jpg'
      },
      {
        id: '3',
        title: 'Adidas Superstar Classic',
        category: 'ORIGINALS / Giày Unisex',
        price: '2.390.000 VND',
        imageUrl: '/assets/images/products/superstar.jpg'
      },
      {
        id: '4',
        title: 'Nike Air Max 270',
        category: 'AIR MAX / Giày Nam',
        price: '3.890.000 VND',
        imageUrl: '/assets/images/products/nikeamax.jpg'
      },
      {
        id: '5',
        title: 'Nike Vomero 18',
        category: 'VOMERO / Giày Nam',
        price: '2.190.000 VND',
        imageUrl: '/assets/images/products/vomero.jpg'
      },
      {
        id: '6',
        title: 'Nike Dunk Low Retro',
        category: 'DUNK / Giày Nam',
        price: '2.990.000 VND',
        imageUrl: '/assets/images/products/nikeduck.jpg'
      },
      {
        id: '7',
        title: 'Nike Vapormax 2024',
        category: 'VAPORMAX / Giày Nam',
        price: '4.590.000 VND',
        imageUrl: '/assets/images/products/vapomax.jpg'
      },
      {
        id: '8',
        title: 'Adidas Ultraboost 5',
        category: 'RUNNING / Giày Nữ',
        price: '4.590.000 VND',
        imageUrl: '/assets/images/products/ultraboost.jpg'
      }
    ];
  }
}
