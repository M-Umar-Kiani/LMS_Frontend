import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { UserTopbar } from '../user-topbar/user-topbar';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule, UserTopbar],
  templateUrl: './user-dashboard.html',
  styleUrls: ['./user-dashboard.css'],
})
export class UserDashboard {
  ngAfterViewInit(): void {
    new Chart('deptChart', {
      type: 'bar',
      data: {
        labels: ['Computer Science', 'Management Science', 'Social Science'],
        datasets: [
          {
            label: 'Books',
            data: [4, 2, 2],
            backgroundColor: '#3b82f6',
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { display: false } },
        scales: { y: { beginAtZero: true } },
      },
    });

    new Chart('categoryChart', {
      type: 'pie',
      data: {
        labels: ['Books', 'Magazines', 'Articles', 'General'],
        datasets: [
          {
            data: [6, 1, 1, 0],
            backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
          },
        ],
      },
      options: {
        responsive: true,
        plugins: { legend: { position: 'right' } },
      },
    });
  }
}
