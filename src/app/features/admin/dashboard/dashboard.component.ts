import { Component } from '@angular/core';
import { AuthService } from '../../../services/auth.service';
import { DashboardService } from './service/dashboard.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
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
    console.log("Token: ", this.token);
    this.nit = this.authService.getcompany();


    // GLOBAL VARIABLE
    sessionStorage.setItem('company', this.nit ?? 'Sin compañía');

    this.dashboardService.getCompany(this.nit).subscribe({
      next:(data:any)=>{
        console.log(data);

      this.company = data.name;

    },

    error:(err)=>{

      console.error(err);

    }

  });

  }
}
