import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { DashboardService } from './service/dashboard.service';

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
  company: any = null;
  nit: any = null;

  constructor(private authService: AuthService, private dashboardService: DashboardService) {}

  ngOnInit(): void {

    this.nombre = this.authService.getNombre();
    this.token = this.authService.getToken();
    this.nit = this.authService.getcompany();

    // GLOBAL VARIABLE
    sessionStorage.setItem('company', this.nit ?? 'Sin compañía');

    this.dashboardService.getCompany().subscribe({
      next:(data)=>{
        console.log(data);



      this.company = data[0];

    },

    error:(err)=>{

      console.error(err);

    }

  });

  }
}
