import { Routes } from '@angular/router';
import { LoginComponent } from './features/dashboard/Login/login.component';
import { HomeComponent } from './features/home/home.component';
import { RegisterComponent } from './features/dashboard/register/register.component';
import { ServicesComponent } from './features/dashboard/services/services.component';
import { ContactComponent } from './features/dashboard/contacto/contacto.component';

export const routes: Routes = [
  { path: '', component: HomeComponent }, // 👈 página principal
  { path: 'login', component: LoginComponent },
  { path: 'register', component: RegisterComponent },
  { path: 'services', component: ServicesComponent },
  { path: 'contact', component: ContactComponent }

];
