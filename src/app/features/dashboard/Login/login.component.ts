import { HttpClient } from '@angular/common/http';
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';


@Component({
  standalone: true,
  imports: [FormsModule, RouterModule],
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  email: string = '';
  password: string = '';

  constructor(private http: HttpClient) {}



  //  login(): void {
  //   this.http.post('http://localhost:8080/auth/login', { email: this.email, password: this.password })
  //     .subscribe({
  //       next: (response) => {
  //         console.log('TOKEN', response);
  //       },
  //       error: (error) => {
  //         console.error('Error:', error);
  //       }
  //     });
  // }
}
