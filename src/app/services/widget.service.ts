import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class WidgetService {
  private apiUrl = 'http://localhost:5001/api/Widgit';

  constructor(private http: HttpClient) {}

  GetBookByDepartmentWidget(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/get-books-by-department`, data);
  }

  GetBookByCategoryWidget(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/get-books-by-category`, data);
  }

  GetTotalBooksCount(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/get-total-books-count`, data);
  }

  GetDownloadedBooksCount(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/get-downloaded-books-count`, data);
  }

  GetPopularBooks(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/get-popular-books`, data);
  }
}
