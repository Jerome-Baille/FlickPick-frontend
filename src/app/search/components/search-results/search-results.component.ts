import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.sass']
})
export class SearchResultsComponent {
  @Input() movies: any[] = [];
  @Input() tvShows: any[] = [];
}
