import { Route, Routes } from '@angular/router';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { authGuard } from './core/guards/auth.guard';
import { AuthComponent } from './features/auth/auth/auth.component';
import { AfterLoginComponent } from './features/auth/after-login/after-login.component';
import { SearchComponent } from './features/search/search/search.component';
import { SearchDetailViewComponent } from './features/search/search-detail-view/search-detail-view.component';
import { CastDetailViewComponent } from './features/search/cast-detail-view/cast-detail-view.component';
import { GroupOverviewComponent } from './features/group/group-overview/group-overview.component';
import { GroupDetailComponent } from './features/group/group-detail/group-detail.component';
import { environment } from 'src/environments/environment';
import { eventStatusGuard } from './core/guards/event-status.guard';

// Build auth children routes conditionally
const authChildren: Route[] = [
  { path: '', component: AuthComponent },
  { path: 'after-login', component: AfterLoginComponent },
];

// Only add dev auth route in development - this ensures it's tree-shaken in production
if (!environment.production) {
  authChildren.push({
    path: 'dev',
    loadComponent: () => import('./features/auth/dev-auth/dev-auth.component').then(m => m.DevAuthComponent)
  });
}

export const routes: Routes = [
  {
    path: 'dashboard',
    component: DashboardComponent,
    canActivate: [authGuard]
  },
  {
    path: 'calendar',
    canActivate: [authGuard],
    loadComponent: () => import('./features/calendar/calendar.component').then(m => m.CalendarComponent)
  },
  {
    path: 'archive',
    canActivate: [authGuard],
    loadComponent: () => import('./features/archive/archive.component').then(m => m.ArchiveComponent)
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
    path: 'group',
    canActivate: [authGuard],
    children: [
      { path: 'overview', component: GroupOverviewComponent },
      { path: 'detail/:groupId', component: GroupDetailComponent },
      { 
        path: 'create', 
        loadComponent: () => import('./features/group/create-group/create-group.component').then(m => m.CreateGroupComponent) 
      },
      { 
        path: 'setup', 
        loadComponent: () => import('./features/group/group-setup/group-setup.component').then(m => m.GroupSetupComponent) 
      },
      { path: '', pathMatch: 'full', redirectTo: 'overview' }
    ]
  },
  {
    path: 'event',
    canActivate: [authGuard],
    children: [
      { 
        path: 'create', 
        loadComponent: () => import('./features/event/create-event/create-event.component').then(m => m.CreateEventComponent) 
      },
      { 
        path: 'detail/:eventId', 
        canActivate: [eventStatusGuard],
        loadComponent: () => import('./features/event/event-detail/event-detail.component').then(m => m.EventDetailComponent) 
      },
      { 
        path: 'edit/:eventId',
        loadComponent: () => import('./features/event/event-edit/event-edit.component').then(m => m.EventEditComponent)
      },

      { 
        path: 'voting/:eventId', 
        loadComponent: () => import('./features/group/choosing-game/choosing-game.component').then(m => m.ChoosingGameComponent) 
      },
      { 
        path: 'results/:eventId', 
        loadComponent: () => import('./features/event/voting-results/voting-results.component').then(m => m.VotingResultsComponent) 
      }
    ]
  },
  {
    path: '',
    pathMatch: 'full',
    redirectTo: 'dashboard'
  }
];
