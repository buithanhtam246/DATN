import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';

interface Color {
  id?: number;
  name: string;
  hex_code: string;
  created_at?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-colors',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './colors.component.html',
  styleUrls: ['./colors.component.scss']
})
export class ColorsComponent implements OnInit {
  colors: Color[] = [];
  filteredColors: Color[] = [];
  searchQuery: string = '';
  showModal: boolean = false;
  isSubmitting: boolean = false;
  editingColor: Color | null = null;

  newColor: Color = {
    name: '',
    hex_code: '#000000'
  };

  constructor(private productService: ProductService) {}

  ngOnInit(): void {
    this.loadColors();
  }

  loadColors(): void {
    this.productService.getColors().subscribe({
      next: (data: any) => {
        this.colors = data;
        this.applyFilters();
      },
      error: (err: any) => {
        console.error('Error loading colors:', err);
        alert('❌ Lỗi khi tải dữ liệu màu sắc');
      }
    });
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  applyFilters(): void {
    this.filteredColors = this.colors.filter(color =>
      color.name.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
      color.hex_code.toLowerCase().includes(this.searchQuery.toLowerCase())
    );
  }

  resetFilters(): void {
    this.searchQuery = '';
    this.applyFilters();
  }

  openAddColorModal(): void {
    this.editingColor = null;
    this.newColor = { name: '', hex_code: '#000000' };
    this.showModal = true;
  }

  editColor(color: Color): void {
    this.editingColor = color;
    this.newColor = { ...color };
    this.showModal = true;
  }

  closeModal(): void {
    this.showModal = false;
    this.editingColor = null;
    this.isSubmitting = false;
  }

  submitColor(): void {
    // Validation
    if (!this.newColor.name || !this.newColor.hex_code) {
      alert('Vui lòng điền đầy đủ thông tin');
      return;
    }

    this.isSubmitting = true;

    if (this.editingColor) {
      // Update
      this.productService.updateColor(this.editingColor.id!, this.newColor).subscribe({
        next: (response: any) => {
          alert('✅ Cập nhật màu sắc thành công!');
          this.closeModal();
          this.loadColors();
          this.isSubmitting = false;
        },
        error: (err: any) => {
          console.error('Error:', err);
          alert('❌ Lỗi: ' + (err.error?.message || 'Xảy ra lỗi'));
          this.isSubmitting = false;
        }
      });
    } else {
      // Add new
      this.productService.addColor(this.newColor).subscribe({
        next: (response: any) => {
          alert('✅ Thêm màu sắc thành công!');
          this.closeModal();
          this.loadColors();
          this.isSubmitting = false;
        },
        error: (err: any) => {
          console.error('Error:', err);
          alert('❌ Lỗi: ' + (err.error?.message || 'Xảy ra lỗi'));
          this.isSubmitting = false;
        }
      });
    }
  }

  deleteColor(id?: number): void {
    if (!id) return;
    
    const color = this.colors.find(c => c.id === id);
    if (!color) return;

    if (confirm(`Bạn có chắc chắn muốn xóa màu "${color.name}" không?`)) {
      this.productService.deleteColor(id).subscribe({
        next: (response: any) => {
          alert('✅ Xóa màu sắc thành công!');
          this.loadColors();
        },
        error: (err: any) => {
          console.error('Error:', err);
          alert('❌ Lỗi: ' + (err.error?.message || 'Xảy ra lỗi'));
        }
      });
    }
  }
}
