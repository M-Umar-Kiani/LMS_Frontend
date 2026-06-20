import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpResponse } from '@angular/common/http';
import { Observable } from 'rxjs';

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

  bulkUpload(request: FormData) {
    return this.http.post(`${this.apiUrl}/bulk`, request, {
      responseType: 'blob', // IMPORTANT
    });
  }

  downloadDocument(documentId: number): Observable<HttpResponse<Blob>> {
    return this.http.get(`${this.apiUrl}/download-document/${documentId}`, {
      responseType: 'blob',
      observe: 'response',
    });
  }
}
