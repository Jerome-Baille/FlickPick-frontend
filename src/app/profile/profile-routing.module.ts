import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileDetailComponent } from './components/profile-detail/profile-detail.component';
import { ProfileListComponent } from './components/profile-list/profile-list.component';

const routes: Routes = [
  { path: 'own', component: ProfileDetailComponent },
  { path: 'list/:listId', component: ProfileListComponent },
  { path: '', pathMatch: 'full', redirectTo:'own' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
