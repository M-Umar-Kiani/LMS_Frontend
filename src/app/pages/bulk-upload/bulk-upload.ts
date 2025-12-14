import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { BookService } from '../../services/book.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { Loader } from '../../global/loader/loader';
import { CoreService } from '../../services/core.service';

@Component({
  selector: 'app-bulk-upload',
  standalone: true,
  imports: [CommonModule, FormsModule, MatSnackBarModule, Loader],
  templateUrl: './bulk-upload.html',
  styleUrls: ['./bulk-upload.css'],
})
export class BulkUpload {
  selectedDepartment = 'Computer Science';
  files: any[] = [];
  isUploading = false;
  uploadResult: any = null;
  isLoading: boolean = false;

  constructor(private bookService: BookService, private _coreService: CoreService) {}

  // Handle file selection
  onFileSelected(event: any) {
    const selectedFiles = event.target.files;
    for (let i = 0; i < selectedFiles.length; i++) {
      const file = selectedFiles[i];
      this.files.push({
        name: file.name,
        size: (file.size / (1024 * 1024)).toFixed(2), // Convert bytes to MB
        file: file,
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

  uploadAll() {
    if (this.files.length === 0) {
      alert('⚠️ No files selected!');
      return;
    }

    const formData = new FormData();
    formData.append('Department', this.selectedDepartment);
    this.files.forEach((f) => {
      formData.append('files', f.file);
    });

    this.isLoading = true;
    this.isUploading = true;

    this.bookService.bulkUpload(formData).subscribe({
      next: (res) => {
        this._coreService.openSnackBar('Files uploaded successfully!', 'Ok', 'success');
        this.uploadResult = res;
        this.files = [];
        this.isUploading = false;
        this.isLoading = false;
      },
      error: (err) => {
        this._coreService.openSnackBar('File upload failed!', 'Close', 'error');
        this.isUploading = false;
        this.isLoading = false;
      },
    });
  }
}
