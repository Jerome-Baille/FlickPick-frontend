import { Injectable } from '@angular/core';
import { BehaviorSubject, catchError, tap, throwError } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private authURL = environment.authURL;
  private loggedIn$ = new BehaviorSubject<boolean>(this.getInitialLoginState());

  constructor(
    private http: HttpClient,
  ) { }

  private getInitialLoginState(): boolean {
    return localStorage.getItem('loggedIn') === 'true';
  }

  get isLoggedIn() {
    return this.loggedIn$.asObservable();
  }

  login(username: string, password: string): any {
    return this.http.post(`${this.authURL}/login`, { username, password }, { withCredentials: true }).pipe(
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
    return this.http.post(`${this.authURL}/logout`, {}, { withCredentials: true }).pipe(
      tap(() => {
        this.loggedIn$.next(false);
        localStorage.removeItem('loggedIn');
      }),
      catchError((error) => {
        this.loggedIn$.next(false);
        localStorage.removeItem('loggedIn');
        return throwError(() => error);
      })
    );
  }

  register(username: string, email: string, password: string): any {
    return this.http.post(`${this.authURL}/register`, { username, email, password }, { withCredentials: true });
  }

  refreshToken() {
    return this.http.post(`${this.authURL}/refresh`, {}, { withCredentials: true });
  }
}