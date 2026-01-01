import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router, RouterLink } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { environment } from 'src/environments/environment';
import { AuthService } from 'src/app/core/services/auth.service';

interface TestUser {
  id: number;
  username: string;
  uuid: string;
}

interface DevUsersResponse {
  users: TestUser[];
}

interface DevLoginResponse {
  message: string;
  status: string;
  user: TestUser;
}

/**
 * Development-only component for selecting test users
 * This component is only rendered in development mode
 */
@Component({
  selector: 'app-dev-auth',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule
  ],
  templateUrl: './dev-auth.component.html',
  styleUrls: ['./dev-auth.component.scss']
})
export class DevAuthComponent implements OnInit {
  private http = inject(HttpClient);
  private router = inject(Router);
  private authService = inject(AuthService);

  users: TestUser[] = [];
  isLoading = true;
  error: string | null = null;
  loginInProgress = false;
  selectedUser: TestUser | null = null;

  ngOnInit(): void {
    // Redirect to regular auth if in production
    if (environment.production) {
      this.router.navigate(['/auth']);
      return;
    }
    this.loadUsers();
  }

  loadUsers(): void {
    this.isLoading = true;
    this.error = null;

    this.http.get<DevUsersResponse>(`${environment.authURL}/dev-users`)
      .subscribe({
        next: (response) => {
          this.users = response.users;
          this.isLoading = false;
        },
        error: (err) => {
          console.error('Failed to load test users:', err);
          this.error = 'Failed to load test users. Make sure the backend is running and seeded.';
          this.isLoading = false;
        }
      });
  }

  selectUser(user: TestUser): void {
    if (this.loginInProgress) return;

    this.loginInProgress = true;
    this.selectedUser = user;

    this.http.post<DevLoginResponse>(
      `${environment.authURL}/dev-login`,
      { userId: user.id, uuid: user.uuid },
      { withCredentials: true }
    ).subscribe({
      next: () => {
        // Trigger auth state refresh and navigate
        this.authService.handlePostLogin().subscribe({
          next: () => {
            this.router.navigate(['/dashboard']);
          },
          error: () => {
            // Even if handlePostLogin fails, try navigating
            this.router.navigate(['/dashboard']);
          }
        });
      },
      error: (err) => {
        console.error('Dev login failed:', err);
        this.error = 'Login failed. Please try again.';
        this.loginInProgress = false;
        this.selectedUser = null;
      }
    });
  }
}
