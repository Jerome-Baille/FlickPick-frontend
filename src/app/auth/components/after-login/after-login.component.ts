import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-after-login',
  template: '<div>Processing authentication...</div>'
})
export class AfterLoginComponent implements OnInit {
  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private authService: AuthService,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      const token = params['token'];
      if (token) {
        this.handleAuthCallback(token);
      } else {
        this.snackbarService.showError('No authentication token received');
        this.router.navigate(['/auth/login']);
      }
    });
  }

  private handleAuthCallback(token: string) {
    this.authService.handleAuthCallback(token).subscribe({
      next: () => {
        this.snackbarService.showSuccess('Successfully logged in');
        this.router.navigate(['/']);
      },
      error: (error) => {
        this.snackbarService.showError('Authentication failed');
        this.router.navigate(['/auth/login']);
      }
    });
  }
}