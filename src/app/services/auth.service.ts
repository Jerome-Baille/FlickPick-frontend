import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, catchError, switchMap, tap, throwError } from 'rxjs';
import { BACKEND_API_URL } from 'config/backend-api';
import { CookieService } from './cookie.service';

interface LoginForm {
  username: string;
  password: string;
}

interface LoginResponse {
  message: string;
  accessToken: string;
  refreshToken: string;
  userId: number;
  accessTokenExpireDate: Date;
  refreshTokenExpireDate: Date;
  userIdExpireDate: Date;
}

interface RegisterResponse {
  message: string;
  id: number;
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private isLoggedIn$ = new BehaviorSubject<boolean>(false);
  private accessTokenSubject = new BehaviorSubject<string>('');

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
  ) {
    // Initialize the authentication state from local storage
    const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true';
    this.isLoggedIn$.next(isLoggedIn);
  }

  isUserLoggedIn(): boolean {
    // const accessToken = this.cookieService.getCookie('FPaccessToken');
    // return !!accessToken;
    return this.isLoggedIn$.getValue();
  }

  register(loginForm: LoginForm): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${BACKEND_API_URL.auth}/register`, loginForm)
  }

  login(loginForm: LoginForm): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${BACKEND_API_URL.auth}/login`, loginForm).pipe(
      tap((response: LoginResponse) => {
        this.cookieService.setCookie('FPaccessToken', response.accessToken, response.accessTokenExpireDate);
        this.cookieService.setCookie('FPrefreshToken', response.refreshToken, response.refreshTokenExpireDate);
        this.isLoggedIn$.next(true);
        // Store the authentication state in local storage
        localStorage.setItem('isLoggedIn', 'true');
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    this.cookieService.deleteCookie('FPaccessToken');
    this.cookieService.deleteCookie('FPrefreshToken');

    this.isLoggedIn$.next(false);
    // Remove the authentication state from local storage
    localStorage.removeItem('isLoggedIn');
  }

  get authStatusChanged() {
    return this.isLoggedIn$.asObservable();
  }

  // Method to handle token refresh
  refreshToken(): Observable<string> {
    const refreshToken = this.cookieService.getCookie('FPrefreshToken');
    if (!refreshToken) {
      this.logout();
      return throwError(() => 'Refresh token not found');
    }
    return this.http.post<any>(`${BACKEND_API_URL.auth}/refresh`, { refreshToken }).pipe(
      switchMap((response: any) => {
        const newAccessToken = response.accessToken;
        this.cookieService.setCookie('FPaccessToken', newAccessToken, response.accessTokenExpireDate);
        this.accessTokenSubject.next(newAccessToken);
        return this.accessTokenSubject;
      }),
      catchError((error) => {
        this.logout();
        return throwError(() => error);
      })
    );
  }
}
