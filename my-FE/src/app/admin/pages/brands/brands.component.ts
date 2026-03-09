import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Brand {
  id: number;
  name: string;
  description: string;
  logo: string;
  productCount: number;
  status: 'active' | 'inactive';
}

@Component({
  selector: 'app-admin-brands',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './brands.component.html',
  styleUrls: ['./brands.component.scss']
})
export class AdminBrandsComponent {
  searchQuery = signal('');
  showAddModal = signal(false);
  
  brands: Brand[] = [
    { id: 1, name: 'Nike', description: 'Thương hiệu thể thao hàng đầu thế giới', logo: '/assets/images/brands/nike.png', productCount: 145, status: 'active' },
    { id: 2, name: 'Adidas', description: 'Thương hiệu thể thao Đức nổi tiếng', logo: '/assets/images/brands/adidas.png', productCount: 132, status: 'active' },
    { id: 3, name: 'Puma', description: 'Thương hiệu thể thao năng động', logo: '/assets/images/brands/puma.png', productCount: 98, status: 'active' },
    { id: 4, name: 'New Balance', description: 'Giày thể thao chất lượng cao', logo: '/assets/images/brands/newbalance.png', productCount: 76, status: 'active' },
    { id: 5, name: 'Vans', description: 'Phong cách streetwear độc đáo', logo: '/assets/images/brands/vans.png', productCount: 54, status: 'inactive' },
  ];

  get filteredBrands() {
    return this.brands.filter(brand => 
      brand.name.toLowerCase().includes(this.searchQuery().toLowerCase()) ||
      brand.description.toLowerCase().includes(this.searchQuery().toLowerCase())
    );
  }

  toggleStatus(brand: Brand) {
    brand.status = brand.status === 'active' ? 'inactive' : 'active';
  }

  deleteBrand(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa thương hiệu này?')) {
      this.brands = this.brands.filter(b => b.id !== id);
    }
  }

  openAddModal() {
    this.showAddModal.set(true);
  }

  closeAddModal() {
    this.showAddModal.set(false);
  }
}
