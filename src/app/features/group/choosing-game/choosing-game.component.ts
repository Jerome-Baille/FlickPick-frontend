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
import { DragDropModule, CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';
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
  slotDropListIds: string[] = [];
  shortlistDropListId = '';
  
  // State management
  hasSubmitted = false;
  eventId!: number;
  groupId?: number; // Optional: for navigation back to group
  
  // Mobile detection
  isMobile = false;
  // Drag state
  draggingItem: MediaItem | null = null;
  draggingFromSlotIndex: number | null = null;

  ngOnInit() {
    // Initialize ranking slots
    for (let i = 1; i <= this.requiredSlots; i++) {
      this.rankingSlots.push({ rank: i, item: null });
    }
    // Build slot drop list IDs for cdkDropListConnectedTo
    this.slotDropListIds = this.rankingSlots.map((_, i) => 'slot-' + i);
    // Add shortlist ID for slots to connect back to
    this.shortlistDropListId = 'shortlist-drop-list';

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

  // Returns other slot IDs plus shortlist for cdkDropListConnectedTo
  getOtherSlotIds(currentIndex: number): string[] {
    const otherSlots = this.slotDropListIds.filter((_, i) => i !== currentIndex);
    return [this.shortlistDropListId, ...otherSlots];
  }

  // Handle drop onto a specific ranking slot
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDropToSlot(event: CdkDragDrop<any, any, any>, targetSlotIndex: number) {


    const dragData = event.item.data as { item: MediaItem; slotIndex: number };
    const item = dragData.item;
    const sourceSlotIndex = dragData.slotIndex;

    // If coming from shortlist (slotIndex === -1)
    if (sourceSlotIndex === -1) {
      // Remove from available items
      const idx = this.availableItems.findIndex(i => i.tmdbId === item.tmdbId);
      if (idx !== -1) {
        this.availableItems.splice(idx, 1);
      }
      // If target slot already has an item, swap it back to shortlist
      if (this.rankingSlots[targetSlotIndex].item) {
        this.availableItems.push(this.rankingSlots[targetSlotIndex].item!);
      }
      this.rankingSlots[targetSlotIndex].item = item;
    } else {
      // Moving between slots - swap items
      const sourceItem = this.rankingSlots[sourceSlotIndex].item;
      const targetItem = this.rankingSlots[targetSlotIndex].item;
      this.rankingSlots[targetSlotIndex].item = sourceItem;
      this.rankingSlots[sourceSlotIndex].item = targetItem;
    }
    this.updateRankingSlots();
  }

  // Handle drop back to shortlist
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  onDropToShortlist(event: CdkDragDrop<any, any, any>) {


    const dragData = event.item.data as { item: MediaItem; slotIndex: number };
    const item = dragData.item;
    const sourceSlotIndex = dragData.slotIndex;

    // Reordering within shortlist
    if (sourceSlotIndex === -1) {
      moveItemInArray(this.availableItems, event.previousIndex, event.currentIndex);
      return;
    }

    // Moving from a slot back to shortlist
    this.rankingSlots[sourceSlotIndex].item = null;
    this.availableItems.splice(event.currentIndex, 0, item);
    this.updateRankingSlots();
  }

  // Ensure rankingSlots ranks remain correct and update compact rankedItems list
  updateRankingSlots() {
    this.rankingSlots = this.rankingSlots.map((slot, index) => ({ ...slot, rank: index + 1 }));
    this.rankedItems = this.rankingSlots.map(s => s.item).filter(Boolean) as MediaItem[];
  }

  removeFromRanking(index: number) {
    const slot = this.rankingSlots[index];
    if (slot && slot.item) {
      this.availableItems.push(slot.item);
      slot.item = null;
      this.updateRankingSlots();
    }
  }



  onDragStarted(item: MediaItem | null, slotIndex: number) {
    if (!item) return;
    this.draggingItem = item;
    this.draggingFromSlotIndex = slotIndex;
  }

  onDragEnded() {
    this.draggingItem = null;
    this.draggingFromSlotIndex = null;
  }

  isRankingComplete(): boolean {
    return this.rankingSlots.every(slot => !!slot.item);
  }

  submitVotes() {
    if (!this.isRankingComplete()) {
      this.snackbarService.showError('Please complete all ranking slots before submitting');
      return;
    }

    // Assign points based on slot order (slot 1 gets highest)
    const rankings = this.rankingSlots.map((slot, index) => {
      const mediaItem = slot.item as MediaItem;
      const points = this.requiredSlots - index;
      mediaItem.points = points;
      return {
        tmdbId: mediaItem.tmdbId,
        mediaType: mediaItem.mediaType,
        rating: mediaItem.points || 0,
        title: mediaItem.title,
        posterPath: mediaItem.posterPath,
        releaseDate: mediaItem.releaseDate,
        overview: mediaItem.overview,
      };
    });

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
    // Remove item from any other slot
    this.rankingSlots.forEach(slot => {
      if (slot.item && slot.item.tmdbId === item.tmdbId) {
        slot.item = null;
      }
    });

    // Remove from available items if present
    const availableIndex = this.availableItems.findIndex(i => i.tmdbId === item.tmdbId);
    if (availableIndex !== -1) {
      this.availableItems.splice(availableIndex, 1);
    }

    // Assign into the requested slot
    this.rankingSlots[slotIndex].item = item;
    this.updateRankingSlots();
  }

  moveUp(index: number) {
    if (index > 0) {
      const item = this.rankingSlots[index].item;
      this.rankingSlots[index].item = this.rankingSlots[index - 1].item;
      this.rankingSlots[index - 1].item = item;
      this.updateRankingSlots();
    }
  }

  moveDown(index: number) {
    if (index < this.rankingSlots.length - 1) {
      const item = this.rankingSlots[index].item;
      this.rankingSlots[index].item = this.rankingSlots[index + 1].item;
      this.rankingSlots[index + 1].item = item;
      this.updateRankingSlots();
    }
  }

}