import { Component, AfterViewInit, NgZone, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { WidgetService } from '../../services/widget.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PopularBook } from '../../models/Book.model';
import { TooltipPipe } from '../../custom-pipes/tooltip-pipe';
import { forkJoin } from 'rxjs';
import { ExcelService } from '../../services/excel.service';
import { CoreService } from '../../services/core.service';
import { saveAs } from 'file-saver';
import { Loader } from '../../global/loader/loader';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  imports: [CommonModule, FormsModule, TooltipPipe, Loader],
})
export class Dashboard implements OnInit {
  categoryChart: Chart | null = null;
  departmentChart: Chart | null = null;
  activityChart: Chart | null = null;

  departmentWidgetData: DepartmentWidgetDto = {
    departmentName: [],
    bookCount: [],
  };
  categoryWidgetData: CategoryWidgetDto = {
    categoryName: [],
    bookCount: [],
  };

  monthilyActivityWidgetData: MonthilyActivityWidget = {
    monthName: [],
    bookCount: [],
  };

  popularBooks: PopularBook[] = [];

  bookCount: number = 0;
  downloadedBooksCount: number = 0;

  selectedRange: string = 'monthToDate'; // default selected
  startDate: string = '';
  endDate: string = '';
  isLoading: boolean = false;

  constructor(
    private zone: NgZone,
    private widgetService: WidgetService,
    private excelService: ExcelService,
    private _coreService: CoreService
  ) {}

  ngOnInit(): void {
    this.setDefaultDates();
  }

  setDefaultDates() {
    if (this.selectedRange === 'monthToDate') {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

      this.startDate = firstDay.toISOString().split('T')[0];
      this.endDate = today.toISOString().split('T')[0];
      this.isLoading = true;
      this.refreshDashboard();
    }
  }

  onRangeChange() {
    const today = new Date();

    if (this.selectedRange === 'monthToDate') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      this.startDate = this.formatDate(firstDay);
      this.endDate = this.formatDate(today);
      this.isLoading = true;
      this.refreshDashboard();
    } else if (this.selectedRange === 'lastMonth') {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1);
      const end = new Date(today.getFullYear(), today.getMonth(), 0);
      this.startDate = this.formatDate(start);
      this.endDate = this.formatDate(end);
      this.isLoading = true;
      this.refreshDashboard();
    } else if (this.selectedRange === 'lastThreeMonths') {
      const start = new Date(today.getFullYear(), today.getMonth() - 3, 1);
      this.startDate = this.formatDate(start);
      this.endDate = this.formatDate(today);
      this.isLoading = true;
      this.refreshDashboard();
    } else if (this.selectedRange === 'thisYear') {
      const start = new Date(today.getFullYear(), 0, 1);
      this.startDate = this.formatDate(start);
      this.endDate = this.formatDate(today);
      this.isLoading = true;
      this.refreshDashboard();
    } else if (this.selectedRange === 'lastYear') {
      const start = new Date(today.getFullYear() - 1, 0, 1);
      const end = new Date(today.getFullYear() - 1, 11, 31);
      this.startDate = this.formatDate(start);
      this.endDate = this.formatDate(end);
      this.isLoading = true;
      this.refreshDashboard();
    } else if (this.selectedRange === 'custom') {
      this.startDate = '';
      this.endDate = '';
    }
  }

  formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = ('0' + (date.getMonth() + 1)).slice(-2);
    const dd = ('0' + date.getDate()).slice(-2);
    return `${yyyy}-${mm}-${dd}`;
  }

  onCustomDateChange() {
    if (this.startDate && this.endDate) {
      this.isLoading = true;
      this.refreshDashboard();
    }
  }

  refreshDashboard() {
    forkJoin({
      totalBooks: this.widgetService.GetTotalBooksCount(this.datePayload),
      downloadedBooks: this.widgetService.GetDownloadedBooksCount(this.datePayload),
      category: this.widgetService.GetBookByCategoryWidget(this.datePayload),
      department: this.widgetService.GetBookByDepartmentWidget(this.datePayload),
      popularBooks: this.widgetService.GetPopularBooks(this.datePayload),
      monthlyActivity: this.widgetService.GetMonthlyActivityWidget(this.datePayload),
    }).subscribe({
      next: (res: any) => {
        this.bookCount = res.totalBooks.bookCount;
        this.downloadedBooksCount = res.downloadedBooks.bookCount;

        this.categoryWidgetData = res.category;
        this.departmentWidgetData = res.department;

        this.popularBooks = res.popularBooks.map((book: any, index: number) => ({
          rank: index + 1,
          title: book.title,
          author: book.author,
          dept: book.department,
          download: book.downloads,
        }));

        this.monthilyActivityWidgetData = res.monthlyActivity;
        setTimeout(() => {
          this.createCharts();
          this.isLoading = false;
        }, 1000);
      },
      error: (err) => {
        this.isLoading = false;
      },
    });
  }

  get datePayload() {
    return {
      startDate: this.startDate,
      endDate: this.endDate,
    };
  }

  GetTotalBooksCount() {
    this.widgetService.GetTotalBooksCount(this.datePayload).subscribe({
      next: (resp: any) => {
        this.bookCount = resp.bookCount;
      },
      error: (err) => {},
    });
  }

  GetDownloadedBooksCount() {
    this.widgetService.GetDownloadedBooksCount(this.datePayload).subscribe({
      next: (resp: any) => {
        this.downloadedBooksCount = resp.bookCount;
      },
      error: (err) => {},
    });
  }

  getCategoryWidgetData() {
    this.widgetService.GetBookByCategoryWidget(this.datePayload).subscribe({
      next: (resp: CategoryWidgetDto) => {
        this.categoryWidgetData = resp;
      },
      error: (err) => {},
    });
  }

  getDepartmentidgetData() {
    this.widgetService.GetBookByDepartmentWidget(this.datePayload).subscribe({
      next: (resp: DepartmentWidgetDto) => {
        this.departmentWidgetData = resp;
      },
      error: (err) => {},
    });
  }

  getPopularBooks() {
    this.widgetService.GetPopularBooks(this.datePayload).subscribe({
      next: (resp: any[]) => {
        this.popularBooks = resp.map((book, index) => ({
          rank: index + 1,
          title: book.title,
          author: book.author,
          dept: book.department,
          download: book.downloads,
        }));
      },
      error: (err) => {
        console.error(err);
      },
    });
  }

  getMonthlyActivityWidget() {
    this.widgetService.GetMonthlyActivityWidget(this.datePayload).subscribe({
      next: (resp: MonthilyActivityWidget) => {
        this.monthilyActivityWidgetData = resp;
      },
      error: (err) => {},
    });
  }

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      setTimeout(() => {
        this.createCharts();
      }, 200);
    });
  }

  createCharts(): void {
    const categoryCanvas = document.getElementById('categoryChart') as HTMLCanvasElement;
    if (categoryCanvas) {
      if (this.categoryChart) {
        this.categoryChart.destroy();
      }
      const colors = this.categoryWidgetData.categoryName.map(
        () => '#' + Math.floor(Math.random() * 16777215).toString(16)
      );

      this.categoryChart = new Chart(categoryCanvas, {
        type: 'pie',
        data: {
          labels: this.categoryWidgetData.categoryName,
          datasets: [
            {
              data: this.categoryWidgetData.bookCount,
              backgroundColor: colors,
              borderWidth: 2,
              borderColor: '#ffffff',
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          layout: {
            padding: 40,
          },
          plugins: {
            legend: {
              position: 'right',
              align: 'center',
              labels: {
                boxWidth: 100,
                color: '#111827',
                font: {
                  size: 16,
                  family: 'Inter',
                },
              },
            },
            tooltip: {
              backgroundColor: '#111827',
              titleColor: '#fff',
              bodyColor: '#fff',
            },
            title: {
              display: false,
            },
          },
        },
        plugins: [
          {
            id: 'centerText',
            afterDraw(chart) {
              const {
                ctx,
                chartArea: { width, height },
              } = chart;
              ctx.save();
              ctx.font = 'bold 20px Inter';
              ctx.fillStyle = '#111827';
              ctx.textAlign = 'center';
              ctx.textBaseline = 'middle';
              ctx.restore();
            },
          },
        ],
      });
    }

    const departmentCanvas = document.getElementById('deptChart') as HTMLCanvasElement;
    if (departmentCanvas) {
      if (this.departmentChart) {
        this.departmentChart.destroy();
      }
      this.departmentChart = new Chart(departmentCanvas, {
        type: 'bar',
        data: {
          labels: this.departmentWidgetData.departmentName,
          datasets: [
            {
              label: 'Books',
              data: this.departmentWidgetData.bookCount,
              backgroundColor: '#3b82f6',
              borderRadius: 6,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: { display: false },
            tooltip: {
              backgroundColor: '#111827',
              titleColor: '#fff',
              bodyColor: '#fff',
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: {
                color: '#374151',
              },
              grid: {
                color: '#f3f4f6',
              },
            },
            x: {
              ticks: {
                color: '#374151',
              },
              grid: {
                display: false,
              },
            },
          },
        },
      });
    }

    const activityCanvas = document.getElementById('activityChart') as HTMLCanvasElement;
    if (activityCanvas) {
      if (this.activityChart) {
        this.activityChart.destroy();
      }
      this.activityChart = new Chart('activityChart', {
        type: 'line',
        data: {
          labels: this.monthilyActivityWidgetData.monthName,
          datasets: [
            {
              label: 'Upload(s)',
              data: this.monthilyActivityWidgetData.bookCount,
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59,130,246,0.2)',
              fill: true,
              tension: 0.3,
            },
          ],
        },
        options: { plugins: { legend: { display: false } } },
      });
    }
    this.isLoading = false;
  }

  hasData(widgetData: any): boolean {
    const data = widgetData?.bookCount;
    return Array.isArray(data) && data.length > 0;
  }

  downloadCSV(widgetData: any, filename: string) {
    if (!this.hasData(widgetData)) {
      alert('No data to download!');
      return;
    }

    let rows: any[] = [];

    if (widgetData.categoryName) {
      rows = widgetData.categoryName.map((name: string, index: number) => ({
        Category: name,
        Books: widgetData.bookCount[index],
      }));
    } else if (widgetData.departmentName) {
      rows = widgetData.departmentName.map((name: string, index: number) => ({
        Department: name,
        Books: widgetData.bookCount[index],
      }));
    } else if (widgetData.monthName) {
      rows = widgetData.monthName.map((month: string, index: number) => ({
        Month: month,
        Books: widgetData.bookCount[index],
      }));
    } else if (widgetData.length) {
      // For Popular Books
      rows = widgetData.map((b: any) => ({
        Rank: b.rank,
        Title: b.title,
        Author: b.author,
        Department: b.dept,
        Downloads: b.download,
      }));
    }

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [Object.keys(rows[0]).join(',')]
        .concat(rows.map((r) => Object.values(r).join(',')))
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `${filename}_${new Date().toISOString()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  hasMonthlyActivityData(): boolean {
    const data = this.monthilyActivityWidgetData?.bookCount;
    return Array.isArray(data) && data.some((v) => v > 0);
  }

  // Download Excel Report
  downloadCategoryReportExcel() {
    this.isLoading = true;
    if (!this.startDate || !this.endDate) {
      return;
    }
    this.excelService.downloadDepartmentReportExcel(this.startDate, this.endDate).subscribe({
      next: (blob: Blob) => {
        saveAs(blob, `CategoryReport_${this.startDate}_to_${this.endDate}.xlsx`);
        this._coreService.openSnackBar('File Exported Successfully!', 'Ok');
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = false;
        console.error(err);
        this._coreService.openSnackBar('Failed to export file', 'Ok');
      },
    });
  }

  downloadDepartmentReportExcel() {
    this.isLoading = true;
    if (!this.startDate || !this.endDate) {
      return;
    }
    this.excelService.downloadCategoryReportExcel(this.startDate, this.endDate).subscribe({
      next: (blob: Blob) => {
        saveAs(blob, `DepartmentReport_${this.startDate}_to_${this.endDate}.xlsx`);
        this._coreService.openSnackBar('File Exported Successfully!', 'Ok');
        this.isLoading = false;
      },
      error: (err) => {
        this.isLoading = true;
        console.error(err);
        this._coreService.openSnackBar('Failed to export file', 'Ok');
      },
    });
  }
}
