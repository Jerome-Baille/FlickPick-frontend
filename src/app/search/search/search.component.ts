import { Component, OnDestroy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { faCircleCheck, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Subscription } from 'rxjs';
import { ActionModalComponent } from 'src/app/shared/action-modal/action-modal.component';
import { environment } from 'src/environments/environment.prod';
import { TmdbService } from 'src/app/services/tmdb.service';
import { DataService } from 'src/app/services/data.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { AuthService } from 'src/app/services/auth.service';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { FavButtonComponent } from 'src/app/shared/fav-button/fav-button.component';
import { MatButtonModule } from '@angular/material/button';

interface Media {
  tmdbId: number;
  mediaType: string;
  listName?: string;
  title?: string;
  releaseDate?: Date;
  posterPath?: string;
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
        MatInputModule,
        FavButtonComponent
    ],
    templateUrl: './search.component.html',
    styleUrls: ['./search.component.scss'],
    standalone: true
})
export class SearchComponent implements OnDestroy {
  searchQuery: string = '';
  movies: any[] = [];
  tvShows: any[] = [];
  loading: boolean = false;
  error: string | null = null;
  isLoggedIn = false;
  TMDB_IMAGE_BASE_URL = environment.TMDB_IMAGE_BASE_URL;

  faCircleCheck = faCircleCheck;
  faCirclePlus = faCirclePlus;

  private authSubscription: Subscription;

  constructor(
    private tmdbService: TmdbService,
    private router: Router,
    private dataService: DataService,
    private localStorageService: LocalStorageService,
    private snackbarService: SnackbarService,
    private authService: AuthService,
    public dialog: MatDialog
  ) {
    this.authSubscription = this.authService.isLoggedIn.subscribe(
      (isLoggedIn: boolean) => {
        this.isLoggedIn = isLoggedIn;
        if (isLoggedIn) {
          this.dataService.getUserFavorites().subscribe({
            next: (data: any) => {
              localStorage.setItem('favorites', JSON.stringify(data));
            },
            error: (err: any) => {
              this.snackbarService.showError(err);
            }
          });
        }
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
      this.movies = [];
      this.tvShows = [];
    }
  }

  getMediaType(result: any): string {
    if (result.mediaType) {
      return result.mediaType;
    } else if (result.title) {
      return 'movie';
    } else if (result.name) {
      return 'tv';
    }
    return '';
  }

  addMedia(event: any, result: any) {
    event.stopPropagation();

    const dialogRef = this.dialog.open(ActionModalComponent);
    const mediaType = this.getMediaType(result);

    dialogRef.afterClosed().subscribe(dialogRes => {
      if (dialogRes) {
        for (const res of dialogRes) {
          const data = {
            listId: res,
            tmdbId: result.tmdbId || result.id,
            mediaType: mediaType,
            title: result.title || result.name,
            releaseDate: result.release_date || result.first_air_date,
            posterPath: result.poster_path,
            overview: result.overview
          }

          this.dataService.addMediaItem(data).subscribe({
            next: (response: any) => {
              this.snackbarService.showSuccess(response.message);
            },
            error: (err: any) => {
              this.snackbarService.showError(err);
            }
          });
        }
      }
    });
  }

  removeMedia(event: any, result: any) {
    event.stopPropagation();

    const tmdbId = result.tmdbId || result.id;
    const mediaType = this.getMediaType(result);

    this.dataService.deleteMediaItemFromList({ tmdbId, mediaType, listName: "My_Personal_List" }).subscribe({
      next: (response: any) => {
        this.snackbarService.showSuccess(response.message);
        this.localStorageService.triggerItemRemoved();
      },
      error: (err: any) => {
        this.snackbarService.showError(err);
      }
    });

    this.manageStorage({ tmdbId, mediaType });
  }

  isChecked(tmdbId: number): boolean {
    return false;
  }

  onNavigateToDetail(result: any) {
    const mediaType = this.getMediaType(result);
    this.router.navigate(['/media/detail', mediaType, result.tmdbId || result.id], { state: { media: result } });
  }

  private manageStorage(data: Media) {
    const storedIdsString = localStorage.getItem('userPersonalList');
    let storedIds = storedIdsString ? JSON.parse(storedIdsString) : [];
    const index = storedIds.findIndex((item: { tmdbId: number, mediaType: string }) => item.tmdbId === data.tmdbId);
    if (index === -1) {
      storedIds.push(data);
    } else {
      storedIds.splice(index, 1);
    }
    localStorage.setItem('userPersonalList', JSON.stringify(storedIds));
  }
}
