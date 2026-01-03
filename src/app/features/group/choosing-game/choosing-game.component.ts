import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { environment } from 'src/environments/environment.prod';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatBottomSheet, MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { trigger, style, animate, transition } from '@angular/animations';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { DataService } from 'src/app/core/services/data.service';
import { TmdbService } from 'src/app/core/services/tmdb.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { RankSelectorSheetComponent } from './rank-selector-sheet.component';
import { Event as MovieNightEvent } from '../../../shared/models/Event';

interface Genre {
  id: number;
  name: string;
}

interface MediaItem {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  releaseDate?: string;
  posterPath?: string;
  overview?: string;
  runtime?: number;
  genres?: Genre[];
  points: number;
  sumOfRatings?: number;
}

interface RankingSlot {
  rank: number;
  item: MediaItem | null;
}

interface EventMediaResponse {
  mediaItems: {
    MediaItems: MediaItem[];
  };
}

@Component({
    selector: 'app-choosing-game',
    imports: [
      CommonModule,
      MatCardModule,
      MatCheckboxModule,
      MatProgressBarModule,
      MatIconModule,
      MatButtonModule,
      MatBottomSheetModule,
      DragDropModule
    ],
    templateUrl: './choosing-game.component.html',
    styleUrls: ['./choosing-game.component.scss'],
    animations: [
      // Fade animation for general transitions
      trigger('fadeAnimation', [
        transition(':enter', [
          style({ opacity: 0 }),
          animate('400ms ease-in', style({ opacity: 1 }))
        ]),
        transition(':leave', [
          animate('400ms ease-out', style({ opacity: 0 }))
        ])
      ]),
      // Card animation for movie cards
      trigger('cardAnimation', [
        transition(':enter', [
          style({ opacity: 0, transform: 'scale(0.9)' }),
          animate('300ms ease-out', style({ opacity: 1, transform: 'scale(1)' }))
        ])
      ]),
      // Celebration animation for game completion
      trigger('celebrateAnimation', [
        transition(':enter', [
          style({ opacity: 0, transform: 'scale(0.8)' }),
          animate('600ms cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
            style({ opacity: 1, transform: 'scale(1)' }))
        ])
      ])
    ],
    standalone: true
})
export class ChoosingGameComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dataService = inject(DataService);
  private tmdbService = inject(TmdbService);
  private snackbarService = inject(SnackbarService);
  private bottomSheet = inject(MatBottomSheet);
  private breakpointObserver = inject(BreakpointObserver);
  private destroy$ = new Subject<void>();

  TMDB_IMAGE_BASE_URL_300 = environment.TMDB_IMAGE_BASE_URL_300;
  
  // Data arrays
  mediaItems: MediaItem[] = [];
  availableItems: MediaItem[] = [];
  rankedItems: MediaItem[] = [];
  displayedItems: MediaItem[] = [];

  isLoading = false;
  
  // Ranking configuration
  requiredSlots = 3;
  rankingSlots: RankingSlot[] = [];
  
  // State management
  hasSubmitted = false;
  eventId!: number;
  groupId?: number; // Optional: for navigation back to group
  
  // Mobile detection
  isMobile = false;

  ngOnInit() {
    // Initialize ranking slots
    for (let i = 1; i <= this.requiredSlots; i++) {
      this.rankingSlots.push({ rank: i, item: null });
    }

    // Detect mobile viewport
    this.breakpointObserver
      .observe([Breakpoints.XSmall, Breakpoints.Small])
      .pipe(takeUntil(this.destroy$))
      .subscribe(result => {
        this.isMobile = result.matches;
      });

    // Get event ID from route and load media items
    this.route.params.subscribe(params => {
      this.eventId = +params['eventId'];
      if (!this.eventId) {
        this.snackbarService.showError('Invalid event ID');
        this.router.navigate(['/group/overview']);
        return;
      }
      this.loadMediaItems();
      this.loadEventDetails();
    });
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadEventDetails() {
    this.dataService.getEventById(this.eventId).subscribe({
      next: (event: MovieNightEvent) => {
        this.groupId = event.groupId;
      },
      error: (err: Error) => {
        console.error('Failed to load event details:', err);
      }
    });
  }

  loadMediaItems() {
    this.isLoading = true;
    this.dataService.getEventMediaItems(this.eventId).subscribe({
      next: (data: unknown) => {
        const response = data as EventMediaResponse;
        this.mediaItems = response.mediaItems.MediaItems;
        
        // Initialize points for all items
        this.mediaItems.forEach(item => item.points = 0);
        
        // All items start as available for selection
        this.availableItems = [...this.mediaItems];

        this.isLoading = false;
      },
      error: (err: Error) => {
        this.isLoading = false;
        this.snackbarService.showError('Failed to load media items: ' + err.message);
      }
    });
  }

  onDrop(event: CdkDragDrop<MediaItem[]>) {
    if (event.previousContainer === event.container) {
      // Reordering within the same list
      moveItemInArray(event.container.data, event.previousIndex, event.currentIndex);
      
      // Update ranking slots if reordering in ranked items
      if (event.container.data === this.rankedItems) {
        this.updateRankingSlots();
      }
    } else {
      // Moving between lists
      transferArrayItem(
        event.previousContainer.data,
        event.container.data,
        event.previousIndex,
        event.currentIndex
      );
      
      // Update ranking slots
      this.updateRankingSlots();
      
      // Limit ranked items to requiredSlots
      if (this.rankedItems.length > this.requiredSlots) {
        const overflow = this.rankedItems.splice(this.requiredSlots);
        this.availableItems.push(...overflow);
      }
    }
  }

  updateRankingSlots() {
    // Update the ranking slots with current ranked items
    this.rankingSlots = this.rankingSlots.map((slot, index) => ({
      rank: index + 1,
      item: this.rankedItems[index] || null
    }));
  }

  removeFromRanking(index: number) {
    const item = this.rankedItems.splice(index, 1)[0];
    if (item) {
      this.availableItems.push(item);
    }
    this.updateRankingSlots();
  }

  isRankingComplete(): boolean {
    return this.rankedItems.length === this.requiredSlots;
  }

  submitVotes() {
    if (!this.isRankingComplete()) {
      this.snackbarService.showError('Please complete all ranking slots before submitting');
      return;
    }

    // Assign points based on ranking (higher rank = more points)
    this.rankedItems.forEach((item, index) => {
      item.points = this.requiredSlots - index;
    });

    // Save the entire ballot in one call
    const rankings = this.rankedItems.map((mediaItem: MediaItem) => ({
      tmdbId: mediaItem.tmdbId,
      mediaType: mediaItem.mediaType,
      rating: mediaItem.points || 0,
      title: mediaItem.title,
      posterPath: mediaItem.posterPath,
      releaseDate: mediaItem.releaseDate,
      overview: mediaItem.overview,
    }));

    this.dataService.submitBallot({ eventId: this.eventId, rankings }).subscribe({
      next: () => {
      this.hasSubmitted = true;
      this.snackbarService.showSuccess('Your votes have been submitted!');
      
      // Navigate to results page after a delay
      setTimeout(() => {
        this.router.navigate(['/event/results', this.eventId]);
      }, 2000);
      },
      error: (err: Error) => {
        const message = err.message || 'Unknown error';
        this.snackbarService.showError('Failed to submit votes: ' + message);
      }
    });
  }

  // Mobile-specific methods
  openRankSelector(item: MediaItem) {
    // Get available slots (slots that are currently empty or contain this item)
    const availableSlots = this.rankingSlots
      .filter(slot => !slot.item || slot.item.tmdbId === item.tmdbId)
      .map(slot => slot.rank);

    if (availableSlots.length === 0) {
      this.snackbarService.showError('All ranking slots are filled. Remove an item first.');
      return;
    }

    const bottomSheetRef = this.bottomSheet.open(RankSelectorSheetComponent, {
      data: { item, availableSlots },
      panelClass: 'rank-selector-bottom-sheet'
    });

    bottomSheetRef.afterDismissed().subscribe(rank => {
      if (rank !== undefined) {
        this.assignToSlot(item, rank - 1); // Convert 1-based rank to 0-based index
      }
    });
  }

  assignToSlot(item: MediaItem, slotIndex: number) {
    // Remove item from current position if already ranked
    const currentIndex = this.rankedItems.findIndex(i => i.tmdbId === item.tmdbId);
    if (currentIndex !== -1) {
      this.rankedItems.splice(currentIndex, 1);
    } else {
      // Remove from available items if not already ranked
      const availableIndex = this.availableItems.findIndex(i => i.tmdbId === item.tmdbId);
      if (availableIndex !== -1) {
        this.availableItems.splice(availableIndex, 1);
      }
    }

    // Insert at new position
    this.rankedItems.splice(slotIndex, 0, item);
    this.updateRankingSlots();
  }

  moveUp(index: number) {
    if (index > 0) {
      moveItemInArray(this.rankedItems, index, index - 1);
      this.updateRankingSlots();
    }
  }

  moveDown(index: number) {
    if (index < this.rankedItems.length - 1) {
      moveItemInArray(this.rankedItems, index, index + 1);
      this.updateRankingSlots();
    }
  }

}