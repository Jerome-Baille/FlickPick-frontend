import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';
import { faStar, faTrophy } from '@fortawesome/free-solid-svg-icons';
import { TMDB_IMAGE_BASE_URL_300 } from 'config/tmdb-api';
import { DataService } from 'src/app/services/data.service';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-media-table-view',
  templateUrl: './media-table-view.component.html',
  styleUrls: ['./media-table-view.component.sass']
})
export class MediaTableViewComponent {
  @Input() mediaItems: any[] = [];

  faTrophy = faTrophy;

  TMDB_IMAGE_BASE_URL_300 = TMDB_IMAGE_BASE_URL_300;

  faStar = faStar;

  constructor(
    private dataService: DataService,
    private router: Router,
    private snackbarService: SnackbarService
  ) { }

  deleteMediaItem(mediaItem: any) {
    const data = {
      tmdbId: mediaItem.tmdbId,
      mediaType: mediaItem.mediaType,
      listId: mediaItem.ListMediaItem?.ListId
    };

    this.dataService.deleteMediaItemFromList(data).subscribe({
      next: (response: any) => {
        this.snackbarService.showSuccess(response.message);
        this.mediaItems = this.mediaItems.filter(item => item.tmdbId !== mediaItem.tmdbId);
      },
      error: (err: any) => {
        this.snackbarService.showError(err);
      }
    })
  }

  addOrUpdateRating(mediaItem: any, rating: number) {
    const data = {
      tmdbId: mediaItem.tmdbId,
      mediaType: mediaItem.mediaType,
      groupId: mediaItem.groupId,
      rating: rating
    };

    this.dataService.createVote(data).subscribe({
      next: (response: any) => {
        this.snackbarService.showSuccess(response.message);
        mediaItem.rating = rating;
      },
      error: (err: any) => {
        this.snackbarService.showError(err);
      }
    })
  }

  deleteRating(mediaItem: any) {
    const data = {
      groupId: mediaItem.groupId,
      tmdbId: mediaItem.tmdbId,
      mediaType: mediaItem.mediaType
    }

    this.dataService.deleteVote(data).subscribe({
      next: (response: any) => {
        this.snackbarService.showSuccess(response.message);
        mediaItem.rating = 0;
      },
      error: (err: any) => {
        this.snackbarService.showError(err);
      }
    })
  }

  navigateToMedia(mediaItem: any) {
    this.router.navigate(['/media/detail', mediaItem.mediaType, mediaItem.tmdbId]);
  }
}
