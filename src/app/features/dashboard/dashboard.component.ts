import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFilm, faUsers, faHeart, faTv } from '@fortawesome/free-solid-svg-icons';
import { DataService } from 'src/app/core/services/data.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';

interface GroupItem {
  id: number;
  name: string;
  isAdmin?: boolean;
}

interface MediaItem {
  id: number;
  title: string;
  mediaType: string;
  tmdbId: number;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterLink,
    FontAwesomeModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private dataService = inject(DataService);
  private snackbarService = inject(SnackbarService);

  recentGroups: GroupItem[] = [];
  favoriteMedia: MediaItem[] = [];
  recentVotes: unknown[] = [];

  // Icons
  faFilm = faFilm;
  faUsers = faUsers;
  faHeart = faHeart;
  faTv = faTv;

  ngOnInit() {
    // Get user's groups
    this.dataService.getAllGroupsForUser().subscribe({
      next: (response: unknown) => {
        const groups = response as GroupItem[];
        if (groups && Array.isArray(groups) && groups.length > 0) {
          this.recentGroups = groups.slice(0, 3); // Get last 3 groups
        } else {
          this.recentGroups = [];
        }
      },
      error: (err) => this.snackbarService.showError(err.message)
    });

    // Get favorite media items
    this.dataService.getUserFavorites().subscribe({
      next: (response: unknown) => {
        const favorites = response as MediaItem[];
        if (favorites && Array.isArray(favorites) && favorites.length > 0) {
          this.favoriteMedia = favorites.slice(0, 3); // Get last 3 favorites
        } else {
          this.favoriteMedia = [];
        }
      },
      error: (err) => this.snackbarService.showError(err.message)
    });
  }
}
