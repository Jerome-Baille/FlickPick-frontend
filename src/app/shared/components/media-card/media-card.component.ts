import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output, HostBinding } from '@angular/core';
import { DragDropModule } from '@angular/cdk/drag-drop';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface MediaCardItem {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  releaseDate?: string;
  posterPath?: string;
  sumOfRatings?: number;
}

@Component({
  selector: 'app-media-card',
  standalone: true,
  imports: [CommonModule, DragDropModule, MatButtonModule, MatIconModule],
  templateUrl: './media-card.component.html',
  styleUrl: './media-card.component.scss',
  host: {
    class: 'movie-card'
  }
})
export class MediaCardComponent {

  @Input({ required: true }) item!: MediaCardItem;

  @Input({ required: true }) imageBaseUrl300!: string;

  @Input() fallbackPosterUrl = 'assets/images/poster-not-found.png';

  @Input() isMobile = false;

  /** Controls whether the mobile "Assign Rank" action is shown. */
  @Input() showAssignRankButton = true;

  /** When true, the component host receives a `.clickable` class so parents can opt-in to pointer cursor */
  @Input() clickable = false;

  @HostBinding('class.clickable')
  get clickableHostClass(): boolean {
    return !!this.clickable;
  }

  @Output() assignRank = new EventEmitter<MediaCardItem>();

  get posterUrl(): string {
    return this.item?.posterPath
      ? this.imageBaseUrl300 + this.item.posterPath
      : this.fallbackPosterUrl;
  }

  get ratingText(): string | null {
    if (!this.item?.sumOfRatings) return null;
    return (this.item.sumOfRatings / 10).toFixed(1);
  }

  onAssignRankClick(): void {
    this.assignRank.emit(this.item);
  }
}
