# Layout Structure

## Folder Organization

```
src/app/
├── layouts/           # Layout components (shared structure)
│   ├── main-layout/   # Main layout with header & footer
│   └── index.ts       # Export barrel file
│
├── pages/             # Page components (routes)
│   ├── home/          # Home page
│   └── index.ts       # Export barrel file
│
├── header/            # Header component
├── footer/            # Footer component
├── banner/            # Banner section
├── collection/        # Collection section
└── shared/            # Shared components
```

## How It Works

### Layout Pattern
Layouts provide common structure (header, footer) that wraps multiple pages.

**MainLayoutComponent:**
```
┌─────────────────────┐
│      Header         │
├─────────────────────┤
│                     │
│   <router-outlet>   │ ← Page content rendered here
│                     │
├─────────────────────┤
│      Footer         │
└─────────────────────┘
```

### Routing Structure

```typescript
routes = [
  {
    path: '',
    component: MainLayoutComponent,  // Layout wrapper
    children: [
      { path: '', component: HomeComponent },      // Home page
      { path: 'products', component: ProductsComponent },  // Products page
      // ... more pages
    ]
  }
]
```

### Benefits

1. **DRY Principle** - Header & footer defined once
2. **Easy to extend** - Add new pages without duplicating layout
3. **Multiple layouts** - Can have different layouts for different sections
4. **Clean separation** - Layout vs Content logic

## Adding New Pages

### 1. Create page component:
```bash
ng generate component pages/products --standalone
```

### 2. Add route:
```typescript
// app.routes.ts
{
  path: 'products',
  component: ProductsComponent,
  title: 'Products - GoodShoes'
}
```

### 3. Export from index:
```typescript
// pages/index.ts
export { ProductsComponent } from './products/products.component';
```

## Adding New Layouts

For pages that need different structure (e.g., auth pages, admin panel):

### 1. Create layout component:
```bash
ng generate component layouts/auth-layout --standalone
```

### 2. Add separate route group:
```typescript
{
  path: 'auth',
  component: AuthLayoutComponent,
  children: [
    { path: 'login', component: LoginComponent }
  ]
}
```

## Example Usage

Navigate to pages:
```typescript
// In component
this.router.navigate(['/products']);

// In template
<a routerLink="/products">Products</a>
```
