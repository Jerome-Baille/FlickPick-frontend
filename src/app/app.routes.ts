import { Routes } from '@angular/router';
import { SearchComponent } from './search/search/search.component';
import { SearchDetailViewComponent } from './search/search-detail-view/search-detail-view.component';
import { CastDetailViewComponent } from './search/cast-detail-view/cast-detail-view.component';
import { AfterLoginComponent } from './auth/after-login/after-login.component';
import { ProfileDetailComponent } from './profile/profile-detail/profile-detail.component';
import { ProfileListComponent } from './profile/profile-list/profile-list.component';
import { GroupOverviewComponent } from './group/group-overview/group-overview.component';
import { GroupDetailComponent } from './group/group-detail/group-detail.component';
import { AuthComponent } from './auth/auth/auth.component';
import { DashboardComponent } from './dashboard/dashboard.component';
import { FavoriteComponent } from './favorite/favorite.component';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'auth',
    children: [
      { path: '', component: AuthComponent },
      { path: 'after-login', component: AfterLoginComponent }
    ]
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
