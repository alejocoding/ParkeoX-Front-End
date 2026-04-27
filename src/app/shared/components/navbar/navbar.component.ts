import { Component } from '@angular/core';
import { RouterLink } from "@angular/router";
import { RouterModule } from '@angular/router';

@Component({
  selector: 'app-navbar',
  imports: [RouterLink, RouterModule],
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.css'
})
export class NavbarComponent {

}
