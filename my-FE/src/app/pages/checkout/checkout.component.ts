import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { OrderHistoryService } from '../../services/order.service';
import { NotificationService } from '../../core/services/notification.service';
import { ApiService } from '../../services/api.service';
import { AddressLocationService } from '../../services/address-location.service';

@Component({
selector:'app-checkout',
standalone:true,
imports: [CommonModule, FormsModule],
templateUrl:'./checkout.component.html',
styleUrls: ['./checkout.component.scss']
})
export class CheckoutComponent implements OnInit{
user: any = JSON.parse(localStorage.getItem("user") || "{}");

cart:any[] = JSON.parse(localStorage.getItem("cart") || "[]");

private http = inject(HttpClient);

isLoading = false;

fullName = '';
email = '';
phone = '';
address = '';
selectedAddressId: number | null = null;
addresses: any[] = [];
showAddNewAddress = false;
newAddressName = '';
newAddressPhone = '';
newAddressPhoneError = ''; // Lỗi validate SDT
newAddressText = '';
newAddressProvince = '';
newAddressDistrict = '';
newAddressWard = '';
isAddingAddress = false;
usingNewAddress = false; // Biến để track khi user nhập địa chỉ mới (không cần lưu)
selectedShippingMethod = '';
paymentMethods: any[] = [];
selectedPaymentMethodId: number | null = null;
orderNote = ''; // Ghi chú đơn hàng
shippingFee = 30000;
discountAmount = 0;
remainingForFreeShip = 0;

// Voucher
voucherCode = '';
voucherMessage = '';
appliedVoucher: any = null;
isApplyingVoucher = false;

// Danh sách địa chỉ theo cấp
provinces: string[] = [];
districts: string[] = [];
wards: string[] = [];

// Manual address (form đầu tiên, khi không có địa chỉ đã lưu)
manualAddressName = '';
manualAddressProvince = '';
manualAddressDistrict = '';
manualAddressWard = '';
manualAddressText = '';
manualAddressPhone = '';
manualDistricts: string[] = [];
manualWards: string[] = [];

constructor(
	private router: Router,
	private orderService: OrderHistoryService,
	private notificationService: NotificationService,
	private apiService: ApiService,
	private addressLocationService: AddressLocationService
){}

ngOnInit() {
	// Load danh sách tỉnh/thành phố
	this.provinces = this.addressLocationService.getProvinces();

	// Load phương thức thanh toán từ API
	this.loadPaymentMethods();

	// Tự động điền thông tin user nếu đã đăng nhập
	if (this.user && this.user.id) {
		this.fullName = this.user.name || '';
		this.email = this.user.email || '';
		this.phone = this.user.phone || '';
		
		// Load danh sách địa chỉ của user
		this.loadAddresses();
	} else {
		this.notificationService.showError('Vui lòng đăng nhập để tiếp tục');
		this.router.navigate(['/login']);
	}
}

loadPaymentMethods() {
	this.http.get<any>('http://localhost:3000/api/payment-methods/all').subscribe({
		next: (response: any) => {
			if (response.success && response.data) {
				this.paymentMethods = response.data;
				console.log('✅ Payment methods loaded:', this.paymentMethods);
			}
		},
		error: (err: any) => {
			console.error('❌ Error loading payment methods:', err);
		}
	});
}

loadAddresses() {
	if (!this.apiService.getAddresses) {
		return; // API chưa có
	}
	
	this.apiService.getAddresses().subscribe({
		next: (response: any) => {
			if (response.success && response.data) {
				this.addresses = response.data;
				// Không auto-select địa chỉ mặc định, user phải chọn thủ công
			}
		},
		error: (err) => {
			console.error('Error loading addresses:', err);
		}
	});
}

toggleAddressSelect(address: any) {
	// Toggle: nếu click vào địa chỉ đã selected → bỏ chọn
	if (this.selectedAddressId === address.id) {
		this.selectedAddressId = null;
		this.address = '';
		this.shippingFee = 30000; // Reset shipping fee
		return;
	}

	// Nếu click vào địa chỉ khác → select nó
	this.selectedAddressId = address.id;
	this.address = address.full_address;
	// Tính phí ship dựa trên địa chỉ được chọn
	if (address.full_address && address.full_address.includes('Hồ Chí Minh')) {
		this.shippingFee = 15000;
	} else {
		this.shippingFee = 30000;
	}
}

onAddressSelect(address: any) {
	// Keep this for backward compatibility if needed
	this.toggleAddressSelect(address);
}

toggleAddNewAddress() {
	this.showAddNewAddress = !this.showAddNewAddress;
	if (!this.showAddNewAddress) {
		this.resetNewAddressForm();
	}
}

resetNewAddressForm() {
	this.newAddressName = '';
	this.newAddressPhone = '';
	this.newAddressProvince = '';
	this.newAddressDistrict = '';
	this.newAddressWard = '';
	this.newAddressText = '';
	this.districts = [];
	this.wards = [];
}

// Khi chọn tỉnh/thành phố (form manual - đầu tiên)
onManualProvinceChange(province: string) {
	this.manualAddressProvince = province;
	this.manualAddressDistrict = '';
	this.manualAddressWard = '';
	this.manualDistricts = this.addressLocationService.getDistricts(province);
	this.manualWards = [];
	this.calculateShippingFee(province);
	this.updateManualAddress();
}

// Khi chọn quận/huyện (form manual)
onManualDistrictChange(district: string) {
	this.manualAddressDistrict = district;
	this.manualAddressWard = '';
	this.manualWards = this.addressLocationService.getWards(this.manualAddressProvince, district);
	this.updateManualAddress();
}

// Khi chọn phường/xã (form manual)
onManualWardChange(ward: string) {
	this.manualAddressWard = ward;
	// Cập nhật địa chỉ hiển thị
	this.updateManualAddress();
}

// Cập nhật địa chỉ từ form manual
updateManualAddress() {
	// Xây dựng full address từ các thành phần
	const addressParts = [];
	if (this.manualAddressText) addressParts.push(this.manualAddressText);
	if (this.manualAddressWard) addressParts.push(this.manualAddressWard);
	if (this.manualAddressDistrict) addressParts.push(this.manualAddressDistrict);
	if (this.manualAddressProvince) addressParts.push(this.manualAddressProvince);
	
	if (addressParts.length > 0) {
		this.address = addressParts.join(', ');
	}
	
	// Nếu người dùng nhập tên, cập nhật fullName
	if (this.manualAddressName) {
		this.fullName = this.manualAddressName;
	}
}

// Reset form manual
resetManualAddress() {
	this.manualAddressName = '';
	this.manualAddressProvince = '';
	this.manualAddressDistrict = '';
	this.manualAddressWard = '';
	this.manualAddressText = '';
	this.manualAddressPhone = '';
	this.manualDistricts = [];
	this.manualWards = [];
}

// Validate SDT real-time (chỉ 10 số)
validateNewAddressPhone() {
	const phone = this.newAddressPhone.trim();
	
	if (!phone) {
		this.newAddressPhoneError = 'Vui lòng nhập số điện thoại';
		return;
	}
	
	// Check chỉ có chữ số
	if (!/^\d+$/.test(phone)) {
		this.newAddressPhoneError = 'Số điện thoại chỉ được chứa chữ số';
		return;
	}
	
	// Check đúng 10 số
	if (phone.length !== 10) {
		this.newAddressPhoneError = `Số điện thoại phải có 10 chữ số (hiện có ${phone.length} số)`;
		return;
	}
	
	this.newAddressPhoneError = ''; // Valid - xóa message lỗi
}

// Getter để check nếu SDT hợp lệ
get isNewAddressPhoneValid(): boolean {
	const phone = this.newAddressPhone.trim();
	return /^\d{10}$/.test(phone);
}
onProvinceChange(province: string) {
	this.newAddressProvince = province;
	this.newAddressDistrict = '';
	this.newAddressWard = '';
	this.districts = this.addressLocationService.getDistricts(province);
	this.wards = [];
	// Cập nhật phí ship khi chọn tỉnh
	this.calculateShippingFee(province);
	this.updateNewAddress();
}

// Khi chọn quận/huyện
onDistrictChange(district: string) {
	this.newAddressDistrict = district;
	this.newAddressWard = '';
	this.wards = this.addressLocationService.getWards(this.newAddressProvince, district);
	this.updateNewAddress();
}

// Khi chọn phường/xã (form thêm địa chỉ mới)
onWardChange(ward: string) {
	this.newAddressWard = ward;
	this.updateNewAddress();
}

// Tính phí vận chuyển dựa trên tỉnh/thành phố
calculateShippingFee(province: string) {
	if (province && province.includes('Hồ Chí Minh')) {
		this.shippingFee = 15000;
	} else {
		this.shippingFee = 30000;
	}
}

// Cập nhật địa chỉ từ form "Thêm Địa Chỉ Mới" (không cần lưu vào DB)
updateNewAddress() {
	// Xây dựng full address từ các thành phần
	const addressParts = [];
	if (this.newAddressText) addressParts.push(this.newAddressText);
	if (this.newAddressWard) addressParts.push(this.newAddressWard);
	if (this.newAddressDistrict) addressParts.push(this.newAddressDistrict);
	if (this.newAddressProvince) addressParts.push(this.newAddressProvince);
	
	if (addressParts.length > 0) {
		this.address = addressParts.join(', ');
		this.usingNewAddress = true; // Mark rằng đang dùng địa chỉ mới
	}
	
	// Cập nhật fullName nếu user nhập
	if (this.newAddressName) {
		this.fullName = this.newAddressName;
	}
	
	// Cập nhật phone từ form mới
	if (this.newAddressPhone) {
		this.phone = this.newAddressPhone;
	}
}

// Áp dụng voucher
applyVoucher() {
	if (!this.voucherCode.trim()) {
		this.notificationService.showError('Vui lòng nhập mã voucher');
		return;
	}

	this.isApplyingVoucher = true;

	// Gửi request kiểm tra voucher
	this.apiService.checkVoucher(this.voucherCode, this.subtotal).subscribe({
		next: (response: any) => {
			if (response.success) {
				this.appliedVoucher = response.data;
				this.discountAmount = response.data.discountAmount;
				this.voucherMessage = response.message;
				this.notificationService.showSuccess('Áp dụng voucher thành công!');
			} else {
				this.voucherMessage = response.message;
				this.discountAmount = 0;
				this.appliedVoucher = null;
				this.notificationService.showError(response.message);
			}
			this.isApplyingVoucher = false;
		},
		error: (error) => {
			console.error('Error applying voucher:', error);
			this.voucherMessage = 'Không thể kiểm tra voucher. Vui lòng thử lại.';
			this.discountAmount = 0;
			this.appliedVoucher = null;
			this.notificationService.showError('Lỗi khi áp dụng voucher');
			this.isApplyingVoucher = false;
		}
	});
}

// Xóa voucher
removeVoucher() {
	this.voucherCode = '';
	this.discountAmount = 0;
	this.appliedVoucher = null;
	this.voucherMessage = '';
}

addNewAddress() {
	if (!this.newAddressName || !this.newAddressPhone || !this.newAddressProvince || 
	    !this.newAddressDistrict || !this.newAddressWard || !this.newAddressText) {
		
		// Báo lỗi chi tiết từng field
		if (!this.newAddressName) {
			this.notificationService.showError('Vui lòng nhập tên người nhận');
			return;
		}
		if (!this.newAddressPhone) {
			this.notificationService.showError('Vui lòng nhập số điện thoại');
			return;
		}
		if (!this.newAddressProvince) {
			this.notificationService.showError('Vui lòng chọn tỉnh/thành phố');
			return;
		}
		if (!this.newAddressDistrict) {
			this.notificationService.showError('Vui lòng chọn quận/huyện');
			return;
		}
		if (!this.newAddressWard) {
			this.notificationService.showError('Vui lòng chọn phường/xã');
			return;
		}
		if (!this.newAddressText) {
			this.notificationService.showError('Vui lòng nhập địa chỉ chi tiết');
			return;
		}
	}

	// Validate tên người nhận (ít nhất 2 ký tự)
	if (this.newAddressName.trim().length < 2) {
		this.notificationService.showError('Tên người nhận phải ít nhất 2 ký tự');
		return;
	}

	// Validate SDT (đúng 10 số)
	const phoneRegex = /^\d{10}$/;
	if (!phoneRegex.test(this.newAddressPhone.trim())) {
		this.notificationService.showError('Số điện thoại phải là 10 chữ số');
		return;
	}

	this.isAddingAddress = true;

	// Ghép địa chỉ theo cấp
	const fullAddress = `${this.newAddressText}, ${this.newAddressWard}, ${this.newAddressDistrict}, ${this.newAddressProvince}`;

	const addressData = {
		receiver_name: this.newAddressName,
		receiver_phone: this.newAddressPhone,
		full_address: fullAddress,
		is_default: false
	};

	console.log('[DEBUG] Sending address data:', addressData);

	this.apiService.createAddress(addressData).subscribe({
		next: (response: any) => {
			this.isAddingAddress = false;
			
			if (response.success) {
				// Hiển thị thông báo thành công - sẽ lâu hơn để user thấy
				this.notificationService.showSuccess('✅ Thêm địa chỉ thành công! Đang cập nhật...');
				
				// Cập nhật danh sách địa chỉ
				if (response.data) {
					this.addresses.push(response.data);
					
					// Tự động chọn địa chỉ mới thêm
					this.selectedAddressId = response.data.id;
					this.address = response.data.full_address;
					
					console.log('✅ Address saved:', response.data);
				}
				
				// Reset form ngay lập tức
				this.showAddNewAddress = false;
				this.resetNewAddressForm();
			} else {
				this.notificationService.showError(response.message || 'Thêm địa chỉ thất bại');
			}
		},
		error: (error) => {
			this.isAddingAddress = false;
			console.error('Error adding address:', error);
			const errorMsg = error?.error?.message || 'Thêm địa chỉ thất bại. Vui lòng thử lại.';
			this.notificationService.showError(errorMsg);
		}
	});
}

get subtotal(): number {
	return this.cart.reduce((sum, item) => {
		const price = item.priceSale || item.price;
		return sum + price * item.quantity;
	}, 0);
}

get total(): number {
	return this.subtotal + this.shippingFee - this.discountAmount;
}

get totalAmount(): number {
	return this.total;
}

toggleShippingMethods() {
	// Toggle shipping method selection UI
}

goBack() {
	this.router.navigate(['/cart']);
}

trackByAddressId(index: number, address: any) {
	return address.id;
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

	if (!this.fullName || !this.address) {
		this.notificationService.showError('Vui lòng nhập đầy đủ thông tin giao hàng');
		return;
	}

	// Check phone - either from selected address or manual/new address phone
	const hasPhone = this.selectedAddressId || this.manualAddressPhone || this.newAddressPhone;
	if (!hasPhone) {
		this.notificationService.showError('Vui lòng nhập số điện thoại');
		return;
	}

	// Check email
	if (!this.email) {
		this.notificationService.showError('Vui lòng nhập email');
		return;
	}

	// Check shipping method
	if (!this.selectedShippingMethod) {
		this.notificationService.showError('Vui lòng chọn phương thức thanh toán');
		return;
	}

	this.isLoading = true;

	// Prepare order data for API
	const orderData = {
		items: this.cart.map(item => ({
			variant_id: item.variant_id,
			quantity: item.quantity,
			price: item.priceSale || item.price  // Dùng giá sale nếu có, không thì dùng giá gốc
		})),
		total_price: this.totalAmount,
		payment_method: this.selectedShippingMethod,  // Payment method từ form
		delivery: this.selectedShippingMethod,  // Shipping method/delivery type
		note: this.orderNote,  // Ghi chú đơn hàng
		address_id: this.selectedAddressId || null,
		delivery_address: this.address
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