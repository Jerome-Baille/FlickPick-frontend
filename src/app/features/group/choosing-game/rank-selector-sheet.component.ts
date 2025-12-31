import { Component, inject } from '@angular/core';
import { MatBottomSheetRef, MAT_BOTTOM_SHEET_DATA } from '@angular/material/bottom-sheet';
import { CommonModule } from '@angular/common';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';

interface MediaItem {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  releaseDate?: string;
  posterPath?: string;
  overview?: string;
  runtime?: number;
  points: number;
  sumOfRatings?: number;
}

interface RankSelectorData {
  item: MediaItem;
  availableSlots: number[];
}

@Component({
  selector: 'app-rank-selector-sheet',
  standalone: true,
  imports: [CommonModule, MatListModule, MatIconModule, MatButtonModule],
  template: `
    <div class="rank-selector-sheet">
      <div class="sheet-header">
        <h2 class="sheet-title">{{ data.item.title }}</h2>
        <p class="sheet-subtitle">Choose a rank for this item</p>
      </div>
      
      <mat-nav-list class="rank-options">
        @for (slot of data.availableSlots; track slot) {
          <a mat-list-item 
             (click)="selectRank(slot)"
             (keydown.enter)="selectRank(slot)"
             (keydown.space)="selectRank(slot)"
             tabindex="0"
             role="button">
            <mat-icon matListItemIcon class="rank-icon">{{ getRankIcon(slot) }}</mat-icon>
            <span matListItemTitle class="rank-label">Rank #{{ slot }}</span>
            <span matListItemLine class="rank-description">{{ getRankDescription(slot) }}</span>
          </a>
        }
      </mat-nav-list>
      
      <div class="sheet-actions">
        <button mat-button (click)="cancel()" class="cancel-button">
          Cancel
        </button>
      </div>
    </div>
  `,
  styles: [`
    .rank-selector-sheet {
      padding-bottom: env(safe-area-inset-bottom);
    }

    .sheet-header {
      padding: 1.5rem 1rem 1rem;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
    }

    .sheet-title {
      font-family: 'Bebas Neue', sans-serif;
      font-size: 1.5rem;
      font-weight: 700;
      color: white;
      margin: 0 0 0.25rem 0;
      line-height: 1.2;
    }

    .sheet-subtitle {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.6);
      margin: 0;
    }

    .rank-options {
      padding: 0.5rem 0;
      
      a {
        min-height: 72px;
        padding: 1rem;
        border-bottom: 1px solid rgba(255, 255, 255, 0.05);
        transition: background-color 0.2s;
        
        &:hover {
          background-color: rgba(249, 212, 6, 0.1);
        }
        
        &:active {
          background-color: rgba(249, 212, 6, 0.2);
        }
      }
    }

    .rank-icon {
      color: var(--color-primary);
      font-size: 32px;
      width: 32px;
      height: 32px;
      
      &::ng-deep {
        font-variation-settings: 'FILL' 1;
      }
    }

    .rank-label {
      font-size: 1.125rem;
      font-weight: 700;
      color: white;
    }

    .rank-description {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.6);
    }

    .sheet-actions {
      padding: 1rem;
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      display: flex;
      justify-content: center;
    }

    .cancel-button {
      color: rgba(255, 255, 255, 0.7);
      min-width: 120px;
    }
  `]
})
export class RankSelectorSheetComponent {
  private bottomSheetRef = inject(MatBottomSheetRef<RankSelectorSheetComponent>);
  data = inject<RankSelectorData>(MAT_BOTTOM_SHEET_DATA);

  selectRank(rank: number): void {
    this.bottomSheetRef.dismiss(rank);
  }

  cancel(): void {
    this.bottomSheetRef.dismiss();
  }

  getRankIcon(rank: number): string {
    const icons: Record<number, string> = {
      1: 'emoji_events',
      2: 'military_tech',
      3: 'star'
    };
    return icons[rank] || 'circle';
  }

  getRankDescription(rank: number): string {
    const descriptions: Record<number, string> = {
      1: 'Your top choice',
      2: 'Your second choice',
      3: 'Your third choice'
    };
    return descriptions[rank] || `Position ${rank}`;
  }
}
