import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse
} from '@angular/common/http';
import { CookieService } from './services/cookie.service';
import { LoaderService } from './services/loader.service';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, switchMap, finalize, filter, tap } from 'rxjs/operators';
import { AuthService } from './services/auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  private isRefreshingToken = false;
  private accessTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(
    private cookieService: CookieService,
    private loaderService: LoaderService,
    private authService: AuthService
  ) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    this.loaderService.showLoader();
    const accessToken = this.cookieService.getCookie('FPaccessToken');

    if (accessToken) {
      request = request.clone({
        setHeaders: {
          Authorization: `Bearer ${accessToken}`
        }
      });
    }
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 403 || error.status === 401) {
          if (!request.url.endsWith('/refresh')) {
            // Token refresh is required, so retry the request after refreshing the token
            return this.handleTokenRefreshAndRetry(request, next);
          } else {
            // Token refresh failed, logout the user
            this.authService.logout();
            return throwError(() => error);
          }
        } else {
          // Handle other error statuses
          return throwError(() => error);
        }
      }),
      finalize(() => {
        this.loaderService.hideLoader(); // Hide the loader
      })
    );
  }

  private handleTokenRefreshAndRetry(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshingToken) {
      this.isRefreshingToken = true;
      this.accessTokenSubject.next(null);

      return this.authService.refreshToken().pipe(
        switchMap((newToken: string) => {
          if (newToken !== null) {
            // Store the new token and update the headers in the original request
            this.accessTokenSubject.next(newToken);
            request = request.clone({
              setHeaders: {
                Authorization: `Bearer ${newToken}`
              }
            });

            // Make a copy of the form content and retry the request
            const formContent = { ...request.body };
            request = request.clone({ body: formContent });

            return next.handle(request);
          } else {
            // Token refresh failed, logout the user
            this.authService.logout();
            return throwError(() => 'Token refresh failed')
          }
        }),
        catchError((error) => {
          // Token refresh failed, logout the user
          this.authService.logout();
          return throwError(() => error);
        }),
        finalize(() => {
          this.isRefreshingToken = false;
        })
      );
    } else {
      // If token refresh is already in progress, wait for it to complete and then retry the request
      return this.accessTokenSubject.pipe(
        filter((token): token is string => token !== null),
        switchMap((token: string) => {
          // Retry the request with the new token
          request = request.clone({
            setHeaders: {
              Authorization: token
            }
          });
          return next.handle(request);
        })
      );
    }
  }
}