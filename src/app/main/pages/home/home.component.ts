import { Component, effect, inject, signal } from '@angular/core';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCardModule } from '@angular/material/card';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { MainService } from '../../../../core/main.service';
import { IRegister } from './interfaces/home.interface';
import { UserComponent } from '../user/user.component';
import { GlobalService } from '../../../../core/global.service';
@Component({
  selector: 'app-home',
  imports: [
    MatInputModule,
    MatButtonModule,
    MatFormFieldModule,
    MatCardModule,
    ReactiveFormsModule,
    FormsModule,
    RouterLink,
    UserComponent
  ],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',

})
export class HomeComponent {
public logeado = signal<boolean>(false);
public _mainService = inject(MainService);
public _globalService = inject(GlobalService);
public user = signal<IRegister | null>(null);
public token = signal<string | null>(null);
public loginForm = new FormGroup({
      firstName: new FormControl('', Validators.required),
      lastName: new FormControl('', Validators.required),
      username: new FormControl('', Validators.required),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [Validators.required, Validators.minLength(6)]),
    });

  onSubmit(): void {
    if (this.loginForm.valid) {
      console.log(this.loginForm.value); // Aquí se manejan los datos del formulario
    } else {
      console.log('Formulario no válido');
    }
  }
public effectToken = effect(()=>{
     if(this._globalService.token()){
       this.logeado.set(true);
     }
})
  
registrar(){
  const formValue = this.loginForm.controls;
  const body:IRegister = {
    username: formValue.username.value as string,
    password: formValue.password.value as string,
    email: formValue.email.value as string,
    firstName: formValue.firstName.value as string,
    lastName: formValue.lastName.value as string
  }
  this._mainService.registrar(body).subscribe({
    next:(res)=>{
        this._globalService.user.set(res.body);
        this.logeado.set(true); 
    },
    error:(err)=>{
      console.error(err);
      alert('Error al registrarse');
    }
  });
}

}
