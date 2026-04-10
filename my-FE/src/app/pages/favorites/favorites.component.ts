import { Component, inject, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FavoritesService } from '../../core/services/favorites.service';
import { Subscription } from 'rxjs';

/**
 * Favorites Page
 * Hiển thị danh sách sản phẩm yêu thích của người dùng.
 * Lúc đầu sẽ hiển thị placeholder nếu chưa có sản phẩm.
 */
@Component({
  selector: 'app-favorites',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './favorites.component.html',
  styleUrls: ['./favorites.component.scss']
})
export class FavoritesComponent {
  // TODO: kết nối service để lấy danh sách yêu thích từ backend/localStorage
  public favorites = [] as any[];
  private favService = inject(FavoritesService);
  private sub: Subscription | null = null;
  // track ids currently fading out
  public removingIds = new Set<number | string>();

  constructor() {
    this.sub = this.favService.items$.subscribe(list => {
      this.favorites = Array.isArray(list) ? list : [];
    });
  }

  isRemoving(id: number | string) {
    return this.removingIds.has(id);
  }

  removeWithFade(item: any) {
    const id = item?.id;
    if (id === undefined || id === null) return;

    // If already removing, ignore
    if (this.removingIds.has(id)) return;

    // mark as removing to apply CSS fade
    this.removingIds.add(id);

    // wait for CSS transition to finish, then remove from service (which persists)
    const TRANSITION_MS = 360; // match CSS below
    setTimeout(() => {
      this.favService.remove(id);
      this.removingIds.delete(id);
    }, TRANSITION_MS);
  }

  onHeartClick(event: Event, item: any) {
    // prevent link navigation when clicking heart inside anchor
    event.preventDefault();
    event.stopPropagation();
    this.removeWithFade(item);
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }
}
