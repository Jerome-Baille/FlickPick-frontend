import { Component, OnDestroy, inject, ViewChild, ElementRef } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { CommonModule } from '@angular/common';
import { TmdbService } from 'src/app/core/services/tmdb.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { MediaCardComponent } from 'src/app/shared/components/media-card/media-card.component';

interface SearchResult {
  id: number;
  tmdbId?: number;
  media_type?: string;
  mediaType?: string;
  title?: string;
  name?: string;
  poster_path?: string;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
}



@Component({
    selector: 'app-search',
    imports: [
        CommonModule, 
        FormsModule,
        MediaCardComponent
    ],
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
    standalone: true
})
export class SearchComponent implements OnDestroy {
  private tmdbService = inject(TmdbService);
  private router = inject(Router);
  private authService = inject(AuthService);

  searchQuery = '';
  movies: SearchResult[] = [];
  tvShows: SearchResult[] = [];
  loading = false;
  error: string | null = null;
  isLoggedIn = false;
  activeFilter: 'all' | 'movie' | 'tv' = 'all';
  searchPerformed = false;
  @ViewChild('searchInputRef') searchInputEl?: ElementRef<HTMLInputElement>;
  TMDB_IMAGE_BASE_URL: string = environment.TMDB_IMAGE_BASE_URL ?? '';

  private authSubscription: Subscription;

  constructor() {
    this.authSubscription = this.authService.isLoggedIn.subscribe(
      (isLoggedIn: boolean) => {
        this.isLoggedIn = isLoggedIn;
      }
    );
  }

  ngOnDestroy() {
    if (this.authSubscription) {
      this.authSubscription.unsubscribe();
    }
  }

  setFilter(filter: 'all' | 'movie' | 'tv') {
    this.activeFilter = filter;
  }

  search() {
    if (this.searchQuery.trim() !== '') {
      // mark that a search has been initiated
      this.searchPerformed = true;
      this.loading = true;
      this.error = null;
      // clear previous results while loading
      this.movies = [];
      this.tvShows = [];

      this.tmdbService.searchMulti(this.searchQuery).subscribe({
        next: (results) => {
          this.movies = results.results.filter((result: SearchResult) => result.media_type === 'movie');
          this.tvShows = results.results.filter((result: SearchResult) => result.media_type === 'tv');
        },
        error: (error: { status_message?: string }) => {
          this.error = error.status_message || 'An error occurred';
          console.error('Error:', error);
        },
        complete: () => {
          this.loading = false;
        }
      });
    } else {
      // reset search state if query is empty
      this.searchPerformed = false;
      this.movies = [];
      this.tvShows = [];
    }
  }

  resetSearch() {
    // clear query and results, reset flags and focus the input
    this.searchQuery = '';
    this.searchPerformed = false;
    this.movies = [];
    this.tvShows = [];
    this.error = null;
    // return focus to input for quick typing
    setTimeout(() => this.searchInputEl?.nativeElement.focus());
  }

  getMediaType(result: SearchResult): string {
    if (result.mediaType) {
      return result.mediaType;
    } else if (result.title) {
      return 'movie';
    } else if (result.name) {
      return 'tv';
    }
    return '';
  }







  onNavigateToDetail(result: SearchResult) {
    const mediaType = this.getMediaType(result);
    this.router.navigate(['/media/detail', mediaType, result.tmdbId || result.id], { state: { media: result } });
  }


}
