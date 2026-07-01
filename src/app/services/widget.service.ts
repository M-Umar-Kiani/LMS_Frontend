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

  GetMonthlyActivityWidget(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/get-monthly-activity-data`, data);
  }

  GetDownloadTrendWidget(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/get-download-trend-widget`, data);
  }

  GetDepartmentPerformanceWidget(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/get-department-performance-widget`, data);
  }

  GetYearPopularityWidget(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/get-year-popularity-widget`, data);
  }

  GetCategoryDepartmentWidget(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/get-category-department-widget`, data);
  }

  GetDataQualityWidget(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/get-data-quality-widget`, data);
  }
}
