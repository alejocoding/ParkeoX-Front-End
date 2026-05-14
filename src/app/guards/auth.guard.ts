import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthService);
  const router = inject(Router);

  // Verificar autenticación
  if (!authService.isAuthenticated()) {

    router.navigate(['/login']);

    return false;
  }

  // Rol requerido
  const expectedRole = route.data?.['role'];

  // Rol del usuario
  const userRole = authService.getRol();

  // Validar rol
  if (expectedRole && userRole !== expectedRole) {

    router.navigate(['/login']);

    return false;
  }

  return true;
};
