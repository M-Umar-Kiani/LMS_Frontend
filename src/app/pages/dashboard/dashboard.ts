import { Component, AfterViewInit, NgZone, OnInit } from '@angular/core';
import { Chart } from 'chart.js/auto';
import { WidgetService } from '../../services/widget.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PopularBook } from '../../models/Book.model';
import { TooltipPipe } from '../../custom-pipes/tooltip-pipe';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  templateUrl: './dashboard.html',
  styleUrls: ['./dashboard.css'],
  imports: [CommonModule, FormsModule, TooltipPipe],
})
export class Dashboard implements OnInit {
  departmentWidgetData: DepartmentWidgetDto = {
    departmentName: [],
    bookCount: [],
  };
  categoryWidgetData: CategoryWidgetDto = {
    categoryName: [],
    bookCount: [],
  };

  popularBooks: PopularBook[] = [];

  bookCount: number = 0;
  downloadedBooksCount: number = 0;

  selectedRange: string = 'monthToDate'; // default selected
  startDate: string = '';
  endDate: string = '';

  constructor(private zone: NgZone, private widgetService: WidgetService) {}

  ngOnInit(): void {
    this.setDefaultDates();
  }

  setDefaultDates() {
    if (this.selectedRange === 'monthToDate') {
      const today = new Date();
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);

      this.startDate = firstDay.toISOString().split('T')[0];
      this.endDate = today.toISOString().split('T')[0];
      this.onRangeChange();
    }
  }

  onRangeChange() {
    const today = new Date();

    if (this.selectedRange === 'monthToDate') {
      const firstDay = new Date(today.getFullYear(), today.getMonth(), 1);
      this.startDate = this.formatDate(firstDay); // local 1st of month
      this.endDate = this.formatDate(today); // local today
    } else if (this.selectedRange === 'lastMonth') {
      const start = new Date(today.getFullYear(), today.getMonth() - 1, 1); // 1st day of last month
      const end = new Date(today.getFullYear(), today.getMonth(), 0); // last day of last month
      this.startDate = this.formatDate(start);
      this.endDate = this.formatDate(end);
    } else if (this.selectedRange === 'lastThreeMonths') {
      const start = new Date(today.getFullYear(), today.getMonth() - 3, 1);
      this.startDate = this.formatDate(start);
      this.endDate = this.formatDate(today);
    } else if (this.selectedRange === 'thisYear') {
      const start = new Date(today.getFullYear(), 0, 1);
      this.startDate = this.formatDate(start);
      this.endDate = this.formatDate(today);
    } else if (this.selectedRange === 'lastYear') {
      const start = new Date(today.getFullYear() - 1, 0, 1); // Jan 1 of last year
      const end = new Date(today.getFullYear() - 1, 11, 31); // Dec 31 of last year
      this.startDate = this.formatDate(start);
      this.endDate = this.formatDate(end);
    }

    this.refreshDashboard();
  }

  formatDate(date: Date): string {
    const yyyy = date.getFullYear();
    const mm = ('0' + (date.getMonth() + 1)).slice(-2); // Months are 0-based
    const dd = ('0' + date.getDate()).slice(-2);
    return `${yyyy}-${mm}-${dd}`;
  }

  onCustomDateChange() {
    if (this.startDate && this.endDate) {
      this.refreshDashboard();
    }
  }

  refreshDashboard() {
    this.GetTotalBooksCount();
    this.GetDownloadedBooksCount();
    this.getCategoryWidgetData();
    this.getDepartmentidgetData();
    this.getPopularBooks();

    setTimeout(() => this.createCharts(), 300);
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
    const datePayload = {
      startDate: this.startDate,
      endDate: this.endDate,
    };
    this.widgetService.GetDownloadedBooksCount(this.datePayload).subscribe({
      next: (resp: any) => {
        this.downloadedBooksCount = resp.bookCount;
      },
      error: (err) => {},
    });
  }

  getCategoryWidgetData() {
    const datePayload = {
      startDate: this.startDate,
      endDate: this.endDate,
    };
    this.widgetService.GetBookByCategoryWidget(this.datePayload).subscribe({
      next: (resp: CategoryWidgetDto) => {
        this.categoryWidgetData = resp;
      },
      error: (err) => {},
    });
  }

  getDepartmentidgetData() {
    const datePayload = {
      startDate: this.startDate,
      endDate: this.endDate,
    };
    this.widgetService.GetBookByDepartmentWidget(this.datePayload).subscribe({
      next: (resp: DepartmentWidgetDto) => {
        this.departmentWidgetData = resp;
      },
      error: (err) => {},
    });
  }

  getPopularBooks() {
    const payload = {
      startDate: this.startDate,
      endDate: this.endDate,
    };

    this.widgetService.GetPopularBooks(payload).subscribe({
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

  ngAfterViewInit(): void {
    this.zone.runOutsideAngular(() => {
      setTimeout(() => {
        this.createCharts();
      }, 200);
    });
  }

  createCharts(): void {
    // ✅ Category Distribution (same as your desired first screenshot)
    const categoryCanvas = document.getElementById('categoryChart') as HTMLCanvasElement;
    if (categoryCanvas) {
      const colors = this.categoryWidgetData.categoryName.map(
        () => '#' + Math.floor(Math.random() * 16777215).toString(16) // generates random hex colors
      );

      new Chart(categoryCanvas, {
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
            padding: 70,
          },
          plugins: {
            legend: {
              position: 'right',
              align: 'center',
              labels: {
                boxWidth: 100,
                color: '#111827',
                font: {
                  size: 13,
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
              ctx.fillText('8', width / 2.3, height / 2.1);
              ctx.restore();
            },
          },
        ],
      });
    }

    // ✅ Books by Department (Bar Chart)
    const deptCanvas = document.getElementById('deptChart') as HTMLCanvasElement;
    if (deptCanvas) {
      new Chart(deptCanvas, {
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

    // Monthly Activity line chart
    new Chart('activityChart', {
      type: 'line',
      data: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [
          {
            label: 'Borrows',
            data: [45, 52, 38, 61, 49, 55],
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
}
