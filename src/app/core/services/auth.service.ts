import { Injectable, signal, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { tap, map, filter, take } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';
import { Router } from '@angular/router';

interface VerifyResponse {
  message: string;
  status: string;
  userId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);

  private authURL = environment.authURL;
  private authFrontURL = environment.authFrontURL;
  
  // Check if we're in development mode
  readonly isDevelopment = !environment.production;

  // Using signal instead of BehaviorSubject
  private authState = signal<boolean>(false);
  // Expose the signal as a readonly signal
  readonly isAuthenticated = this.authState.asReadonly();
  
  // New signal to track if verification is complete
  private verificationCompleted = signal<boolean>(false);

  // Create observables from the signals
  readonly authState$ = toObservable(this.isAuthenticated);
  readonly verificationCompleted$ = toObservable(this.verificationCompleted.asReadonly());

  constructor() {
    this.verifyAuthState();
  }

  private verifyAuthState() {
    this.http.get<VerifyResponse>(`${this.authURL}/verify`, { withCredentials: true })
      .subscribe({
        next: (response) => {
          this.authState.set(response.status === 'success');
          this.verificationCompleted.set(true);
        },
        error: () => {
          this.authState.set(false);
          this.verificationCompleted.set(true);
        }
      });
  }

  // Wait until verification is complete then emit the authState value
  waitForAuthState(): Observable<boolean> {
    return combineLatest([this.authState$, this.verificationCompleted$]).pipe(
      filter(([, verified]) => verified),
      map(([auth]) => auth),
      take(1)
    );
  }
  
  // For backward compatibility with existing components
  get isLoggedIn(): Observable<boolean> {
    return this.waitForAuthState();
  }

  private buildReturnUrl(path: string): string {
    const currentOrigin = window.location.origin;
    return `${currentOrigin}${path}`;
  }

  login(): void {
    // In development mode, redirect to dev auth selector
    if (this.isDevelopment) {
      this.router.navigate(['/auth/dev']);
      return;
    }
    
    const returnUrl = this.buildReturnUrl('/auth/after-login');
    window.location.href = `${this.authFrontURL}/external-login?returnUrl=${encodeURIComponent(returnUrl)}`;
  }

  handlePostLogin() {
    return this.http.get<VerifyResponse>(`${this.authURL}/verify`, { withCredentials: true }).pipe(
      tap((response) => {
        this.authState.set(response.status === 'success');
        this.verificationCompleted.set(true);
      }),
      map(response => ({
        auth: response.status === 'success',
        message: response.message,
        userId: response.userId
      }))
    );
  }

  logout(skipRequest = false): void {
    if (skipRequest) {
      this.authState.set(false);
      this.verificationCompleted.set(true);
      window.location.reload();
      return;
    }

    this.http.post(`${this.authURL}/logout`, {}, { withCredentials: true })
      .subscribe({
        next: () => {
          this.authState.set(false);
          this.verificationCompleted.set(true);
          window.location.reload();
        },
        error: () => {
          // Even if the request fails, we'll clear the auth state locally
          this.authState.set(false);
          this.verificationCompleted.set(true);
          window.location.reload();
        }
      });
  }

  register(): void {
    // In development mode, redirect to dev auth selector (registration is same as login)
    if (this.isDevelopment) {
      this.router.navigate(['/auth/dev']);
      return;
    }
    
    const returnUrl = this.buildReturnUrl('/auth/after-login');
    window.location.href = `${this.authFrontURL}/external-register?returnUrl=${encodeURIComponent(returnUrl)}`;
  }

  refreshToken() {
    return this.http.post(`${this.authURL}/refresh`, {}, { withCredentials: true });
  }
}