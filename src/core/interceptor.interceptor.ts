import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthService } from './auth.service';
import { catchError, finalize, switchMap, throwError } from 'rxjs';
import { SpinnerService } from './spinner.service';

export const interceptorInterceptor: HttpInterceptorFn = (req, next) => {
 const authService = inject(AuthService); // Si tenemos un api que nos invoque el token
 const spinnerService = inject(SpinnerService); 
  const publicUrls = ['/login', '/register'];
  if (publicUrls.some(url => req.url.includes(url))) {
     spinnerService.show();
    return next(req).pipe(
      finalize(() => {
        spinnerService.hide();
      }));
  }
  spinnerService.show();

 // req.clone({
  //   setHeaders:{
  //     Authorization: `Bearer ${authService.getToken()}`,
  //   }
  // })

  return next(authService.addAuthHeader(req)).pipe(
    finalize(() => {
      // Ocultar spinner al finalizar (éxito o error)
      spinnerService.hide();
    }),
    catchError(error => {
      spinnerService.hide();
      if (error.status === 401 ) {
      authService.logout();
        return throwError(() => new Error('Sesión expirada'));
      }
      return throwError(() => error);
    })
  );
};
