import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { ProfileRoutingModule } from './profile-routing.module';
import { ProfileDetailComponent } from './components/profile-detail/profile-detail.component';
import { SearchModule } from '../search/search.module';
import { SharedModule } from '../shared/shared.module';
import { ProfileListComponent } from './components/profile-list/profile-list.component';


@NgModule({
  declarations: [
    ProfileDetailComponent,
    ProfileListComponent
  ],
  imports: [
    CommonModule,
    ProfileRoutingModule,
    SharedModule,
    SearchModule
  ]
})
export class ProfileModule { }
