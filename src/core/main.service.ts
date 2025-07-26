import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { ILogin, IRegister } from '../app/main/pages/home/interfaces/home.interface';

@Injectable({
  providedIn: 'root'
})
export class MainService {
  public _http = inject(HttpClient);
  public url = 'http://vibeapi.somee.com/';
  public urlv1 = 'http://vibeapi.somee.com/';
  constructor() { }
    login(paramsa:ILogin):Observable<any>{
    const params = {
      username: paramsa.username,
      password: paramsa.password
    }
    const ling = this.url + 'login';
    return this._http.get<any>(ling,{
      params: params,
      headers:{ 'Content-Type': 'application/json' },
      observe: 'response'
    });
  }

  postCommentario(content:string,userId:number,mediaId:number): Observable<any> {
      const ling = this.urlv1 + 'api/Comments';
      const body =
      {
        content,
        userId,
        mediaId
      }
      return this._http.post<any>(ling, body,{
        headers: { 'Content-Type': 'application/json' },
        observe: 'response'
      });
  }
  getCommentario(mediaId:number): Observable<any> {
      const ling = this.urlv1 + 'api/Comments/media/' + mediaId;
      const body =
      {
        mediaId
      }
      return this._http.get<any>(ling,{
        headers: { 'Content-Type': 'application/json' },
        observe: 'response'
      });
  }
   getFeedUser(): Observable<any> {
      const ling = this.urlv1 + 'Users/feed';
      return this._http.get<any>(ling, {
        headers: { 'Content-Type': 'application/json' },
        observe: 'response'
      });
  }

  getVideos(){
          const ling = this.urlv1 + 'api/Media/my-media';
      return this._http.get<any>(ling, {
        headers: { 'Content-Type': 'application/json' },
        observe: 'response'
      });
  }
    getVideosXId(id:number){
          const ling = this.urlv1 + 'api/Media/my-media/' + id;
      return this._http.get<any>(ling, {
        headers: { 'Content-Type': 'application/json' },
        observe: 'response'
      });
  }
  registrar(body:IRegister):Observable<any>{
    const ling = this.url + 'register';

    return this._http.post<any>(ling, body,{
      headers:{ 'Content-Type': 'application/json',  },
      observe: 'response'
    });
  }

  getUser(id: number): Observable<any> {
    const ling = `${this.urlv1}users/${id}`;
    return this._http.get<any>(ling, {
      headers: { 'Content-Type': 'application/json' },
      observe: 'response'
    });
  }
getUserXUserName(userName:string): Observable<any> {
    const ling = `${this.urlv1}user/${userName}`;
    return this._http.get<any>(ling, {
      headers: { 'Content-Type': 'application/json' },
      observe: 'response'
    });
  }

  getUsers(): Observable<any> {
    const ling = `${this.urlv1}Get/All/Users`;
    return this._http.get<any>(ling, {
      headers: { 'Content-Type': 'application/json' },
      observe: 'response'
    });
  }
  getCountFollow(id:number): Observable<any> {
    const ling = `${this.urlv1}api/Followers/followings/${id}`;
    return this._http.get<any>(ling, {
      headers: { 'Content-Type': 'application/json' },
      observe: 'response'
    });
  }
  getUserStatusFollow():Observable<any>{
        const ling = `${this.urlv1}Get/All/UserStatusFollow`;
    return this._http.get<any>(ling, {
      headers: { 'Content-Type': 'application/json' },
      observe: 'response'
    });
  }

    getFollowingXId(id:number):Observable<any>{
        const ling = `${this.urlv1}api/Followers/followingsUsers/${id}`;
    return this._http.get<any>(ling, {
      headers: { 'Content-Type': 'application/json' },
      observe: 'response'
    });
  }
  getSeguidores(): Observable<any> {
    const ling = `${this.urlv1}api/Followers/followers`;
    return this._http.get<any>(ling, {
      headers: { 'Content-Type': 'application/json' },
      observe: 'response'
    });
  }
  getSeguidoresXId(id:number): Observable<any> {
    const ling = `${this.urlv1}api/Followers/followers/${id}`;
    return this._http.get<any>(ling, {
      headers: { 'Content-Type': 'application/json' },
      observe: 'response'
    });
  }
  postUnFollowId(id:number){
    const ling = `${this.urlv1}api/Followers/unFollow/${id}`;
    return this._http.post<any>(ling, {
      headers: { 'Content-Type': 'application/json' },
      observe: 'response'
    });
  }

    postSeguir(id: number): Observable<any> {
    const ling = `${this.urlv1}api/Followers/follow/${id}`;
    return this._http.post<any>(ling, {
      headers: { 'Content-Type': 'application/json' },
      observe: 'response'
    });
  }

    uploadMedia(file: File, title: string, description: string): Observable<any> {
    const formData = new FormData();
    formData.append('File', file);
    formData.append('Title', title);
    formData.append('Description', description);
    const ling = `${this.urlv1}api/Media/upload`;
    return this._http.post(ling, formData,{
    reportProgress: true,
    observe: 'response',
  });
  }

  jointChatRoom(id:number){
    const ling = `${this.urlv1}api/Chat/join-chat/${id}`;
    return this._http.post<any>(ling, {
      headers: { 'Content-Type': 'application/json' },
      observe: 'response'
    });
  }



}
