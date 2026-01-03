import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { DataService } from '../../core/services/data.service';
import { Event as MovieNightEvent } from '../../shared/models/Event';
import { of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

// Guard to redirect to results if event is completed
export const eventStatusGuard: CanActivateFn = (route) => {
  const dataService = inject(DataService);
  const router = inject(Router);
  const eventIdParam = route.params['eventId'];
  const eventId = Number(eventIdParam);
  if (Number.isNaN(eventId)) return of(false);

  return dataService.getEventById(eventId).pipe(
    map((response: unknown) => {
      // Backend might return { event, MediaItems } or the event object directly
      let ev: MovieNightEvent | undefined;
      if (response && typeof response === 'object' && 'event' in response) {
        ev = (response as { event: MovieNightEvent }).event;
      } else {
        ev = response as MovieNightEvent;
      }

      if (ev && ev.status === 'completed') {
        // Redirect to results if completed
        router.navigate(['/event/results', eventId]);
        return false;
      }
      return true;
    }),
    catchError(() => {
      // On error, allow navigation
      return of(true);
    })
  );
};