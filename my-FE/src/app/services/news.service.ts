import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface NewsItem {
  id: number;
  title: string;
  slug?: string | null;
  summary?: string | null;
  content?: string | null;
  imageUrl?: string | null;
  image_url?: string | null;
  status: 0 | 1 | number;
  isFeatured?: 0 | 1 | number;
  is_featured?: 0 | 1 | number;
  authorName?: string | null;
  author_name?: string | null;
  publishedAt?: string | null;
  published_at?: string | null;
  createdAt?: string | null;
  created_at?: string | null;
  updatedAt?: string | null;
  updated_at?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class NewsService {
  private apiUrl = 'http://localhost:3000/api/admin/news';

  constructor(private http: HttpClient) {}

  getApiBase(): string {
    // return base host for backend (e.g. http://localhost:3000)
    try {
      return this.apiUrl.replace(/\/api.*$/i, '');
    } catch (e) {
      return this.apiUrl;
    }
  }

  private getAuthHeaders(): HttpHeaders {
    const token = localStorage.getItem('authToken');
    return new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    });
  }

  getAllNews(): Observable<any> {
    return this.http.get<any>(this.apiUrl, { headers: this.getAuthHeaders() });
  }

  getNewsDetail(id: number): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }

  createNews(data: Partial<NewsItem>): Observable<any> {
    return this.http.post<any>(this.apiUrl, data, { headers: this.getAuthHeaders() });
  }

  uploadImage(formData: FormData): Observable<any> {
    // For multipart, only send Authorization header (let the browser set Content-Type)
    const token = localStorage.getItem('authToken');
    const headers = new HttpHeaders({ 'Authorization': token ? `Bearer ${token}` : '' });
    return this.http.post<any>(`${this.apiUrl}/upload`, formData, { headers });
  }

  updateNews(id: number, data: Partial<NewsItem>): Observable<any> {
    return this.http.put<any>(`${this.apiUrl}/${id}`, data, { headers: this.getAuthHeaders() });
  }

  deleteNews(id: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${id}`, { headers: this.getAuthHeaders() });
  }
}
