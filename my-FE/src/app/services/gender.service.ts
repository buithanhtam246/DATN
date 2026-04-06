import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Gender {
  id: number;
  name: string;
  code: string;
  icon: string;
  description: string;
  status: 'active' | 'inactive';
}

@Injectable({
  providedIn: 'root'
})
export class GenderService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/admin/genders';

  // Lấy tất cả giới tính
  getAllGenders(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // Lấy giới tính theo ID
  getGenderById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  // Thêm giới tính mới
  createGender(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  // Cập nhật giới tính
  updateGender(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  // Xóa giới tính
  deleteGender(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
