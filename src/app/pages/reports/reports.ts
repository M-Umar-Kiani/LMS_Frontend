import { Component, AfterViewInit, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Chart } from 'chart.js/auto';
import { saveAs } from 'file-saver';
import { forkJoin } from 'rxjs';
import { ExcelService } from '../../services/excel.service';
import { CoreService } from '../../services/core.service';
import { WidgetService } from '../../services/widget.service';
import { Loader } from '../../global/loader/loader';

type ReportFormat = 'excel' | 'pdf';

interface ReportDefinition {
  key: string;
  title: string;
  description: string;
  icon: string;
  excelEndpoint: string;
  pdfEndpoint: string;
  extra?: 'top' | 'days' | 'granularity';
}

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, FormsModule, Loader],
  templateUrl: './reports.html',
  styleUrls: ['./reports.css'],
})
export class Reports implements OnInit, AfterViewInit {
  isLoading = false;
  viewReady = false;

  selectedRange: string = 'thisYear';
  startDate: string = '';
  endDate: string = '';

  topN = 20;
  recentDays = 30;
  granularity = 'monthly';

  // Custom report builder
  customCategory = '';
  customDepartment = '';
  customPublisher = '';
  customYearFrom: number | null = null;
  customYearTo: number | null = null;
  customGroupBy = 'None';

  departmentChart: Chart | null = null;
  departmentPerformanceChart: Chart | null = null;
  yearPopularityChart: Chart | null = null;
  categoryDepartmentChart: Chart | null = null;
  dataQualityChart: Chart | null = null;

  departmentWidgetData: DepartmentWidgetDto = { departmentName: [], bookCount: [] };
  departmentPerformanceData: DepartmentPerformanceWidget = {
    departmentName: [],
    bookCount: [],
    downloadCount: [],
    utilizationRate: [],
  };
  yearPopularityData: YearPopularityWidget = { year: [], bookCount: [], downloadCount: [] };
  categoryDepartmentData: CategoryDepartmentWidget = { categories: [], departments: [], matrix: [] };
  dataQualityData: DataQualityWidget = { totalCount: 0, completeCount: 0, missingCount: 0, completePercentage: 100 };

  collectionReports: ReportDefinition[] = [
    { key: 'category', title: 'Books by Category', description: 'All books grouped by category', icon: 'category', excelEndpoint: 'download-category-report-excel', pdfEndpoint: 'download-category-report-pdf' },
    { key: 'department', title: 'Books by Department', description: 'All books grouped by department', icon: 'apartment', excelEndpoint: 'download-department-report-excel', pdfEndpoint: 'download-department-report-pdf' },
    { key: 'publisher', title: 'Books by Publisher', description: 'Summary and full detail list per publisher', icon: 'business', excelEndpoint: 'download-publisher-report-excel', pdfEndpoint: 'download-publisher-report-pdf' },
    { key: 'year', title: 'Books by Publication Year', description: 'Collection distribution across publication years', icon: 'event', excelEndpoint: 'download-year-report-excel', pdfEndpoint: 'download-year-report-pdf' },
    { key: 'matrix', title: 'Category x Department Matrix', description: 'Cross-tab pivot of categories vs departments', icon: 'grid_on', excelEndpoint: 'download-category-department-matrix-excel', pdfEndpoint: 'download-category-department-matrix-pdf' },
    { key: 'uploadTrend', title: 'Upload Trend', description: 'Uploads over time with cumulative growth', icon: 'trending_up', excelEndpoint: 'download-upload-trend-report-excel', pdfEndpoint: 'download-upload-trend-report-pdf', extra: 'granularity' },
    { key: 'recent', title: 'Recently Added Books', description: 'Books added in the last N days', icon: 'fiber_new', excelEndpoint: 'download-recently-added-report-excel', pdfEndpoint: 'download-recently-added-report-pdf', extra: 'days' },
    { key: 'dataQuality', title: 'Data Quality Report', description: 'Missing metadata, unspecified fields, missing preview images', icon: 'fact_check', excelEndpoint: 'download-data-quality-report-excel', pdfEndpoint: 'download-data-quality-report-pdf' },
    { key: 'deleted', title: 'Deleted Books Audit', description: 'Soft-deleted books uploaded within this range', icon: 'delete_sweep', excelEndpoint: 'download-deleted-books-report-excel', pdfEndpoint: 'download-deleted-books-report-pdf' },
  ];

  usageReports: ReportDefinition[] = [
    { key: 'topDownloaded', title: 'Top Downloaded Books', description: 'Most downloaded books, ranked', icon: 'military_tech', excelEndpoint: 'download-top-downloaded-books-report-excel', pdfEndpoint: 'download-top-downloaded-books-report-pdf', extra: 'top' },
    { key: 'downloadTrend', title: 'Download Trend', description: 'Downloads over time with cumulative growth', icon: 'show_chart', excelEndpoint: 'download-download-trend-report-excel', pdfEndpoint: 'download-download-trend-report-pdf', extra: 'granularity' },
    { key: 'downloadsByCategory', title: 'Downloads by Category', description: 'Includes a monthly breakdown per category', icon: 'pie_chart', excelEndpoint: 'download-downloads-by-category-report-excel', pdfEndpoint: 'download-downloads-by-category-report-pdf' },
    { key: 'departmentPerformance', title: 'Department Performance', description: 'Books vs downloads vs utilization rate per department', icon: 'insights', excelEndpoint: 'download-department-performance-report-excel', pdfEndpoint: 'download-department-performance-report-pdf' },
    { key: 'downloadsByPublisher', title: 'Downloads by Publisher', description: 'Which publishers get downloaded the most', icon: 'storefront', excelEndpoint: 'download-downloads-by-publisher-report-excel', pdfEndpoint: 'download-downloads-by-publisher-report-pdf' },
    { key: 'yearPopularity', title: 'Publication Year Popularity', description: 'Old vs new books download comparison', icon: 'history_edu', excelEndpoint: 'download-year-popularity-report-excel', pdfEndpoint: 'download-year-popularity-report-pdf' },
  ];

  dataQualityReports: ReportDefinition[] = [
    { key: 'duplicates', title: 'Duplicate Books', description: 'Same title + author appearing more than once', icon: 'content_copy', excelEndpoint: 'download-duplicate-books-report-excel', pdfEndpoint: 'download-duplicate-books-report-pdf' },
  ];

  constructor(
    private excelService: ExcelService,
    private coreService: CoreService,
    private widgetService: WidgetService
  ) {}

  ngOnInit(): void {
    this.setDefaultDates();
    this.loadAnalytics();
  }

  ngAfterViewInit(): void {
    this.viewReady = true;
  }

  setDefaultDates(): void {
    this.applyRange(this.selectedRange);
  }

  onRangeChange(): void {
    this.applyRange(this.selectedRange);
    if (this.startDate && this.endDate) {
      this.loadAnalytics();
    }
  }

  private applyRange(range: string): void {
    const today = new Date();

    if (range === 'monthToDate') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      this.startDate = this.formatDate(firstDay);
      this.endDate = this.formatDate(today);
    } else if (range === 'lastMonth') {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      this.startDate = this.formatDate(start);
      this.endDate = this.formatDate(end);
    } else if (range === 'lastThreeMonths') {
      const start = new Date(today.getFullYear(), today.getMonth() - 3, 1);
      this.startDate = this.formatDate(start);
      this.endDate = this.formatDate(today);
    } else if (range === 'thisYear') {
      const start = new Date(today.getFullYear(), 0, 1);
      this.startDate = this.formatDate(start);
      this.endDate = this.formatDate(today);
    } else if (range === 'lastYear') {
      const start = new Date(today.getFullYear() - 1, 0, 1);
      const end = new Date(today.getFullYear() - 1, 11, 31);
      this.startDate = this.formatDate(start);
      this.endDate = this.formatDate(end);
    } else if (range === 'custom') {
      this.startDate = '';
      this.endDate = '';
    }
  }

  onCustomDateChange(): void {
    if (this.startDate && this.endDate) {
      this.loadAnalytics();
    }
  }

  formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = ('0' + (date.getMonth() + 1)).slice(-2);
    const dd = ('0' + date.getDate()).slice(-2);
    return `${yyyy}-${mm}-${dd}`;
  }

  get datePayload() {
    return { startDate: this.startDate, endDate: this.endDate };
  }

  loadAnalytics(): void {
    if (!this.startDate || !this.endDate) return;

    this.isLoading = true;
    forkJoin({
      department: this.widgetService.GetBookByDepartmentWidget(this.datePayload),
      departmentPerformance: this.widgetService.GetDepartmentPerformanceWidget(this.datePayload),
      yearPopularity: this.widgetService.GetYearPopularityWidget(this.datePayload),
      categoryDepartment: this.widgetService.GetCategoryDepartmentWidget(this.datePayload),
      dataQuality: this.widgetService.GetDataQualityWidget(this.datePayload),
    }).subscribe({
      next: (res: any) => {
        this.departmentWidgetData = res.department;
        this.departmentPerformanceData = res.departmentPerformance;
        this.yearPopularityData = res.yearPopularity;
        this.categoryDepartmentData = res.categoryDepartment;
        this.dataQualityData = res.dataQuality;

        setTimeout(() => {
          this.createAnalyticsCharts();
          this.isLoading = false;
        }, 200);
      },
      error: () => {
        this.isLoading = false;
      },
    });
  }

  createAnalyticsCharts(): void {
    const deptCanvas = document.getElementById('deptChart') as HTMLCanvasElement;
    if (deptCanvas) {
      this.departmentChart?.destroy();
      this.departmentChart = new Chart(deptCanvas, {
        type: 'bar',
        data: {
          labels: this.departmentWidgetData.departmentName,
          datasets: [
            {
              label: 'Books',
              data: this.departmentWidgetData.bookCount,
              backgroundColor: '#1b488c',
              borderRadius: 6,
            },
          ],
        },
        options: {
          indexAxis: 'y',
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            x: { beginAtZero: true, grid: { color: '#f3f4f6' } },
            y: { grid: { display: false } },
          },
        },
      });
    }

    const perfCanvas = document.getElementById('deptPerformanceChart') as HTMLCanvasElement;
    if (perfCanvas) {
      this.departmentPerformanceChart?.destroy();
      this.departmentPerformanceChart = new Chart(perfCanvas, {
        data: {
          labels: this.departmentPerformanceData.departmentName,
          datasets: [
            {
              type: 'bar',
              label: 'Books',
              data: this.departmentPerformanceData.bookCount,
              backgroundColor: '#93c5fd',
              borderRadius: 6,
              yAxisID: 'y',
            },
            {
              type: 'bar',
              label: 'Downloads',
              data: this.departmentPerformanceData.downloadCount,
              backgroundColor: '#1b488c',
              borderRadius: 6,
              yAxisID: 'y',
            },
            {
              type: 'line',
              label: 'Utilization Rate',
              data: this.departmentPerformanceData.utilizationRate,
              borderColor: '#d97706',
              backgroundColor: '#d97706',
              tension: 0.3,
              yAxisID: 'y1',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 10 } } },
          scales: {
            y: { beginAtZero: true, position: 'left', grid: { color: '#f3f4f6' } },
            y1: { beginAtZero: true, position: 'right', grid: { display: false } },
            x: { grid: { display: false } },
          },
        },
      });
    }

    const yearCanvas = document.getElementById('yearPopularityChart') as HTMLCanvasElement;
    if (yearCanvas) {
      this.yearPopularityChart?.destroy();
      this.yearPopularityChart = new Chart(yearCanvas, {
        data: {
          labels: this.yearPopularityData.year,
          datasets: [
            {
              type: 'bar',
              label: 'Books Published',
              data: this.yearPopularityData.bookCount,
              backgroundColor: '#dbeafe',
              borderRadius: 4,
              yAxisID: 'y',
            },
            {
              type: 'line',
              label: 'Downloads',
              data: this.yearPopularityData.downloadCount,
              borderColor: '#16a34a',
              backgroundColor: '#16a34a',
              tension: 0.3,
              yAxisID: 'y1',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 10 } } },
          scales: {
            y: { beginAtZero: true, position: 'left', grid: { color: '#f3f4f6' } },
            y1: { beginAtZero: true, position: 'right', grid: { display: false } },
            x: { grid: { display: false } },
          },
        },
      });
    }

    const matrixCanvas = document.getElementById('categoryDepartmentChart') as HTMLCanvasElement;
    if (matrixCanvas) {
      this.categoryDepartmentChart?.destroy();
      const palette = ['#1b488c', '#2f63b8', '#93c5fd', '#16a34a', '#d97706', '#7c3aed', '#dc2626'];
      this.categoryDepartmentChart = new Chart(matrixCanvas, {
        type: 'bar',
        data: {
          labels: this.categoryDepartmentData.categories,
          datasets: this.categoryDepartmentData.departments.map((dept, i) => ({
            label: dept,
            data: this.categoryDepartmentData.matrix[i] ?? [],
            backgroundColor: palette[i % palette.length],
          })),
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 10 } } },
          scales: {
            x: { stacked: true, grid: { display: false } },
            y: { stacked: true, beginAtZero: true, grid: { color: '#f3f4f6' } },
          },
        },
      });
    }

    const qualityCanvas = document.getElementById('dataQualityChart') as HTMLCanvasElement;
    if (qualityCanvas) {
      this.dataQualityChart?.destroy();
      const pct = this.dataQualityData.completePercentage;
      this.dataQualityChart = new Chart(qualityCanvas, {
        type: 'doughnut',
        data: {
          labels: ['Complete', 'Missing / Incomplete'],
          datasets: [
            {
              data: [this.dataQualityData.completeCount, this.dataQualityData.missingCount],
              backgroundColor: ['#16a34a', '#fca5a5'],
              borderWidth: 2,
              borderColor: '#fff',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          cutout: '72%',
          plugins: { legend: { display: true, position: 'bottom', labels: { boxWidth: 10 } } },
        },
        plugins: [
          {
            id: 'centerScore',
            afterDraw(chart) {
              const { ctx, chartArea } = chart;
              const cx = (chartArea.left + chartArea.right) / 2;
              const cy = (chartArea.top + chartArea.bottom) / 2;
              ctx.save();
              ctx.font = 'bold 22px Inter';
              ctx.fillStyle = '#111827';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.fillText(`${pct}%`, cx, cy);
              ctx.restore();
            },
          },
        ],
      });
    }
  }

  downloadReport(report: ReportDefinition, format: ReportFormat): void {
    if (!this.startDate || !this.endDate) {
      this.coreService.openSnackBar('Please select a valid date range', 'Ok', 'error');
      return;
    }

    const payload: any = { startDate: this.startDate, endDate: this.endDate };
    if (report.extra === 'top') payload.top = this.topN;
    if (report.extra === 'days') payload.days = this.recentDays;
    if (report.extra === 'granularity') payload.granularity = this.granularity;

    const endpoint = format === 'pdf' ? report.pdfEndpoint : report.excelEndpoint;
    const extension = format === 'pdf' ? 'pdf' : 'xlsx';

    this.isLoading = true;
    this.excelService.download(endpoint, payload).subscribe({
      next: (blob: Blob) => {
        saveAs(blob, `${report.title.replace(/[^a-zA-Z0-9]/g, '')}_${this.startDate}_to_${this.endDate}.${extension}`);
        this.coreService.openSnackBar('Report downloaded successfully!', 'Ok');
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.coreService.openSnackBar('Failed to generate report', 'Ok', 'error');
      },
    });
  }

  generateCustomReport(format: ReportFormat): void {
    if (!this.startDate || !this.endDate) {
      this.coreService.openSnackBar('Please select a valid date range', 'Ok', 'error');
      return;
    }

    const payload: any = {
      startDate: this.startDate,
      endDate: this.endDate,
      category: this.customCategory || null,
      department: this.customDepartment || null,
      publisher: this.customPublisher || null,
      yearFrom: this.customYearFrom || null,
      yearTo: this.customYearTo || null,
      groupBy: this.customGroupBy,
    };

    const endpoint = format === 'pdf' ? 'download-custom-report-pdf' : 'download-custom-report-excel';
    const extension = format === 'pdf' ? 'pdf' : 'xlsx';

    this.isLoading = true;
    this.excelService.download(endpoint, payload).subscribe({
      next: (blob: Blob) => {
        saveAs(blob, `CustomReport_${this.startDate}_to_${this.endDate}.${extension}`);
        this.coreService.openSnackBar('Report downloaded successfully!', 'Ok');
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.coreService.openSnackBar('Failed to generate report', 'Ok', 'error');
      },
    });
  }
}
