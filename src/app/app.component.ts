import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { FooterComponent } from './shared/components/footer/footer.component';
import { RouterModule } from '@angular/router';
@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NavbarComponent, FooterComponent, RouterModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'ParkeoxFront';
}
