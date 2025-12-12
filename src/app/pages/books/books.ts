import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BookService } from '../../services/book.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { DownloadResponseDto } from '../../models/Book.model';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CoreService } from '../../services/core.service';
import { MatIcon } from '@angular/material/icon';

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatSnackBarModule],
  templateUrl: './books.html',
  styleUrls: ['./books.css'],
})
export class BooksComponent implements OnInit {
  books: any[] = [];
  showModal = false;
  isEdit = false;
  selectedFile: File | null = null;

  selectedCategory = '';
  selectedDepartment = '';

  bookForm!: FormGroup;
  searchTerm: string = '';
  private searchSubject = new Subject<string>();

  // Pagination
  pageNumber = 1;
  pageSize = 10;
  totalItems = 0;

  constructor(
    private bookService: BookService,
    private http: HttpClient,
    private _coreService: CoreService
  ) {}

  ngOnInit(): void {
    this.bookForm = new FormGroup({
      documentId: new FormControl(0),
      bookTitle: new FormControl('', Validators.required),
      author: new FormControl('', Validators.required),
      year: new FormControl(new Date().getFullYear(), [Validators.required, Validators.min(1900)]),
      category: new FormControl('Book', Validators.required),
      department: new FormControl('Computer Science', Validators.required),
    });

    this.searchSubject.pipe(debounceTime(400), distinctUntilChanged()).subscribe((term) => {
      this.pageNumber = 1;
      this.getBooks(term);
    });

    this.getBooks();
  }

  applyFilter() {
    this.getBooks();
  }

  getBooks(searchTerm: string = this.searchTerm): void {
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

  openAddModal() {
    this.showModal = true;
  }

  openEditModel(book: any) {
    this.showModal = true;
    this.isEdit = true;

    this.bookForm.patchValue({
      documentId: book.documentId,
      bookTitle: book.title,
      author: book.author,
      year: book.year,
      category: book.category,
      department: book.department ?? '',
    });
  }

  closeModal() {
    this.showModal = false;
    this.isEdit = false;
    this.bookForm.reset();
  }

  onSearchChange(): void {
    this.searchSubject.next(this.searchTerm);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) this.selectedFile = file;
  }

  addBook() {
    if (!this.bookForm.valid) {
      this.bookForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('title', this.bookForm.get('bookTitle')?.value);
    formData.append('author', this.bookForm.get('author')?.value);
    formData.append('category', this.bookForm.get('category')?.value);
    formData.append('department', this.bookForm.get('department')?.value);
    formData.append('year', this.bookForm.get('year')?.value);
    if (this.selectedFile) formData.append('attachment', this.selectedFile);

    this.bookService.addBook(formData).subscribe({
      next: () => {
        // alert('✅ Book added successfully!');
        this._coreService.openSnackBar('Book added successfully!', 'Ok');
        this.closeModal();
        this.getBooks();
      },
      error: (err: any) => console.error('Add Book error:', err),
    });
  }

  editBook() {
    if (!this.bookForm.valid) {
      this.bookForm.markAllAsTouched();
      return;
    }

    const formData = new FormData();
    formData.append('documentId', this.bookForm.get('documentId')?.value);
    formData.append('title', this.bookForm.get('bookTitle')?.value);
    formData.append('author', this.bookForm.get('author')?.value);
    formData.append('category', this.bookForm.get('category')?.value);
    formData.append('department', this.bookForm.get('department')?.value);
    formData.append('year', this.bookForm.get('year')?.value);

    this.bookService.editBook(formData).subscribe({
      next: () => {
        alert('✅ Book updated successfully!');
        this.closeModal();
        this.getBooks();
      },
      error: (err: any) => console.error('Update Book error:', err),
    });
  }

  deleteBook(documentId: number) {
    this.bookService.deleteBook(documentId).subscribe({
      next: () => {
        // alert('✅ Book Deleted successfully!');
        this._coreService.openSnackBar('Book Deleted successfully!', 'Ok');

        this.getBooks();
      },
      error: (err: any) => console.error('Delete Book error:', err),
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

  downloadDocument(documentId: number): void {
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
        } else {
          alert(response.message || 'Failed to download document.');
        }
      },
      error: (err) => {
        console.error('Download error:', err);
        alert('Something went wrong while downloading the document.');
      },
    });
  }
}
