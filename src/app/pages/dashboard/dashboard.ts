import { Component, AfterViewInit, NgZone, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { WidgetService } from '../../services/widget.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PopularBook } from '../../models/Book.model';
import { TooltipPipe } from '../../custom-pipes/tooltip-pipe';
import { forkJoin } from 'rxjs';
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
  topBooksChart: Chart | null = null;
  booksSparkline: Chart | null = null;
  downloadsSparkline: Chart | null = null;

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

  downloadTrendWidgetData: MonthilyActivityWidget = {
    monthName: [],
    bookCount: [],
  };

  popularBooks: PopularBook[] = [];

  bookCount: number = 0;
  downloadedBooksCount: number = 0;

  selectedRange: string = 'monthToDate';
  startDate: string = '';
  endDate: string = '';
  isLoading: boolean = false;

  constructor(
    private zone: NgZone,
    private widgetService: WidgetService
  ) {}

  ngOnInit(): void {
    this.setDefaultDates();
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
      monthlyActivity: this.widgetService.GetMonthlyActivityWidget(this.datePayload),
      downloadTrend: this.widgetService.GetDownloadTrendWidget(this.datePayload),
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
        this.downloadTrendWidgetData = res.downloadTrend;
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
              backgroundColor: '#1b488c',
              borderRadius: 6,
            },
          ],
        },
        options: {
          indexAxis: 'y',
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
            x: {
              beginAtZero: true,
              ticks: {
                color: '#374151',
              },
              grid: {
                color: '#f3f4f6',
              },
            },
            y: {
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
      const cumulative: number[] = [];
      let running = 0;
      for (const v of this.monthilyActivityWidgetData.bookCount) {
        running += v;
        cumulative.push(running);
      }

      this.activityChart = new Chart('activityChart', {
        type: 'bar',
        data: {
          labels: this.monthilyActivityWidgetData.monthName,
          datasets: [
            {
              type: 'bar',
              label: 'Uploads',
              data: this.monthilyActivityWidgetData.bookCount,
              backgroundColor: 'rgba(27,72,140,0.25)',
              borderRadius: 6,
              yAxisID: 'y',
              order: 2,
            },
            {
              type: 'line',
              label: 'Cumulative',
              data: cumulative,
              borderColor: '#1b488c',
              backgroundColor: '#1b488c',
              tension: 0.3,
              yAxisID: 'y1',
              order: 1,
            },
          ],
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              display: true,
              position: 'bottom',
              labels: { boxWidth: 10, color: '#374151' },
            },
          },
          scales: {
            y: {
              beginAtZero: true,
              position: 'left',
              grid: { color: '#f3f4f6' },
              ticks: { color: '#374151' },
            },
            y1: {
              beginAtZero: true,
              position: 'right',
              grid: { display: false },
              ticks: { color: '#374151' },
            },
            x: {
              grid: { display: false },
              ticks: { color: '#374151' },
            },
          },
        },
      });
    }

    const topBooksCanvas = document.getElementById('topBooksChart') as HTMLCanvasElement;
    if (topBooksCanvas) {
      if (this.topBooksChart) {
        this.topBooksChart.destroy();
      }
      this.topBooksChart = new Chart(topBooksCanvas, {
        type: 'bar',
        data: {
          labels: this.popularBooks.map((b) => (b.title?.length > 22 ? b.title.slice(0, 22) + '…' : b.title)),
          datasets: [
            {
              label: 'Downloads',
              data: this.popularBooks.map((b) => b.download),
              backgroundColor: '#16a34a',
              borderRadius: 6,
            },
          ],
        },
        options: {
          indexAxis: 'y',
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
            x: { beginAtZero: true, ticks: { color: '#374151' }, grid: { color: '#f3f4f6' } },
            y: { ticks: { color: '#374151' }, grid: { display: false } },
          },
        },
      });
    }

    this.createSparklines();
    this.isLoading = false;
  }

  private sparklineOptions(color: string): any {
    return {
      responsive: true,
      maintainAspectRatio: false,
      elements: { point: { radius: 0 } },
      plugins: { legend: { display: false }, tooltip: { enabled: false } },
      scales: {
        x: { display: false },
        y: { display: false },
      },
    };
  }

  createSparklines(): void {
    const booksCanvas = document.getElementById('booksSparkline') as HTMLCanvasElement;
    if (booksCanvas) {
      if (this.booksSparkline) {
        this.booksSparkline.destroy();
      }
      this.booksSparkline = new Chart(booksCanvas, {
        type: 'line',
        data: {
          labels: this.monthilyActivityWidgetData.monthName,
          datasets: [
            {
              data: this.monthilyActivityWidgetData.bookCount,
              borderColor: '#1b488c',
              backgroundColor: 'rgba(27,72,140,0.15)',
              fill: true,
              tension: 0.35,
              borderWidth: 2,
            },
          ],
        },
        options: this.sparklineOptions('#1b488c'),
      });
    }

    const downloadsCanvas = document.getElementById('downloadsSparkline') as HTMLCanvasElement;
    if (downloadsCanvas) {
      if (this.downloadsSparkline) {
        this.downloadsSparkline.destroy();
      }
      this.downloadsSparkline = new Chart(downloadsCanvas, {
        type: 'line',
        data: {
          labels: this.downloadTrendWidgetData.monthName,
          datasets: [
            {
              data: this.downloadTrendWidgetData.bookCount,
              borderColor: '#16a34a',
              backgroundColor: 'rgba(22,163,74,0.15)',
              fill: true,
              tension: 0.35,
              borderWidth: 2,
            },
          ],
        },
        options: this.sparklineOptions('#16a34a'),
      });
    }
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

  formatEndDate(year: number, month: number, day: number): string {
    return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }
}
