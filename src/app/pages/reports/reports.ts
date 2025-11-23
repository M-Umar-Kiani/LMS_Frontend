import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './reports.html',
  styleUrls: ['./reports.css'],
})
export class Reports {
  ngAfterViewInit(): void {
    // Department Usage bar chart
    new Chart('deptChart', {
      type: 'bar',
      data: {
        labels: ['Computer Science', 'Management Science', 'Social Science'],
        datasets: [
          {
            label: 'Books',
            data: [2, 1, 0],
            backgroundColor: '#3b82f6',
          },
        ],
      },
      options: { plugins: { legend: { display: false } } },
    });

    // // Monthly Activity line chart
    // new Chart('activityChart', {
    //   type: 'line',
    //   data: {
    //     labels: ['Jan','Feb','Mar','Apr','May','Jun'],
    //     datasets: [{
    //       label: 'Borrows',
    //       data: [45,52,38,61,49,55],
    //       borderColor: '#3b82f6',
    //       backgroundColor: 'rgba(59,130,246,0.2)',
    //       fill: true,
    //       tension: 0.3
    //     }]
    //   },
    //   options: { plugins: { legend: { display: false } } }
    // });
  }

  // popularBooks = [
  //   {
  //     rank: 1,
  //     title: 'Introduction to Algorithms',
  //     author: 'Thomas H. Cormen',
  //     dept: 'Computer Science',
  //     borrows: 1,
  //   },
  //   {
  //     rank: 2,
  //     title: 'Clean Code',
  //     author: 'Robert C. Martin',
  //     dept: 'Computer Science',
  //     borrows: 1,
  //   },
  //   {
  //     rank: 3,
  //     title: 'Strategic Management',
  //     author: 'Fred R. David',
  //     dept: 'Management Science',
  //     borrows: 1,
  //   },
  // ];
}
