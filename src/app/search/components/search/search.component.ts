import { Component } from '@angular/core';
import { TmdbService } from 'src/app/services/tmdb.service';

@Component({
    selector: 'app-search',
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.sass'],
    standalone: false
})
export class SearchComponent {
  searchQuery: string = '';
  movies: any[] = [];
  tvShows: any[] = [];
  loading: boolean = false;
  error: string | null = null;

  constructor(private tmdbService: TmdbService) { }

  search() {
    if (this.searchQuery.trim() !== '') {
      this.loading = true;
      this.error = null;

      this.tmdbService.searchMulti(this.searchQuery).subscribe({
        next: (results) => {
          console.log(results);
          this.movies = results.results.filter((result: any) => result.media_type === 'movie');
          this.tvShows = results.results.filter((result: any) => result.media_type === 'tv');
        },
        error: (error) => {
          this.error = error.status_message;
          console.error('Error:', error);
        },
        complete: () => {
          this.loading = false;
        }
      });
      
    } else {
      // Clear the results when search query is empty
      this.movies = [];
      this.tvShows = [];
    }
  }
}
