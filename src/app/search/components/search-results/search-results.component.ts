import { Component, Input } from '@angular/core';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.sass']
})
export class SearchResultsComponent {
  @Input() movies: any[] = [];
  @Input() tvShows: any[] = [];

  constructor(
    private dataService: DataService
  ) {
    // check if the userPersonalList is in the local storage
    const storedIdsString = localStorage.getItem('userPersonalList');
    if (!storedIdsString) {
      this.dataService.getPersonnalList().subscribe({
        next: (response: any) => {
          localStorage.setItem('userPersonalList', JSON.stringify(response));
        },
        error: (error) => {
          console.log(error);
        }
      });
    }
  }
}
