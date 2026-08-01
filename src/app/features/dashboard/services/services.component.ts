import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-services',
  imports: [RouterModule],
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
