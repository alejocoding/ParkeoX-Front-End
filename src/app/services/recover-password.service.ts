import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RecoverPasswordService {
  email: string = '';
  resetToken: string = '';

  reset(): void {
    this.email = '';
    this.resetToken = '';
  }
}
