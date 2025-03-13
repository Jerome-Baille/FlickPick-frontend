import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faFilm, faUsers, faHeart, faTv } from '@fortawesome/free-solid-svg-icons';
import { DataService } from '../services/data.service';
import { SnackbarService } from '../services/snackbar.service';

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
  recentGroups: any[] = [];
  favoriteMedia: any[] = [];
  recentVotes: any[] = [];

  // Icons
  faFilm = faFilm;
  faUsers = faUsers;
  faHeart = faHeart;
  faTv = faTv;

  constructor(
    private dataService: DataService,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit() {
    // Get user's groups
    this.dataService.getAllGroupsForUser().subscribe({
      next: (response: any) => {
        if (response && Array.isArray(response) && response.length > 0) {
          this.recentGroups = response.slice(0, 3); // Get last 3 groups
        } else {
          this.recentGroups = [];
        }
      },
      error: (err) => this.snackbarService.showError(err.message)
    });

    // Get favorite media items
    this.dataService.getUserFavorites().subscribe({
      next: (response: any) => {
        if (response && Array.isArray(response) && response.length > 0) {
          this.favoriteMedia = response.slice(0, 3); // Get last 3 favorites
        } else {
          this.favoriteMedia = [];
        }
      },
      error: (err) => this.snackbarService.showError(err.message)
    });
  }
}
