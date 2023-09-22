import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent {
  loginForm!: FormGroup;
  isUserLoggedIn: boolean = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackbarService: SnackbarService,
  ) {
    this.isUserLoggedIn = this.authService.isUserLoggedIn();

    if (!this.isUserLoggedIn) {
      this.loginForm = this.formBuilder.group({
        username: ['', Validators.required],
        password: ['', Validators.required]
      });
    }
  }

  onLogin() {
    if (this.loginForm.invalid) {
      return;
    }

    this.authService.login(this.loginForm.value).subscribe({
      next: (response) => {
        this.snackbarService.showSuccess(response.message);
        this.loginForm.reset();
        this.router.navigate(['/']);
      },
      error: () => {
        this.snackbarService.showError('Invalid username or password');
      }
    })
  }

  onLogout() {
    this.authService.logout();
  }
}