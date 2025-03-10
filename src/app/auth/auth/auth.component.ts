import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-auth',
  templateUrl: './auth.component.html',
  styleUrls: ['./auth.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    RouterModule
  ]
})
export class AuthComponent {
  isLoggedIn = false;
  isLoading = false;
  isRegisterMode = false;

  constructor(
    private authService: AuthService,
    private snackbarService: SnackbarService
  ) {
    this.authService.waitForAuthState().subscribe(
      (isLoggedIn: boolean) => {
        this.isLoggedIn = isLoggedIn;
      }
    );
  }

  toggleMode() {
    if (!this.isLoading) {
      this.isRegisterMode = !this.isRegisterMode;
    }
  }

  onAction() {
    this.isLoading = true;
    try {
      if (this.isRegisterMode) {
        this.authService.register();
      } else {
        this.authService.login();
      }
    } catch (error) {
      this.isLoading = false;
      this.snackbarService.showError(`Failed to redirect to ${this.isRegisterMode ? 'registration' : 'authentication'} service`);
    }
  }

  onLogout() {
    this.isLoading = true;
    try {
      this.authService.logout();
    } catch (error) {
      this.isLoading = false;
      this.snackbarService.showError('Failed to redirect to logout');
    }
  }
}
