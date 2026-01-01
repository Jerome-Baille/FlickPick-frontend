import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DataService } from '../../../core/services/data.service';
import { SnackbarService } from '../../../core/services/snackbar.service';
import { Event as MovieNightEvent } from '../../../shared/models/Event';

interface EventMediaItem {
  tmdbId: number;
  mediaType: string;
  title: string;
  posterPath?: string;
  releaseDate?: string;
  overview?: string;
  points?: number;
}

interface EventResponse {
  event: MovieNightEvent & {
    Group?: {
      id: number;
      name: string;
    };
    shortlist?: {
      id: number;
      name: string;
      MediaItems?: EventMediaItem[];
    };
  };
}

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './event-detail.component.html',
  styleUrls: ['./event-detail.component.scss']
})
export class EventDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dataService = inject(DataService);
  private snackbarService = inject(SnackbarService);

  eventData: MovieNightEvent | null = null;
  groupName = '';
  groupId = 0;
  shortlistItems: EventMediaItem[] = [];
  isLoading = true;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const eventId = +params['eventId'];
      if (eventId) {
        this.loadEventData(eventId);
      }
    });
  }

  loadEventData(eventId: number): void {
    this.isLoading = true;
    this.dataService.getEventById(eventId).subscribe({
      next: (response: unknown) => {
        const res = response as EventResponse;
        this.eventData = res.event;
        this.groupName = res.event.Group?.name || '';
        this.groupId = res.event.Group?.id || res.event.groupId;
        this.shortlistItems = res.event.shortlist?.MediaItems || [];
        this.isLoading = false;
      },
      error: (err: Error) => {
        this.snackbarService.showError('Failed to load event: ' + err.message);
        this.isLoading = false;
      }
    });
  }

  getStatusLabel(): string {
    if (!this.eventData) return '';
    switch (this.eventData.status) {
      case 'draft': return 'Planning';
      case 'voting': return 'Voting Now';
      case 'completed': return 'Completed';
      case 'cancelled': return 'Cancelled';
      default: return this.eventData.status;
    }
  }

  getStatusClass(): string {
    if (!this.eventData) return '';
    return `status-${this.eventData.status}`;
  }

  launchVoting(): void {
    if (!this.eventData) return;
    
    this.dataService.launchVoting(this.eventData.id).subscribe({
      next: () => {
        this.snackbarService.showSuccess('Voting has been launched!');
        this.router.navigate(['/event/voting', this.eventData!.id]);
      },
      error: (err: Error) => {
        this.snackbarService.showError('Failed to launch voting: ' + err.message);
      }
    });
  }

  startVoting(): void {
    if (!this.eventData) return;
    this.router.navigate(['/event/voting', this.eventData.id]);
  }

  editEvent(): void {
    // Navigate to edit view - to be implemented
    this.snackbarService.showSuccess('Edit event feature coming soon!');
  }

  deleteEvent(): void {
    if (!this.eventData) return;
    
    if (confirm(`Are you sure you want to delete "${this.eventData.name}"?`)) {
      this.dataService.deleteEvent(this.eventData.id).subscribe({
        next: () => {
          this.snackbarService.showSuccess('Event deleted successfully');
          this.router.navigate(['/group/detail', this.groupId]);
        },
        error: (err: Error) => {
          this.snackbarService.showError('Failed to delete event: ' + err.message);
        }
      });
    }
  }

  backToGroup(): void {
    this.router.navigate(['/group/detail', this.groupId]);
  }

  getPosterUrl(posterPath?: string): string {
    if (!posterPath) return 'assets/placeholder-movie.jpg';
    return `https://image.tmdb.org/t/p/w500${posterPath}`;
  }

  getYear(releaseDate?: string): string {
    if (!releaseDate) return '';
    return new Date(releaseDate).getFullYear().toString();
  }
}
