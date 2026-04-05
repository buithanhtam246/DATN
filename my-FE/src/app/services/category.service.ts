import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Category {
  id: number;
  name: string;
  gender: 'male' | 'female' | 'unisex';
  status: 'active' | 'inactive';
  isParent?: boolean;
  parent_id?: number | null;
  children?: Category[];
}

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:3000/api/admin/categories';

  // Lấy tất cả danh mục (cấp 1 + cấp 2)
  getAllCategories(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  // Lấy danh mục cấp 1 (Nam/Nữ)
  getParentCategories(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/parents`);
  }

  // Lấy danh mục con theo parent_id
  getSubCategories(parentId: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/children/${parentId}`);
  }

  // Tạo danh mục cấp 1 (Nam/Nữ)
  createParentCategory(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/parent`, data);
  }

  // Tạo danh mục cấp 2 (con)
  createSubCategory(data: any): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/child`, data);
  }

  // Cập nhật danh mục
  updateCategory(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  // Xóa danh mục
  deleteCategory(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }

  // Legacy methods
  getCategoryById(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`);
  }

  createCategory(name: string, status: boolean = true): Observable<any> {
    return this.http.post<any>(this.apiUrl, {
      name,
      status: status ? 1 : 0
    });
  }
}