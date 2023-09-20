import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SearchRoutingModule } from './search-routing.module';
import { SearchComponent } from './components/search/search.component';
import { SearchResultsComponent } from './components/search-results/search-results.component';
import { SharedModule } from '../shared/shared.module';
import { CoreModule } from '../core/core.module';
import { SearchResultCardComponent } from './components/search-result-card/search-result-card.component';
import { SearchDetailViewComponent } from './components/search-detail-view/search-detail-view.component';
import { CastDetailViewComponent } from './components/cast-detail-view/cast-detail-view.component';


@NgModule({
  declarations: [
    SearchComponent,
    SearchResultsComponent,
    SearchResultCardComponent,
    SearchDetailViewComponent,
    CastDetailViewComponent
  ],
  imports: [
    CommonModule,
    SearchRoutingModule,
    SharedModule,
    CoreModule
  ],
  exports: [
    SearchResultsComponent,
    SearchResultCardComponent
  ]
})
export class SearchModule { }
