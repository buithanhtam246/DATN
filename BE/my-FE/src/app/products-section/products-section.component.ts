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
    // Mock data - replace with API call
    this.products = [
      {
        id: '1',
        title: 'Nike Air Force 1 \'07 Mini Jewel',
        category: 'AIR FORCE / Giày Nam',
        price: '2.695.000 VND',
        imageUrl: '/assets/images/products/nike-af1-white.jpg'
      },
      {
        id: '2',
        title: 'Nike Air Force 1 \'07 Mini Jewel',
        category: 'AIR FORCE / Giày Nam',
        price: '2.695.000 VND',
        imageUrl: '/assets/images/products/nike-af1-blue.jpg'
      },
      {
        id: '3',
        title: 'Nike Air Force 1 \'07 Mini Jewel',
        category: 'AIR FORCE / Giày Nam',
        price: '2.695.000 VND',
        imageUrl: '/assets/images/products/nike-jordan-black.jpg'
      },
      {
        id: '4',
        title: 'Nike Air Force 1 \'07 Mini Jewel',
        category: 'AIR FORCE / Giày Nam',
        price: '2.695.000 VND',
        imageUrl: '/assets/images/products/nike-jordan-white.jpg'
      },
      {
        id: '5',
        title: 'Nike Air Force 1 \'07 Mini Jewel',
        category: 'AIR FORCE / Giày Nam',
        price: '2.695.000 VND',
        imageUrl: '/assets/images/products/adidas-classic.jpg'
      },
      {
        id: '6',
        title: 'Nike Air Force 1 \'07 Mini Jewel',
        category: 'AIR FORCE / Giày Nam',
        price: '2.695.000 VND',
        imageUrl: '/assets/images/products/nike-vapormax.jpg'
      },
      {
        id: '7',
        title: 'Nike Air Force 1 \'07 Mini Jewel',
        category: 'AIR FORCE / Giày Nam',
        price: '2.695.000 VND',
        imageUrl: '/assets/images/products/nike-beige.jpg'
      },
      {
        id: '8',
        title: 'Nike Air Force 1 \'07 Mini Jewel',
        category: 'AIR FORCE / Giày Nam',
        price: '2.695.000 VND',
        imageUrl: '/assets/images/products/nike-pink.jpg'
      }
    ];
  }
}
