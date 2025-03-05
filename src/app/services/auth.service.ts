import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { tap, map, filter, take } from 'rxjs/operators';
import { Observable, combineLatest } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

interface VerifyResponse {
  message: string;
  status: string;
  userId?: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authURL = environment.authURL;
  private authFrontURL = environment.authFrontURL;

  // Using signal instead of BehaviorSubject
  private authState = signal<boolean>(false);
  // Expose the signal as a readonly signal
  readonly isAuthenticated = this.authState.asReadonly();
  
  // New signal to track if verification is complete
  private verificationCompleted = signal<boolean>(false);

  // Create observables from the signals
  readonly authState$ = toObservable(this.isAuthenticated);
  readonly verificationCompleted$ = toObservable(this.verificationCompleted.asReadonly());

  constructor(
    private http: HttpClient,
  ) {
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
      filter(([_, verified]) => verified),
      map(([auth, _]) => auth),
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
    const returnUrl = this.buildReturnUrl('/auth/after-login');
    window.location.href = `${this.authFrontURL}/external-login?returnUrl=${encodeURIComponent(returnUrl)}`;
  }

  handlePostLogin() {
    return this.http.get<VerifyResponse>(`${this.authURL}/verify`, { withCredentials: true }).pipe(
      tap((response) => {
        this.authState.set(response.status === 'success');
      }),
      map(response => ({
        auth: response.status === 'success',
        message: response.message,
        userId: response.userId
      }))
    );
  }

  logout(): void {
    this.http.post(`${this.authURL}/logout`, {}, { withCredentials: true })
      .subscribe({
        next: () => {
          this.authState.set(false);
          window.location.reload();
        },
        error: () => {
          // Even if the request fails, we'll clear the auth state locally
          this.authState.set(false);
          window.location.reload();
        }
      });
  }

  register(): void {
    const returnUrl = this.buildReturnUrl('/auth/after-login');
    window.location.href = `${this.authFrontURL}/external-register?returnUrl=${encodeURIComponent(returnUrl)}`;
  }

  refreshToken() {
    return this.http.post(`${this.authURL}/refresh`, {}, { withCredentials: true });
  }
}