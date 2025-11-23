import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { BooksComponent } from './pages/books/books';  
import { AddBook } from './pages/add-book/add-book'; 
import { BulkUpload } from './pages/bulk-upload/bulk-upload';
import { Reports } from './pages/reports/reports'; 

// 👇 User-side components
import { UserDashboard } from './pages/user/user-dashboard/user-dashboard';
import { BrowseBooks } from './pages/user/browse-books/browse-books';

export const routes: Routes = [
  // ✅ Admin routes (with sidebar)
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'books', component: BooksComponent },
      { path: 'books/add', component: AddBook },
      { path: 'bulk-upload', component: BulkUpload },
      { path: 'reports', component: Reports },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  },

  // ✅ User routes (without sidebar)
  {
    path: 'user',
    children: [
      { path: 'dashboard', component: UserDashboard },
      { path: 'browse-books', component: BrowseBooks },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];
