import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';

@Component({
  selector: 'app-size-guide-settings',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './size-guide-settings.component.html',
  styleUrls: ['./size-guide-settings.component.scss']
})
export class SizeGuideSettingsComponent implements OnInit {
  @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

  currentGuide: any = null;
  selectedFile: File | null = null;
  filePreview: string | null = null;
  isSubmitting: boolean = false;
  sizeGuideImgUrl = 'http://localhost:3000/uploads/size-guides/';

  constructor(
    private productService: ProductService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadGuide();
  }

  /**
   * Load current size guide (from male gender as default)
   */
  loadGuide(): void {
    this.productService.getSizeGuide('male').subscribe({
      next: (res: any) => {
        if (res && res.image_url) {
          this.currentGuide = res;
        }
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        console.log('Không có ảnh hướng dẫn hiện tại');
        this.currentGuide = null;
      }
    });
  }

  /**
   * Handle file selection
   */
  onFileSelected(event: any): void {
    const file: File = event.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      const maxSize = 5 * 1024 * 1024;
      if (file.size > maxSize) {
        alert('❌ Hình ảnh quá lớn! Tối đa 5MB');
        return;
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        alert('❌ Chỉ chấp nhận JPG, PNG, WebP');
        return;
      }

      this.selectedFile = file;

      // Create preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.filePreview = e.target.result;
        this.cdr.detectChanges();
      };
      reader.readAsDataURL(file);
    }
  }

  /**
   * Upload size guide
   */
  uploadGuide(): void {
    if (!this.selectedFile) {
      alert('❌ Vui lòng chọn hình ảnh');
      return;
    }

    const formData = new FormData();
    formData.append('image', this.selectedFile);

    this.isSubmitting = true;

    // Upload to male gender (as default storage)
    this.productService.uploadSizeGuide('male', formData).subscribe({
      next: (res: any) => {
        alert('✅ Cập nhật ảnh hướng dẫn size thành công!');
        this.currentGuide = {
          gender: 'male',
          image_url: res.image_url
        };
        this.selectedFile = null;
        this.filePreview = null;
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        const errorMsg = err.error?.message || err.message || 'Không xác định';
        alert('❌ Lỗi upload: ' + errorMsg);
        this.isSubmitting = false;
        console.error('Upload error:', err);
      }
    });
  }

  /**
   * Delete current guide
   */
  deleteGuide(): void {
    if (!confirm('Bạn có chắc muốn xóa ảnh hướng dẫn size này?')) {
      return;
    }

    this.isSubmitting = true;

    this.productService.deleteSizeGuide('male').subscribe({
      next: () => {
        alert('✅ Xóa ảnh hướng dẫn size thành công!');
        this.currentGuide = null;
        this.selectedFile = null;
        this.filePreview = null;
        this.isSubmitting = false;
        this.cdr.detectChanges();
      },
      error: (err: any) => {
        const errorMsg = err.error?.message || err.message || 'Không xác định';
        alert('❌ Lỗi xóa: ' + errorMsg);
        this.isSubmitting = false;
        console.error('Delete error:', err);
      }
    });
  }

  /**
   * Open file selector
   */
  selectFile(): void {
    this.fileInput.nativeElement.click();
  }
}
