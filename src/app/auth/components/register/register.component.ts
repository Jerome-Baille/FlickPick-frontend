import { Component } from '@angular/core';
import { AuthService } from 'src/app/services/auth.service';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.sass']
})
export class RegisterComponent {
  isLoading = false;

  constructor(
    private authService: AuthService,
    private snackbarService: SnackbarService
  ) {}

  onRegister() {
    this.isLoading = true;
    try {
      this.authService.register();
    } catch (error) {
      this.isLoading = false;
      this.snackbarService.showError('Failed to redirect to registration service');
    }
  }
}
