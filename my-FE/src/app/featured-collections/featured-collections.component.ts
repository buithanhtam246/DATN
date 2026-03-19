import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Featured Collections Component
 * 
 * Responsibility: Display featured collection cards
 * - Show Kids, School, and Football collections
 * - Handle navigation to collection pages
 */
@Component({
  selector: 'app-featured-collections',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './featured-collections.component.html',
  styleUrl: './featured-collections.component.scss'
})
export class FeaturedCollectionsComponent {
  // Component logic here
}
