import { Component, Input } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { DataService } from 'src/app/services/data.service';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-search-results',
  templateUrl: './search-results.component.html',
  styleUrls: ['./search-results.component.sass']
})
export class SearchResultsComponent {
  @Input() movies: any[] = [];
  @Input() tvShows: any[] = [];
  isLoggedIn = false;

  constructor(
    private dataService: DataService,
    private authService: AuthService,
    private snackbarService: SnackbarService
  ) {
    this.isLoggedIn = this.authService.isUserLoggedIn();
    this.authService.authStatusChanged.subscribe(
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
}