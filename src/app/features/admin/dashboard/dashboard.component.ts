import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent {

  nombre: string | null = '';
  token: string  | null = '';

  constructor(private authService: AuthService) {}

  ngOnInit(): void {

    this.nombre = this.authService.getNombre();
    this.token = this.authService.getToken();



  }
}
