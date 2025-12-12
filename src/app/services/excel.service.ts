import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ExcelService {
  private apiUrl = 'http://localhost:5001/api/Report';

  constructor(private http: HttpClient) {}

  downloadCategoryReportExcel(startDate: string, endDate: string): Observable<Blob> {
    const request = { startDate, endDate };
    return this.http.post(`${this.apiUrl}/download-category-report-excel`, request, {
      responseType: 'blob',
    });
  }

  downloadDepartmentReportExcel(startDate: string, endDate: string): Observable<Blob> {
    const request = { startDate, endDate };
    return this.http.post(`${this.apiUrl}/download-department-report-excel`, request, {
      responseType: 'blob',
    });
  }
}
