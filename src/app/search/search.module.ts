import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SearchRoutingModule } from './search-routing.module';
import { SearchComponent } from './components/search/search.component';
import { SearchResultsComponent } from './components/search-results/search-results.component';
import { SharedModule } from '../shared/shared.module';
import { CoreModule } from '../core/core.module';
import { SearchResultCardComponent } from './components/search-result-card/search-result-card.component';


@NgModule({
  declarations: [
    SearchComponent,
    SearchResultsComponent,
    SearchResultCardComponent
  ],
  imports: [
    CommonModule,
    SearchRoutingModule,
    SharedModule,
    CoreModule
  ]
})
export class SearchModule { }
