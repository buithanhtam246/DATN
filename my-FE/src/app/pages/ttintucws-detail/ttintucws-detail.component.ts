import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { NewsService, NewsItem } from '../../services/news.service';

@Component({
  selector: 'app-ttintucws-detail',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './ttintucws-detail.component.html',
  styleUrls: ['./ttintucws-detail.component.scss']
})
export class TtintucwsDetailComponent implements OnInit {
  public article: NewsItem | null = null;
  public isLoading = true;
  public sanitizedContent: SafeHtml | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private newsService: NewsService,
    private sanitizer: DomSanitizer
  ) {}

  ngOnInit(): void {
    this.route.paramMap.subscribe(params => {
      const idOrSlug = params.get('id');
      if (!idOrSlug) return;
      this.loadArticle(idOrSlug);
    });
  }

  private loadArticle(idOrSlug: string): void {
    this.isLoading = true;
    const maybeId = Number(idOrSlug);

    // Try to resolve the article from the list endpoint first (supports slug or id)
    this.newsService.getAllNews().subscribe({
      next: (res: any) => {
        const items: any[] = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : (res?.rows ?? []));
        // backend service.getAllNews() usually returns array of items
        const found = (items || []).find((it: any) => {
          if (!it) return false;
          if (Number.isFinite(maybeId) && maybeId > 0 && Number(it.id) === maybeId) return true;
          if (it.slug && String(it.slug) === String(idOrSlug)) return true;
          return false;
        });

        if (found) {
          const article = found;
          let raw = article.image_url ?? article.imageUrl ?? '';
          if (!raw) raw = '/assets/images/news/default.jpg';
          const base = (() => { try { return this.newsService.getApiBase(); } catch (e) { return ''; }})();
          let final = raw;
          if (typeof final === 'string' && final.startsWith('/') && !/^https?:\/\//i.test(final)) {
            final = base ? base + final : final;
          }
          this.article = { ...article, imageUrl: final } as NewsItem;
          this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(this.article.content || this.article.summary || '');
          this.isLoading = false;
          return;
        }

        // Not found from list, fall back to detail endpoint (may return more fields)
        const param: any = Number.isFinite(maybeId) && maybeId > 0 ? maybeId : idOrSlug;
        this.newsService.getNewsDetail(param).subscribe({
          next: (res2: any) => {
            let data = res2?.data ?? res2;
            if (data?.data) data = data.data;
            const article2 = Array.isArray(data) ? data[0] : data;
            if (article2) {
              let raw = article2.image_url ?? article2.imageUrl ?? '';
              if (!raw) raw = '/assets/images/news/default.jpg';
              const base = (() => { try { return this.newsService.getApiBase(); } catch (e) { return ''; }})();
              let final = raw;
              if (typeof final === 'string' && final.startsWith('/') && !/^https?:\/\//i.test(final)) {
                final = base ? base + final : final;
              }
              this.article = { ...article2, imageUrl: final } as NewsItem;
              this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(this.article.content || this.article.summary || '');
            } else {
              this.article = null;
              this.sanitizedContent = null;
            }
            this.isLoading = false;
          },
          error: (err2: any) => {
            console.error('Failed to load news detail', err2);
            this.article = null;
            this.sanitizedContent = null;
            this.isLoading = false;
          }
        });
      },
      error: (err: any) => {
        // If list fetch fails, try detail endpoint directly
        console.warn('Failed to load news list, falling back to detail endpoint', err);
        const param: any = Number.isFinite(maybeId) && maybeId > 0 ? maybeId : idOrSlug;
        this.newsService.getNewsDetail(param).subscribe({
          next: (res2: any) => {
            let data = res2?.data ?? res2;
            if (data?.data) data = data.data;
            const article2 = Array.isArray(data) ? data[0] : data;
            if (article2) {
              let raw = article2.image_url ?? article2.imageUrl ?? '';
              if (!raw) raw = '/assets/images/news/default.jpg';
              const base = (() => { try { return this.newsService.getApiBase(); } catch (e) { return ''; }})();
              let final = raw;
              if (typeof final === 'string' && final.startsWith('/') && !/^https?:\/\//i.test(final)) {
                final = base ? base + final : final;
              }
              this.article = { ...article2, imageUrl: final } as NewsItem;
              this.sanitizedContent = this.sanitizer.bypassSecurityTrustHtml(this.article.content || this.article.summary || '');
            } else {
              this.article = null;
              this.sanitizedContent = null;
            }
            this.isLoading = false;
          },
          error: (err3: any) => {
            console.error('Failed to load news detail (fallback)', err3);
            this.article = null;
            this.sanitizedContent = null;
            this.isLoading = false;
          }
        });
      }
    });
  }

  public backToList(): void {
    try { this.router.navigate(['/ttintucws']); } catch (e) { history.back(); }
  }
}
