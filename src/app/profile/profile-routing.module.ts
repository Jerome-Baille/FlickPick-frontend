import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileDetailComponent } from './components/profile-detail/profile-detail.component';
import { ProfileListComponent } from './components/profile-list/profile-list.component';
import { ProfileGroupComponent } from './components/profile-group/profile-group.component';

const routes: Routes = [
  { path: 'own', component: ProfileDetailComponent },
  { path: 'list/:listName', component: ProfileListComponent },
  { path: 'group/:groupName', component: ProfileGroupComponent },
  { path: '', pathMatch: 'full', redirectTo:'own' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ProfileRoutingModule { }
