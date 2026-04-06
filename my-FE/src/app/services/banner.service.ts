import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class BannerService {
  private readonly baseUrl = 'http://localhost:3000/api/admin/banners';
  public readonly categoryBannerImgBaseUrl = 'http://localhost:3000/uploads/category-banners/';

  constructor(private http: HttpClient) {}

  getCategoryBanners(): Observable<any> {
    return this.http.get(`${this.baseUrl}/categories`);
  }

  createCategoryBanner(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/categories`, formData);
  }

  updateCategoryBanner(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl}/categories/${id}`, formData);
  }

  deleteCategoryBanner(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/categories/${id}`);
  }

  getSportBanners(): Observable<any> {
    return this.http.get(`${this.baseUrl}/sports`);
  }

  createSportBanner(formData: FormData): Observable<any> {
    return this.http.post(`${this.baseUrl}/sports`, formData);
  }

  updateSportBanner(id: number, formData: FormData): Observable<any> {
    return this.http.put(`${this.baseUrl}/sports/${id}`, formData);
  }

  deleteSportBanner(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/sports/${id}`);
  }
}
