import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService } from '../../../services/book.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterModule } from '@angular/router';
import { UserTopbar } from '../user-topbar/user-topbar';
import { Loader } from '../../../global/loader/loader';
import { CoreService } from '../../../services/core.service';

@Component({
  selector: 'app-browse-books',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule, UserTopbar, Loader],
  templateUrl: './browse-books.html',
  styleUrls: ['./browse-books.css'],
})
export class BrowseBooks {
  books: any[] = [];
  isLoading = false;
  pageNumber = 1;
  pageSize = 10;
  totalItems = 0;
  searchTerm: string = '';

  selectedCategory = '';
  selectedDepartment = '';
  selectedPublisher = '';
  yearFrom: number | null = null;
  yearTo: number | null = null;

  showDetailModal = false;
  selectedBook: any = null;

  private searchSubject = new Subject<string>();

  constructor(private bookService: BookService, private _coreService: CoreService) {}

  ngOnInit(): void {
    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe((term) => {
      this.pageNumber = 1;
      this.loadData(term);
    });

    this.loadData();
  }

  applyFilter() {
    this.pageNumber = 1;
    this.loadData();
  }

  clearFilters(): void {
    this.searchTerm = '';
    this.selectedCategory = '';
    this.selectedDepartment = '';
    this.selectedPublisher = '';
    this.yearFrom = null;
    this.yearTo = null;
    this.applyFilter();
  }

  openDetail(book: any): void {
    this.selectedBook = book;
    this.showDetailModal = true;
  }

  closeDetail(): void {
    this.showDetailModal = false;
    this.selectedBook = null;
  }

  downloadDocument(documentId: number): void {
    this.isLoading = true;
    this.bookService.downloadDocument(documentId).subscribe({
      next: (response) => {
        const blob = response.body!;
        const disposition = response.headers.get('Content-Disposition') ?? '';
        const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';\r\n]+)["']?/i);
        const fileName = match ? decodeURIComponent(match[1]) : 'download';
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        URL.revokeObjectURL(url);
        this._coreService.openSnackBar('Book downloaded successfully!', 'Ok', 'success');
        this.isLoading = false;
      },
      error: (err) => {
        this._coreService.openSnackBar('Download failed!', 'Ok', 'error');
        this.isLoading = false;
      },
    });
  }
  // Get Paginated books
  loadData(searchTerm: string = this.searchTerm): void {
    this.isLoading = true;
    var payload = {
      pageNumber: this.pageNumber,
      pageSize: this.pageSize,
      category: this.selectedCategory,
      department: this.selectedDepartment,
      publisher: this.selectedPublisher,
      yearFrom: this.yearFrom,
      yearTo: this.yearTo,
      searchTerm: searchTerm,
    };

    this.bookService.getAllDocumentsPaginated(payload).subscribe({
      next: (res: any) => {
        this.books = (res.items ?? res.data ?? res).map((b: any) => ({
          ...b,
          imageUrl: b.imageUrl || 'assets/default-book.png',
        }));
        this.totalItems = res.totalCount ?? this.books.length;
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error('Error fetching books:', err);
      },
    });
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  get totalPages(): number {
    return Math.ceil(this.totalItems / this.pageSize) || 1;
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const start = Math.max(1, this.pageNumber - 2);
    const end = Math.min(this.totalPages, this.pageNumber + 2);
    for (let i = start; i <= end; i++) pages.push(i);
    return pages;
  }

  get rangeStart(): number {
    return this.totalItems === 0 ? 0 : (this.pageNumber - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.pageNumber * this.pageSize, this.totalItems);
  }

  // Pagination navigation
  goToPage(page: number): void {
    if (page < 1 || page > this.totalPages) return;
    this.pageNumber = page;
    this.loadData();
  }

  nextPage() {
    if (this.pageNumber < this.totalPages) {
      this.pageNumber++;
      this.loadData();
    }
  }

  prevPage() {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.loadData();
    }
  }
  limitWords(text: string, maxWords: number): string {
    if (!text) return '';
    const words = text.split(' ');
    return words.length > maxWords ? words.slice(0, maxWords).join(' ') + '…' : text;
  }
}
