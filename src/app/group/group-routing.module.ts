import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { GroupDetailComponent } from './components/group-detail/group-detail.component';
import { GroupOverviewComponent } from './components/group-overview/group-overview.component';

const routes: Routes = [
  { path: 'overview', component: GroupOverviewComponent },
  { path: 'detail/:groupId', component: GroupDetailComponent },
  { path: '', pathMatch: 'full', redirectTo:'overview' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GroupRoutingModule { }
