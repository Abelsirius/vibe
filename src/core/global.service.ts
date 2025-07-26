import { Injectable, model, signal } from '@angular/core';
import { ILogin, IRegister, UserProfile } from '../app/main/pages/home/interfaces/home.interface';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {

  constructor() { }

  public token = signal<string  | null>(null);
  public user = signal<IRegister | null>(null);
  public idUser = signal<number | null>(null);
  public countFollowers = new BehaviorSubject<number>(0);
  public countFollowing = new BehaviorSubject<number>(0)
   public profileUser =  new BehaviorSubject<UserProfile |null>(null)
   public isMyProfile =  new BehaviorSubject<boolean>(true)


}
