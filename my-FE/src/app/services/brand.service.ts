import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface Brand {
  id: number;
  name: string;
  status: 'active' | 'inactive';
}

@Injectable({
  providedIn: 'root'
})
export class BrandService {
  // URL đã gộp theo đúng hình image_1a912d.png của bạn
  private apiUrl = 'http://localhost:3000/api/admin/brands';

  constructor(private http: HttpClient) { }

  getAllBrands(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }

  createBrand(data: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, data);
  }

  updateBrand(id: number, data: any): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data);
  }

  deleteBrand(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`);
  }
}