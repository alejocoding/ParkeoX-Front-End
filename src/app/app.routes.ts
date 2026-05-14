import { Routes } from '@angular/router';
import { LoginComponent } from './features/dashboard/Login/login.component';
import { HomeComponent } from './features/home/home.component';
import { RegisterComponent } from './features/dashboard/register/register.component';
import { ServicesComponent } from './features/dashboard/services/services.component';
import { ContactComponent } from './features/dashboard/contacto/contacto.component';
import { AuthLayoutComponent } from './layouts/auth-layout/auth-layout.component';
import { PublicLayoutComponent } from './layouts/public-layout/public-layout.component';
import { AdminLayoutComponent } from './layouts/admin-layout/admin-layout.component';
import { DashboardComponent } from './features/admin/dashboard/dashboard.component';
import { authGuard } from './guards/auth.guard';
import { TicketsComponent } from './features/admin/tickets/tickets.component';


export const routes: Routes = [



  {
    // RUTAS PUBLICAS
    path: '', component: PublicLayoutComponent ,
    children: [

        { path: '', component: HomeComponent },
        { path: 'services', component: ServicesComponent },
        { path: 'contact', component: ContactComponent },

    ]
  },
  {
    // RUTAS PRIVADAS
    path: '',
    component: AuthLayoutComponent,
    children: [

      {
        path: 'login',
        component: LoginComponent
      },

      {
        path: 'register',
        component: RegisterComponent
      }
    ]
  },
  {
    path: 'admin',
    component: AdminLayoutComponent,
    canActivate: [authGuard],
    data: { role: 'SUPERADMIN' },
    children: [
      {path:'dashboard', component: DashboardComponent },
      {path:'tickets', component: TicketsComponent }
    ]
  }

];
