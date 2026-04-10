import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NewsService, NewsItem } from '../services/news.service';

interface NewsArticle {
  id: number | string;
  title: string;
  date: string;
  imageUrl: string;
  slug?: string | null;
}

/**
 * News Section Component
 * 
 * Responsibility: Display news/blog articles section
 * - Show news articles in grid layout
 * - Navigate to article details
 */
@Component({
  selector: 'app-news-section',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './news-section.component.html',
  styleUrl: './news-section.component.scss'
})
export class NewsSectionComponent implements OnInit {
  articles: NewsArticle[] = [];

  constructor(private newsService: NewsService) {}

  ngOnInit(): void {
    this.loadArticles();
  }

  private loadArticles(): void {
    // Fetch latest news from backend and show 4 newest
    this.newsService.getAllNews().subscribe({
      next: (res: any) => {
        const items: NewsItem[] = Array.isArray(res?.data) ? res.data : (res?.data?.rows ?? []);
        // sort by published_at then created_at desc
        items.sort((a: any, b: any) => {
          const aTime = new Date(a.published_at ?? a.publishedAt ?? a.created_at ?? a.createdAt ?? 0).getTime();
          const bTime = new Date(b.published_at ?? b.publishedAt ?? b.created_at ?? b.createdAt ?? 0).getTime();
          return bTime - aTime;
        });
        const latest = items.slice(0, 4);
        this.articles = latest.map(it => {
          const rawImage = (it as any).image_url ?? (it as any).imageUrl ?? '/assets/images/news/default.jpg';
          let finalImage = rawImage as string;
          if (typeof finalImage === 'string') {
            // if path is relative to server (starts with '/') and not absolute http(s), prefix backend base
            if (/^\//.test(finalImage) && !/^https?:\/\//i.test(finalImage) && !(finalImage.startsWith('//'))) {
              try {
                const base = this.newsService.getApiBase();
                finalImage = base ? base + finalImage : finalImage;
              } catch (e) {
                // ignore and keep raw
              }
            }
          }
          return {
            id: it.id,
            title: it.title ?? '',
            date: this.formatDate(it.published_at ?? it.publishedAt ?? it.created_at ?? it.createdAt),
            imageUrl: finalImage,
            slug: (it as any).slug ?? null
          };
        });
      },
      error: (err: any) => {
        console.error('Failed to load news for homepage', err);
        // fallback keep mock or empty
        this.articles = [];
      }
    });
  }

  private formatDate(value?: string | null): string {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return '';
    const dd = String(d.getDate()).padStart(2, '0');
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const yyyy = d.getFullYear();
    return `${dd}/${mm}/${yyyy}`;
  }

  trackById(index: number, item: NewsArticle) {
    return item.id;
  }
}