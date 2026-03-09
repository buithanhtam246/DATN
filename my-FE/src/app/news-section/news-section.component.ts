import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

interface NewsArticle {
  id: string;
  title: string;
  date: string;
  imageUrl: string;
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
  imports: [CommonModule],
  templateUrl: './news-section.component.html',
  styleUrl: './news-section.component.scss'
})
export class NewsSectionComponent implements OnInit {
  articles: NewsArticle[] = [];

  ngOnInit(): void {
    this.loadArticles();
  }

  private loadArticles(): void {
    // Mock data - replace with API call
    this.articles = [
      {
        id: '1',
        title: 'Nike Launches New Global Football-Inspired Workouts on...',
        date: '20/01/2026',
        imageUrl: '/assets/images/news/Nike Pegasus 42 Hero.jpg'
      },
      {
        id: '2',
        title: 'Nike Launches New Global Football-Inspired Workouts on...',
        date: '20/01/2026',
        imageUrl: '/assets/images/news/alexia-putellas-player-edition-nike-phantom-6-hero.jpg'
      },
      {
        id: '3',
        title: 'Nike Launches New Global Football-Inspired Workouts on...',
        date: '20/01/2026',
        imageUrl: '/assets/images/news/Nike Freak 8 Official Image.jpg'
      },
      {
        id: '4',
        title: 'Nike Launches New Global Football-Inspired Workouts on...',
        date: '20/01/2026',
        imageUrl: '/assets/images/news/Heir Series 2 Napheesa Collier.jpg'
      }
    ];
  }
}
