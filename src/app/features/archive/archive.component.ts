import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from 'src/app/core/services/data.service';
import { Event as MovieNightEvent } from 'src/app/shared/models/Event';
import type { Event } from 'src/app/shared/models/Event';

interface WinnerMedia {
  title: string;
  posterPath?: string | null;
  releaseDate?: string | null;
  tmdbId?: number;
  mediaType?: string;
  overview?: string;
  rating?: number;
  genre?: string;
}

interface ArchiveItem {
  eventId: number;
  eventName: string;
  eventDate?: string | Date;
  groupId?: number;
  groupName?: string;
  media?: WinnerMedia;
}

@Component({
  selector: 'app-archive',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.scss']
})
export class ArchiveComponent implements OnInit {
  private dataService = inject(DataService);

  winners: ArchiveItem[] = [];
  filteredWinners: ArchiveItem[] = [];
  loading = false;
  search = '';

  ngOnInit(): void {
    this.loadWinners();
  }

  private loadWinners() {
    this.loading = true;

    interface Group {
      id: number;
      name: string;
      Events?: MovieNightEvent[];
    }

    interface MediaItem {
      title?: string;
      name?: string;
      posterPath?: string;
      releaseDate?: string;
      tmdbId?: number;
      mediaType?: string;
      overview?: string;
      sumOfRatings?: number;
      dataValues?: { sumOfRatings?: number };
      genre?: string;
    }

    this.dataService.getAllGroupsForUser().subscribe({
      next: (groups: Group[]) => {
        const completedEvents: { id: number; name: string; groupId?: number; groupName?: string; eventDate?: string }[] = [];

        // collect all completed events across groups
        (groups || []).forEach((g: Group) => {
          (g.Events || []).forEach((e: MovieNightEvent) => {
            if (e.status === 'completed') {
              completedEvents.push({
                id: e.id,
                name: e.name,
                groupId: g.id,
                groupName: g.name,
                eventDate: e.eventDate as string
              });
            }
          });
        });

        // For each completed event fetch event details (which include media item ratings)
        Promise.all(
          completedEvents.map(e => {
            return this.dataService.getEventById(e.id).toPromise().then((eventResult: Event | undefined) => {
              let mediaItems: MediaItem[] = [];
              if (eventResult) {
                // If eventResult has a 'shortlist' property with MediaItems
                if ('shortlist' in eventResult && eventResult.shortlist && Array.isArray(eventResult.shortlist.MediaItems)) {
                  mediaItems = eventResult.shortlist.MediaItems as MediaItem[];
                } else if ('MediaItems' in eventResult && Array.isArray((eventResult as { MediaItems?: MediaItem[] }).MediaItems)) {
                  mediaItems = (eventResult as { MediaItems?: MediaItem[] }).MediaItems ?? [];
                }
              }
              const sorted = mediaItems.slice().sort((a: MediaItem, b: MediaItem) => (b.dataValues?.sumOfRatings || b.sumOfRatings || 0) - (a.dataValues?.sumOfRatings || a.sumOfRatings || 0));
              const winner = sorted[0] || null;

              const archiveItem: ArchiveItem = {
                eventId: e.id,
                eventName: e.name,
                eventDate: e.eventDate,
                groupId: e.groupId,
                groupName: e.groupName,
                media: winner
                  ? {
                      title: winner.title ?? winner.name ?? '',
                      posterPath: winner.posterPath,
                      releaseDate: winner.releaseDate,
                      tmdbId: winner.tmdbId,
                      mediaType: winner.mediaType,
                      overview: winner.overview,
                      rating: winner.dataValues?.sumOfRatings || winner.sumOfRatings || 0
                    }
                  : undefined
              };

              return archiveItem;
            }).catch(() => {
              return {
                eventId: e.id,
                eventName: e.name,
                eventDate: e.eventDate,
                groupId: e.groupId,
                groupName: e.groupName
              } as ArchiveItem;
            });
          })
        )
          .then((results: ArchiveItem[]) => {
            // sort by eventDate desc
            this.winners = results
              .filter(r => !!r.media)
              .sort((a, b) => {
                const da = a.eventDate ? new Date(a.eventDate).getTime() : 0;
                const db = b.eventDate ? new Date(b.eventDate).getTime() : 0;
                return db - da;
              });

            this.filteredWinners = this.winners;
            this.loading = false;
          })
          .catch(() => {
            this.loading = false;
            this.filteredWinners = this.winners;
          });
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  onSearchChange(value: string) {
    this.search = value || '';
    const term = this.search.trim().toLowerCase();
    if (!term) {
      this.filteredWinners = this.winners;
      return;
    }

    this.filteredWinners = this.winners.filter(w => {
      const title = (w.media?.title || '').toLowerCase();
      const group = (w.groupName || '').toLowerCase();
      return title.includes(term) || group.includes(term) || (w.eventName || '').toLowerCase().includes(term);
    });
  }

  // Formats date like 'Jan 5, 2023'
  formatDate(date?: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
