/**
 * Base Service Interfaces
 * 
 * Following Interface Segregation Principle (ISP)
 * - Small, specific interfaces
 * - Clients don't depend on methods they don't use
 */

/**
 * IDataService - Base interface for data operations
 */
export interface IDataService<T> {
  getAll(): T[];
  getById(id: string | number): T | undefined;
}

/**
 * IStatefulService - Base interface for services with state
 */
export interface IStatefulService<T> {
  state(): T;
  setState(newState: T): void;
}

/**
 * ICartOperations - Interface for cart operations
 */
export interface ICartOperations {
  addToCart(productId: string, quantity?: number): void;
  removeFromCart(productId: string): void;
  clearCart(): void;
}

/**
 * IWishlistOperations - Interface for wishlist operations
 */
export interface IWishlistOperations {
  addToWishlist(productId: string): void;
  removeFromWishlist(productId: string): void;
}

/**
 * INavigationOperations - Interface for navigation operations
 */
export interface INavigationOperations {
  getMenuItems(): any[];
  navigateTo(path: string): void;
}

/**
 * IProductOperations - Interface for product operations  
 */
export interface IProductOperations {
  getFeaturedProduct(): any;
  getProductsByCategory(category: string): any[];
<<<<<<< HEAD
}
=======
}
>>>>>>> dedb69f02061182b9ae37476fee45e26cf25e284
