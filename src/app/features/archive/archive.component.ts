import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DataService } from 'src/app/core/services/data.service';
import { firstValueFrom } from 'rxjs';

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
  selectedYear = 'All';
  selectedRating = 0;
  years: string[] = [];

  // View mode: 'grid' | 'list'
  viewMode: 'grid' | 'list' = 'grid';

  ngOnInit(): void {
    this.loadWinners();
  }

  private loadWinners() {
    this.loading = true;

    // Modern approach: fetch user lists, treat lists named "* Winner" as archive entries,
    // load their media items and display only the winning media.
    firstValueFrom(this.dataService.getAllListsForUser())
      .then(async (lists: { id: number; name: string }[]) => {
        const winnerLists = (lists || []).filter(l => /winner$/i.test(l.name));

        const items: ArchiveItem[] = [];
        await Promise.all(
          winnerLists.map(async (list) => {
            try {
              const mediaRes: unknown = await firstValueFrom(this.dataService.getMediaItemsInList(list.id));
              let firstMedia: unknown = undefined;
              if (Array.isArray(mediaRes)) {
                firstMedia = mediaRes[0];
              } else if (
                mediaRes &&
                typeof mediaRes === 'object' &&
                'MediaItems' in mediaRes &&
                Array.isArray((mediaRes as { MediaItems: unknown[] }).MediaItems)
              ) {
                firstMedia = (mediaRes as { MediaItems: unknown[] }).MediaItems[0];
              }
              if (firstMedia && typeof firstMedia === 'object' && firstMedia !== null) {
                const eventName = list.name.replace(/\s*Winner$/i, '').trim();

                // Extract eventDate and eventId safely
                let listEventDate: string | Date | undefined = undefined;
                let listEventId: number | undefined = undefined;
                if (mediaRes && typeof mediaRes === 'object') {
                  if ('eventDate' in mediaRes && typeof (mediaRes as { eventDate?: string | Date }).eventDate !== 'undefined') {
                    listEventDate = (mediaRes as { eventDate?: string | Date }).eventDate;
                  } else if ('dataValues' in mediaRes && typeof (mediaRes as { dataValues?: { eventDate?: string | Date } }).dataValues === 'object') {
                    listEventDate = (mediaRes as { dataValues?: { eventDate?: string | Date } }).dataValues?.eventDate;
                  }
                  if ('eventId' in mediaRes && typeof (mediaRes as { eventId?: number }).eventId !== 'undefined') {
                    listEventId = (mediaRes as { eventId?: number }).eventId;
                  } else if ('dataValues' in mediaRes && typeof (mediaRes as { dataValues?: { eventId?: number } }).dataValues === 'object') {
                    listEventId = (mediaRes as { dataValues?: { eventId?: number } }).dataValues?.eventId;
                  }
                }

                // Normalize media fields for the frontend
                const fm = firstMedia as Record<string, unknown>;
                const rawPoster = fm['posterPath'] ?? fm['poster_path'] ?? '';
                const posterPath =
                  typeof rawPoster === 'string' && rawPoster
                    ? (rawPoster.startsWith('http') ? rawPoster : `https://image.tmdb.org/t/p/w500${rawPoster}`)
                    : undefined;

                const rating = Number(
                  fm['rating'] ?? fm['sumOfRatings'] ?? (fm['dataValues'] && typeof fm['dataValues'] === 'object' ? (fm['dataValues'] as Record<string, unknown>)['sumOfRatings'] : 0) ?? 0
                ) || 0;
                const genre = (fm['genre'] ?? fm['type'] ?? 'Movie') as string;

                items.push({
                  eventId: listEventId ?? (fm['eventId'] as number) ?? 0,
                  eventName,
                  eventDate: listEventDate ?? (fm['eventDate'] as string | Date | undefined),
                  groupId: fm['groupId'] as number | undefined,
                  groupName: fm['groupName'] as string | undefined,
                  media: {
                    title: (fm['title'] ?? fm['name'] ?? '') as string,
                    posterPath,
                    releaseDate: (fm['releaseDate'] ?? fm['release_date'] ?? undefined) as string | undefined,
                    tmdbId: (fm['tmdbId'] ?? fm['tmdb_id'] ?? undefined) as number | undefined,
                    mediaType: (fm['mediaType'] ?? fm['media_type'] ?? undefined) as string | undefined,
                    overview: (fm['overview'] ?? fm['description'] ?? undefined) as string | undefined,
                    rating,
                    genre
                  }
                });
              }
            } catch {
              // ignore per-list errors
            }
          })
        );

        // sort by eventDate desc when available
        this.winners = items.sort((a, b) => {
          const da = a.eventDate ? new Date(a.eventDate).getTime() : 0;
          const db = b.eventDate ? new Date(b.eventDate).getTime() : 0;
          return db - da;
        });

        // compute available years for the year filter (most recent first)
        this.years = Array.from(
          new Set(
            this.winners
              .map(w => (w.eventDate ? new Date(w.eventDate).getFullYear().toString() : undefined))
              .filter((y): y is string => !!y)
          )
        ).sort((a, b) => Number(b) - Number(a));

        this.applyFilters();
        this.loading = false;
      })
      .catch(() => {
        this.loading = false;
      });
  }

  onSearchChange(value: string) {
    this.search = value || '';
    this.applyFilters();
  }

  onYearChange(year: string) {
    this.selectedYear = year || 'All';
    this.applyFilters();
  }

  onRatingChange(value: string) {
    this.selectedRating = Number(value) || 0;
    this.applyFilters();
  }

  setViewMode(mode: 'grid' | 'list') {
    this.viewMode = mode;
  }

  applyFilters() {
    const term = (this.search || '').trim().toLowerCase();
    this.filteredWinners = this.winners.filter(w => {
      // search
      const title = (w.media?.title || '').toLowerCase();
      const group = (w.groupName || '').toLowerCase();
      const eventName = (w.eventName || '').toLowerCase();
      if (term && !(title.includes(term) || group.includes(term) || eventName.includes(term))) {
        return false;
      }

      // year
      if (this.selectedYear && this.selectedYear !== 'All') {
        const y = w.eventDate ? new Date(w.eventDate).getFullYear().toString() : undefined;
        if (y !== this.selectedYear) return false;
      }

      // rating
      if (this.selectedRating && this.selectedRating > 0) {
        const r = w.media?.rating ?? 0;
        if (r < this.selectedRating) return false;
      }

      return true;
    });
  }

  // Formats date like 'Jan 5, 2023'
  formatDate(date?: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
