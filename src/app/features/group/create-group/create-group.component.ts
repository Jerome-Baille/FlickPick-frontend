import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { debounceTime, Subject } from 'rxjs';
import { TmdbService } from 'src/app/core/services/tmdb.service';
import { DataService } from 'src/app/core/services/data.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { ShortlistService } from 'src/app/core/services/shortlist.service';
import { environment } from 'src/environments/environment.prod';

interface Genre {
  id: number;
  name: string;
}

interface SelectedMedia {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  releaseDate?: string;
  posterPath?: string;
  overview?: string;
  voteAverage?: number;
  runtime?: number;
  genres?: Genre[];
}

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string;
  overview?: string;
  vote_average?: number;
  media_type?: 'movie' | 'tv';
}

@Component({
  selector: 'app-create-group',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './create-group.component.html',
  styleUrl: './create-group.component.scss'
})
export class CreateGroupComponent implements OnInit {
  private tmdbService = inject(TmdbService);
  private dataService = inject(DataService);
  private snackbarService = inject(SnackbarService);
  private shortlistService = inject(ShortlistService);
  private router = inject(Router);

  TMDB_IMAGE_BASE_URL = environment.TMDB_IMAGE_BASE_URL_300;

  // Search state
  searchQuery = '';
  searchResults: SelectedMedia[] = [];
  isSearching = false;
  private searchSubject = new Subject<string>();

  // Ballot state
  selectedMovies: SelectedMedia[] = [];
  maxSelections = 10;

  // Expanded cards state
  expandedCards = new Set<number>();

  // Form state
  groupName = '';
  listName = '';

  ngOnInit() {
    // Set up debounced search
    this.searchSubject.pipe(
      debounceTime(500)
    ).subscribe(query => {
      if (query.trim().length > 0) {
        this.performSearch(query);
      } else {
        this.searchResults = [];
      }
    });

    // Load trending movies initially
    this.loadTrendingMovies();
  }

  onSearchInput(value: string) {
    this.searchQuery = value;
    this.isSearching = true;
    this.searchSubject.next(value);
  }

  private performSearch(query: string) {
    this.tmdbService.searchMulti(query).subscribe({
      next: (response: unknown) => {
        const data = response as { results: SearchResult[] };
        this.searchResults = data.results
          .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
          .slice(0, 12)
          .map(item => this.mapSearchResult(item));
        this.isSearching = false;
      },
      error: (err) => {
        this.snackbarService.showError('Search failed: ' + err.message);
        this.isSearching = false;
      }
    });
  }

  private loadTrendingMovies() {
    this.isSearching = true;
    this.tmdbService.getTrendingMovies('week').subscribe({
      next: (response: unknown) => {
        const data = response as { results: SearchResult[] };
        this.searchResults = data.results.slice(0, 12).map(item => ({
          tmdbId: item.id,
          mediaType: 'movie' as const,
          title: item.title || '',
          releaseDate: item.release_date,
          posterPath: item.poster_path,
          overview: item.overview,
          voteAverage: item.vote_average
        }));
        this.isSearching = false;
      },
      error: () => {
        this.isSearching = false;
      }
    });
  }

  private mapSearchResult(item: SearchResult): SelectedMedia {
    return {
      tmdbId: item.id,
      mediaType: item.media_type || 'movie',
      title: item.title || item.name || '',
      releaseDate: item.release_date || item.first_air_date,
      posterPath: item.poster_path,
      overview: item.overview,
      voteAverage: item.vote_average
    };
  }

  addToShortlist(movie: SelectedMedia) {
    if (this.selectedMovies.length >= this.maxSelections) {
      this.snackbarService.showError(`Maximum ${this.maxSelections} movies allowed`);
      return;
    }

    if (this.selectedMovies.some(m => m.tmdbId === movie.tmdbId)) {
      this.snackbarService.showError('Movie already in shortlist');
      return;
    }

    this.selectedMovies.push(movie);
  }

  removeFromShortlist(index: number) {
    this.selectedMovies.splice(index, 1);
  }

  clearAll() {
    this.selectedMovies = [];
  }

  isInShortlist(movie: SelectedMedia): boolean {
    return this.selectedMovies.some(m => m.tmdbId === movie.tmdbId);
  }

  toggleCardExpand(tmdbId: number) {
    if (this.expandedCards.has(tmdbId)) {
      this.expandedCards.delete(tmdbId);
    } else {
      this.expandedCards.add(tmdbId);
    }
  }

  isCardExpanded(tmdbId: number): boolean {
    return this.expandedCards.has(tmdbId);
  }

  goToSetup() {
    if (this.selectedMovies.length < 2) {
      this.snackbarService.showError('Please add at least 2 movies to the shortlist');
      return;
    }

    if (!this.groupName.trim()) {
      this.snackbarService.showError('Please enter a group name');
      return;
    }

    // Store shortlist data in service
    this.shortlistService.setShortlistData({
      groupName: this.groupName.trim(),
      selectedMovies: this.selectedMovies
    });

    // Navigate to setup page
    this.router.navigate(['/group/setup']);
  }

  getRatingStars(rating?: number): string {
    if (!rating) return '0.0';
    return rating.toFixed(1);
  }

  getYear(releaseDate?: string): string {
    if (!releaseDate) return 'TBD';
    return new Date(releaseDate).getFullYear().toString();
  }

  getPosterUrl(posterPath?: string): string {
    if (!posterPath) return 'assets/placeholder-poster.png';
    return this.TMDB_IMAGE_BASE_URL + posterPath;
  }
}

