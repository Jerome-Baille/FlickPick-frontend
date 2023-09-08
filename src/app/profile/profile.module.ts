import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileDetailComponent } from './components/profile-detail/profile-detail.component';
import { SearchModule } from '../search/search.module';
import { SharedModule } from '../shared/shared.module';
import { ProfileListComponent } from './components/profile-list/profile-list.component';
import { ProfileGroupComponent } from './components/profile-group/profile-group.component';


@NgModule({
  declarations: [
    ProfileDetailComponent,
    ProfileListComponent,
    ProfileGroupComponent
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    SharedModule,
    SearchModule
  ]
})
export class ProfileModule { }
