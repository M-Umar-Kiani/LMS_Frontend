import { Component } from '@angular/core';
import { FormControl, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-add-book',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './add-book.html',
  styleUrls: ['./add-book.css'],
})
export class AddBook {
  bookForm!: FormGroup;
  selectedFile: File | null = null;

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.bookForm = new FormGroup({
      title: new FormControl('', Validators.required),
      author: new FormControl('', Validators.required),
      year: new FormControl(new Date().getFullYear(), [Validators.required, Validators.min(1900)]),
      category: new FormControl('Book', Validators.required),
      department: new FormControl('Computer Science', Validators.required),
      isbn: new FormControl(''),
      coverUrl: new FormControl(''),
      description: new FormControl(''),
      pdf: new FormControl(null),
    });
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file && file.type === 'application/pdf') {
      this.bookForm.controls['pdf'].setValue(file);
      this.selectedFile = file;
    } else {
      alert('Only PDF files are allowed.');
    }
  }

  // addBook(): void {
  //   if (this.bookForm.valid) {
  //     console.log('✅ Book Added:', this.bookForm.value);
  //     alert('Book added successfully!');
  //     this.router.navigate(['/books']);
  //   } else {
  //     this.bookForm.markAllAsTouched();
  //   }
  // }

  addBook(): void {
    debugger;
    console.log(this.bookForm);
    if (this.bookForm.valid) {
      this.router.navigate(['/books']);
    } else {
      this.bookForm.markAllAsTouched();
    }
  }

  cancel(): void {
    this.router.navigate(['/books']);
  }
}
