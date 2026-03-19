import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrderHistoryService } from '../../services/order.service';
import { NotificationService } from '../../core/services/notification.service';

@Component({
selector:'app-checkout',
standalone:true,
imports: [CommonModule, FormsModule],
templateUrl:'./checkout.component.html'
})
export class CheckoutComponent{
user: any = JSON.parse(localStorage.getItem("user") || "{}");

cart:any[] = JSON.parse(localStorage.getItem("cart") || "[]");

isLoading = false;

fullName = '';
phone = '';
address = '';

constructor(
	private router:Router,
	private orderService: OrderHistoryService,
	private notificationService: NotificationService
){}

get totalAmount(): number {
	return this.cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
}

checkout(){
	if (!this.user.id) {
		this.notificationService.showError('Vui lòng đăng nhập để đặt hàng');
		this.router.navigate(['/login']);
		return;
	}

	if (this.cart.length === 0) {
		this.notificationService.showError('Giỏ hàng trống');
		return;
	}

	if (!this.fullName || !this.phone || !this.address) {
		this.notificationService.showError('Vui lòng nhập đầy đủ thông tin giao hàng');
		return;
	}

	this.isLoading = true;

	// Prepare order data for API
	const orderData = {
		items: this.cart.map(item => ({
			variant_id: item.variant_id,
			quantity: item.quantity,
			price: item.price
		})),
		total_price: this.totalAmount,
		note: `Người nhận: ${this.fullName}, SĐT: ${this.phone}, Địa chỉ: ${this.address}`,
		// For now, we'll skip address_id and let the backend handle it
		// address_id: 1, // Use default address or create one
	};

	this.orderService.checkout(orderData).subscribe({
		next: (response: any) => {
			if (response.success) {
				this.notificationService.showSuccess('Đặt hàng thành công!');
				localStorage.removeItem("cart");
				this.router.navigate(['/orders']);
			} else {
				this.notificationService.showError(response.message || 'Đặt hàng thất bại');
			}
			this.isLoading = false;
		},
		error: (error) => {
			console.error('Checkout error:', error);
			this.notificationService.showError(error.error?.message || 'Đặt hàng thất bại. Vui lòng thử lại.');
			this.isLoading = false;
		}
	});
}

}