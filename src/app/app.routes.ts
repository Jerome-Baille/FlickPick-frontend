import { Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';
import { AuthComponent } from './features/auth/auth/auth.component';
import { AfterLoginComponent } from './features/auth/after-login/after-login.component';
import { SearchComponent } from './features/search/search/search.component';
import { SearchDetailViewComponent } from './features/search/search-detail-view/search-detail-view.component';
import { CastDetailViewComponent } from './features/search/cast-detail-view/cast-detail-view.component';
import { ProfileDetailComponent } from './features/profile/profile-detail/profile-detail.component';
import { ProfileListComponent } from './features/profile/profile-list/profile-list.component';
import { GroupOverviewComponent } from './features/group/group-overview/group-overview.component';
import { GroupDetailComponent } from './features/group/group-detail/group-detail.component';
import { FavoriteComponent } from './features/favorite/favorite.component';
import { environment } from 'src/environments/environment';

// Build auth children routes conditionally
const authChildren = [
  { path: '', component: AuthComponent },
  { path: 'after-login', component: AfterLoginComponent },
];

// Only add dev auth route in development - this ensures it's tree-shaken in production
if (!environment.production) {
  authChildren.push({
    path: 'dev',
    loadComponent: () => import('./features/auth/dev-auth/dev-auth.component').then(m => m.DevAuthComponent)
  } as any);
}

export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'auth',
    children: authChildren
  },
  {
    path: 'media',
    canActivate: [authGuard],
    children: [
      { path: 'search', component: SearchComponent },
      { path: 'detail/movie/:id', component: SearchDetailViewComponent },
      { path: 'detail/movie/:id/cast', component: CastDetailViewComponent },
      { path: 'detail/tv/:id', component: SearchDetailViewComponent },
      { path: 'detail/tv/:id/cast', component: CastDetailViewComponent },
      { path: '', pathMatch: 'full', redirectTo: 'search' }
    ]
  },
  {
    path: 'profile',
    canActivate: [authGuard],
    children: [
      { path: 'own', component: ProfileDetailComponent },
      { path: 'list/:listId', component: ProfileListComponent },
      { path: '', pathMatch: 'full', redirectTo: 'own' }
    ]
  },
  {
    path: 'group',
    canActivate: [authGuard],
    children: [
      { path: 'overview', component: GroupOverviewComponent },
      { path: 'detail/:groupId', component: GroupDetailComponent },
      { path: '', pathMatch: 'full', redirectTo: 'overview' }
    ]
  },
  {
    path: 'favorite',
    component: FavoriteComponent,
    canActivate: [authGuard]
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  }
];
