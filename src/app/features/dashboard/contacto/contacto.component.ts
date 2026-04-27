import { Component } from '@angular/core';

@Component({
  selector: 'app-contact',
  standalone: true,
  templateUrl: './contacto.component.html',
  styleUrl: './contacto.component.css'
})
export class ContactComponent {

  sendEmail(event: Event) {
    event.preventDefault();

    const form = event.target as HTMLFormElement;

    const name = (form.elements.namedItem('name') as HTMLInputElement).value;
    const email = (form.elements.namedItem('email') as HTMLInputElement).value;
    const message = (form.elements.namedItem('message') as HTMLTextAreaElement).value;

    const subject = `Mensaje de ${name}`;
    const body = `Nombre: ${name}%0AEmail: ${email}%0A%0AMensaje:%0A${message}`;

    window.location.href = `mailto:alejoreyvm@gmail.com?subject=${subject}&body=${body}`;
  }
}
