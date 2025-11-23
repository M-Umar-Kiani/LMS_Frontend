import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../services/book.service';

@Component({
  selector: 'app-bulk-upload',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './bulk-upload.html',
  styleUrls: ['./bulk-upload.css']
})
export class BulkUpload {
  selectedCategory = 'Book';
  selectedDepartment = 'Computer Science';
  files: any[] = [];
  isUploading = false;
  uploadResult: any = null;

  constructor(private bookService: BookService) {}

  // Handle file selection
  onFileSelected(event: any) {
    const selectedFiles = event.target.files;
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      this.files.push({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2), // Convert bytes to MB
        file: file
      });
    }
  }

  // Remove single file
  removeFile(index: number) {
    this.files.splice(index, 1);
  }

  // Clear all files
  clearAll() {
    this.files = [];
  }

  // ✅ Upload all files to backend
  uploadAll() {
    if (this.files.length === 0) {
      alert('⚠️ No files selected!');
      return;
    }

    const fileArray = this.files.map(f => f.file);
    this.isUploading = true;

    this.bookService.bulkUpload(fileArray).subscribe({
      next: (res) => {
        console.log('Upload successful:', res);
        this.uploadResult = res;
        alert('✅ Files uploaded successfully!');
        this.files = [];
        this.isUploading = false;
      },
      error: (err) => {
        console.error('❌ Upload failed:', err);
        alert('❌ Upload failed. Check console for details.');
        this.isUploading = false;
      }
    });
  }
}
