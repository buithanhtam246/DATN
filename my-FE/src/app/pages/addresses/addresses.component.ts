import { Component, OnInit, ChangeDetectionStrategy, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UserService } from '../../services/user.service';
import { AuthService } from '../../services/auth.service';
import { NotificationService } from '../../services/notification.service';
import { AddressLocationService } from '../../services/address-location.service';

@Component({
  selector: 'app-addresses',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './addresses.component.html',
  styleUrls: ['./addresses.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class AddressesComponent implements OnInit {
  addresses: any[] = [];
  user: any = null;
  isLoading = false;
  showForm = false;
  isEditing = false;
  editingId: number | null = null;

  // Address location
  provinces: string[] = [];
  districts: string[] = [];
  wards: string[] = [];

  formData = {
    receiver_name: '',
    receiver_phone: '',
    province: '',
    district: '',
    ward: '',
    address_detail: '',
    full_address: '',
    is_default: false
  };

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private router: Router,
    private notificationService: NotificationService,
    private addressLocationService: AddressLocationService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    if (!this.authService.isLoggedIn()) {
      this.router.navigate(['/login']);
      return;
    }

    // Initialize current user from localStorage (if present)
    try {
      const stored = localStorage.getItem('user');
      this.user = stored ? JSON.parse(stored) : null;
    } catch (e) {
      this.user = null;
    }

    // Load provinces
    this.provinces = this.addressLocationService.getProvinces();

    this.loadAddresses();
  }

  loadAddresses() {
    this.isLoading = true;
    this.userService.getAddresses().subscribe({
      next: (response: any) => {
        if (response && response.success) {
          this.addresses = response.data || [];
          console.log('Addresses loaded:', this.addresses);
        } else {
          this.notificationService.showError('Không thể tải danh sách địa chỉ');
        }
        this.isLoading = false;
        this.cdr.markForCheck();
      },
      error: (err: any) => {
        console.error('Error loading addresses:', err);
        this.notificationService.showError('Lỗi khi tải danh sách địa chỉ');
        this.isLoading = false;
        this.cdr.markForCheck();
      }
    });
  }

  toggleForm() {
    this.showForm = !this.showForm;
    if (!this.showForm) {
      this.resetForm();
    }
    this.cdr.markForCheck();
  }

  editAddress(address: any) {
    this.isEditing = true;
    this.editingId = address.id;
    
    // Parse full_address to extract province, district, ward, detail
    const parts = address.full_address.split(',').map((p: string) => p.trim());
    
    this.formData = {
      receiver_name: address.receiver_name,
      receiver_phone: address.receiver_phone,
      province: parts[3] || '',
      district: parts[2] || '',
      ward: parts[1] || '',
      address_detail: parts[0] || '',
      full_address: address.full_address,
      is_default: address.is_default
    };
    
    // Load districts and wards if province is set
    if (this.formData.province) {
      this.districts = this.addressLocationService.getDistricts(this.formData.province);
      if (this.formData.district) {
        this.wards = this.addressLocationService.getWards(this.formData.province, this.formData.district);
      }
    }
    
    this.showForm = true;
    this.cdr.markForCheck();
  }

  resetForm() {
    this.formData = {
      receiver_name: '',
      receiver_phone: '',
      province: '',
      district: '',
      ward: '',
      address_detail: '',
      full_address: '',
      is_default: false
    };
    this.isEditing = false;
    this.editingId = null;
    this.districts = [];
    this.wards = [];
  }

  saveAddress() {
    // Validation
    if (!this.formData.receiver_name.trim()) {
      this.notificationService.showError('Vui lòng nhập tên người nhận');
      return;
    }
    if (!this.formData.receiver_phone.trim()) {
      this.notificationService.showError('Vui lòng nhập số điện thoại');
      return;
    }
    if (!this.formData.province) {
      this.notificationService.showError('Vui lòng chọn tỉnh/thành phố');
      return;
    }
    if (!this.formData.district) {
      this.notificationService.showError('Vui lòng chọn quận/huyện');
      return;
    }
    if (!this.formData.ward) {
      this.notificationService.showError('Vui lòng chọn phường/xã');
      return;
    }
    if (!this.formData.address_detail.trim()) {
      this.notificationService.showError('Vui lòng nhập chi tiết địa chỉ');
      return;
    }

    // Build full_address from parts
    this.formData.full_address = `${this.formData.address_detail}, ${this.formData.ward}, ${this.formData.district}, ${this.formData.province}`;

    const addressPayload = {
      receiver_name: this.formData.receiver_name,
      receiver_phone: this.formData.receiver_phone,
      full_address: this.formData.full_address,
      is_default: this.formData.is_default
    };

    if (this.isEditing && this.editingId) {
      // Update existing address
      this.userService.updateAddress({ id: this.editingId, ...addressPayload }).subscribe({
        next: (response: any) => {
          if (response && response.success) {
            this.notificationService.showSuccess('Cập nhật địa chỉ thành công');
            this.loadAddresses();
            this.showForm = false;
            this.resetForm();
          } else {
            this.notificationService.showError(response?.message || 'Cập nhật thất bại');
          }
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          console.error('Error updating address:', err);
          this.notificationService.showError('Lỗi khi cập nhật địa chỉ');
          this.cdr.markForCheck();
        }
      });
    } else {
      // Create new address
      this.userService.addAddress(addressPayload).subscribe({
        next: (response: any) => {
          if (response && response.success) {
            this.notificationService.showSuccess('Thêm địa chỉ thành công');
            this.loadAddresses();
            this.showForm = false;
            this.resetForm();
          } else {
            this.notificationService.showError(response?.message || 'Thêm địa chỉ thất bại');
          }
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          console.error('Error adding address:', err);
          this.notificationService.showError('Lỗi khi thêm địa chỉ');
          this.cdr.markForCheck();
        }
      });
    }
  }

  deleteAddress(addressId: number) {
    if (confirm('Bạn chắc chắn muốn xóa địa chỉ này?')) {
      this.userService.deleteAddress(addressId).subscribe({
        next: (response: any) => {
          if (response && response.success) {
            this.notificationService.showSuccess('Xóa địa chỉ thành công');
            this.loadAddresses();
          } else {
            this.notificationService.showError(response?.message || 'Xóa thất bại');
          }
          this.cdr.markForCheck();
        },
        error: (err: any) => {
          console.error('Error deleting address:', err);
          this.notificationService.showError('Lỗi khi xóa địa chỉ');
          this.cdr.markForCheck();
        }
      });
    }
  }

  onProvinceChange(province: string) {
    this.formData.province = province;
    this.formData.district = '';
    this.formData.ward = '';
    this.districts = this.addressLocationService.getDistricts(province);
    this.wards = [];
  }

  onDistrictChange(district: string) {
    this.formData.district = district;
    this.formData.ward = '';
    this.wards = this.addressLocationService.getWards(this.formData.province, district);
  }

  onWardChange(ward: string) {
    this.formData.ward = ward;
  }

  goBack() {
    this.router.navigate(['/account']);
  }
}
