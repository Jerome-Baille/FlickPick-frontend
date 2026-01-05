import { Component, inject, signal, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ViewToggleComponent } from 'src/app/shared/components/view-toggle/view-toggle.component';
import { HeaderBadgeComponent } from 'src/app/shared/components/header-badge/header-badge.component';
import { DataService } from 'src/app/core/services/data.service';
import { Observable } from 'rxjs';
import { PendingTasks } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';

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

// Backend response shapes for the archive endpoint
interface BackendMediaItem {
  id: number;
  tmdbId: number;
  mediaType: string;
  title?: string;
  releaseDate?: string;
  posterPath?: string;
  overview?: string;
  rating?: number;
  genre?: string;
}

interface BackendWinner {
  mediaItem?: BackendMediaItem;
  tmdbId?: number;
  mediaType?: string;
  totalPoints?: number;
  voteCount?: number;
  title?: string;
  posterPath?: string;
  releaseDate?: string;
  overview?: string;
  rank?: number;
  rating?: number; // sometimes rating may be present on the winner object
}

interface ArchiveEntry {
  eventId: number;
  eventName: string;
  eventDate?: string;
  groupId?: number;
  groupName?: string;
  winner?: BackendWinner;
}

interface ArchiveResponse {
  archive: ArchiveEntry[];
}

@Component({
  selector: 'app-archive',
  standalone: true,
  imports: [CommonModule, RouterLink, ViewToggleComponent, HeaderBadgeComponent],
  templateUrl: './archive.component.html',
  styleUrls: ['./archive.component.scss']
})
export class ArchiveComponent {
  private dataService = inject(DataService);
  private pendingTasks = inject(PendingTasks);

  // Signals for component state
  // Start undefined so we can detect real emission vs default
  readonly archiveSignal = toSignal(this.dataService.getArchive() as Observable<ArchiveResponse>, { initialValue: undefined });
  readonly loading = signal(true);

  readonly search = signal('');
  readonly selectedYear = signal('All');
  readonly selectedRating = signal(0);
  readonly viewMode = signal<'grid' | 'list'>('grid');

  // Derived signals
  readonly winners = computed<ArchiveItem[]>(() => {
    const archive = this.archiveSignal()?.archive ?? [];
    const items: ArchiveItem[] = archive.map((a: ArchiveEntry) => {
      const w = a.winner || null;
      const rawPoster = w?.mediaItem?.posterPath ?? w?.posterPath ?? '';
      const posterPath = typeof rawPoster === 'string' && rawPoster
        ? (rawPoster.startsWith('http') ? rawPoster : `https://image.tmdb.org/t/p/w500${rawPoster}`)
        : undefined;

      return {
        eventId: a.eventId,
        eventName: a.eventName,
        eventDate: a.eventDate,
        groupId: a.groupId,
        groupName: a.groupName,
        media: w
          ? {
              title: w.mediaItem?.title ?? w.title ?? '',
              posterPath,
              releaseDate: w.mediaItem?.releaseDate ?? w.releaseDate ?? undefined,
              tmdbId: w.mediaItem?.tmdbId ?? w.tmdbId,
              mediaType: w.mediaItem?.mediaType ?? w.mediaType,
              overview: w.mediaItem?.overview ?? w.overview,
              rating: Number(w.mediaItem?.rating ?? w.totalPoints ?? w.rating ?? 0) || 0,
              genre: w.mediaItem?.genre ?? 'Movie'
            }
          : undefined
      } as ArchiveItem;
    }).filter((it: ArchiveItem) => !!it.media && it.eventId);

    return items.sort((a, b) => {
      const da = a.eventDate ? new Date(a.eventDate).getTime() : 0;
      const db = b.eventDate ? new Date(b.eventDate).getTime() : 0;
      return db - da;
    });
  });

  readonly filteredWinners = computed<ArchiveItem[]>(() => {
    const term = (this.search()?.trim().toLowerCase()) || '';
    return this.winners().filter(w => {
      // search
      const title = (w.media?.title || '').toLowerCase();
      const group = (w.groupName || '').toLowerCase();
      const eventName = (w.eventName || '').toLowerCase();
      if (term && !(title.includes(term) || group.includes(term) || eventName.includes(term))) {
        return false;
      }

      // year
      if (this.selectedYear() && this.selectedYear() !== 'All') {
        const y = w.eventDate ? new Date(w.eventDate).getFullYear().toString() : undefined;
        if (y !== this.selectedYear()) return false;
      }

      // rating
      if (this.selectedRating() && this.selectedRating() > 0) {
        const r = w.media?.rating ?? 0;
        if (r < this.selectedRating()) return false;
      }

      return true;
    });
  });

  readonly years = computed<string[]>(() => {
    return Array.from(new Set(this.winners().map(w => (w.eventDate ? new Date(w.eventDate).getFullYear().toString() : undefined)).filter((y): y is string => !!y))).sort((a, b) => Number(b) - Number(a));
  });

  // Field-level effect runs in injection context (avoids NG0203)
  private _archiveInit = (() => {
    const taskCleanup = this.pendingTasks.add();
    let cleaned = false;
    return effect(() => {
      const archive = this.archiveSignal();
      if (typeof archive !== 'undefined' && !cleaned) {
        this.loading.set(false);
        taskCleanup();
        cleaned = true;
      }
    });
  })();

  onSearchChange(value: string) {
    this.search.set(value || '');
  }

  onYearChange(year: string) {
    this.selectedYear.set(year || 'All');
  }

  onRatingChange(value: string) {
    this.selectedRating.set(Number(value) || 0);
  }

  setViewMode(mode: 'grid' | 'list') {
    this.viewMode.set(mode);
  }

  // Formats date like 'Jan 5, 2023'
  formatDate(date?: string | Date): string {
    if (!date) return '';
    const d = new Date(date);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
}
