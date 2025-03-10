import { Component, Input, OnInit } from '@angular/core';
import { faHeartCircleMinus, faHeartCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { DataService } from 'src/app/services/data.service';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
    selector: 'app-fav-button',
    templateUrl: './fav-button.component.html',
    styleUrls: ['./fav-button.component.sass'],
    standalone: false
})
export class FavButtonComponent implements OnInit {
  @Input() media: any;
  isFav = false;

  faHeartCirclePlus = faHeartCirclePlus;
  faHeartCircleMinus = faHeartCircleMinus;

  constructor(
    private dataService: DataService,
    private snackbarService: SnackbarService
  ) {  }

  ngOnInit(): void {
    if (this.media) {
      const favorites = JSON.parse(localStorage.getItem('favorites') || '[]');
      const foundFavorite = favorites.some((fav: any) => fav.tmdbId === this.media.tmdbId);
      foundFavorite ? this.isFav = true : this.isFav = false;
    }
  }

  onClick(event: any) {
    event.stopPropagation();

    const mediaType = this.media.title ? 'movie' : 'tv';

    const mediaPayload = {
      tmdbId: this.media.tmdbId,
      mediaType: mediaType,
    };

    if (this.isFav) {
      this.dataService.removeFromFavorites(mediaPayload).subscribe({
        next: (response: any) => {
          this.snackbarService.showSuccess(response.message);
        },
        error: (err: any) => {
          this.snackbarService.showError(err);
        }
      });
    } else {
      this.dataService.addToFavorites(mediaPayload).subscribe({
        next: (response: any) => {
          this.snackbarService.showSuccess(response.message);
        },
        error: (err: any) => {
          this.snackbarService.showError(err);
        }
      });
    }

    this.isFav = !this.isFav;
  }
}
