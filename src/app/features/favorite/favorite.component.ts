import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHeart, faFilm, faTv } from '@fortawesome/free-solid-svg-icons';
import { MatDialog } from '@angular/material/dialog';
import { User } from 'src/app/shared/models/User';
import { UserService } from 'src/app/core/services/user.service';
import { DataService } from 'src/app/core/services/data.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { BasicModalComponent } from 'src/app/shared/components/basic-modal/basic-modal.component';

interface FavoriteItem {
  id: number;
  MediaItem: {
    id: number;
    title: string;
    mediaType: string;
    tmdbId: number;
  };
}

interface FavoriteResponse {
  message: string;
}

@Component({
  selector: 'app-favorite',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    FontAwesomeModule,
    RouterLink
  ],
  templateUrl: './favorite.component.html',
  styleUrl: './favorite.component.scss'
})
export class FavoriteComponent {
  private userService = inject(UserService);
  private dataService = inject(DataService);
  private snackbarService = inject(SnackbarService);
  private dialog = inject(MatDialog);

  userProfile: User = {
    username: '',
    Lists: [],
    Favorites: []
  };

  // Icons
  faHeart = faHeart;
  faFilm = faFilm;
  faTv = faTv;

  constructor() {
    this.userService.getUserProfileById().subscribe({
      next: (response: User) => {
        this.userProfile = {
          ...response,
          Favorites: response.Favorites || []
        };
      },
      error: (err: Error) => {
        this.snackbarService.showError(err.message);
      }
    });
  }

  removeFromFavorites(favorite: FavoriteItem) {
    const mediaItem = favorite.MediaItem;
    const dialogRef = this.dialog.open(BasicModalComponent, {
      data: {
        title: 'Remove from Favorites',
        message: `Are you sure you want to remove "${mediaItem.title}" from your favorites?`,
        confirmText: 'Remove'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.dataService.removeFromFavorites({ tmdbId: mediaItem.tmdbId, mediaType: mediaItem.mediaType }).subscribe({
          next: (response: unknown) => {
            const res = response as FavoriteResponse;
            this.snackbarService.showSuccess(res.message);
            this.userProfile.Favorites = this.userProfile.Favorites!.filter((f) => f.id !== favorite.id);
          },
          error: (err: Error) => {
            this.snackbarService.showError(err.message);
          }
        });
      }
    });
  }
}
