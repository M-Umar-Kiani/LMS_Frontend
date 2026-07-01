import { Routes } from '@angular/router';
import { AdminLayoutComponent } from './layout/admin-layout/admin-layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { BooksComponent } from './pages/books/books';
import { AddBook } from './pages/add-book/add-book';
import { BulkUpload } from './pages/bulk-upload/bulk-upload';
import { Reports } from './pages/reports/reports';
import { UserDashboard } from './pages/user/user-dashboard/user-dashboard';
import { BrowseBooks } from './pages/user/browse-books/browse-books';

export const routes: Routes = [
  // Admin routes (with sidebar)
  {
    path: '',
    component: AdminLayoutComponent,
    children: [
      { path: 'dashboard', component: Dashboard, title: 'Dashboard | SZABIST Library Admin' },
      { path: 'books', component: BooksComponent, title: 'Books | SZABIST Library Admin' },
      { path: 'books/add', component: AddBook, title: 'Add Book | SZABIST Library Admin' },
      { path: 'bulk-upload', component: BulkUpload, title: 'Bulk Upload | SZABIST Library Admin' },
      { path: 'reports', component: Reports, title: 'Reports | SZABIST Library Admin' },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },

  // User routes (without sidebar)
  {
    path: 'user',
    children: [
      { path: 'dashboard', component: UserDashboard, title: 'Dashboard | SZABIST Digital Library' },
      { path: 'browse-books', component: BrowseBooks, title: 'Browse Books | SZABIST Digital Library' },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
];
