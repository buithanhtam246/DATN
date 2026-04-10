import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NewsService, NewsItem } from '../../services/news.service';

@Component({
  selector: 'app-ttintucws',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './ttintucws.component.html',
  styleUrl: './ttintucws.component.scss'
})
export class TtintucwsComponent implements OnInit {
  public articles: NewsItem[] = [];
  public isLoading = true;
  public selectedArticle: NewsItem | null = null;

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.loadAllNews();
  }

  private loadAllNews(): void {
    this.isLoading = true;
    this.newsService.getAllNews().subscribe({
      next: (res: any) => {
        const items: NewsItem[] = Array.isArray(res?.data) ? res.data : (res?.data?.rows ?? []);
        // show visible items only
        const visible = (items || []).filter(i => Number(i.status) === 1);
        // sort newest first
        visible.sort((a: any, b: any) => {
          const at = new Date(a.published_at ?? a.publishedAt ?? a.created_at ?? a.createdAt ?? 0).getTime();
          const bt = new Date(b.published_at ?? b.publishedAt ?? b.created_at ?? b.createdAt ?? 0).getTime();
          return bt - at;
        });

        // compute final image URL for each item so template can use it directly
        const base = (() => {
          try { return this.newsService.getApiBase(); } catch (e) { return ''; }
        })();

        this.articles = visible.map((it: any) => {
          let raw = it.image_url ?? it.imageUrl ?? '';
          if (!raw) raw = '/assets/images/news/default.jpg';
          let final = raw;
          if (typeof final === 'string' && final.startsWith('/') && !/^https?:\/\//i.test(final)) {
            final = base ? base + final : final;
          }
          return {
            ...it,
            imageUrl: final
          } as NewsItem;
        });
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Failed to load news page', err);
        this.articles = [];
        this.isLoading = false;
      }
    });
  }

  public openArticle(article: NewsItem): void {
    this.selectedArticle = article;
    // scroll to top for the detail view
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {}
  }

  public backToList(): void {
    this.selectedArticle = null;
    try { window.scrollTo({ top: 0, behavior: 'smooth' }); } catch (e) {}
  }
}
