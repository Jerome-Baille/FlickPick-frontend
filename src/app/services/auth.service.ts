import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, Subject, catchError, tap, throwError } from 'rxjs';
import { BACKEND_API_URL } from 'config/backend-api';
import { CookieService } from './cookie.service';
import { Router } from '@angular/router';

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
  id: number;
  username: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLoggedIn$ = new Subject<boolean>();

  constructor(
    private http: HttpClient,
    private cookieService: CookieService,
    private router: Router
  ) { }

  register(loginForm: LoginForm): Observable<RegisterResponse> {
    return this.http.post<RegisterResponse>(`${BACKEND_API_URL.auth}/register`, loginForm)
  }

  login(loginForm: LoginForm): Observable<LoginResponse> {
    return this.http.post<LoginResponse>(`${BACKEND_API_URL.auth}/login`, loginForm).pipe(
      tap((response: LoginResponse) => {
        this.cookieService.setCookie('FPaccessToken', response.accessToken, response.accessTokenExpireDate);
        this.cookieService.setCookie('FPrefreshToken', response.refreshToken, response.refreshTokenExpireDate);
        this.isLoggedIn$.next(true);
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

    this.router.navigate(['/']);
  }
}
