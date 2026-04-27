import { Component } from '@angular/core';

@Component({
  selector: 'app-services',
  imports: [],
  templateUrl: './services.component.html',
  styleUrl: './services.component.css'
})
export class ServicesComponent {

  ngAfterViewInit() {
  const stats = document.querySelectorAll('.stat h3');

  stats.forEach(stat => {
    let start = 0;
    const end = parseInt(stat.textContent || '0');

    const interval = setInterval(() => {
      start += Math.ceil(end / 50);
      stat.textContent = start.toString();

      if (start >= end) clearInterval(interval);
    }, 30);
  });
}
}
