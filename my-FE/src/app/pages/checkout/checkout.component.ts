import { Component, OnInit, OnDestroy, inject, ChangeDetectorRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { OrderHistoryService } from '../../services/order.service';
import { NotificationService } from '../../core/services/notification.service';
import { ApiService } from '../../services/api.service';
import { AddressLocationService } from '../../services/address-location.service';
import { CartService } from '../../services/cart.service';
import { environment } from '../../../environments/environment';

@Component({
selector:'app-checkout',
standalone:true,
imports: [CommonModule, FormsModule],
templateUrl:'./checkout.component.html',
styleUrls: ['./checkout.component.scss']

})

export class CheckoutComponent implements OnInit, OnDestroy {

user: any = JSON.parse(localStorage.getItem('user') || '{}');

cart: any[] = [];
// When true, we should not overwrite `cart` from CartService emissions
private ignoreCartServiceEmits = false;

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
availableVouchers: any[] = [];
isLoadingVouchers = false;
// Voucher modal visibility
showVouchersModal: boolean = false;

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
	private addressLocationService: AddressLocationService,
	private cartService: CartService,
	private cdr: ChangeDetectorRef
){ }

	// Normalize cart items stored in different shapes (legacy vs current)
	private normalizeCartArray(items: any[]): any[] {
		if (!Array.isArray(items)) return [];

		// Helper to parse numeric-like values (e.g. "30,000đ" -> 30000)
		const parseNumber = (v: any): number | undefined => {
			if (v == null) return undefined;
			if (typeof v === 'number') return Number.isFinite(v) ? v : undefined;
			const s = String(v).trim();
			if (!s) return undefined;
			const cleaned = s.replace(/[^0-9.-]+/g, '');
			const n = Number(cleaned);
			return Number.isFinite(n) ? n : undefined;
		};
		const mapped = items.map((it: any) => {
			const pickNumber = (vals: any[]) => {
				for (const v of vals) {
					const n = parseNumber(v);
					if (n !== undefined && n > 0) return n;
				}
				return null;
			};

			const variant_id = pickNumber([it.variant_id, it.variantId, it.variant?.id, it.variant, it.id]);
			const quantity = parseNumber(it.quantity ?? it.qty ?? it.count ?? 0) || 0;

			// Determine unit price and sale price from many possible fields returned by different APIs
			const priceCandidates = [
				it.price,
				it.original_price,
				it.unit_price,
				it.cost,
				it.product?.price,
				it.variant?.price,
				it.finalPrice,
				it.final_price
			];
			const saleCandidates = [
				it.priceSale,
				it.price_sale,
				it.salePrice,
				it.variant?.priceSale,
				it.variant?.price_sale,
				it.totalPrice,
				it.total_price
			];

			let price = 0;
			for (const p of priceCandidates) {
				const n = parseNumber(p);
				if (n !== undefined && n > 0) { price = n; break; }
			}

			let priceSale = undefined as number | undefined;
			for (const s of saleCandidates) {
				const n = parseNumber(s);
				if (n !== undefined && n > 0) { priceSale = n; break; }
			}

			// If sale not found but price was taken from a total (e.g., totalPrice), try to recover unit price
			if ((!price || price <= 0) && (it.total_price || it.totalPrice)) {
				const tp = parseNumber(it.total_price ?? it.totalPrice);
				const q = parseNumber(it.quantity ?? it.qty ?? it.count) || 1;
				if (tp !== undefined && q > 0) price = tp / q;
			}
			const name = it.name || it.title || it.product_name || it.productName || it.productTitle || 'Sản phẩm';
						let image = it.image || it.imageUrl || it.image_url || it.thumbnail || it.img || '/assets/placeholder.png';

						// Normalize image into a full URL that the browser can load.
						// Cases handled:
						// - Already absolute (http:// or https://) -> keep
						// - Starts with '//' -> protocol-relative -> keep
						// - Starts with '/' (server-relative) -> prefix with assetsBaseUrl
						// - Bare filename (e.g. 'product-xxx.avif') -> assume stored in /public/images/products/
						const isAbsolute = typeof image === 'string' && (image.startsWith('http://') || image.startsWith('https://') || image.startsWith('//'));
						const isServerRelative = typeof image === 'string' && image.startsWith('/');
						if (!isAbsolute) {
							if (isServerRelative) {
								image = `${environment.assetsBaseUrl}${image}`;
							} else if (typeof image === 'string' && image.length > 0 && !image.includes('/') ) {
								// simple filename -> use public images products folder
								image = `${environment.assetsBaseUrl}/public/images/products/${image}`;
							} else if (typeof image === 'string' && image.includes('/public/images/') ) {
								// already contains public path but maybe missing domain
								if (!image.startsWith('http')) image = `${environment.assetsBaseUrl}${image.startsWith('/') ? image : '/' + image}`;
							} else if (typeof image === 'string' && image.includes('/uploads/')) {
								if (!image.startsWith('http')) image = `${environment.assetsBaseUrl}${image.startsWith('/') ? image : '/' + image}`;
							}
						}
			const color = it.color || it.colorName || it.color_name || undefined;
			const size = it.size || it.sizeName || it.size_name || it.bangSize || undefined;

			return {
				...it,
				variant_id,
				quantity,
				price,
				priceSale,
				name,
				image,
				color,
				size
			};
		});

		// Deduplicate by variant_id: merge entries referring to the same variant
		const dedupMap = new Map<number, any>();
		for (const it of mapped) {
			const vid = Number(it.variant_id || 0);
			if (!vid) {
				// keep items without variant_id as-is using a unique negative key
				const key = Symbol();
				dedupMap.set(key as any, it);
				continue;
			}

			if (!dedupMap.has(vid)) {
				dedupMap.set(vid, { ...it });
			} else {
				const existing = dedupMap.get(vid);
				// Combine quantities (use server-side authoritative quantity if present)
				existing.quantity = (typeof existing.quantity === 'number' ? existing.quantity : parseNumber(existing.quantity) || 0) + (typeof it.quantity === 'number' ? it.quantity : parseNumber(it.quantity) || 0);
				// Prefer non-placeholder image/name
				if ((!existing.image || existing.image.includes('placeholder')) && it.image) existing.image = it.image;
				if ((!existing.name || existing.name === 'Sản phẩm') && it.name) existing.name = it.name;
				dedupMap.set(vid, existing);
			}
		}

		return Array.from(dedupMap.values());
	}

	// Handle order creation errors (e.g., insufficient stock)
	private handleOrderCreateError(error: any, paymentMethodLabel: string) {
		const msg = error?.error?.message || error?.message || String(error || '');
		// Try to parse messages like: "Số lượng không đủ cho biến thể #259. Tồn kho: 7, yêu cầu: 8"
		const re = /Số lượng không đủ[^#]*#?(\d+)[^\d]*Tồn kho[:\s]*([0-9]+)(?:[^0-9]+([0-9]+))?/i;
		const m = msg.match(re);
		if (m) {
			const variantId = Number(m[1]);
			const available = Number(m[2]) || 0;
			// Update local cart: set the quantity for that variant to available (or remove if 0)
			try {
				let items = this.cartService.getCartFromStorage() || [];
				let updated = false;
				items = items.map((it: any) => {
					const vid = Number(it.variant_id ?? it.variantId ?? (it.variant && it.variant.id) ?? it.id ?? 0);
					if (vid === variantId) {
						updated = true;
						if (available <= 0) return null; // remove
						return { ...it, quantity: available };
					}
					return it;
				}).filter(Boolean);
				if (updated) {
					this.cartService.setCartToStorage(items);
					// Refresh cart from backend if possible, else update local view
					try { this.cartService.getCart(); } catch (e) { /* ignore */ }
					this.cart = this.normalizeCartArray(items || []);
					this.notificationService.showError(`Số lượng sản phẩm đã được điều chỉnh về ${available} do tồn kho. Vui lòng kiểm tra giỏ hàng trước khi thanh toán (${paymentMethodLabel}).`);
					return;
				}
			} catch (e) {
				console.error('Error while adjusting cart after stock error:', e);
			}
		}

		// Default: show server message
		this.notificationService.showError(msg || `Không thể tạo đơn hàng trước khi thanh toán ${paymentMethodLabel}`);
	}

	// Reset products on checkout: clear local cart and call backend clear when possible
	resetProducts() {
		if (!confirm('Bạn có chắc muốn đặt lại giỏ hàng? Tất cả sản phẩm sẽ bị xóa khỏi hóa đơn.')) return;

		// Clear local state
		this.cart = [];
		try {
			this.cartService.setCartToStorage([]);
		} catch (e) {
			console.warn('Could not set empty cart to storage', e);
		}

		// If there is a server-side cart, attempt to clear it
		const cartId = this.cartService.getCartId();
		if (cartId) {
			try {
				this.cartService.clearCart()?.subscribe?.({
					next: (resp: any) => {
						this.notificationService.showSuccess('Giỏ hàng đã được đặt lại.');
						this.cdr.markForCheck();
					},
					error: (err: any) => {
						console.error('Error clearing server cart:', err);
						this.notificationService.showError('Không thể xóa giỏ hàng trên server, nhưng đã xóa cục bộ.');
						this.cdr.markForCheck();
					}
				});
			} catch (e) {
				console.error('clearCart call failed', e);
				this.notificationService.showError('Đã xóa cục bộ giỏ hàng, server không thể xóa lúc này.');
			}
		} else {
			this.notificationService.showSuccess('Giỏ hàng đã được đặt lại.');
			this.cdr.markForCheck();
		}
	}

	/**
	 * After an order is created, subtract purchased quantities from the cart instead of clearing all items.
	 * Expects `order` to contain `orderDetails` (array of { variant_id, quantity }) or `order_details`.
	 */
	private processOrderCartCleanup(order: any): void {
		try {
			const details = order?.orderDetails || order?.order_details || [];
			if (!Array.isArray(details) || details.length === 0) {
				// nothing to subtract — clear cart as fallback
				try { this.cartService.setCartToStorage([]); } catch (e) {}
				try { this.cart = []; this.cdr.markForCheck(); } catch (e) {}
				return;
			}

			// Refresh server cart first
			try { this.cartService.getCart(); } catch (e) {}

			// Allow cart to refresh then read from storage
			setTimeout(() => {
				const serverCartItems = this.cartService.getCartFromStorage() || [];

				details.forEach((d: any) => {
					const variantId = Number(d.variant_id || d.variantId || 0);
					const qtyOrdered = Number(d.quantity || 0);
					if (!variantId || qtyOrdered <= 0) return;

					const matches = serverCartItems.filter((ci: any) => Number(ci.variant_id) === variantId);
					matches.forEach((ci: any) => {
						try {
							const remaining = Number(ci.quantity || 0) - qtyOrdered;
							if (remaining > 0) {
								this.cartService.updateCartItem(ci.id, remaining)?.subscribe?.({
									next: () => {},
									error: (err: any) => console.error('Error updating cart item after checkout:', err)
								});
							} else {
								this.cartService.removeFromCart(ci.id)?.subscribe?.({
									next: () => {},
									error: (err: any) => console.error('Error removing cart item after checkout:', err)
								});
							}
						} catch (e) {
							console.error('Error processing cart cleanup for item', ci, e);
						}
					});
				});

				// Clear legacy localStorage key and temp checkout items
				try { localStorage.removeItem('cart'); } catch (e) {}
				try { this.cartService.clearTempCheckoutItems(); } catch (e) {}

				// Refresh cart state
				try { this.cartService.getCart(); } catch (e) {}
				try { this.notificationService.showSuccess('Giỏ hàng đã được cập nhật sau khi thanh toán.'); } catch (e) {}
			}, 250);
		} catch (e) {
			console.error('processOrderCartCleanup error:', e);
			try { this.cartService.setCartToStorage([]); } catch (err) {}
			try { this.cart = []; this.cdr.markForCheck(); } catch (err) {}
		}
	}

// Toggle voucher modal (open/close)
toggleVouchersModal(open: boolean) {
	this.showVouchersModal = !!open;
	this.cdr.markForCheck();
}

ngOnInit() {
	// Load danh sách tỉnh/thành phố
	this.provinces = this.addressLocationService.getProvinces();

	// Load phương thức thanh toán từ API
	this.loadPaymentMethods();
	this.loadAvailableVouchers();

	// Tự động điền thông tin user nếu đã đăng nhập
	if (this.user && this.user.id) {
		this.fullName = this.user.name || '';
		this.email = this.user.email || '';
		this.phone = this.user.phone || '';
		
		// Load danh sách địa chỉ của user
		this.loadAddresses();

				// Initialize cart from CartService (uses per-user storage key)
				// IMPORTANT: Force reload cart from server to ensure fresh data
				try {
					// If there are items saved specifically for checkout (from Cart), prefer them.
					const storedTemp = this.cartService.getTempCheckoutItems() || [];
					if (Array.isArray(storedTemp) && storedTemp.length > 0) {
						this.cart = this.normalizeCartArray(storedTemp);
						// Prevent server cart emissions from overwriting the temp-selected checkout items
						this.ignoreCartServiceEmits = true;
					} else {
						const stored = this.cartService.getCartFromStorage() || [];
						if (Array.isArray(stored) && stored.length > 0) {
							this.cart = this.normalizeCartArray(stored);
						} else {
							// Fetch fresh cart data from server and then load from storage
							this.cartService.getCart();
							setTimeout(() => {
								this.cart = this.normalizeCartArray(this.cartService.getCartFromStorage() || []);
								this.cdr.markForCheck();
							}, 150);
						}
					}
				} catch (e) {
					this.cart = [];
				}

		// Subscribe to updates from CartService to keep cart in sync
		// This ensures we always have the latest cart data from server
		this.cartService.cartItems$.subscribe((items: any[]) => {
			// If we are currently using temp-selected items for checkout, do not overwrite
			if (this.ignoreCartServiceEmits) return;
			let newItems: any[] = [];
			if (Array.isArray(items) && items.length > 0) {
				newItems = items;
			} else {
				newItems = this.cartService.getCartFromStorage() || [];
			}
			this.cart = this.normalizeCartArray(newItems || []);
			this.cdr.markForCheck();
		});

	} else {
		this.notificationService.showError('Vui lòng đăng nhập để tiếp tục');
		this.router.navigate(['/login']);
	}

	// Reset thanh toán cũ - đảm bảo không có dữ liệu từ lần thanh toán trước
	this.resetCheckoutState();
}

/**
 * Reset trạng thái thanh toán để đảm bảo mỗi lần vào trang checkout là dữ liệu sạch
 */
private resetCheckoutState(): void {
	// Reset voucher
	this.appliedVoucher = null;
	this.voucherCode = '';
	this.voucherMessage = '';
	this.discountAmount = 0;
	
	// Reset địa chỉ mới
	this.newAddressName = '';
	this.newAddressPhone = '';
	this.newAddressText = '';
	this.newAddressProvince = '';
	this.newAddressDistrict = '';
	this.newAddressWard = '';
	
	// Reset địa chỉ thủ công
	this.manualAddressName = '';
	this.manualAddressPhone = '';
	this.manualAddressText = '';
	this.manualAddressProvince = '';
	this.manualAddressDistrict = '';
	this.manualAddressWard = '';
	
	// Reset ghi chú
	this.orderNote = '';
	
	// Reset phương thức thanh toán (người dùng phải chọn lại)
	this.selectedShippingMethod = '';
	
	// Reset phí vận chuyển mặc định
	this.shippingFee = 30000;
	
	this.cdr.markForCheck();
}

	ngOnDestroy(): void {
		try {
			const flag = sessionStorage.getItem('checkout_selected');
			if (flag) {
					// Clear the temporary checkout selection stored in temp key
					try {
						this.cartService.clearTempCheckoutItems();
					} catch (e) {
						// ignore
					}
				// Remove the flag so it doesn't trigger again
				try { sessionStorage.removeItem('checkout_selected'); } catch (e) {}
					// Allow CartService emissions again and refresh server cart/state
					this.ignoreCartServiceEmits = false;
					try { this.cartService.getCart(); } catch (e) {}
			}
		} catch (e) {
			// ignore any sessionStorage errors
		}
	}

loadAvailableVouchers() {
	this.isLoadingVouchers = true;

	this.apiService.getAvailableVouchers().subscribe({
		next: (response: any) => {
			if (response?.success && Array.isArray(response.data)) {
				this.availableVouchers = response.data.sort((a: any, b: any) => {
					const aMin = Number(a.minimumOrder || 0);
					const bMin = Number(b.minimumOrder || 0);
					return aMin - bMin;
				});
			}
			this.isLoadingVouchers = false;
		},
		error: (error) => {
			console.error('Error loading available vouchers:', error);
			this.isLoadingVouchers = false;
		}
	});
}

getVoucherMinimumOrder(voucher: any): number {
	return Number(voucher?.minimumOrder || 0);
}

isVoucherApplicable(voucher: any): boolean {
	return this.subtotal >= this.getVoucherMinimumOrder(voucher);
}

getVoucherUnavailableReason(voucher: any): string {
	const minimumOrder = this.getVoucherMinimumOrder(voucher);
	if (this.subtotal >= minimumOrder) {
		return '';
	}

	const remain = minimumOrder - this.subtotal;
	return `Mua thêm ${remain.toLocaleString('vi-VN')}đ để dùng voucher này`;
}

selectVoucher(voucher: any) {
	if (!voucher || !voucher.code) {
		return;
	}

	if (!this.isVoucherApplicable(voucher)) {
		this.notificationService.showError(this.getVoucherUnavailableReason(voucher) || 'Voucher chưa khả dụng');
		return;
	}

	this.voucherCode = voucher.code;
	this.applyVoucher();
}

loadPaymentMethods() {
	this.http.get<any>('http://localhost:3000/api/payment-methods/all').subscribe({
		next: (response: any) => {
			if (response.success && response.data) {
				// assign inside a macrotask to avoid ExpressionChangedAfterItHasBeenCheckedError
				setTimeout(() => {
					// optionally attach logos or descriptions (if available)
					this.paymentMethods = response.data.map((m: any) => ({
						...m,
						logo: this.getLogoForMethod(m.name)
					}));
					this.cdr.detectChanges();
					console.log('✅ Payment methods loaded:', this.paymentMethods);
				});
			}
		},
		error: (err: any) => {
			console.error('❌ Error loading payment methods:', err);
		}
	});
}

// Return optional logo path for known payment method names (placeholders)
getLogoForMethod(name: string) {
	if (!name) return null;
	const lower = name.toLowerCase();
	if (lower.includes('vnpay')) return '/assets/images/vnpay.png';
	if (lower.includes('momo')) return '/assets/images/momo.png';
	if (lower.includes('cod')) return '/assets/images/cod.png';
	if (lower.includes('credit') || lower.includes('card')) return '/assets/images/visa.png';
	if (lower.includes('bank')) return '/assets/images/bank.png';
	return null;
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
		// Coerce numeric-like strings (remove currency characters, commas)
		const parseNumber = (v: any) => {
			if (v == null) return undefined;
			if (typeof v === 'number') return Number.isFinite(v) ? v : undefined;
			const s = String(v).trim();
			if (!s) return undefined;
			// remove anything that's not digit, dot or minus
			const cleaned = s.replace(/[^0-9.-]+/g, '');
			const n = Number(cleaned);
			return Number.isFinite(n) ? n : undefined;
		};

		// Candidate fields to check (including totals)
		const candidates = [
			item.priceSale,
			item.salePrice,
			item.price,
			item.price_sale,
			item.unit_price,
			item.original_price,
			item.cost,
			item.product_price,
			item.variant?.price,
			item.variant?.priceSale,
			item.variant?.price_sale,
			item.product?.price,
			item.finalPrice,
			item.final_price,
			item.total_price,
			item.totalPrice
		];

		let price = 0;
		for (const c of candidates) {
			const n = parseNumber(c);
			if (n !== undefined && n > 0) { price = n; break; }
		}

		// If only total_price exists, divide by quantity to obtain unit price
		if ((!price || price <= 0) && (item.total_price || item.totalPrice)) {
			const tp = parseNumber(item.total_price ?? item.totalPrice);
			const q = parseNumber(item.quantity ?? item.qty ?? item.count) || 1;
			if (tp !== undefined && q > 0) price = tp / q;
		}

		const qty = parseNumber(item.quantity ?? item.qty ?? item.count) || 0;
		return sum + price * qty;
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
		voucher_code: this.appliedVoucher?.code || null,
		payment_method: this.selectedShippingMethod,  // Payment method từ form
		delivery: this.selectedShippingMethod,  // Shipping method/delivery type
		note: this.orderNote,  // Ghi chú đơn hàng
address_id: this.selectedAddressId || null,
			delivery_address: this.address,
			// flag to indicate backend should skip immediate confirmation email
			skipEmail: false
	};

	// Debug: log the constructed order payload before sending to backend
	console.log('[DEBUG checkout] orderData prepared:', JSON.parse(JSON.stringify(orderData)));

	// Sanitize and validate items before sending to backend
	const sanitizedItems = (orderData.items || []).map((it: any) => ({
		variant_id: Number(it.variant_id),
		quantity: Number(it.quantity),
		price: Number(it.price)
	}));

	// Validate items
	if (!Array.isArray(sanitizedItems) || sanitizedItems.length === 0) {
		this.isLoading = false;
		this.notificationService.showError('Danh sách sản phẩm rỗng. Vui lòng kiểm tra giỏ hàng.');
		return;
	}

	for (const it of sanitizedItems) {
		if (!Number.isFinite(it.variant_id) || it.variant_id <= 0) {
			this.isLoading = false;
			this.notificationService.showError('Một sản phẩm trong giỏ có variant_id không hợp lệ.');
			return;
		}
		if (!Number.isFinite(it.quantity) || it.quantity <= 0) {
			this.isLoading = false;
			this.notificationService.showError('Một sản phẩm trong giỏ có số lượng không hợp lệ.');
			return;
		}
		if (!Number.isFinite(it.price) || isNaN(it.price)) {
			this.isLoading = false;
			this.notificationService.showError('Một sản phẩm trong giỏ có giá không hợp lệ.');
			return;
		}
	}

	// Replace items with sanitized version
	orderData.items = sanitizedItems;


	// Determine selected payment method
	// Resolve selected payment method object (prefer server-provided entry)
	const selectedMethodObj = this.paymentMethods.find((m: any) => m.name === this.selectedShippingMethod) || { id: null, name: this.selectedShippingMethod };
	const selectedName = (selectedMethodObj.name || '').toLowerCase();
	console.log('[checkout] selectedMethodObj=', selectedMethodObj);
	const isCod = /\bcod\b/.test(selectedName);
	// Safer matcher: split words to avoid accidental substring matches (e.g., 'vinmomo-vnp' etc)
	const tokenize = (s: string) => (s || '').toLowerCase().split(/[^a-z0-9]+/).filter(Boolean);
	const tokens = tokenize(selectedName);
	const hasToken = (tok: string) => tokens.includes(tok);
	// Check MoMo first
	if (hasToken('momo')) {
		// If user selected MoMo, create order then call backend to get MoMo pay URL and redirect
			// mark that we will handle email on MoMo callback instead of immediately
			orderData.skipEmail = true;
			this.orderService.checkout(orderData).subscribe({
			next: (orderResp: any) => {
				if (!orderResp?.success || !orderResp?.data?.id) {
					this.isLoading = false;
					this.notificationService.showError(orderResp?.message || 'Không thể tạo đơn hàng trước khi thanh toán MoMo');
					return;
				}

				const createdOrder = orderResp.data;
				const uniqueOrderId = `${createdOrder.id}-${Date.now()}`;
				console.log('[checkout] calling /api/payments/momo/create with orderId=', uniqueOrderId, 'amount=', Number(createdOrder.total_price) || this.totalAmount);
				this.http.post<any>('http://localhost:3000/api/payments/momo/create', {
					amount: Number(createdOrder.total_price) || this.totalAmount,
					orderId: String(uniqueOrderId),
					orderInfo: `Thanh toan don hang #${createdOrder.id}`
				}).subscribe({
					next: (resp) => {
						this.isLoading = false;
						if (resp && resp.success && resp.url) {
							window.location.href = resp.url;
						} else {
							this.notificationService.showError('Không thể tạo đường dẫn MoMo.');
							console.error('MoMo create response:', resp);
						}
					},
					error: (err) => {
						this.isLoading = false;
						console.error('MoMo create error:', err);
						this.notificationService.showError('Lỗi khi khởi tạo thanh toán MoMo');
					}
				});
			},
			error: (error: any) => {
					this.isLoading = false;
					console.error('Checkout before MoMo error:', error);
					this.handleOrderCreateError(error, 'MoMo');
			}
		});
		return;
	}

	// If user selected VNPay, call backend to create VNPay payment URL and redirect
	if (hasToken('vnp') || hasToken('vnpay')) {
			// mark that we will handle email on VNPay callback instead of immediately
			orderData.skipEmail = true;
			// Create order first so order + order_details are persisted before redirecting to VNPay
			this.orderService.checkout(orderData).subscribe({
			next: (orderResp: any) => {
				if (!orderResp?.success || !orderResp?.data?.id) {
					this.isLoading = false;
					this.notificationService.showError(orderResp?.message || 'Không thể tạo đơn hàng trước khi thanh toán VNPay');
					return;
				}

				const createdOrder = orderResp.data;
				console.log('[checkout] calling /api/payments/vnpay/create with orderId=', createdOrder.id, 'amount=', Number(createdOrder.total_price) || this.totalAmount);
				this.http.post<any>('http://localhost:3000/api/payments/vnpay/create', {
amount: Number(createdOrder.total_price) || this.totalAmount,
					orderId: String(createdOrder.id),
					orderInfo: `Thanh toan don hang #${createdOrder.id}`
				}).subscribe({
					next: (resp) => {
						this.isLoading = false;
						if (resp && resp.success && resp.url) {
							window.location.href = resp.url;
						} else {
							this.notificationService.showError('Không thể tạo đường dẫn VNPay.');
						}
					},
					error: (err) => {
						this.isLoading = false;
						console.error('VNPay create error:', err);
						this.notificationService.showError('Lỗi khi khởi tạo thanh toán VNPay');
					}
				});
			},
			error: (error: any) => {
					this.isLoading = false;
					console.error('Checkout before VNPay error:', error);
					this.handleOrderCreateError(error, 'VNPay');
			}
		});
		return;
	}

	// (MoMo flow handled earlier with tokenized matching)

	// default: regular checkout
	this.orderService.checkout(orderData).subscribe({
		next: (response: any) => {
			if (response.success) {
				const successMessage = isCod ? 'Đặt hàng thành công' : 'Đặt hàng thành công!';
				this.notificationService.showSuccess(successMessage, 4000);

				if (isCod) {
					alert('Đặt hàng thành công');
				}
				// Instead of clearing the whole cart immediately, subtract purchased items
				// Use the created order returned by the API (response.data)
				try {
					const createdOrder = response.data;
					if (createdOrder && createdOrder.id) {
						this.processOrderCartCleanup(createdOrder);
					} else {
						// fallback: clear local cart
						this.cartService.setCartToStorage([]);
						this.cart = [];
						this.cdr.markForCheck();
					}
					this.router.navigate(['/orders']);
				} catch (e) {
					console.error('Error during post-checkout cart cleanup:', e);
					this.cartService.setCartToStorage([]);
					this.cart = [];
					this.cdr.markForCheck();
					this.router.navigate(['/orders']);
				}
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
