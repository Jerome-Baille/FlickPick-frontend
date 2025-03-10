import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'auth',
    loadChildren: () => import('./auth/auth.module').then(m => m.AuthModule)
  },
  {
    path: 'media',
    loadChildren: () => import('./search/search.module').then(m => m.SearchModule)
  },
  {
    path: 'profile',
    loadChildren: () => import('./profile/profile.module').then(m => m.ProfileModule)
  },
  {
    path: 'group',
    loadChildren: () => import('./group/group.module').then(m => m.GroupModule)
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'media'
  }
];
