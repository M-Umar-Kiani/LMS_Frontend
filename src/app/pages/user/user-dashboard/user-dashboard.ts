import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-user-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './user-dashboard.html',
  styleUrls: ['./user-dashboard.css'],
})
export class UserDashboard {
  ngAfterViewInit(): void {
    // Department-wise Bar Chart
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

    // Category-wise Pie Chart
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

  latestBooks = [
    {
      title: 'Machine Learning Research',
      author: 'Dr. Sarah Johnson',
      year: 2024,
      category: 'Article',
      image: 'https://images.unsplash.com/photo-1677442136019-21780ecad995',
    },
    {
      title: 'Psychology Today',
      author: 'Various Authors',
      year: 2024,
      category: 'Magazine',
      image: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0ea',
    },
    {
      title: 'Social Psychology',
      author: 'David G. Myers',
      year: 2023,
      category: 'Book',
      image: 'https://images.unsplash.com/photo-1581091012184-7af8c6cda3b2',
    },
    {
      title: 'Strategic Management',
      author: 'Fred R. David',
      year: 2023,
      category: 'Book',
      image: 'https://images.unsplash.com/photo-1544006659-f0b21884ce1d',
    },
  ];
}
