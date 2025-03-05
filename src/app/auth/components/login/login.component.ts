import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.sass']
})
export class LoginComponent {
  loginForm!: FormGroup;
  isLoggedIn = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router,
    private snackbarService: SnackbarService
  ) {
    this.loginForm = this.formBuilder.group({
      username: ['', Validators.required],
      password: ['', Validators.required]
    });
  }

  onLogin() {
    if (this.loginForm.invalid) {
      return;
    }

    const { username, password } = this.loginForm.value;

    this.authService.login(username, password).subscribe({
      next: (response: any) => {
        const { userId, username } = response;
        this.snackbarService.showSuccess(response.message);
        this.loginForm.reset();

        this.handleUserCreation(userId, username);
      },
      error: () => {
        this.snackbarService.showError('Invalid username or password');
      }
    });
  }

  handleUserCreation(userId: string, username: string) {
    this.userService.createUser(userId, username).subscribe({
      next: () => {
        this.router.navigate(['/']);
      },
      error: () => {
        this.snackbarService.showError('Error creating user in database');
      }
    });
  }

  onLogout() {
    this.authService.logout();
  }
}