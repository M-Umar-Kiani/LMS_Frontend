import { Component, NgZone } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { UserTopbar } from '../user-topbar/user-topbar';
import { PopularBook } from '../../../models/Book.model';
import { WidgetService } from '../../../services/widget.service';
import { CoreService } from '../../../services/core.service';
import { forkJoin } from 'rxjs';
import { Loader } from '../../../global/loader/loader';
import { FormsModule } from '@angular/forms';
import { TooltipPipe } from '../../../custom-pipes/tooltip-pipe';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, UserTopbar, Loader, FormsModule, TooltipPipe],
  templateUrl: './user-dashboard.html',
  styleUrls: ['./user-dashboard.css'],
})
export class UserDashboard {
  categoryChart: Chart | null = null;
  departmentChart: Chart | null = null;

  popularBooks: PopularBook[] = [];

  bookCount: number = 0;
  downloadedBooksCount: number = 0;

  departmentWidgetData: DepartmentWidgetDto = {
    departmentName: [],
    bookCount: [],
  };
  categoryWidgetData: CategoryWidgetDto = {
    categoryName: [],
    bookCount: [],
  };

  selectedRange: string = 'monthToDate';
  startDate: string = '';
  endDate: string = '';
  isLoading: boolean = false;

  constructor(
    private zone: NgZone,
    private widgetService: WidgetService,
    private _coreService: CoreService
  ) {}

  ngOnInit(): void {
    this.setDefaultDates();
  }
  get datePayload() {
    return {
      startDate: this.startDate,
      endDate: this.endDate,
    };
  }

  setDefaultDates() {
    if (this.selectedRange === 'monthToDate') {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

      this.startDate = firstDay.toISOString().split('T')[0];
      this.endDate = this.formatEndDate(today.getFullYear(), today.getMonth(), today.getDate());

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

        setTimeout(() => {
          this.createCharts();
          this.isLoading = false;
        }, 1000);
      },
      error: (err) => {
        this._coreService.openSnackBar('Failed to load Dashboard!', 'Ok', 'error');
        this.isLoading = false;
      },
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
            padding: 20,
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
    this.isLoading = false;
  }

  hasData(widgetData: any): boolean {
    const data = widgetData?.bookCount;
    return Array.isArray(data) && data.length > 0;
  }

  formatEndDate(year: number, month: number, day: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
}
