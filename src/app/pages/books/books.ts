import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { BookService } from '../../services/book.service';
import { debounceTime, distinctUntilChanged, Subject } from 'rxjs';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { CoreService } from '../../services/core.service';
import { Loader } from '../../global/loader/loader';

@Component({
  selector: 'app-books',
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, MatSnackBarModule, Loader],
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

  isLoading: boolean = false;

  // Pagination
  pageNumber = 1;
  pageSize = 10;
  totalItems = 0;

  constructor(
    private bookService: BookService,
    private _coreService: CoreService,
  ) {}

  ngOnInit(): void {
    this.bookForm = new FormGroup({
      documentId: new FormControl(0),
      bookTitle: new FormControl('', Validators.required),
      author: new FormControl('', Validators.required),
      year: new FormControl(new Date().getFullYear(), [Validators.required, Validators.min(1900)]),
      category: new FormControl('Book', Validators.required),
      department: new FormControl('Computer Science', Validators.required),
      publisher: new FormControl('', Validators.required),
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
      },
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
      publisher: book.publisher ?? '',
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
    this.isLoading = true;
    const formData = new FormData();
    formData.append('title', this.bookForm.get('bookTitle')?.value);
    formData.append('author', this.bookForm.get('author')?.value);
    formData.append('category', this.bookForm.get('category')?.value);
    formData.append('department', this.bookForm.get('department')?.value);
    formData.append('publisher', this.bookForm.get('publisher')?.value);
    formData.append('year', this.bookForm.get('year')?.value);
    if (this.selectedFile) formData.append('attachment', this.selectedFile);

    this.bookService.addBook(formData).subscribe({
      next: () => {
        this.isLoading = false;
        this._coreService.openSnackBar('Book added successfully!', 'Ok');
        this.closeModal();
        this.getBooks();
      },
      error: (err: any) => {
        this.isLoading = false;
      },
    });
  }

  editBook() {
    if (!this.bookForm.valid) {
      this.bookForm.markAllAsTouched();
      return;
    }
    this.isLoading = true;
    const formData = new FormData();
    formData.append('documentId', this.bookForm.get('documentId')?.value);
    formData.append('title', this.bookForm.get('bookTitle')?.value);
    formData.append('author', this.bookForm.get('author')?.value);
    formData.append('category', this.bookForm.get('category')?.value);
    formData.append('publisher', this.bookForm.get('publisher')?.value);
    formData.append('department', this.bookForm.get('department')?.value);
    formData.append('year', this.bookForm.get('year')?.value);

    this.bookService.editBook(formData).subscribe({
      next: () => {
        this.isLoading = false;
        this._coreService.openSnackBar('File uploaded successfully!', 'Ok', 'success');
        this.closeModal();
        this.getBooks();
      },
      error: (err: any) => {
        this.isLoading = false;
        this._coreService.openSnackBar('File uploaded failed!', 'Close', 'error');
      },
    });
  }

  deleteBook(documentId: number) {
    this.isLoading = true;

    this.bookService.deleteBook(documentId).subscribe({
      next: () => {
        this.isLoading = false;
        this._coreService.openSnackBar('Book Deleted successfully!', 'Ok', 'success');
        this.getBooks();
      },
      error: (err: any) => {
        this.isLoading = false;
        this._coreService.openSnackBar('Error occurred while deleting.', 'Close', 'error');
      },
    });
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
    return (this.pageNumber - 1) * this.pageSize + 1;
  }

  get rangeEnd(): number {
    return Math.min(this.pageNumber * this.pageSize, this.totalItems);
  }

  goToPage(page: number) {
    if (page < 1 || page > this.totalPages) return;
    this.pageNumber = page;
    this.getBooks();
  }

  nextPage() {
    if (this.pageNumber < this.totalPages) {
      this.pageNumber++;
      this.getBooks();
    }
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
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        alert('Something went wrong while downloading the document.');
      },
    });
  }

  showImageModal = false;
  selectedImage: string | null = null;

  openImage(book: any) {
    this.selectedImage = book.previewImage
      ? 'data:image/png;base64,' + book.previewImage
      : 'assets/images/no-image.png';

    this.showImageModal = true;
  }

  closeImageModal() {
    this.showImageModal = false;
    this.selectedImage = null;
  }
}
