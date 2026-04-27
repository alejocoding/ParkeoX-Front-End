import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';

@Component({
  standalone: true,
  imports: [FormsModule, RouterModule],
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrl: '../login/login.component.css'
})
export class RegisterComponent {
  name: string = '';
  email: string = '';
  password: string = '';

  register() {
    console.log('Register:', this.name, this.email, this.password);
  }
}
