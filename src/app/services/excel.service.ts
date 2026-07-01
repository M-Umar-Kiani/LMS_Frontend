import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';

export interface ReportRequest {
  startDate: string;
  endDate: string;
  [key: string]: any;
}

@Injectable({
  providedIn: 'root',
})
export class ExcelService {
  private apiUrl = 'http://localhost:5001/api/Report';

  constructor(private http: HttpClient) {}

  // Generic downloader — used by the Reports Library for every report, in either format.
  download(endpoint: string, request: ReportRequest): Observable<Blob> {
    return this.http.post(`${this.apiUrl}/${endpoint}`, request, {
      responseType: 'blob',
    });
  }

  downloadCategoryReportExcel(startDate: string, endDate: string): Observable<Blob> {
    return this.download('download-category-report-excel', { startDate, endDate });
  }

  downloadDepartmentReportExcel(startDate: string, endDate: string): Observable<Blob> {
    return this.download('download-department-report-excel', { startDate, endDate });
  }
}
