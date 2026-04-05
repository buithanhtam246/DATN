import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { OrderHistoryService } from '../../services/order.service';
import { ReviewService } from '../../services/review.service';
import { NotificationService } from '../../core/services/notification.service';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
selector:'app-orders',
standalone:true,
imports:[CommonModule, RouterLink, FormsModule],
templateUrl:'./orders.component.html',
styleUrls:['./orders.component.scss']
})
export class OrdersComponent implements OnInit {
	user: any = {};

	orders: any[] = [];

	isLoading = false;

	reviewingItemId: number | null = null;
	reviewForm = { rating: 5, comment: '' };
	isSubmittingReview = false;

	constructor(
		private orderHistoryService: OrderHistoryService,
		private reviewService: ReviewService,
		private notificationService: NotificationService,
		private authService: AuthService,
		private router: Router,
		private cdr: ChangeDetectorRef
	) {}

	ngOnInit() {
		console.log('Orders component - checking login status');
		console.log('authToken in localStorage:', localStorage.getItem('authToken'));
		console.log('user in localStorage:', localStorage.getItem('user'));
		
		if (!this.authService.isLoggedIn()) {
			console.log('User not logged in, redirecting to login');
			this.notificationService.showError('Vui lòng đăng nhập để xem lịch sử đơn hàng');
			this.router.navigate(['/login']);
			return;
		}
		
		const userStr = localStorage.getItem("user");
		this.user = userStr ? JSON.parse(userStr) : {};
		console.log('User from localStorage:', this.user);
		this.loadOrderHistory();
	}

	loadReviewsForOrders() {
		this.orders.forEach(order => {
			if (order.canReview) {
				this.reviewService.getOrderReviews(order.id).subscribe({
					next: (reviewResponse: any) => {
						if (reviewResponse.success && reviewResponse.data) {
							const reviews = reviewResponse.data;
							order.items.forEach((item: any) => {
								const review = reviews.find((r: any) => r.order_detail_id === item.id);
								if (review) {
									item.reviewed = true;
									item.review = review;
								} else {
									item.reviewed = false;
								}
							});
						}
						this.cdr.detectChanges();
					},
					error: (err) => {
						console.error('Error loading reviews for order', order.id, err);
						// Set reviewed to false if error
						order.items.forEach((item: any) => {
							item.reviewed = false;
						});
						this.cdr.detectChanges();
					}
				});
			} else {
				// For non-delivered orders, set reviewed to false
				order.items.forEach((item: any) => {
					item.reviewed = false;
				});
			}
		});
	}

	loadOrderHistory() {
		this.isLoading = true;
		this.orderHistoryService.getOrderHistory().subscribe({
			next: (response: any) => {
				console.log('Order history response:', response);
				console.log('Response data:', response?.data);
				console.log('Response success:', response?.success);
				if (response.success && response.data) {
					this.orders = response.data;
					console.log('Orders set to:', this.orders);
					// Load reviews for delivered orders
					this.loadReviewsForOrders();
				} else {
					this.notificationService.showError(response.message || 'Không thể tải lịch sử đơn hàng');
				}
				this.isLoading = false;
				this.cdr.detectChanges();
			},
			error: (err) => {
				console.error('Order history error:', err);
				console.log('Error status:', err.status);
				console.log('Error body:', err.error);
				// If unauthorized, redirect to login
				if (err.status === 401) {
					this.notificationService.showError('Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.');
					this.authService.logout();
				} else {
					this.notificationService.showError(err.error?.message || 'Không thể tải lịch sử đơn hàng');
				}
				this.isLoading = false;
				this.cdr.detectChanges();
			}
		});
	}

	getStatusText(status: string): string {
		const statusMap: { [key: string]: string } = {
			pending: 'Chờ xác nhận',
			confirmed: 'Đã xác nhận',
			shipped: 'Đang vận chuyển',
			delivered: 'Đã giao',
			cancelled: 'Đã hủy'
		};
		return statusMap[status] || status;
	}

	calculateOrderTotal(order: any): number {
		let itemsTotal = 0;
		if (order.items && order.items.length > 0) {
			itemsTotal = order.items.reduce((sum: number, item: any) => {
				return sum + (parseFloat(item.price) * item.quantity);
			}, 0);
		}
		const deliveryCost = parseFloat(order.delivery_cost) || 0;
		return itemsTotal + deliveryCost;
	}

	isOrderDelivered(status: string): boolean {
		return status === 'delivered';
	}

	openReviewForm(itemId: number): void {
		this.reviewingItemId = itemId;
		this.reviewForm = { rating: 5, comment: '' };
	}

	closeReviewForm(): void {
		this.reviewingItemId = null;
		this.reviewForm = { rating: 5, comment: '' };
	}

	submitReview(item: any): void {
		if (this.reviewForm.rating < 1 || this.reviewForm.rating > 5) {
			this.notificationService.showError('Đánh giá phải từ 1 đến 5 sao');
			return;
		}
		if (!this.reviewForm.comment.trim()) {
			this.notificationService.showError('Vui lòng nhập nhận xét');
			return;
		}
		if (this.reviewForm.comment.length > 1000) {
			this.notificationService.showError('Nhận xét không được vượt quá 1000 ký tự');
			return;
		}

		this.isSubmittingReview = true;
		this.reviewService.createReview(
			item.id,
			this.reviewForm.rating,
			this.reviewForm.comment
		).subscribe({
			next: (response: any) => {
				if (response.success) {
					this.notificationService.showSuccess('Đánh giá thành công!');
					this.closeReviewForm();
					// Mark item as reviewed
					item.reviewed = true;
				} else {
					this.notificationService.showError(response.message || 'Lỗi khi tạo đánh giá');
				}
				this.isSubmittingReview = false;
				this.cdr.detectChanges();
			},
			error: (err) => {
				console.error('Review error:', err);
				this.notificationService.showError(err.error?.message || 'Lỗi khi tạo đánh giá');
				this.isSubmittingReview = false;
				this.cdr.detectChanges();
			}
		});
	}

	getStatusClass(status: string): string {
		switch (status) {
			case "pending":
				return "pending";
			case "confirmed":
				return "confirmed";
			case "shipped":
				return "shipped";
			case "delivered":
				return "delivered";
			case "cancelled":
				return "cancelled";
			default:
				return "pending";
		}
	}

	trackByOrderId(index: number, order: any): any {
		return order.id;
	}

	trackByItemId(index: number, item: any): any {
		return item.id;
	}

	getImageUrl(imagePath: string): string {
		if (!imagePath) return '';
		
		// Nếu đã là URL đầy đủ thì trả về ngay
		if (imagePath.startsWith('http')) {
			return imagePath;
		}
		
		// Nếu chứa uploads hoặc public thì thêm domain
		if (imagePath.includes('uploads') || imagePath.includes('public')) {
			return `http://localhost:3000/${imagePath}`;
		}
		
		// Mặc định thêm /images/products/
		return `http://localhost:3000/images/products/${imagePath}`;
	}
}