import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchComponent } from './components/search/search.component';
import { SearchDetailViewComponent } from './components/search-detail-view/search-detail-view.component';

const routes: Routes = [
  { path: 'search', component: SearchComponent },
  { path: 'detail/movie/:id', component: SearchDetailViewComponent},
  { path: 'detail/tv/:id', component: SearchDetailViewComponent},
  { path: '', pathMatch: 'full', redirectTo:'search' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SearchRoutingModule { }
