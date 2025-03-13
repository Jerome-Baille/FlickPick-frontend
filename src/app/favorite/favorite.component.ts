import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../services/data.service';
import { UserService } from '../services/user.service';
import { SnackbarService } from '../services/snackbar.service';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faHeart, faFilm, faTv } from '@fortawesome/free-solid-svg-icons';
import { User } from '../models/User';
import { MatDialog } from '@angular/material/dialog';
import { BasicModalComponent } from '../shared/basic-modal/basic-modal.component';

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
  userProfile: User = {
    username: '',
    Lists: [],
    Favorites: []
  };

  // Icons
  faHeart = faHeart;
  faFilm = faFilm;
  faTv = faTv;

  constructor(
    private userService: UserService,
    private dataService: DataService,
    private snackbarService: SnackbarService,
    private dialog: MatDialog
  ) {
    this.userService.getUserProfileById().subscribe({
      next: (response: User) => {
        this.userProfile = {
          ...response,
          Favorites: response.Favorites || []
        };
      },
      error: (err: any) => {
        this.snackbarService.showError(err);
      }
    });
  }

  removeFromFavorites(favorite: any) {
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
          next: (response: any) => {
            this.snackbarService.showSuccess(response.message);
            this.userProfile.Favorites = this.userProfile.Favorites!.filter((f: any) => f.id !== favorite.id);
          },
          error: (err: any) => {
            this.snackbarService.showError(err);
          }
        });
      }
    });
  }
}
