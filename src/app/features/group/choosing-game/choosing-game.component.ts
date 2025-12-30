import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { forkJoin, Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { DragDropModule, CdkDragDrop, moveItemInArray, transferArrayItem } from '@angular/cdk/drag-drop';
import { trigger, state, style, animate, transition } from '@angular/animations';
import { DataService } from 'src/app/core/services/data.service';
import { TmdbService } from 'src/app/core/services/tmdb.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';

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

interface GroupMediaResponse{
  mediaItems: {
    MediaItems: MediaItem[];
  };
}

interface VoteResponse {
  message: string;
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
export class ChoosingGameComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dataService = inject(DataService);
  private tmdbService = inject(TmdbService);
  private snackbarService = inject(SnackbarService);

  TMDB_IMAGE_BASE_URL_300 = environment.TMDB_IMAGE_BASE_URL_300;
  
  // Data arrays
  mediaItems: MediaItem[] = [];
  availableItems: MediaItem[] = [];
  rankedItems: MediaItem[] = [];
  displayedItems: MediaItem[] = [];
  
  // Ranking configuration
  requiredSlots = 3;
  rankingSlots: RankingSlot[] = [];
  
  // State management
  hasSubmitted = false;
  groupId!: number;

  ngOnInit() {
    // Initialize ranking slots
    for (let i = 1; i <= this.requiredSlots; i++) {
      this.rankingSlots.push({ rank: i, item: null });
    }

    // Get group ID from route and load media items
    this.route.params.subscribe(params => {
      this.groupId = +params['groupId'];
      this.loadMediaItems();
    });
  }

  loadMediaItems() {
    this.dataService.getAllMediaItemsForUserInGroup(this.groupId).subscribe({
      next: (data: unknown) => {
        const response = data as GroupMediaResponse;
        this.mediaItems = response.mediaItems.MediaItems;
        
        // Initialize points for all items
        this.mediaItems.forEach(item => item.points = 0);
        
        // All items start as available for selection
        this.availableItems = [...this.mediaItems];
      },
      error: (err: Error) => {
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

    // Save votes to backend
    const votePromises = this.rankedItems.map((mediaItem: MediaItem) => {
      const data = {
        groupId: this.groupId,
        tmdbId: mediaItem.tmdbId,
        mediaType: mediaItem.mediaType,
        rating: mediaItem.points || 0
      };

      return this.dataService.createVote(data).toPromise();
    });

    Promise.all(votePromises).then(() => {
      this.hasSubmitted = true;
      this.snackbarService.showSuccess('Your votes have been submitted!');
      
      // Navigate back to group detail after a delay
      setTimeout(() => {
        this.router.navigate(['/group/detail', this.groupId]);
      }, 3000);
    }).catch((err: Error) => {
      this.snackbarService.showError('Failed to submit votes: ' + err.message);
    });
  }

}