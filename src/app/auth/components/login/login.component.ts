import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent {
  isLoggedIn = false;
  isLoading = false;

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

  onLogin() {
    this.isLoading = true;
    try {
      this.authService.login();
    } catch (error) {
      this.isLoading = false;
      this.snackbarService.showError('Failed to redirect to authentication service');
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