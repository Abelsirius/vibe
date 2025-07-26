import { Routes } from '@angular/router';

export const routes: Routes = [
      {
        path:'',
        loadComponent: ()=> import('./main/pages/home/home.component').then((m)=>m.HomeComponent),
        title:'VibeMe',

    },
    {
        path:'login',
        loadComponent: ()=> import('./main/pages/home/join/join.component').then((m)=>m.JoinComponent),
        title:'Login',

    },
    {
        path:':username',
        loadComponent: ()=> import('./main/pages/user/user.component').then((m)=>m.UserComponent),
        title:'User Profile',
    }
];
