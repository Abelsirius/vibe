import { Component, inject, signal } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { MainService } from '../../../../../core/main.service';
import { ILogin } from '../interfaces/home.interface';
import { GlobalService } from '../../../../../core/global.service';
import { SharedCoreService } from '../../../../../core/sharedCore.service';
@Component({
  selector: 'app-join',
  imports: [
        MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatCardModule,
    ReactiveFormsModule,
    FormsModule,
    MatIconModule,
    RouterLink
  ],
  templateUrl: './join.component.html',
  styleUrl: './join.component.scss'
})
export class JoinComponent {
  public _mainService = inject(MainService)
  public _globalService = inject(GlobalService);
  public _sharedCoreService = inject(SharedCoreService);
public localStorage = sessionStorage;
  public user = signal<any | null>(null);
  public idUser = signal<number | null>(null);
public token = signal<string | null>(null);
public loginForm = new FormGroup({
      username: new FormControl('', [Validators.required]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    });
constructor(private router: Router){
  
}


  login(){
    const body : ILogin = {
      username: this.loginForm.controls.username.value as string,
      password: this.loginForm.controls.password.value as string
    }
  if(this.token() === null){
      this._mainService.login(body).subscribe({
    next:(res)=>{
      console.log('Login response:', res);
      this.token.set(res.body.token);
      this.user.set(res.body);
      this._globalService.token.set(res.body.token);
sessionStorage.setItem('auth_token', res.body.token);
sessionStorage.setItem('id_user', res.body.id);
      this._globalService.user.set(res.body);
      if(res.status === 200){
        this._globalService.token.set(this.token() ?? '');
        this.router.navigate([`/${this.user().username}`]);
        // this._sharedCoreService.openDialog(1, ` Bienvenido a VibeMe  ${this.user().username}` );
      }else{
        this._sharedCoreService.openDialog(2, 'Error al iniciar sesión, Por favor, inténtalo de nuevo más tarde.');
      }
    },
    error:(err)=>{
      console.error(err);
      this._sharedCoreService.openDialog(2, 'Error al iniciar sesión, Por favor, inténtalo de nuevo más tarde.');
    }
  });
  }else{
    this._sharedCoreService.openDialog(2, 'Ya has iniciado sesión');
  }
}
}
