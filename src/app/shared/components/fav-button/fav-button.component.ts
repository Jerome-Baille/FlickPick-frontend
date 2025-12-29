import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHeartCircleMinus, faHeartCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { DataService, Media } from 'src/app/core/services/data.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';

interface MediaInput {
  id?: number;
  tmdbId?: number;
  title?: string;
  name?: string;
}

interface FavoriteItem {
  tmdbId: number;
}

interface ApiError {
  error?: {
    message?: string;
  };
  message?: string;
}

@Component({
    selector: 'app-fav-button',
    imports: [
      CommonModule, 
      FontAwesomeModule,
      MatButtonModule
    ],
    templateUrl: './fav-button.component.html',
    styleUrls: ['./fav-button.component.scss'],
    standalone: true
})
export class FavButtonComponent implements OnInit {
  private dataService = inject(DataService);
  private snackbarService = inject(SnackbarService);

  @Input() media: MediaInput | undefined;
  isFav = false;

  faHeartCirclePlus = faHeartCirclePlus;
  faHeartCircleMinus = faHeartCircleMinus;

  ngOnInit(): void {
    if (this.media) {
      const favorites: FavoriteItem[] = JSON.parse(localStorage.getItem('favorites') || '[]');
      const foundFavorite = favorites.some((fav: FavoriteItem) => fav.tmdbId === this.media?.tmdbId);
      this.isFav = foundFavorite;
    }
  }

  onClick(event: Event): void {
    event.stopPropagation();

    if (!this.media || this.media.id === undefined) return;

    const mediaType = this.media.title ? 'movie' : 'tv';

    const mediaPayload: Media = {
      tmdbId: this.media.id,
      mediaType: mediaType,
    };

    if (this.isFav) {
      this.dataService.removeFromFavorites(mediaPayload).subscribe({
        next: (response) => {
          this.snackbarService.showSuccess(response.message);
        },
        error: (err: ApiError) => {
          this.snackbarService.showError(err.error?.message || err.message || 'Error');
        }
      });
    } else {
      this.dataService.addToFavorites(mediaPayload).subscribe({
        next: (response) => {
          this.snackbarService.showSuccess(response.message);
        },
        error: (err: ApiError) => {
          this.snackbarService.showError(err.error?.message || err.message || 'Error');
        }
      });
    }

    this.isFav = !this.isFav;
  }
}
