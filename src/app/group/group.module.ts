import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { GroupRoutingModule } from './group-routing.module';
import { CoreModule } from '../core/core.module';
import { SharedModule } from '../shared/shared.module';
import { GroupOverviewComponent } from './components/group-overview/group-overview.component';
import { ChoosingGameComponent } from './components/choosing-game/choosing-game.component';
import { GroupDetailComponent } from './components/group-detail/group-detail.component';
import { SearchModule } from '../search/search.module';


@NgModule({
  declarations: [
    GroupOverviewComponent,
    GroupDetailComponent,
    ChoosingGameComponent
  ],
  imports: [
    CommonModule,
    GroupRoutingModule,
    CoreModule,
    SharedModule,
    SearchModule
  ]
})
export class GroupModule { }
