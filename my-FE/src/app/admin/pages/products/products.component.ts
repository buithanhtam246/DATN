import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Product {
  id: number;
  name: string;
  brand: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'inactive';
  image: string;
}

@Component({
  selector: 'app-admin-products',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss']
})
export class AdminProductsComponent {
  searchQuery = signal('');
  selectedCategory = signal('all');
  selectedStatus = signal('all');
  showAddModal = signal(false);
  
  products: Product[] = [
    { id: 1, name: 'Nike Air Max 270', brand: 'Nike', category: 'Running', price: 3500000, stock: 45, status: 'active', image: '/assets/images/products/product-1.jpg' },
    { id: 2, name: 'Adidas Ultraboost 22', brand: 'Adidas', category: 'Running', price: 4200000, stock: 32, status: 'active', image: '/assets/images/products/product-2.jpg' },
    { id: 3, name: 'Puma RS-X', brand: 'Puma', category: 'Lifestyle', price: 2800000, stock: 28, status: 'active', image: '/assets/images/products/product-3.jpg' },
    { id: 4, name: 'New Balance 574', brand: 'New Balance', category: 'Lifestyle', price: 2500000, stock: 0, status: 'inactive', image: '/assets/images/products/product-4.jpg' },
    { id: 5, name: 'Vans Old Skool', brand: 'Vans', category: 'Lifestyle', price: 1800000, stock: 67, status: 'active', image: '/assets/images/products/product-5.jpg' },
  ];

  categories = ['Running', 'Lifestyle', 'Basketball', 'Football', 'Training'];

  get filteredProducts() {
    return this.products.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(this.searchQuery().toLowerCase()) ||
                          p.brand.toLowerCase().includes(this.searchQuery().toLowerCase());
      const matchesCategory = this.selectedCategory() === 'all' || p.category === this.selectedCategory();
      const matchesStatus = this.selectedStatus() === 'all' || p.status === this.selectedStatus();
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  deleteProduct(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      this.products = this.products.filter(p => p.id !== id);
    }
  }

  toggleStatus(product: Product) {
    product.status = product.status === 'active' ? 'inactive' : 'active';
  }

  openAddModal() {
    this.showAddModal.set(true);
  }

  closeAddModal() {
    this.showAddModal.set(false);
  }
}
