import { Component, inject, Injector, Input, model, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { GlobalService } from '../../../../../../../core/global.service';
import { AuthService } from '../../../../../../../core/auth.service';
import { MainService } from '../../../../../../../core/main.service';
import { SharedCoreService } from '../../../../../../../core/sharedCore.service';
import { IRegister, IUser, IUserStatus } from '../../../../home/interfaces/home.interface';
import { MatDialogRef } from '@angular/material/dialog';
import { RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
@Component({
  selector: 'app-followers',
  imports: [
        MatButtonModule,
        RouterLink
  ],
  templateUrl: './followers.component.html',
  styleUrl: './followers.component.scss'
})
export class FollowersComponent {
 public _globalService = inject(GlobalService);
 public _dialogRef = inject(MatDialogRef<FollowersComponent>);
  public authService = inject(AuthService);
  public mainService = inject(MainService);
    public _sharedCoreService = inject(SharedCoreService);
  public locarlStorage = localStorage;
  public sugerencias = signal<IUser[] | null>(null);
  public usuariosStatusFollow = signal<IUserStatus[] | null>(null);
  public seguidores = signal<any[]>([]);
  public siguiendoCount = signal<number>(0);
  public viewComponent = signal<'post'|'follower'>('follower')
          public posts = model<any[]>([]);
  constructor(){
   const idUser = Number(this.locarlStorage.getItem('id_user'));
  this._globalService.idUser.set(idUser);
    this._globalService.isMyProfile.asObservable().pipe(takeUntilDestroyed()).subscribe((isMyProfile) => {
      
      if (isMyProfile) {
      console.log('hola "q42',isMyProfile);

       this.getUserXId(idUser);
   this.getSuggerencias();
   this.getSeguidores();
   this.getUserStatusFollow();
   this.getCountUser(idUser);
   this.getMedias();
    } else {
       const idUser = this._globalService.profileUser.getValue()?.id as number;
      console.log('Load =>', idUser);
   this.getSuggerencias();
   this.getSeguidoresXId(idUser);
   this.getCountUser(idUser);
    }
  });
  }

close(){
    this._dialogRef.close();
  }
   getCountUser(id:number){
    this.mainService.getCountFollow(id).subscribe({
      next: (res)=>  this._globalService.countFollowing.next(res.body)
    })
  }
    getMedias(){
    this.mainService.getVideos().subscribe({
      next:(res)=>{
          this.posts.set(res.body);
      }
    })
  }
  getSuggerencias(){
       this.mainService.getUsers().subscribe({
    next:(res: { body: IUser[] | null; })=>{
      this.sugerencias.set(res.body);
    }
   }) 
      }

   getUserStatusFollow(){
           this.mainService.getUserStatusFollow().subscribe({
    next:(res: { body: IUserStatus[] | null; })=>{
      this.usuariosStatusFollow.set(res.body);
    }
   }) 
   }   
  getUserXId(idUser:number){
       this.mainService.getUser(idUser).subscribe({
    next:(res: { body: IRegister | null; })=>{
      this._globalService.user.set(res.body);
    }
   }) 
  }

  getSeguidores(){
    this.mainService.getSeguidores().subscribe({
    next:(res)=>{
      this.seguidores.set(res.body);
      this._globalService.countFollowers.next(res.body.length);
    }
   }) 
  }

  getSeguidoresXId(id:number){
        this.mainService.getSeguidoresXId(id).subscribe({
    next:(res)=>{
      console.log('hola otro usuario', res.body);
      this.seguidores.set(res.body);
      this._globalService.countFollowers.next(res.body.length);
    }
   }) 
  }
 
  seguir(user:IUserStatus | null){
      console.log('Usuario a seguir =>',user );
      this.mainService.postSeguir(user?.id as number).subscribe({
        next:(res)=>{
           if(!this._globalService.isMyProfile.value){
            console.log("ID",this._globalService.profileUser.getValue()?.id as number)
            this.getSeguidoresXId(this._globalService.profileUser.getValue()?.id as number);
            this.getCountUser(this._globalService.profileUser.getValue()?.id as number);
           }else{
            this.getUserStatusFollow();
            this.getSeguidores();
            this.getCountUser(this._globalService.idUser() as number)
           }
        }
      })
  }
  dejarSeguir(user:IUserStatus){
           this.mainService.postUnFollowId(user?.id as number).subscribe({
        next:(res)=>{
           if(this._globalService.isMyProfile.getValue()){
      
            console.log("ID",this._globalService.profileUser.getValue()?.id as number)
            this.getSeguidoresXId(this._globalService.profileUser.getValue()?.id as number);
            this.getCountUser(this._globalService.profileUser.getValue()?.id as number);
           }else{
            this.getUserStatusFollow();
            this.getSeguidores();
            this.getCountUser(this._globalService.idUser() as number)
           }
        }
      })
  }
}
