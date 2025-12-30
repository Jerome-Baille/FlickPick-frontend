import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface SelectedMedia {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  releaseDate?: string;
  posterPath?: string;
  overview?: string;
  voteAverage?: number;
  runtime?: number;
  genres?: { id: number; name: string }[];
}

export interface ShortlistData {
  groupName: string;
  selectedMovies: SelectedMedia[];
}

@Injectable({
  providedIn: 'root'
})
export class ShortlistService {
  private shortlistData = new BehaviorSubject<ShortlistData | null>(null);
  shortlistData$ = this.shortlistData.asObservable();

  setShortlistData(data: ShortlistData): void {
    this.shortlistData.next(data);
  }

  getShortlistData(): ShortlistData | null {
    return this.shortlistData.getValue();
  }

  clearShortlistData(): void {
    this.shortlistData.next(null);
  }

  hasData(): boolean {
    return this.shortlistData.getValue() !== null;
  }
}
