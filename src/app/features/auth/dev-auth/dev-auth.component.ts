import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
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
    MatCardModule,
    MatButtonModule,
    MatListModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatChipsModule
  ],
  template: `
    <main class="dev-auth-container">
      <mat-card class="dev-auth-card">
        <mat-card-header>
          <mat-card-title>
            <mat-icon color="warn">developer_mode</mat-icon>
            <h1>Development Mode</h1>
          </mat-card-title>
          <mat-card-subtitle>
            Select a test user to login
          </mat-card-subtitle>
        </mat-card-header>

        <mat-card-content>
          @if (isLoading) {
            <div class="loading-container">
              <mat-spinner diameter="40"></mat-spinner>
              <p>Loading test users...</p>
            </div>
          } @else if (error) {
            <div class="error-container">
              <mat-icon color="warn">error</mat-icon>
              <p>{{ error }}</p>
              <button mat-raised-button color="primary" (click)="loadUsers()">
                Retry
              </button>
            </div>
          } @else {
            <mat-chip color="warn" highlighted>
              <mat-icon>warning</mat-icon>
              Do not use in production!
            </mat-chip>
            
            <mat-divider></mat-divider>

            <mat-selection-list [multiple]="false">
              @for (user of users; track user.id) {
                <mat-list-option 
                  (click)="selectUser(user)"
                  [disabled]="loginInProgress"
                  class="user-option">
                  <div class="user-item">
                    <mat-icon matListItemIcon>person</mat-icon>
                    <div class="user-info">
                      <span class="username">{{ user.username }}</span>
                      <span class="uuid">ID: {{ user.id }} | UUID: {{ user.uuid | slice:0:8 }}...</span>
                    </div>
                    @if (loginInProgress && selectedUser?.id === user.id) {
                      <mat-spinner diameter="20"></mat-spinner>
                    }
                  </div>
                </mat-list-option>
              } @empty {
                <div class="empty-state">
                  <mat-icon>group_off</mat-icon>
                  <p>No test users found</p>
                  <p class="hint">Run <code>npm run seed</code> in the backend to create test users</p>
                </div>
              }
            </mat-selection-list>
          }
        </mat-card-content>

        <mat-card-actions>
          <button mat-button color="warn" routerLink="/auth">
            <mat-icon>arrow_back</mat-icon>
            Back to Production Auth
          </button>
        </mat-card-actions>
      </mat-card>
    </main>
  `,
  styles: [`
    .dev-auth-container {
      display: flex;
      justify-content: center;
      align-items: center;
      min-height: 80vh;
      padding: 20px;
    }

    .dev-auth-card {
      max-width: 500px;
      width: 100%;
    }

    mat-card-header {
      margin-bottom: 16px;
    }

    mat-card-title {
      display: flex;
      align-items: center;
      gap: 8px;

      h1 {
        margin: 0;
        font-size: 1.5rem;
      }

      mat-icon {
        font-size: 28px;
        width: 28px;
        height: 28px;
      }
    }

    mat-chip {
      margin-bottom: 16px;
    }

    mat-divider {
      margin: 16px 0;
    }

    .loading-container,
    .error-container {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px;
      gap: 16px;
    }

    .error-container mat-icon {
      font-size: 48px;
      width: 48px;
      height: 48px;
    }

    .user-option {
      margin: 4px 0;
      border-radius: 8px;
      
      &:hover {
        background-color: rgba(var(--mat-primary-color), 0.1);
      }
    }

    .user-item {
      display: flex;
      align-items: center;
      gap: 12px;
      width: 100%;
    }

    .user-info {
      display: flex;
      flex-direction: column;
      flex: 1;
    }

    .username {
      font-weight: 500;
      font-size: 1rem;
    }

    .uuid {
      font-size: 0.75rem;
      color: var(--mat-secondary-text-color, #666);
      font-family: monospace;
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      padding: 32px;
      color: #666;

      mat-icon {
        font-size: 48px;
        width: 48px;
        height: 48px;
        margin-bottom: 16px;
      }

      .hint {
        font-size: 0.875rem;

        code {
          background-color: #f5f5f5;
          padding: 2px 6px;
          border-radius: 4px;
          font-family: monospace;
        }
      }
    }

    mat-card-actions {
      display: flex;
      justify-content: flex-end;
      padding: 16px;
    }
  `]
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
