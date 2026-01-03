import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { DataService } from '../../core/services/data.service';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Guard to redirect to results if event is completed
export const eventStatusGuard: CanActivateFn = (route) => {
  const dataService = inject(DataService);
  const router = inject(Router);
  const eventId = route.params['eventId'];
  console.log('eventStatusGuard: checking event', eventId);
  if (!eventId) return of(false);
  return dataService.getEventById(eventId).pipe(
    map(response => {
      // Backend returns { event, MediaItems } — unwrap if needed
      const ev: any = (response as any)?.event ?? response;
      console.log('eventStatusGuard: got event', ev?.id, ev?.status);
      if (ev && ev.status === 'completed') {
        // Redirect to results if completed
        console.log('eventStatusGuard: redirecting to results for', eventId);
        router.navigate(['/event/results', eventId]);
        return false;
      }
      return true;
    }),
    catchError(() => {
      // On error, allow navigation (or could block)
      console.log('eventStatusGuard: error fetching event, allowing navigation');
      return of(true);
    })
  );
};