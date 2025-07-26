import { HttpRequest } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { GlobalService } from './global.service';
import { IUser } from '../app/main/pages/home/interfaces/home.interface';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private router = inject(Router); // Asegúrate de importar Router desde '@angular/router'
  public _globaServie = inject(GlobalService);
  public isCurrentUser (user:number):boolean{
    console.log("Usuario Ingresado =>",user , this._globaServie.user());
      if(this._globaServie.idUser() === user ){
             return true;
      }else{
        return false;
      }
  }
  constructor() { }

  addAuthHeader<T>(request: HttpRequest<T>): HttpRequest<T> {
    const token = this.getToken(); // Método que obtiene el token (ej: desde localStorage)

    if (!token) {
      throw new Error('No authentication token available');
    }

    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`,
      }
    });
  }
logout(): void {
  // 1. Limpiar datos localmente
  localStorage.removeItem('auth_token');
  localStorage.removeItem('id_user');
  this._globaServie.token.set(null); // Si usas un servicio global
  this._globaServie.user.set(null);

  // 2. Notificar a otras pestañas (BroadcastChannel)
  const authChannel = new BroadcastChannel('auth_channel');
  authChannel.postMessage('logout');
  authChannel.close();

  // 3. Redirigir al login
  this.router.navigate(['/login']);
}
public getToken(): string {
    return sessionStorage.getItem('auth_token') ?? ''; // Cambiado a sessionStorage
}

  // private generateCorrelationId(): string {
  //   // UUID v4 para tracing distribuido (estilo Microsoft/Google)
  //   return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
  //     const r = (Math.random() * 16) | 0;
  //     const v = c === 'x' ? r : (r & 0x3) | 0x8;
  //     return v.toString(16);
  //   });
  // }
}
