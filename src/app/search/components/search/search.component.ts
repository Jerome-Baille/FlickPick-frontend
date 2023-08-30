import { Component } from '@angular/core';
import { TmdbService } from 'src/app/services/tmdb.service';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.sass']
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

      this.tmdbService.searchMovies(this.searchQuery).subscribe({
        next: (movies) => {
          this.movies = movies.results;
        },
        error: (error) => {
          this.error = error.status_message;
          console.error('Error:', error);
        },
        complete: () => {
          this.loading = false;
        }
      });

      this.tmdbService.searchTVShows(this.searchQuery).subscribe({
        next: (tvShows) => {
          this.tvShows = tvShows.results;
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
