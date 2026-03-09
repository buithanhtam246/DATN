import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Review {
  id: number;
  productName: string;
  customerName: string;
  rating: number;
  comment: string;
  date: string;
  status: 'pending' | 'approved' | 'rejected';
}

@Component({
  selector: 'app-reviews',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './reviews.component.html',
  styleUrls: ['./reviews.component.scss']
})
export class ReviewsComponent {
  searchQuery = signal('');
  selectedStatus = signal('all');
  selectedRating = signal('all');
  
  reviews: Review[] = [
    { id: 1, productName: 'Nike Air Max 270', customerName: 'Nguyễn Văn A', rating: 5, comment: 'Sản phẩm rất tốt, giao hàng nhanh!', date: '2024-03-01', status: 'approved' },
    { id: 2, productName: 'Adidas Ultraboost', customerName: 'Trần Thị B', rating: 4, comment: 'Chất lượng ổn, giá hơi cao', date: '2024-03-01', status: 'approved' },
    { id: 3, productName: 'Puma RS-X', customerName: 'Lê Văn C', rating: 3, comment: 'Bình thường, không có gì đặc biệt', date: '2024-02-29', status: 'pending' },
    { id: 4, productName: 'New Balance 574', customerName: 'Phạm Thị D', rating: 5, comment: 'Rất hài lòng với sản phẩm này!', date: '2024-02-29', status: 'approved' },
    { id: 5, productName: 'Vans Old Skool', customerName: 'Hoàng Văn E', rating: 1, comment: 'Sản phẩm kém chất lượng, không giống hình', date: '2024-02-28', status: 'rejected' },
  ];

  get filteredReviews() {
    return this.reviews.filter(review => {
      const matchesSearch = review.productName.toLowerCase().includes(this.searchQuery().toLowerCase()) ||
                          review.customerName.toLowerCase().includes(this.searchQuery().toLowerCase());
      const matchesStatus = this.selectedStatus() === 'all' || review.status === this.selectedStatus();
      const matchesRating = this.selectedRating() === 'all' || review.rating === parseInt(this.selectedRating());
      return matchesSearch && matchesStatus && matchesRating;
    });
  }

  get pendingReviewsCount() {
    return this.reviews.filter(review => review.status === 'pending').length;
  }

  getStars(rating: number): string[] {
    return Array(5).fill('').map((_, i) => i < rating ? '⭐' : '☆');
  }

  approveReview(review: Review) {
    review.status = 'approved';
  }

  rejectReview(review: Review) {
    review.status = 'rejected';
  }

  deleteReview(id: number) {
    if (confirm('Bạn có chắc chắn muốn xóa đánh giá này?')) {
      this.reviews = this.reviews.filter(r => r.id !== id);
    }
  }
}
