import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authURL = environment.authURL;
  private loggedIn$ = new BehaviorSubject<boolean>(this.getInitialLoginState());

  constructor(
    private http: HttpClient,
    private router: Router
  ) { }

  private getInitialLoginState(): boolean {
    return localStorage.getItem('loggedIn') === 'true';
  }

  get isLoggedIn() {
    return this.loggedIn$.asObservable();
  }

  private buildReturnUrl(): string {
    const baseUrl = window.location.origin;
    return `${baseUrl}/auth/after-login`;
  }

  login(username: string, password: string): void {
    const returnUrl = this.buildReturnUrl();
    const redirectUrl = `${this.authURL}/login?returnUrl=${encodeURIComponent(returnUrl)}`;
    window.location.href = redirectUrl;
  }

  handleAuthCallback(token: string) {
    return this.http.post(`${this.authURL}/verify-token`, { token }, { withCredentials: true }).pipe(
      tap(() => {
        this.loggedIn$.next(true);
        localStorage.setItem('loggedIn', 'true');
      }),
      catchError((error) => {
        this.loggedIn$.next(false);
        localStorage.removeItem('loggedIn');
        return throwError(() => error);
      })
    );
  }

  logout() {
    const returnUrl = this.buildReturnUrl();
    const redirectUrl = `${this.authURL}/logout?returnUrl=${encodeURIComponent(returnUrl)}`;
    window.location.href = redirectUrl;
  }

  register(username: string, email: string, password: string): void {
    const returnUrl = this.buildReturnUrl();
    const redirectUrl = `${this.authURL}/register?returnUrl=${encodeURIComponent(returnUrl)}`;
    window.location.href = redirectUrl;
  }

  refreshToken() {
    return this.http.post(`${this.authURL}/refresh`, {}, { withCredentials: true });
  }
}