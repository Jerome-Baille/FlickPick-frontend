import { inject, runInInjectionContext, EnvironmentInjector, signal } from '@angular/core';
import { catchError, switchMap, finalize } from 'rxjs/operators';
import { throwError, Observable, from } from 'rxjs';
import { HttpRequest, HttpHandlerFn, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';

// Using signals instead of Subject for token refresh state
let isRefreshing = false;
const refreshTokenSignal = signal<boolean>(false);
let refreshAttempts = 0; // Add counter for refresh attempts

// A queue to store pending requests during refresh
const pendingRequests: Array<{
  resolve: (value: boolean) => void;
}> = [];

// Function to notify waiting requests
function notifyRefreshComplete() {
  // Update signal to notify components
  refreshTokenSignal.set(true);
  
  // Process any pending requests
  pendingRequests.forEach(request => {
    request.resolve(true);
  });
  
  // Clear the queue
  pendingRequests.length = 0;
  
  // Reset signal state after a short delay
  setTimeout(() => {
    refreshTokenSignal.set(false);
  }, 100);
}

export function authInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  // Bypass refresh token endpoints
  if (req.url.includes('/refresh')) {
    return next(req);
  }

  const injector = inject(EnvironmentInjector);
  
  // We'll use the injector inside the pipes where we need the services
  const modifiedRequest = req.clone({
    withCredentials: true
  });

  return next(modifiedRequest).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.error.shouldRefresh && refreshAttempts < 2) {
        refreshAttempts++; // Increment attempts
        if (!isRefreshing) {
          isRefreshing = true;
          
          return runInInjectionContext(injector, () => {
            const authService = inject(AuthService);
            const router = inject(Router);
            
            return authService.refreshToken().pipe(
              switchMap(() => {
                isRefreshing = false;
                refreshAttempts = 0; // Reset attempts on success
                notifyRefreshComplete();
                const retryRequest = req.clone({
                  withCredentials: true
                });
                return next(retryRequest);
              }),
              catchError(refreshError => {
                isRefreshing = false;
                if (refreshAttempts >= 2) {
                  refreshAttempts = 0; // Reset attempts before logout
                  authService.logout(true);
                  router.navigate(['/auth']);
                }
                return throwError(() => refreshError);
              }),
              finalize(() => {
                isRefreshing = false;
              })
            );
          });
        } else {
          // Wait for the refresh to complete using a promise
          return from(
            new Promise<boolean>((resolve) => {
              // Add this request to the pending queue
              pendingRequests.push({ resolve });
              
              // Set up a timeout to avoid hanging forever
              setTimeout(() => {
                resolve(false);
              }, 10000); // 10 second timeout
            })
          ).pipe(
            switchMap(() => {
              const retryRequest = req.clone({
                withCredentials: true
              });
              return next(retryRequest);
            })
          );
        }
      } else {
        return throwError(() => error);
      }
    })
  );
}