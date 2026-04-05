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
  status: 'approved' | 'hidden'; // Chỉ 2 status: approved (1) và hidden (0)
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
    // Không có pending status nữa vì database chỉ lưu 0/1
    // Đếm những review mới (chưa xử lý) - có thể dùng created_at
    return 0; 
  });

  getStars(rating: number): string[] {
    return Array(5).fill('').map((_, i) => i < rating ? '⭐' : '☆');
  }

  deleteReview(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      this.apiService.deleteReview(id).subscribe({
        next: (res) => {
          this.reviews.update(items => items.filter(r => r.id !== id));
          this.notificationService.showSuccess('Đã xóa đánh giá');
        },
        error: (err) => {
          console.error('Error deleting review:', err);
          this.notificationService.showError('Lỗi xóa đánh giá');
        }
      });
    }
  }

  hideReview(review: Review) {
    this.apiService.updateReviewStatus(review.id, 0).subscribe({
      next: (res) => {
        this.reviews.update(items => 
          items.map(r => r.id === review.id ? { ...r, status: 'hidden' } : r)
        );
        this.notificationService.showSuccess('Đã ẩn đánh giá');
      },
      error: (err) => {
        console.error('Error hiding review:', err);
        this.notificationService.showError('Lỗi ẩn đánh giá');
      }
    });
  }

  unhideReview(review: Review) {
    this.apiService.updateReviewStatus(review.id, 1).subscribe({
      next: (res) => {
        this.reviews.update(items => 
          items.map(r => r.id === review.id ? { ...r, status: 'approved' } : r)
        );
        this.notificationService.showSuccess('Đã hiển thị đánh giá');
      },
      error: (err) => {
        console.error('Error unhiding review:', err);
        this.notificationService.showError('Lỗi hiển thị đánh giá');
      }
    });
  }
}