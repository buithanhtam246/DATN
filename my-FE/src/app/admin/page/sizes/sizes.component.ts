import { Component, OnInit, ViewChild, ElementRef, ChangeDetectorRef } from '@angular/core'; // Thêm ChangeDetectorRef
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ProductService } from '../../../services/product.service';
import { CategoryService, Category } from '../../../services/category.service';

interface Size {
  id?: number;
  size: number;
  gender: 'male' | 'female';
  image_url?: string;
  created_at?: string;
  updated_at?: string;
}

@Component({
  selector: 'app-sizes',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './sizes.component.html',
  styleUrls: ['./sizes.component.scss']
})
export class SizesComponent implements OnInit {
  @ViewChild('maleFileInput') maleFileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('femaleFileInput') femaleFileInput!: ElementRef<HTMLInputElement>;
  @ViewChild('maleDirectInput') maleDirectInput!: ElementRef<HTMLInputElement>;
  @ViewChild('femaleDirectInput') femaleDirectInput!: ElementRef<HTMLInputElement>;

  sizes: Size[] = [];
  filteredSizes: Size[] = [];
  maleGuide: any = null;
  femaleGuide: any = null;
  parentCategories: Category[] = [];
  categoryGuides: Map<number, any> = new Map(); // Store guides by category id
  selectedGuideGender: 'male' | 'female' | null = null; // For gender-based guide selection

  showModal: boolean = false;
  activeTab: 'male' | 'female' | 'all' = 'all';
  searchText: string = '';
  isSubmitting: boolean = false;
  showCategoryList: boolean = false;

  // Guide modal state
  showGuideModal: boolean = false;
  guideModalGender: 'male' | 'female' | null = null;
  selectedGuideCategory: Category | null = null;

  newSize: any = { size: undefined, gender: undefined };
  editingSize: Size | null = null;
  selectedGenderForAdd: 'male' | 'female' | null = null;
  selectedCategoryId: number | null = null;
  selectedCategoryForAdd: boolean = false;

  constructor(
    public productService: ProductService, 
    private categoryService: CategoryService,
    private cdr: ChangeDetectorRef // Inject ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.loadSizes();
    this.loadGuides();
    this.loadCategories();
  }

  loadSizes(): void {
    this.productService.getSizes().subscribe({
      next: (data: any) => {
        this.sizes = data;
        this.applyFilters();
        this.cdr.detectChanges(); // Ép cập nhật số liệu thống kê (21, 13, 8...)
      },
      error: (err) => console.error('Lỗi tải danh sách size:', err)
    });
  }

  loadGuides(): void {
    // Load guides for male and female
    this.productService.getSizeGuide('male').subscribe({
      next: (res: any) => {
        console.log('Male guide response:', res);
        this.maleGuide = res && res.image_url ? res : null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Male guide error:', err);
        this.maleGuide = null;
      }
    });

    this.productService.getSizeGuide('female').subscribe({
      next: (res: any) => {
        console.log('Female guide response:', res);
        this.femaleGuide = res && res.image_url ? res : null;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Female guide error:', err);
        this.femaleGuide = null;
      }
    });
  }

  applyFilters(): void {
    let filtered = [...this.sizes];
    if (this.activeTab !== 'all') {
      filtered = filtered.filter(s => s.gender === this.activeTab);
    }
    if (this.searchText && this.searchText.toString().trim()) {
      filtered = filtered.filter(s => s.size.toString().includes(this.searchText.trim()));
    }
    this.filteredSizes = filtered;
    this.cdr.detectChanges();
  }

  onSearchChange(): void {
    this.applyFilters();
  }

  resetFilters(): void {
    this.searchText = '';
    this.activeTab = 'all';
    this.applyFilters();
  }

  openAddSizeModal(): void {
    this.showModal = true;
    this.editingSize = null;
    this.selectedGenderForAdd = null; 
    this.selectedCategoryForAdd = false; 
    this.selectedCategoryId = null;
    this.newSize = { size: undefined, gender: undefined };
    this.cdr.detectChanges();
  }

  editSize(size: Size): void {
    this.showModal = true;
    this.editingSize = { ...size };
    this.selectedGenderForAdd = size.gender;
    this.newSize = { size: size.size, gender: size.gender };
    this.cdr.detectChanges();
  }

  closeModal(): void {
    this.showModal = false;
    this.isSubmitting = false;
    this.selectedGenderForAdd = null;
    this.selectedCategoryId = null;
    this.selectedCategoryForAdd = false;
    this.showCategoryList = false;
    this.newSize = { size: undefined, gender: undefined };
    this.editingSize = null;
    this.cdr.detectChanges();
  }

  submitSize(): void {
    if (!this.newSize.size) return;
    this.isSubmitting = true;
    const payload = {
      size: this.newSize.size,
      gender: this.editingSize ? this.editingSize.gender : this.selectedGenderForAdd
    };

    if (this.editingSize) {
      this.productService.updateSize(this.editingSize.id!, payload).subscribe({
        next: () => this.handleSuccess('Cập nhật thành công!'),
        error: (err) => this.handleError(err)
      });
    } else {
      this.productService.addSize(payload).subscribe({
        next: () => this.handleSuccess('Thêm size mới thành công!'),
        error: (err) => this.handleError(err)
      });
    }
  }

  deleteSize(id: any): void {
    if (confirm('Bạn có chắc muốn xóa kích thước này?')) {
      this.productService.deleteSize(id).subscribe({
        next: () => {
          this.loadSizes();
        }
      });
    }
  }

  triggerFileInput(gender: string): void {
    // Mở modal để chọn danh mục cha trước khi upload ảnh
    this.guideModalGender = gender.toLowerCase() as 'male' | 'female';
    this.selectedGuideCategory = null;
    this.showGuideModal = true;
    this.cdr.detectChanges();
  }

  openGuideModal(): void {
    // Mở modal chọn danh mục cha
    this.selectedGuideCategory = null;
    this.guideModalGender = null;
    this.showGuideModal = true;
    this.cdr.detectChanges();
  }

  triggerDirectFileInput(gender: string): void {
    // Upload trực tiếp mà không cần chọn danh mục
    const fileInput = gender.toLowerCase() === 'male' ? this.maleDirectInput?.nativeElement : this.femaleDirectInput?.nativeElement;
    if (fileInput) fileInput.click();
  }

  openGuideFileUpload(): void {
    // Mở file picker
    const fileInput = document.querySelector('.modal-overlay .file-input') as HTMLInputElement;
    if (fileInput) fileInput.click();
  }

  closeGuideModal(): void {
    this.showGuideModal = false;
    this.guideModalGender = null;
    this.selectedGuideCategory = null;
    this.cdr.detectChanges();
  }

  selectCategoryForGuide(category: Category): void {
    this.selectedGuideCategory = category;
    this.cdr.detectChanges();
  }

  onFileSelected(event: any, category?: Category): void {
    const file: File = event.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('image', file);

    this.isSubmitting = true;

    // If gender mode (guideModalGender is set), upload by gender
    if (this.guideModalGender) {
      formData.append('gender', this.guideModalGender);
      this.productService.uploadSizeGuide(this.guideModalGender, formData).subscribe({
        next: () => {
          alert('✅ Đã thêm ảnh hướng dẫn thành công!');
          this.loadGuides();
          this.closeGuideModal();
          this.isSubmitting = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          alert('❌ Lỗi upload: ' + (err.error?.message || 'Không xác định'));
          this.isSubmitting = false;
        }
      });
    }
    // Otherwise upload by category (for future use)
    else if (category) {
      formData.append('category_id', category.id?.toString() || '');
      this.productService.uploadSizeGuideByCategory(category.id!, formData).subscribe({
        next: () => {
          alert('✅ Đã thêm ảnh hướng dẫn thành công!');
          this.loadCategories();
          this.closeGuideModal();
          this.isSubmitting = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          alert('❌ Lỗi upload: ' + (err.error?.message || 'Không xác định'));
          this.isSubmitting = false;
        }
      });
    }
  }

  onDirectFileSelected(event: any, gender: string): void {
    const file: File = event.target.files[0];
    if (file) {
      const formData = new FormData();
      formData.append('image', file);
      this.isSubmitting = true;
      this.productService.uploadSizeGuide(gender, formData).subscribe({
        next: () => {
          alert('✅ Đã thêm ảnh hướng dẫn thành công!');
          this.loadGuides();
          this.isSubmitting = false;
          this.cdr.detectChanges();
        },
        error: (err) => {
          alert('❌ Lỗi upload: ' + (err.error?.message || 'Không xác định'));
          this.isSubmitting = false;
        }
      });
    }
  }

  deleteGuide(category: Category): void {
    if (confirm(`Bạn có chắc muốn xóa ảnh hướng dẫn cho "${category.name}"?`)) {
      this.productService.deleteSizeGuideByCategory(category.id!).subscribe({
        next: () => {
          alert('✅ Đã xóa ảnh hướng dẫn!');
          this.categoryGuides.delete(category.id!);
          this.cdr.detectChanges();
        },
        error: (err) => {
          alert('❌ Lỗi xóa: ' + (err.error?.message || 'Không xác định'));
        }
      });
    }
  }

  getGenderGuideImage(gender: string): string {
    const guide = gender === 'male' ? this.maleGuide : this.femaleGuide;
    return guide && guide.image_url ? this.productService.sizeGuideImgUrl + guide.image_url : '';
  }

  hasGenderGuideImage(gender: string): boolean {
    const guide = gender === 'male' ? this.maleGuide : this.femaleGuide;
    return guide && guide.image_url ? true : false;
  }

  openGuideModalByGender(gender: string): void {
    this.selectedGuideCategory = null;
    this.guideModalGender = gender as 'male' | 'female';
    this.showGuideModal = true;
    this.cdr.detectChanges();
  }

  triggerEditGuideByGender(gender: string): void {
    const inputId = `file-input-${gender}`;
    const input = document.getElementById(inputId) as HTMLInputElement;
    if (input) {
      input.click();
    }
  }

  deleteGuideByGender(gender: string): void {
    if (confirm(`Bạn có chắc muốn xóa ảnh hướng dẫn cho ${gender === 'male' ? 'Nam' : 'Nữ'}?`)) {
      this.productService.deleteSizeGuide(gender).subscribe({
        next: () => {
          alert('✅ Đã xóa ảnh hướng dẫn!');
          if (gender === 'male') {
            this.maleGuide = null;
          } else {
            this.femaleGuide = null;
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          alert('❌ Lỗi xóa: ' + (err.error?.message || 'Không xác định'));
        }
      });
    }
  }

  get sizesByGender() {
    return {
      male: this.sizes.filter(s => s.gender === 'male'),
      female: this.sizes.filter(s => s.gender === 'female')
    };
  }

  getMinMaxSize(): string {
    if (this.sizes.length === 0) return '0 - 0';
    const sorted = [...this.sizes].map(s => s.size).sort((a, b) => a - b);
    return `${sorted[0]} - ${sorted[sorted.length - 1]}`;
  }

  getExistingSizes(): Size[] {
    const gender = this.editingSize?.gender || this.selectedGenderForAdd;
    if (!gender) return [];
    return this.sizes.filter(s => s.gender === gender).sort((a, b) => a.size - b.size);
  }

  loadCategories(): void {
    this.categoryService.getAllCategories().subscribe({
      next: (res: any) => {
        if (res && res.success) {
          this.parentCategories = res.data.filter((c: Category) => c.isParent);
          this.cdr.detectChanges();
        }
      },
      error: (err) => console.error('Error loading categories:', err)
    });
  }

  toggleCategoryList(): void {
    this.showCategoryList = !this.showCategoryList;
  }

  selectCategory(category: Category): void {
    this.selectedCategoryId = category.id;
    this.showCategoryList = false;
    this.cdr.detectChanges();
  }

  selectCategoryForAdd(): void {
    if (this.selectedCategoryId) {
      this.selectedCategoryForAdd = true;
      const selectedCat = this.getCategoryById(this.selectedCategoryId);
     this.selectedGenderForAdd = (selectedCat?.gender as 'male' | 'female') || 'male';
      this.newSize.gender = this.selectedGenderForAdd;
      this.cdr.detectChanges();
    }
  }

  getCategoryName(categoryId: number | null): string {
    if (!categoryId) return '';
    const category = this.parentCategories.find(c => c.id === categoryId);
    return category ? category.name : '';
  }

  getCategoryById(categoryId: number | null): Category | null {
    if (!categoryId) return null;
    return this.parentCategories.find(c => c.id === categoryId) || null;
  }

  getCategoryGuideImage(category: Category): string {
    const guide = this.categoryGuides.get(category.id!);
    return guide && guide.image_url ? this.productService.sizeGuideImgUrl + guide.image_url : '';
  }

  hasCategoryGuideImage(category: Category): boolean {
    const guide = this.categoryGuides.get(category.id!);
    return guide && guide.image_url ? true : false;
  }

  openGuidesModal(category?: Category): void {
    // Mở modal chọn danh mục hoặc để edit danh mục được chọn
    if (category) {
      this.selectedGuideCategory = category;
    } else {
      this.selectedGuideCategory = null;
    }
    this.guideModalGender = null;
    this.showGuideModal = true;
    this.cdr.detectChanges();
  }

  triggerEditGuide(category: Category): void {
    this.selectedGuideCategory = category;
    this.guideModalGender = null;
    this.showGuideModal = true;
    this.cdr.detectChanges();
  }

  private handleSuccess(msg: string): void {
    alert(msg);
    this.closeModal();
    this.loadSizes();
  }

  private handleError(err: any): void {
    alert('Lỗi: ' + (err.error?.message || 'Thao tác thất bại'));
    this.isSubmitting = false;
  }
}