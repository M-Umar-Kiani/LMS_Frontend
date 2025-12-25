import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService } from '../../../services/book.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { RouterLink, RouterModule } from '@angular/router';
import { UserTopbar } from '../user-topbar/user-topbar';
import { Loader } from '../../../global/loader/loader';
import { DownloadResponseDto } from '../../../models/Book.model';
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
    this.loadData();
  }

  downloadDocument(documentId: number): void {
    this.isLoading = true;
    this.bookService.downloadDocument(documentId).subscribe({
      next: (response: DownloadResponseDto) => {
        if (
          response.isSuccess &&
          response.base64Data &&
          response.contentType &&
          response.fileName
        ) {
          const byteCharacters = atob(response.base64Data);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], { type: response.contentType });
          const link = document.createElement('a');
          const url = URL.createObjectURL(blob);
          link.href = url;
          link.download = response.fileName;
          link.click();
          URL.revokeObjectURL(url);
          this._coreService.openSnackBar('Book downloaded successfully!', 'Ok', 'success');
          this.isLoading = false;
        } else {
          this._coreService.openSnackBar('Failed to download document.', 'False', 'error');
          this.isLoading = false;
        }
      },
      error: (err) => {
        this._coreService.openSnackBar('Failed to download document.', 'False', 'error');
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

  // Pagination navigation
  nextPage() {
    this.pageNumber++;
    this.loadData();
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
