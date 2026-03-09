import { Component, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Scroll To Top Component
 * 
 * Responsibility: Provide quick navigation back to top
 * - Show/hide based on scroll position
 * - Smooth scroll to top on click
 */
@Component({
  selector: 'app-scroll-to-top',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './scroll-to-top.component.html',
  styleUrl: './scroll-to-top.component.scss'
})
export class ScrollToTopComponent {
  public isVisible = false;

  /**
   * Detect scroll to show/hide button
   */
  @HostListener('window:scroll', [])
  onWindowScroll(): void {
    this.isVisible = window.scrollY > 300;
  }

  /**
   * Scroll to top smoothly
   */
  scrollToTop(): void {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }
}
