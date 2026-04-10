import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ApiService } from '../../services/api.service';
import { environment } from '../../../environments/environment';

export interface FavoriteItem {
  id: number | string;
  name?: string;
  image?: string;
  price?: number | string;
  [key: string]: any;
}

@Injectable({ providedIn: 'root' })
export class FavoritesService {
  private storageKey = 'favorites';
  private countsKey = 'favoriteCounts';
  private _items$ = new BehaviorSubject<FavoriteItem[]>(this.readFromStorage());
  private _counts$ = new BehaviorSubject<Record<string, number>>(this.readCountsFromStorage());

  public readonly items$ = this._items$.asObservable();
  public readonly counts$ = this._counts$.asObservable();

  constructor(private api: ApiService) {
    // If user is authenticated, try to sync favorites from server
    if (this.isAuthenticated()) {
      this.syncFromServer();
    }
  }

  private isAuthenticated(): boolean {
    return !!localStorage.getItem('authToken');
  }

  private readFromStorage(): FavoriteItem[] {
    try {
      const raw = localStorage.getItem(this.storageKey);
      if (!raw) return [];
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  }

  private writeToStorage(items: FavoriteItem[]) {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(items));
    } catch (e) {
      // ignore write errors
    }
  }

  private readCountsFromStorage(): Record<string, number> {
    try {
      const raw = localStorage.getItem(this.countsKey);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (e) {
      return {};
    }
  }

  private writeCountsToStorage(map: Record<string, number>) {
    try {
      localStorage.setItem(this.countsKey, JSON.stringify(map));
    } catch (e) {
      // ignore
    }
  }

  private syncFromServer(): void {
    this.api.getFavorites().subscribe({
      next: (res: any) => {
        try {
          if (!res) return;
          const data = res.data || res;
          // If backend returns product details, map to FavoriteItem
          if (Array.isArray(data.products) && data.products.length > 0) {
            const items = data.products.map((p: any) => ({
              id: p.id,
              name: p.title || p.name || p.title || '',
              image: this.resolveImageUrl(p.imageUrl || p.image || ''),
              price: p.price || p.minPrice || 0
            }));
            this._items$.next(items);
            this.writeToStorage(items);
            return;
          }

          // Fallback: backend returned favorites rows with product_id
          if (Array.isArray(data.favorites) && data.favorites.length > 0) {
            const items = data.favorites.map((f: any) => ({ id: f.product_id, image: '' }));
            this._items$.next(items);
            this.writeToStorage(items);
            return;
          }
        } catch (e) {
          console.warn('Favorites sync parse error', e);
        }
      },
      error: (err) => {
        // ignore sync errors
        console.warn('Favorites sync error', err?.message || err);
      }
    });
  }

  private resolveImageUrl(raw?: string | null): string {
    if (!raw) return '';
    const s = String(raw).trim();
    if (!s) return '';
    if (s.startsWith('http://') || s.startsWith('https://')) return s;
    // If already contains public path, return as-is but ensure absolute
    if (s.includes('/public/') || s.includes('/images/')) {
      // if starts with slash, prefix assetsBaseUrl
      if (s.startsWith('/')) return `${environment.assetsBaseUrl}${s}`;
      return `${environment.assetsBaseUrl}/${s}`;
    }
    // Otherwise assume it's a filename under /public/images/products/
    return `${environment.assetsBaseUrl}/public/images/products/${s}`;
  }

  getAll(): FavoriteItem[] {
    return this._items$.getValue();
  }

  isFavorite(id: number | string): boolean {
    return this.getAll().some(i => String(i.id) === String(id));
  }

  add(item: FavoriteItem): void {
    const items = this.getAll();
    if (!items.some(i => String(i.id) === String(item.id))) {
      const next = [item, ...items];
      this._items$.next(next);
      this.writeToStorage(next);
      // increment count locally
      this.incrementCount(item.id);

      // Sync to backend if authenticated (optimistic)
      if (this.isAuthenticated()) {
        this.api.addFavorite(Number(item.id)).subscribe({
          next: () => {},
          error: (err) => { console.warn('addFavorite API failed', err); }
        });
      }
    }
  }

  remove(id: number | string): void {
    const items = this.getAll();
    const next = items.filter(i => String(i.id) !== String(id));
    this._items$.next(next);
    this.writeToStorage(next);
    // decrement count locally
    this.decrementCount(id);

    if (this.isAuthenticated()) {
      this.api.removeFavorite(Number(id)).subscribe({
        next: () => {},
        error: (err) => { console.warn('removeFavorite API failed', err); }
      });
    }
  }

  toggle(item: FavoriteItem): boolean {
    if (this.isFavorite(item.id)) {
      this.remove(item.id);
      return false;
    }
    this.add(item);
    return true;
  }

  // ====== Counts API ======
  getCount(id: number | string): number {
    const map = this._counts$.getValue();
    return map[String(id)] || 0;
  }

  incrementCount(id: number | string): void {
    const map = { ...this._counts$.getValue() };
    const key = String(id);
    map[key] = (map[key] || 0) + 1;
    this._counts$.next(map);
    this.writeCountsToStorage(map);
  }

  decrementCount(id: number | string): void {
    const map = { ...this._counts$.getValue() };
    const key = String(id);
    if (!map[key]) return;
    map[key] = Math.max(0, (map[key] || 0) - 1);
    this._counts$.next(map);
    this.writeCountsToStorage(map);
  }
}
