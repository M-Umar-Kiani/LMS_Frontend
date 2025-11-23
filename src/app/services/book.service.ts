import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { DownloadResponseDto } from '../models/Book.model';

@Injectable({ providedIn: 'root' })
export class BookService {
  private apiUrl = 'http://localhost:5001/Main';

  constructor(private http: HttpClient) {}

  getAllDocumentsPaginated(payload: any): Observable<any> {
    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });
    return this.http.post(`${this.apiUrl}/get-all-document-paginated`, payload, { headers });
  }

  addBook(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/add-book`, formData);
  }

  editBook(formData: FormData): Observable<any> {
    return this.http.post(`${this.apiUrl}/edit-book`, formData);
  }

  deleteBook(documentId: number): Observable<any> {
    return this.http.get(`${this.apiUrl}/delete-book/${documentId}`);
  }

  bulkUpload(files: File[]): Observable<any> {
    const formData = new FormData();
    for (let file of files) {
      formData.append('files', file);
    }
    return this.http.post(`${this.apiUrl}/bulk`, formData);
  }

  downloadDocument(documentId: number): Observable<DownloadResponseDto> {
    return this.http.get<DownloadResponseDto>(`${this.apiUrl}/download-document/${documentId}`);
  }
}
