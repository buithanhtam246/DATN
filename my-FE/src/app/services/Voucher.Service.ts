import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Voucher {
  id: number;
  code: string;           // Map từ code_voucher
  name: string;           // Map từ name_voucher
  discountType: 'percentage' | 'fixed'; 
  discountValue: number;  
  maxValue?: number | null;     // Map từ max_value
  minimumOrder: number;
  quantity: number;
  startDate?: string;     // Map từ start_date
  endDate: string;        // Map từ promotion_date
}

@Injectable({ providedIn: 'root' })
export class VoucherService {
  // Đảm bảo cổng 3000 khớp với Port Backend của bạn
  private apiUrl = 'http://localhost:3000/api/admin/vouchers'; 

  constructor(private http: HttpClient) {}

  getAllVouchers(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}`);
  }

  createVoucher(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}`, data);
  }

  deleteVoucher(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
}