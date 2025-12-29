import { CommonModule } from '@angular/common';
import { Component, Input, inject } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faStar, faTrophy } from '@fortawesome/free-solid-svg-icons';
import { environment } from 'src/environments/environment';
import { MatBadgeModule } from '@angular/material/badge';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { DataService, Media } from 'src/app/core/services/data.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';

interface MediaItem {
  tmdbId: number;
  mediaType: string;
  title: string;
  posterPath?: string;
  releaseDate?: string;
  overview?: string;
  points?: number;
  sumOfRatings?: number;
  rating?: number;
  groupId?: number;
  isAdmin?: boolean;
  ListMediaItem?: {
    ListId: number;
  };
}

interface ApiError {
  error?: {
    message?: string;
  };
  message?: string;
}

@Component({
    selector: 'app-media-table-view',
    imports: [
      CommonModule,
      MatButtonModule,
      MatIconModule,
      MatBadgeModule,
      MatTableModule,
      FontAwesomeModule
    ],
    templateUrl: './media-table-view.component.html',
    styleUrls: ['./media-table-view.component.scss'],
    standalone: true
})
export class MediaTableViewComponent {
  private dataService = inject(DataService);
  private router = inject(Router);
  private snackbarService = inject(SnackbarService);

  @Input() mediaItems: MediaItem[] = [];
  @Input() showPoints = true; // Added property to control points display

  faTrophy = faTrophy;

  TMDB_IMAGE_BASE_URL_300 = environment.TMDB_IMAGE_BASE_URL_300;

  faStar = faStar;

  deleteMediaItem(mediaItem: MediaItem): void {
    const data: Media = {
      tmdbId: mediaItem.tmdbId,
      mediaType: mediaItem.mediaType,
      listId: mediaItem.ListMediaItem?.ListId
    };

    this.dataService.deleteMediaItemFromList(data).subscribe({
      next: (response) => {
        this.snackbarService.showSuccess(response.message);
        this.mediaItems = this.mediaItems.filter(item => item.tmdbId !== mediaItem.tmdbId);
      },
      error: (err: ApiError) => {
        this.snackbarService.showError(err.error?.message || err.message || 'Error');
      }
    })
  }

  addOrUpdateRating(mediaItem: MediaItem, rating: number): void {
    const data: Media = {
      tmdbId: mediaItem.tmdbId,
      mediaType: mediaItem.mediaType,
      groupId: mediaItem.groupId,
      rating: rating
    };

    this.dataService.createVote(data).subscribe({
      next: (response) => {
        this.snackbarService.showSuccess(response.message);
        mediaItem.rating = rating;
      },
      error: (err: ApiError) => {
        this.snackbarService.showError(err.error?.message || err.message || 'Error');
      }
    })
  }

  deleteRating(mediaItem: MediaItem): void {
    const data: Media = {
      groupId: mediaItem.groupId,
      tmdbId: mediaItem.tmdbId,
      mediaType: mediaItem.mediaType
    }

    this.dataService.deleteVote(data).subscribe({
      next: (response) => {
        this.snackbarService.showSuccess(response.message);
        mediaItem.rating = 0;
      },
      error: (err: ApiError) => {
        this.snackbarService.showError(err.error?.message || err.message || 'Error');
      }
    })
  }

  navigateToMedia(mediaItem: MediaItem): void {
    this.router.navigate(['/media/detail', mediaItem.mediaType, mediaItem.tmdbId]);
  }
}
