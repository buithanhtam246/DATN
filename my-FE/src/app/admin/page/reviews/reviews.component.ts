import { Component, signal, inject, OnInit, computed, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { NotificationService } from '../../../core/services/notification.service';

interface Review {
  id: number;
  productId?: number;
  variantId?: number;
  customerName?: string;
  rating: number;
  comment: string;
  created_at?: string;
  status: 'pending' | 'approved' | 'rejected'; // Bỏ dấu ? để strict hơn
}

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent implements OnInit {
  // Chuyển reviews thành Signal
  reviews = signal<Review[]>([]);
  searchQuery = signal('');
  selectedStatus = signal('all');
  selectedRating = signal('all');
  isLoading = signal(false);
  
  private apiService = inject(ApiService);
  private notificationService = inject(NotificationService);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit() {
    this.loadReviews();
  }

  loadReviews() {
    this.isLoading.set(true);
    this.apiService.getAllReviews().subscribe({
      next: (response: any) => {
        if (response.success && response.data) {
          const mappedData = response.data.map((review: any) => ({
            ...review,
            customerName: review.customerName || 'Ẩn danh',
            status: review.status || 'pending' // Ưu tiên status từ BE, nếu không có thì để pending
          }));
          this.reviews.set(mappedData);
        }
        this.isLoading.set(false);
        this.cdr.detectChanges(); // Ép render lần đầu
      },
      error: (error: any) => {
        console.error('Error loading reviews:', error);
        this.notificationService.showError('Lỗi khi tải danh sách đánh giá');
        this.isLoading.set(false);
        this.cdr.detectChanges();
      }
    });
  }

  // Tự động lọc khi các Signal thay đổi
  filteredReviews = computed(() => {
    const list = this.reviews();
    const query = this.searchQuery().toLowerCase();
    const status = this.selectedStatus();
    const rating = this.selectedRating();

    return list.filter(review => {
      const productNameOrId = review.productId?.toString() || '';
      const customerName = review.customerName || '';
      
      const matchesSearch = productNameOrId.includes(query) ||
                            customerName.toLowerCase().includes(query) ||
                            review.comment.toLowerCase().includes(query);
      
      const matchesStatus = status === 'all' || review.status === status;
      const matchesRating = rating === 'all' || review.rating === parseInt(rating);
      
      return matchesSearch && matchesStatus && matchesRating;
    });
  });

  pendingReviewsCount = computed(() => {
    return this.reviews().filter(r => r.status === 'pending').length;
  });

  getStars(rating: number): string[] {
    return Array(5).fill('').map((_, i) => i < rating ? '⭐' : '☆');
  }

  approveReview(review: Review) {
    // Logic cập nhật trạng thái
    this.reviews.update(items => 
      items.map(r => r.id === review.id ? { ...r, status: 'approved' as const } : r)
    );
    this.notificationService.showSuccess('Đã duyệt đánh giá');
  }

  rejectReview(review: Review) {
    this.reviews.update(items => 
      items.map(r => r.id === review.id ? { ...r, status: 'rejected' as const } : r)
    );
    this.notificationService.showSuccess('Đã từ chối đánh giá');
  }

  deleteReview(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      this.reviews.update(items => items.filter(r => r.id !== id));
      this.notificationService.showSuccess('Đã xóa đánh giá');
    }
  }
}