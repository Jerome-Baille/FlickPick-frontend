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
    this.dataService.getUserFavorites().subscribe({
      next: (data: any) => {
        localStorage.setItem('favorites', JSON.stringify(data));
      },
      error: (error: any) => {
        console.log(error);
      }
    })
  }
}
