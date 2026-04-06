<<<<<<< HEAD
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { ProductService } from '../core/services';
=======
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
>>>>>>> dedb69f02061182b9ae37476fee45e26cf25e284

interface ProductItem {
  id: string;
  title: string;
<<<<<<< HEAD
  brand: string;
=======
>>>>>>> dedb69f02061182b9ae37476fee45e26cf25e284
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
<<<<<<< HEAD
  imports: [CommonModule, RouterLink],
=======
  imports: [CommonModule],
>>>>>>> dedb69f02061182b9ae37476fee45e26cf25e284
  templateUrl: './products-section.component.html',
  styleUrl: './products-section.component.scss'
})
export class ProductsSectionComponent implements OnInit {
<<<<<<< HEAD
  private productService = inject(ProductService);
  private router = inject(Router);
  products = signal<ProductItem[]>([]);
=======
  products: ProductItem[] = [];
>>>>>>> dedb69f02061182b9ae37476fee45e26cf25e284

  ngOnInit(): void {
    this.loadProducts();
  }

  private loadProducts(): void {
<<<<<<< HEAD
    // Load top-selling products for homepage
    this.productService.getTopSellingProducts(8).subscribe({
      next: (response: any) => {
        const productList = response?.data || [];

        if (!Array.isArray(productList) || productList.length === 0) {
          this.loadFallbackProducts();
          return;
        }
        
        // Map backend fields to frontend fields
        const mappedProducts = productList.map((p: any) => {
          const variantSalePrice = Number(p?.price_sale || 0);
          const variantBasePrice = Number(p?.price || 0);
          const productSalePrice = Number(p?.price_sale || 0);
          const productBasePrice = Number(p?.price || 0);

          const price =
            (variantSalePrice > 0 ? variantSalePrice : 0) ||
            (variantBasePrice > 0 ? variantBasePrice : 0) ||
            (productSalePrice > 0 ? productSalePrice : 0) ||
            (productBasePrice > 0 ? productBasePrice : 0) ||
            0;
          const imageUrl = p.image || '';
          
          return {
            id: p.id?.toString() || '',
            title: p.name || 'Sản phẩm',
            brand: p.brand_name || 'Thương hiệu',
            category: p.category_name || 'Danh mục',
            price: this.formatPrice(price),
            imageUrl: this.buildImageUrl(imageUrl)
          };
        }).slice(0, 8);
        
        // Update signal instead of direct assignment
        this.products.set(mappedProducts);
        console.log('Products displayed on home page:', mappedProducts.length);
        console.log('First product:', mappedProducts[0]);
      },
      error: (error) => {
        this.loadFallbackProducts();
      }
    });
  }

  private loadFallbackProducts(): void {
    this.productService.getProducts().subscribe({
      next: (response: any) => {
        const productList = response.data || response || [];

        const mappedProducts = productList.map((p: any) => {
          const firstVariant = p.variants && p.variants.length > 0 ? p.variants[0] : null;
          const variantSalePrice = Number(firstVariant?.price_sale || 0);
          const variantBasePrice = Number(firstVariant?.price || 0);
          const price = (variantSalePrice > 0 ? variantSalePrice : 0) || (variantBasePrice > 0 ? variantBasePrice : 0) || 0;

          return {
            id: p.id?.toString() || '',
            title: p.name || 'Sản phẩm',
            brand: p.brand_name || 'Thương hiệu',
            category: p.category_name || 'Danh mục',
            price: this.formatPrice(price),
            imageUrl: this.buildImageUrl(firstVariant?.image || p.image || '')
          };
        }).slice(0, 8);

        this.products.set(mappedProducts);
      },
      error: () => {
        this.products.set([]);
      }
    });
  }

  private formatPrice(price: any): string {
    if (!price || Number(price) <= 0) return '0 đ';
    const num = parseFloat(price);
    return num.toLocaleString('vi-VN') + ' đ';
  }

  private buildImageUrl(imagePath: string): string {
    if (!imagePath) return 'assets/placeholder.png';
    // If it's already a full URL, return as is
    if (imagePath.startsWith('http')) return imagePath;
    // Images are stored in /public/images/products/ directory
    return `http://localhost:3000/public/images/products/${imagePath}`;
  }

  navigateToProducts(): void {
    this.router.navigate(['/products']);
  }
}
=======
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
>>>>>>> dedb69f02061182b9ae37476fee45e26cf25e284
