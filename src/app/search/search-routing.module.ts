import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SearchComponent } from './components/search/search.component';

const routes: Routes = [
  { path: 'search', component: SearchComponent },
  { path: '', pathMatch: 'full', redirectTo:'search' }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class SearchRoutingModule { }
