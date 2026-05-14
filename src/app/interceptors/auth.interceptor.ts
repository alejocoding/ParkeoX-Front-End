import { HttpInterceptorFn } from '@angular/common/http';

export const authInterceptor: HttpInterceptorFn = (req, next) => {

  const token = localStorage.getItem('token');

  // Rutas públicas
  const publicRoutes = [

    '/auth/login',
    '/auth/register'

  ];
  // Verifica si la request es pública
  const isPublic = publicRoutes.some(route =>
    req.url.includes(route)
  );

  // Si es pública NO agrega token
  if(isPublic){
    return next(req);
  }

  // Si hay token lo agrega
  if(token){

    const clonedRequest = req.clone({

      setHeaders: {
        Authorization: `Bearer ${token}`
      }

    });

    return next(clonedRequest);
  }

  return next(req);
};
