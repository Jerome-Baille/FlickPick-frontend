import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
import { BreadcrumbComponent } from '../../../shared/components/breadcrumb/breadcrumb.component';
import { MediaCardComponent } from '../../../shared/components/media-card/media-card.component';
import { DataService, ApiMessageResponse } from '../../../core/services/data.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { Event as MovieNightEvent, EventStatus } from '../../../shared/models/Event';
import { List, ListMediaItem } from '../../../shared/models/List';
import { Group } from '../../../shared/models/Group';
import { environment } from 'src/environments/environment';

type EventMediaItem = ListMediaItem; // reuse shared model for shortlist items (mediaType is string in API) 

@Component({
  selector: 'app-event-edit',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatButtonModule,
    MatIconModule,
    BreadcrumbComponent,
    MediaCardComponent,
    DragDropModule
  ],
  templateUrl: './event-edit.component.html',
  styleUrls: ['./event-edit.component.scss']
})
export class EventEditComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  private dataService = inject(DataService);
  private snackbarService = inject(SnackbarService);

  eventId = 0;
  isLoading = true;
  isSaving = false;
  shortlistId: number | null = null;
  shortlist: EventMediaItem[] = [];
  breadcrumbItems: { label: string; link?: (string | number | Record<string, unknown>)[] }[] = [];

  TMDB_IMAGE_BASE_URL_300: string = environment.TMDB_IMAGE_BASE_URL_300;

  statusOptions: EventStatus[] = ['draft', 'voting', 'completed', 'cancelled'];

  form = this.fb.group({
    name: ['', Validators.required],
    listName: [''],
    status: ['draft' as EventStatus, Validators.required],
    eventDate: [null as Date | null],
    startTime: [''],
    endTime: ['']
  });

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = +params['eventId'];
      if (id) {
        this.eventId = id;
        this.loadEventData(id);
      }
    });
  }

  loadEventData(eventId: number): void {
    this.isLoading = true;
    this.dataService.getEventById(eventId).subscribe({
      next: (res: { event: MovieNightEvent & { shortlist?: List; Group?: Group }; MediaItems?: ListMediaItem[] }) => {
        const event = res.event;
        this.form.patchValue({
          name: event.name,
          status: event.status || 'draft',
          eventDate: event.eventDate ? new Date(event.eventDate) : null,
          startTime: event.startTime || '',
          endTime: event.endTime || '',
          listName: event.shortlist?.name || ''
        });
        // Prefer shortlist's MediaItems, otherwise fall back to top-level MediaItems
        this.shortlist = (event.shortlist?.MediaItems || res.MediaItems || []).map(mi => ({ ...mi } as EventMediaItem));
        this.shortlistId = event.shortlist?.id ?? null;
        this.breadcrumbItems = [
          { label: 'Dashboard', link: ['/dashboard'] },
          { label: event.Group?.name || 'Group', link: ['/group/detail', event.groupId] },
          { label: 'Edit: ' + event.name }
        ];
        this.isLoading = false;
      },
      error: (err: Error) => {
        this.snackbarService.showError('Failed to load event: ' + err.message);
        this.isLoading = false;
      }
    });
  }

  save(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSaving = true;
    const v = this.form.value as { name: string; listName?: string; status: EventStatus; eventDate?: Date | null; startTime?: string | null; endTime?: string | null };
    const payload: { name: string; status: EventStatus; startTime?: string; endTime?: string; eventDate?: string; listName?: string } = {
      name: v.name,
      status: v.status
    };

    if (v.startTime) payload.startTime = v.startTime;
    if (v.endTime) payload.endTime = v.endTime;

    if (v.eventDate) {
      // Send only date part in ISO format (YYYY-MM-DD)
      const d = new Date(v.eventDate);
      payload.eventDate = d.toISOString();
    }

    if (v.listName) {
      payload.listName = v.listName;
    }

    this.dataService.updateEvent(this.eventId, payload).subscribe({
      next: () => {
        this.snackbarService.showSuccess('Event saved successfully');
        this.isSaving = false;
        this.router.navigate(['/event/detail', this.eventId]);
      },
      error: (err: Error) => {
        this.snackbarService.showError('Failed to save event: ' + err.message);
        this.isSaving = false;
      }
    });
  }

  cancel(): void {
    this.router.navigate(['/event/detail', this.eventId]);
  }

  addMedia(): void {
    const tmdb = prompt('Enter TMDB id to add to shortlist (numeric):');
    if (!tmdb) return;
    const tmdbId = Number(tmdb);
    if (!Number.isFinite(tmdbId)) {
      this.snackbarService.showError('Invalid TMDB id');
      return;
    }

    const mediaType = (prompt('Media type (movie/tv)', 'movie') || 'movie') as 'movie' | 'tv';
    const title = prompt('Title (optional)', '') || undefined;

    if (!this.shortlistId) {
      this.snackbarService.showError('Cannot add media: shortlist not available');
      return;
    }

    this.dataService.addMediaItem({ listId: this.shortlistId, tmdbId, mediaType, title }).subscribe({
      next: (res: ApiMessageResponse) => {
        this.snackbarService.showSuccess(res.message || 'Media added');
        // Optimistically append item; backend will return updated list on next load
        const newItem = { tmdbId, mediaType, title: title || String(tmdbId) } as unknown as EventMediaItem;
        this.shortlist.push(newItem);
      },
      error: (err: Error) => this.snackbarService.showError(err.message || 'Failed to add media')
    });
  }

  removeMedia(item: EventMediaItem): void {
    if (!this.shortlistId) return;
    if (!confirm(`Remove "${item.title}" from shortlist?`)) return;

    this.dataService.deleteMediaItemFromList({ tmdbId: item.tmdbId, mediaType: item.mediaType, listId: this.shortlistId }).subscribe({
      next: (res: ApiMessageResponse) => {
        this.snackbarService.showSuccess(res.message || 'Media removed');
        this.shortlist = this.shortlist.filter(i => i.tmdbId !== item.tmdbId);
      },
      error: (err: Error) => this.snackbarService.showError('Failed to remove media: ' + err.message)
    });
  }

  drop(event: CdkDragDrop<EventMediaItem[]>): void {
    moveItemInArray(this.shortlist, event.previousIndex, event.currentIndex);
    // Note: API does not support re-ordering via a dedicated endpoint today - this is local only
  }

  launchVoting(): void {
    if (this.shortlist.length === 0) {
      this.snackbarService.showError('Cannot launch voting: shortlist is empty');
      return;
    }

    if (!confirm('Launch voting for this event?')) return;

    this.dataService.launchVoting(this.eventId).subscribe({
      next: () => {
        this.snackbarService.showSuccess('Voting has been launched!');
        this.router.navigate(['/event/voting', this.eventId]);
      },
      error: (err: Error) => {
        this.snackbarService.showError('Failed to launch voting: ' + err.message);
      }
    });
  }

  deleteEvent(): void {
    if (!confirm('Are you sure you want to delete this event? This action cannot be undone.')) return;
    this.dataService.deleteEvent(this.eventId).subscribe({
      next: () => {
        this.snackbarService.showSuccess('Event deleted');
        // Navigate back to group view - try to infer groupId from breadcrumb
        const groupLink = this.breadcrumbItems.find(i => Array.isArray(i.link) && i.link[0] === '/group/detail');
        const groupId = groupLink && Array.isArray(groupLink.link) && typeof groupLink.link[1] !== 'undefined' ? Number(groupLink.link[1]) : null;
        if (groupId) {
          this.router.navigate(['/group/detail', groupId]);
        } else {
          this.router.navigate(['/dashboard']);
        }
      },
      error: (err: Error) => this.snackbarService.showError('Failed to delete event: ' + err.message)
    });
  }

  getStatusLabel(): string {
    const status = this.form.get('status')?.value as EventStatus | undefined;
    if (!status) return '';
    switch (status) {
      case 'draft': return 'Planning';
      case 'voting': return 'Voting Now';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return status;
    }
  }

  getStatusClass(): string {
    const status = this.form.get('status')?.value;
    return status ? `status-${status}` : '';
  }

  getMediaType(mediaType?: string): 'movie' | 'tv' {
    return mediaType === 'tv' ? 'tv' : 'movie';
  }

  getItemPoints(item: EventMediaItem): number | undefined {
    // API sometimes attaches points/votes client-side; safely extract if present
    return (item as EventMediaItem & { points?: number }).points;
  }
}

