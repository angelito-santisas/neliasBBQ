import { Routes } from '@angular/router';
import { staffGuard } from './core/staff-auth.service';

export const routes: Routes = [
  { path: 'staff/login', title: "Nelia's BBQ | Staff Login", loadComponent: () => import('./features/staff/login.component').then(m => m.StaffLoginComponent) },
  ...['inventory', 'menu', 'orders', 'store'].map(view => ({
    path: `staff/${view}`, title: `Nelia's BBQ | Staff ${view}`, canActivate: [staffGuard], data: { view },
    loadComponent: () => import('./features/staff/dashboard.component').then(m => m.StaffDashboardComponent)
  })),
  { path: 'staff', title: "Nelia's BBQ | Staff Inventory", canActivate: [staffGuard], loadComponent: () => import('./features/staff/dashboard.component').then(m => m.StaffDashboardComponent) },
  { path: '', title: "Nelia's BBQ | Home", loadComponent: () => import('./features/home/home.component').then(m => m.HomeComponent) },
  { path: 'menu', title: "Nelia's BBQ | Menu", loadComponent: () => import('./features/menu/menu.component').then(m => m.MenuComponent) },
  { path: 'about', redirectTo: '/#about', pathMatch: 'full' },
  { path: 'feedback', redirectTo: '/#feedback', pathMatch: 'full' },
  { path: 'policies', title: "Nelia's BBQ | Privacy & ordering policy", loadComponent: () => import('./features/policies/policies.component').then(m => m.PoliciesComponent) },
  { path: 'cart', title: "Nelia's BBQ | Cart", loadComponent: () => import('./features/cart/cart.component').then(m => m.CartComponent) },
  { path: '**', redirectTo: '' }
];
