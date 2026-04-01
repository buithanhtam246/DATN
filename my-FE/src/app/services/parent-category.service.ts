import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface ParentCategory {
  id: number;
  name: string;
  gender: 'male' | 'female' | 'unisex';
  status: 'active' | 'inactive';
  isParent?: boolean;
  children?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ParentCategoryService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/admin/categories';

  // Lấy tất cả danh mục cấp 1
  getParentCategories(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/parents`);
  }

  // Thêm danh mục cấp 1
  createParentCategory(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/parent`, data);
  }

  // Cập nhật danh mục cấp 1
  updateParentCategory(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  // Xóa danh mục cấp 1
  deleteParentCategory(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}
