import { Component } from '@angular/core';
import { BannerComponent } from '../../banner/banner.component';
import { CollectionComponent } from '../../collection/collection.component';
import { BrandsComponent } from '../../banner/brands/brands.component';
import { FeaturedCollectionsComponent } from '../../featured-collections/featured-collections.component';
import { ProductsSectionComponent } from '../../products-section/products-section.component';
import { NewsSectionComponent } from '../../news-section/news-section.component';
import { ShopBySportComponent } from '../../shop-by-sport/shop-by-sport.component';
import { SpotlightComponent } from '../../spotlight/spotlight.component';

/**
 * Home Page Component
 * 
 * Responsibility: Display home page content
 * - Banner section
 * - Collection section
 * - Brands section
 * - Featured Collections section
 * - Products section
 * - News section
 * - Shop By Sport section
 * - Spotlight section
 * - Can add more sections in the future
 */
@Component({
  selector: 'app-home',
  standalone: true,
  imports: [BannerComponent, CollectionComponent, BrandsComponent, FeaturedCollectionsComponent, ProductsSectionComponent, NewsSectionComponent, ShopBySportComponent, SpotlightComponent],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent {}
