import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

/**
 * Footer Component
 * 
 * Responsibility: Display footer navigation and information
 * - Product categories
 * - Sports categories
 * - Collection links
 * - Company info
 * - Support links
 * - Social media links
 */
@Component({
  selector: 'app-footer',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './footer.component.html',
  styleUrl: './footer.component.scss'
})
export class FooterComponent {
  public readonly currentYear = new Date().getFullYear();
  
  public readonly productLinks = [
    { label: 'Giày', url: '/products/shoes' },
    { label: 'Quần áo', url: '/products/clothing' },
    { label: 'Hàng mới về', url: '/products/new-arrivals' },
    { label: 'Bestseller', url: '/products/bestseller' }
  ];
  
  public readonly sportsLinks = [
    { label: 'Running', url: '/sports/running' },
    { label: 'Football', url: '/sports/football' },
    { label: 'Basketball', url: '/sports/basketball' },
    { label: 'Gym & Training', url: '/sports/gym-training' },
    { label: 'Yoga', url: '/sports/yoga' },
    { label: 'Golf', url: '/sports/golf' },
    { label: 'Tennis', url: '/sports/tennis' },
    { label: 'Skateboarding', url: '/sports/skateboarding' }
  ];
  
  public readonly collectionLinks = [
    { label: '24.7 Collection', url: '/collection/247' },
    { label: 'Just Do The Work', url: '/collection/just-do-the-work' },
    { label: 'Retro Running', url: '/collection/retro-running' },
    { label: 'Life Style', url: '/collection/life-style' }
  ];
  
  public readonly companyLinks = [
    { label: 'Về chúng tôi', url: '/about' },
    { label: 'Cơ hội nghề nghiệp', url: '/careers' },
    { label: 'Tin tức', url: '/news' }
  ];
  
  public readonly supportLinks = [
    { label: 'Trợ giúp', url: '/support/help' },
    { label: 'Giao hàng', url: '/support/delivery' },
    { label: 'Thanh toán', url: '/support/payment' },
    { label: 'Dịch vụ khách hàng', url: '/support/customer-service' }
  ];
  
  public readonly socialLinks = [
    { name: 'Facebook', url: 'https://facebook.com', icon: 'facebook' },
    { name: 'Twitter', url: 'https://twitter.com', icon: 'twitter' },
    { name: 'Instagram', url: 'https://instagram.com', icon: 'instagram' },
    { name: 'TikTok', url: 'https://tiktok.com', icon: 'tiktok' },
    { name: 'YouTube', url: 'https://youtube.com', icon: 'youtube' }
  ];
  
  public readonly legalLinks = [
    { label: 'Cài đặt Cookies', url: '/legal/cookies' },
    { label: 'Chính sách bảo mật', url: '/legal/privacy' },
    { label: 'Điều khoản & Điều kiện', url: '/legal/terms' }
  ];
}