import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { RouterModule } from '@angular/router';
import { AuthService } from 'src/app/core/services/auth.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';

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
  private authService = inject(AuthService);
  private snackbarService = inject(SnackbarService);

  isLoggedIn = false;
  isLoading = false;
  isRegisterMode = false;

  constructor() {
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
    } catch {
      this.isLoading = false;
      this.snackbarService.showError(`Failed to redirect to ${this.isRegisterMode ? 'registration' : 'authentication'} service`);
    }
  }

  onLogout() {
    this.isLoading = true;
    try {
      this.authService.logout();
    } catch {
      this.isLoading = false;
      this.snackbarService.showError('Failed to redirect to logout');
    }
  }
}
