import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-after-login',
  template: '<div>Processing authentication...</div>'
})
export class AfterLoginComponent implements OnInit {
  constructor(
    private router: Router,
    private authService: AuthService,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit() {
    this.authService.handlePostLogin().subscribe({
      next: (response) => {
        if (response.auth) {
          this.snackbarService.showSuccess('Successfully logged in');
          this.router.navigate(['/']);
        } else {
          this.snackbarService.showError(response.message || 'Authentication failed');
          this.router.navigate(['/auth/login']);
        }
      },
      error: (error) => {
        this.snackbarService.showError('Authentication failed');
        this.router.navigate(['/auth/login']);
      }
    });
  }
}