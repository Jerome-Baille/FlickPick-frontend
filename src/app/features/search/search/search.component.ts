import { Component, OnDestroy, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { faCircleCheck, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subscription } from 'rxjs';
import { environment } from 'src/environments/environment';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatButtonModule } from '@angular/material/button';
import { TmdbService } from 'src/app/core/services/tmdb.service';
import { DataService, Media } from 'src/app/core/services/data.service';
import { LocalStorageService } from 'src/app/core/services/local-storage.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { ActionModalComponent } from 'src/app/shared/components/action-modal/action-modal.component';

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

interface FavoriteItem {
  tmdbId: number;
  mediaType: string;
}

@Component({
    selector: 'app-search',
    imports: [
        CommonModule, 
        MatButtonModule,
        MatCardModule,
        FontAwesomeModule,
        FormsModule,
        MatFormFieldModule,
      MatInputModule
    ],
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
    standalone: true
})
export class SearchComponent implements OnDestroy {
  private tmdbService = inject(TmdbService);
  private router = inject(Router);
  private dataService = inject(DataService);
  private localStorageService = inject(LocalStorageService);
  private snackbarService = inject(SnackbarService);
  private authService = inject(AuthService);
  dialog = inject(MatDialog);

  searchQuery = '';
  movies: SearchResult[] = [];
  tvShows: SearchResult[] = [];
  loading = false;
  error: string | null = null;
  isLoggedIn = false;
  TMDB_IMAGE_BASE_URL = environment.TMDB_IMAGE_BASE_URL;

  faCircleCheck = faCircleCheck;
  faCirclePlus = faCirclePlus;

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

  search() {
    if (this.searchQuery.trim() !== '') {
      this.loading = true;
      this.error = null;

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
      this.movies = [];
      this.tvShows = [];
    }
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

  addMedia(event: Event, result: SearchResult) {
    event.stopPropagation();

    const dialogRef = this.dialog.open(ActionModalComponent);
    const mediaType = this.getMediaType(result);

    dialogRef.afterClosed().subscribe((dialogRes: number[] | undefined) => {
      if (dialogRes) {
        for (const res of dialogRes) {
          const data: Media = {
            listId: res,
            tmdbId: result.tmdbId || result.id,
            mediaType: mediaType,
            title: result.title || result.name,
            releaseDate: result.release_date || result.first_air_date,
            posterPath: result.poster_path,
            overview: result.overview
          }

          this.dataService.addMediaItem(data).subscribe({
            next: (response) => {
              this.snackbarService.showSuccess(response.message);
            },
            error: (err: Error) => {
              this.snackbarService.showError(err.message);
            }
          });
        }
      }
    });
  }

  removeMedia(event: Event, result: SearchResult) {
    event.stopPropagation();

    const tmdbId = result.tmdbId || result.id;
    const mediaType = this.getMediaType(result);

    const data: Media = { tmdbId, mediaType, listName: "My_Personal_List" };
    this.dataService.deleteMediaItemFromList(data).subscribe({
      next: (response) => {
        this.snackbarService.showSuccess(response.message);
        this.localStorageService.triggerItemRemoved();
      },
      error: (err: Error) => {
        this.snackbarService.showError(err.message);
      }
    });

    this.manageStorage({ tmdbId, mediaType });
  }

  isChecked(): boolean {
    return false;
  }

  onNavigateToDetail(result: SearchResult) {
    const mediaType = this.getMediaType(result);
    this.router.navigate(['/media/detail', mediaType, result.tmdbId || result.id], { state: { media: result } });
  }

  private manageStorage(data: FavoriteItem) {
    const storedIdsString = localStorage.getItem('userPersonalList');
    const storedIds: FavoriteItem[] = storedIdsString ? JSON.parse(storedIdsString) : [];
    const index = storedIds.findIndex((item: FavoriteItem) => item.tmdbId === data.tmdbId);
    if (index === -1) {
      storedIds.push(data);
    } else {
      storedIds.splice(index, 1);
    }
    localStorage.setItem('userPersonalList', JSON.stringify(storedIds));
  }
}
