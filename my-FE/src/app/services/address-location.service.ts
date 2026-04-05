import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AddressLocationService {
  
  // Dữ liệu địa chỉ Việt Nam (Tỉnh/Thành phố, Quận/Huyện, Phường/Xã)
  private locations: { [key: string]: { [key: string]: string[] } } = {
    'TP. Hồ Chí Minh': {
      'Quận 1': ['Phường Bến Nghé', 'Phường Bến Thành', 'Phường Cầu Kho', 'Phường Cầu Ông Lãnh', 'Phường Dạ Kao', 'Phường Nguyễn Cư Trinh', 'Phường Tân Định'],
      'Quận 2': ['Phường An Khánh', 'Phường An Phú', 'Phường Bình An', 'Phường Bình Trưng Đông', 'Phường Bình Trưng Tây', 'Phường Cát Lái', 'Phường Thạnh Mỹ Lợi', 'Phường Thảo Điền'],
      'Quận 3': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14'],
      'Quận 4': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 16'],
      'Quận 5': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15'],
      'Quận 6': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12'],
      'Quận 7': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14'],
      'Quận 8': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 16'],
      'Quận 9': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13'],
      'Quận 10': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15', 'Phường 16'],
      'Quận 11': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15'],
      'Quận 12': ['Tân Thới Hiệp', 'Tân Hưng Thuận Đông', 'Tân Hưng Thuận Tây', 'Thạnh Lộc', 'Thạnh Xuân', 'Trung Mỹ Tây'],
      'Quận Thủ Đức': ['Phường An Khánh', 'Phường An Lợi Đông', 'Phường An Phú', 'Phường Bình Chiểu', 'Phường Bình Thạnh', 'Phường Bình Trưng Đông', 'Phường Bình Trưng Tây', 'Phường Cát Lái', 'Phường Linh Chiểu', 'Phường Linh Đông', 'Phường Linh Trung', 'Phường Phú Hữu', 'Phường Tân Phú', 'Phường Thạnh Mỹ Lợi', 'Phường Thảo Điền'],
      'Bình Thạnh': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15'],
      'Gò Vấp': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13'],
      'Phú Nhuận': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15'],
      'Tân Bình': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14', 'Phường 15'],
      'Tân Phú': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12', 'Phường 13', 'Phường 14'],
      'Hóc Môn': ['Tân Hiệp', 'Tân Thượng', 'Trung An', 'Xuân Thới Đông', 'Xuân Thới Tây'],
      'Cần Thơ': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7'],
      'Bình Tân': ['Phường 1', 'Phường 2', 'Phường 3', 'Phường 4', 'Phường 5', 'Phường 6', 'Phường 7', 'Phường 8', 'Phường 9', 'Phường 10', 'Phường 11', 'Phường 12'],
      'Nhà Bè': ['Phường An Khánh', 'Phường An Lạc', 'Phường Nhơn Đức', 'Phường Phú Xuân', 'Phường Thạnh An'],
      'Củ Chi': ['Tân An', 'Tân Phú', 'Tân Thạnh', 'Tân Túc', 'Thạnh Mỹ Lợi', 'Trung Lập Thượng', 'Trung Lập Hạ'],
      'Bình Dương': ['Thứ nhất', 'Thứ hai'],
    },
    'Hà Nội': {
      'Ba Đình': ['Phường Cống Vị', 'Phường Điện Biên', 'Phường Kim Mã', 'Phường Liễu Giai', 'Phường Ngọc Hà', 'Phường Quảng An', 'Phường Thành Công'],
      'Hoàn Kiếm': ['Phường Cửa Đông', 'Phường Cửa Nam', 'Phường Hàng Bạc', 'Phường Hàng Buồm', 'Phường Hàng Đào', 'Phường Hàng Gai', 'Phường Hàng Mã', 'Phường Hàng Trống', 'Phường Lý Thái Tổ', 'Phường Thanh Nên', 'Phường Tràng Tiền'],
      'Hai Bà Trưng': ['Phường Bách Khoa', 'Phường Đồng Tàn', 'Phường Minh Khai', 'Phường Thanh Luận', 'Phường Thổ Tân', 'Phường Vĩnh Tuy'],
      'Đống Đa': ['Phường Phương Mai', 'Phường Quang Trung', 'Phường Thành Công', 'Phường Thổ Tân', 'Phường Trần Phú', 'Phường Văn Chương'],
      'Thanh Xuân': ['Phường Khuê Trung', 'Phường Nhân Chính', 'Phường Phương Canh', 'Phường Phúc Diễn', 'Phường Quỳnh Lôi', 'Phường Thanh Xuân Nam', 'Phường Thanh Xuân Trung'],
      'Cầu Giấy': ['Phường Dịch Vọng', 'Phường Dịch Vọng Hậu', 'Phường Láng Hạc', 'Phường Mai Dịch', 'Phường Mỹ Đình', 'Phường Quan Hoa', 'Phường Trung Hòa', 'Phường Yên Hoà'],
    },
    'Đà Nẵng': {
      'Hải Châu': ['Phường Bình Hiên', 'Phường Bình Thuận', 'Phường Hòa Cường Bắc', 'Phường Hòa Cường Nam', 'Phường Hòa Khương', 'Phường Thạch Thang'],
      'Thanh Khê': ['Phường Chính Gián', 'Phường Hòa An', 'Phường Tân Chính', 'Phường Thạc Gián', 'Phường Thanh Khê Đông', 'Phường Thanh Khê Tây'],
      'Sơn Trà': ['Phường An Hải Bắc', 'Phường An Hải Đông', 'Phường An Hải Tây', 'Phường Mân Thái', 'Phường Nại Hiên Đông', 'Phường Thọ Quang'],
    }
  };

  constructor() { }

  // Lấy danh sách tỉnh/thành phố
  getProvinces(): string[] {
    return Object.keys(this.locations).sort();
  }

  // Lấy danh sách quận/huyện theo tỉnh
  getDistricts(province: string): string[] {
    if (!province || !this.locations[province]) {
      return [];
    }
    return Object.keys(this.locations[province]).sort();
  }

  // Lấy danh sách phường/xã theo quận
  getWards(province: string, district: string): string[] {
    if (!province || !district || !this.locations[province] || !this.locations[province][district]) {
      return [];
    }
    return this.locations[province][district].sort();
  }
}
