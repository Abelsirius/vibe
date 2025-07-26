import { Component, inject, Input, model, OnInit, signal } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { IRegister, IUser, IUserStatus, UserProfile } from '../home/interfaces/home.interface';
import { GlobalService } from '../../../../core/global.service';
import { AuthService } from '../../../../core/auth.service';
import { MainService } from '../../../../core/main.service';
import { SharedCoreService } from '../../../../core/sharedCore.service';
import { PostComponent } from './components/post/post.component';
import { MatDialog } from '@angular/material/dialog';
import { FollowersComponent } from './components/shared/followers/followers.component';
import { AsyncPipe } from '@angular/common';
import { FolloweingComponent } from './components/shared/followeing/followeing.component';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { catchError, of, switchMap } from 'rxjs';
import { ChatComponent } from './components/shared/chat/chat.component';

@Component({
  selector: 'app-user',
  imports: [
    MatButtonModule,
    PostComponent,
    AsyncPipe,
    RouterLink
  ],
  templateUrl: './user.component.html',
  styleUrl: './user.component.scss'
})
export class UserComponent implements OnInit {
  public _globalService = inject(GlobalService);
  public authService = inject(AuthService);
  public mainService = inject(MainService);
  public _dialog = inject(MatDialog);
  public _sharedCoreService = inject(SharedCoreService);
  public locarlStorage = localStorage;
  public sugerencias = signal<IUser[] | null>(null);
  public usuariosStatusFollow = signal<IUserStatus[] | null>(null);
  public seguidores = signal<any[]>([]);
  public _route = inject(ActivatedRoute);
  public _router = inject(Router);
  public siguiendoCount = signal<number>(0);
  public posts = model<any[]>([]);
  profile: any;
  isLoading = true;
  error: string | null = null;
  isMyProfile = signal<boolean>(true);
  constructor() {
  }
  ngOnInit(): void {
    this._route.paramMap.pipe(
      switchMap(params => {
        const username = params.get('username') || '';
        this.isLoading = true;
        this.error = null;

        // Verificar si es el perfil del usuario actual
        return this.mainService.getUserXUserName(username).pipe(
          catchError(err => {
            this.error = 'Perfil no encontrado';
            this.isLoading = false;
            return of(null);
          })
        )
      })
    ).subscribe(profile => {
      const idUser = Number(sessionStorage.getItem('id_user'));
      this._globalService.idUser.set(idUser);
      this.isMyProfile.set(this.authService.isCurrentUser(profile.body.id));
      console.log("Es mi Perfil ? =>", this.isMyProfile());
      if (!this.isMyProfile()) {
        this.profile = profile;
        this.isLoading = false;
        console.log('Perfil Otro usuario =>', profile.body);
        this.getMediasXId(profile.body.id);
          this.getUserXId(idUser);
          this.getSeguidores();
          this.getFollowing(idUser);
        if (profile) {
          this._globalService.profileUser.next(profile.body);
          this._globalService.isMyProfile.next(this.isMyProfile());
        }
      } else {
        console.log('Perfil propio =>', profile.body);

        const idUser = Number(sessionStorage.getItem('id_user'));
        this.getUserXId(idUser);
        this.getSeguidores();
        this.getFollowing(idUser);
        this.getMediasXId(idUser);

      }
    });
  }

  openChat() {

    this._dialog.open(ChatComponent, {
      width: '',
      data: this._globalService.profileUser.value,
      position: {
        bottom: '40px',
        right: '40px'
      },
      hasBackdrop: false,
      panelClass: 'custom-modalbox'

    })
  }


  handleEditProfile() {
    this._router.navigate(['/settings/profile']);
  }

  // handleFollow() {
  //   if (!this.profile) return;

  //   this.profileService.followUser(this.profile.username).subscribe({
  //     next: (updatedProfile) => {
  //       this.profile = updatedProfile;
  //     },
  //     error: (err) => console.error('Error al seguir', err)
  //   });
  // }

  openFollower() {
    this._dialog.open(FollowersComponent, {
      width: '',
      data: '',
      panelClass: 'custom-modalbox'

    })
  }
  openFolloweing() {
    this._dialog.open(FolloweingComponent, {
      width: '',
      data: '',
      panelClass: 'custom-modalbox'

    })
  }
  getFollowing(id: number) {
    this.mainService.getCountFollow(id).subscribe({
      next: (res) => {
        this.siguiendoCount.set(res.body);
        this._globalService.countFollowing.next(res.body);
      }

    })
  }
  getMediasXId(id: number) {
    this.mainService.getVideosXId(id as number).subscribe({
      next: (posts) => {
        this.posts.set(posts.body.map((post: { mediaType: any; url: string; }) => ({
          ...post,
          mediaType: post.mediaType || this.inferMediaType(post.url),
          comentario: '',
          comentarios: []
        })));
      },
      error: (err) => {
        console.error('Failed to fetch media:', err);
      }
    })
  }
  getSuggerencias() {
    this.mainService.getUsers().subscribe({
      next: (res: { body: IUser[] | null; }) => {
        this.sugerencias.set(res.body);
      }
    })
  }
  private inferMediaType(url: string): 'video' | 'image' {
    const extension = url.toLowerCase().split('.').pop() || '';
    return ['mp4', 'mov', 'quicktime'].includes(extension) ? 'video' : 'image';
  }
  getUserStatusFollow() {
    this.mainService.getUserStatusFollow().subscribe({
      next: (res: { body: IUserStatus[] | null; }) => {
        this.usuariosStatusFollow.set(res.body);
      }
    })
  }
  getUserXId(idUser: number) {
    this.mainService.getUser(idUser).subscribe({
      next: (res: { body: IRegister | null; }) => {
        this._globalService.user.set(res.body);
      }
    })
  }

  getSeguidores() {
    this.mainService.getSeguidores().subscribe({
      next: (res) => {
        this.seguidores.set(res.body);
        this._globalService.countFollowers.next(res.body.length);
      }
    })
  }

  seguir(user: IUserStatus | null) {
    console.log('Usuario a seguir =>', user);
    this.mainService.postSeguir(user?.id as number).subscribe({
      next: (res) => {
        this.getUserStatusFollow();
        this.getSeguidores();
        this.getFollowing(this._globalService.idUser() as number)
        console.log(res);
      }
    })
  }
  dejarSeguir(user: IUserStatus) {
    this.mainService.postUnFollowId(user?.id as number).subscribe({
      next: (res) => {
        this.getUserStatusFollow();
        this.getSeguidores();
        this.getFollowing(this._globalService.idUser() as number)
      }
    })
  }
  logOut() {
    this.authService.logout();
    this._globalService.user.set(null);
  }
}
