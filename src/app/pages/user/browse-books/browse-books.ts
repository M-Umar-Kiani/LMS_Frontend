import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BookService } from '../../../services/book.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-browse-books',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './browse-books.html',
  styleUrls: ['./browse-books.css'],
})
export class BrowseBooks {
  books: any[] = [];
  pageNumber = 1;
  pageSize = 30;
  totalItems = 0;

  selectedCategory = '';
  selectedDepartment = '';

  searchTerm: string = '';
  private searchSubject = new Subject<string>();

  constructor(private bookService: BookService) {}

  ngOnInit(): void {
    // Debounce user typing before triggering search
    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe((term) => {
      this.pageNumber = 1; // Reset to first page when searching
      this.getBooks(term);
    });

    // load first page on init
    this.getBooks();
  }

  applyFilter() {
    this.getBooks();
  }

  // Get Paginated books
  getBooks(searchTerm: string = this.searchTerm): void {
    debugger;
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
      },
      error: (err) => console.error('Error fetching books:', err),
    });
  }

  // Pagination navigation
  nextPage() {
    this.pageNumber++;
    this.getBooks();
  }

  prevPage() {
    if (this.pageNumber > 1) {
      this.pageNumber--;
      this.getBooks();
    }
  }
  limitWords(text: string, maxWords: number): string {
    if (!text) return '';
    const words = text.split(' ');
    return words.length > maxWords ? words.slice(0, maxWords).join(' ') + '…' : text;
  }
}
