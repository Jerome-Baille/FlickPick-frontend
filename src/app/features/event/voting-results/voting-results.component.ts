import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { trigger, style, animate, transition, stagger, query } from '@angular/animations';
import { DataService } from 'src/app/core/services/data.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { VideoModalComponent } from 'src/app/shared/components/video-modal/video-modal.component';

interface MediaItem {
  trailer?: string;
  // other fields from the API are intentionally typed as unknown
  [key: string]: unknown;
}

interface MediaResult {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  posterPath?: string;
  releaseDate?: string;
  overview?: string;
  totalPoints: number;
  voteCount: number;
  rank: number;
  // full media item returned from the API (may contain `trailer`)
  mediaItem?: MediaItem;
  trailer?: string;
}

interface VotingResults {
  eventId: number;
  eventName: string;
  groupName: string;
  groupId: number;
  totalVoters: number;
  totalMembers: number;
  isComplete: boolean;
  winner: MediaResult | null;
  runnerUps: MediaResult[];
  isTie: boolean;
  tiedItems?: MediaResult[];
}

@Component({
  selector: 'app-voting-results',
  standalone: true,
  imports: [
    CommonModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatDialogModule
  ],
  templateUrl: './voting-results.component.html',
  styleUrls: ['./voting-results.component.scss'],
  animations: [
    trigger('fadeInUp', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(30px)' }),
        animate('600ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ])
    ]),
    trigger('staggerIn', [
      transition(':enter', [
        query('.runner-up-card', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          stagger(100, [
            animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
          ])
        ], { optional: true })
      ])
    ]),
    trigger('scaleIn', [
      transition(':enter', [
        style({ opacity: 0, transform: 'scale(0.8)' }),
        animate('500ms cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
          style({ opacity: 1, transform: 'scale(1)' }))
      ])
    ])
  ]
})
export class VotingResultsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dataService = inject(DataService);
  private snackbarService = inject(SnackbarService);
  private dialog = inject(MatDialog);

  TMDB_IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

  private extractYouTubeId(url?: string): string | null {
    if (!url) return null;
    // common YouTube URL patterns
    const patterns = [
      /(?:youtube\.com\/.*v=|youtu\.be\/)([\w-]{11})/,
      /youtube\.com\/embed\/([\w-]{11})/
    ];
    for (const p of patterns) {
      const m = url.match(p);
      if (m && m[1]) return m[1];
    }
    return null;
  }

  openTrailer(item: MediaResult): void {
    const trailerUrl = item.mediaItem?.trailer || item.trailer;
    if (!trailerUrl) {
      this.snackbarService.showError('Trailer not available');
      return;
    }

    const videoId = this.extractYouTubeId(trailerUrl);
    if (!videoId) {
      this.snackbarService.showError('Trailer format not supported');
      return;
    }

    this.dialog.open(VideoModalComponent, {
      data: {
        trailers: [{ key: videoId }]
      }
    });
  }

  results: VotingResults | null = null;
  isLoading = true;
  eventId!: number;

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.eventId = +params['eventId'];
      if (this.eventId) {
        this.loadResults();
      }
    });
  }

  loadResults(): void {
    this.isLoading = true;
    this.dataService.getVotingResults(this.eventId).subscribe({
      next: (response: unknown) => {
        this.results = response as VotingResults;
        this.isLoading = false;
      },
      error: (err: Error) => {
        this.snackbarService.showError('Failed to load results: ' + err.message);
        this.isLoading = false;
      }
    });
  }

  getPosterUrl(posterPath?: string): string {
    if (!posterPath) return 'assets/placeholder-movie.jpg';
    return `${this.TMDB_IMAGE_BASE_URL}${posterPath}`;
  }

  getYear(releaseDate?: string): string {
    if (!releaseDate) return '';
    return new Date(releaseDate).getFullYear().toString();
  }

  selectTiebreaker(item: MediaResult): void {
    if (!this.results) return;
    
    this.dataService.resolveTiebreaker(this.eventId, item.tmdbId).subscribe({
      next: () => {
        this.snackbarService.showSuccess(`${item.title} has been selected as the winner!`);
        this.loadResults(); // Reload to get updated results
      },
      error: (err: Error) => {
        this.snackbarService.showError('Failed to resolve tiebreaker: ' + err.message);
      }
    });
  }

  backToGroup(): void {
    if (this.results?.groupId) {
      this.router.navigate(['/group/detail', this.results.groupId]);
    } else {
      this.router.navigate(['/group/overview']);
    }
  }

  backToEvent(): void {
    this.router.navigate(['/event/detail', this.eventId]);
  }

  getOrdinalSuffix(rank: number): string {
    const j = rank % 10;
    const k = rank % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  }
}
