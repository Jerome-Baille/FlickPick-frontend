import { Component, Input, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { faCircleCheck, faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { TMDB_IMAGE_BASE_URL } from 'config/tmdb-api';
import { DataService } from 'src/app/services/data.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';

interface Media {
  tmdbId: number;
  mediaType: string; // movie or tv
  listName?: string;
  title?: string;
  releaseDate?: Date;
  posterPath?: string;
}

@Component({
  selector: 'app-search-result-card',
  templateUrl: './search-result-card.component.html',
  styleUrls: ['./search-result-card.component.sass']
})
export class SearchResultCardComponent implements OnInit {
  @Input() result: any;
  TMDB_IMAGE_BASE_URL = TMDB_IMAGE_BASE_URL;

  mediaType!: string;

  faCircleCheck = faCircleCheck;
  faCirclePlus = faCirclePlus;

  constructor(
    private router: Router,
    private dataService: DataService,
    private localStorageService: LocalStorageService
  ) { }

  ngOnInit(): void {
    if (this.result) {
      this.mediaType = this.getMediaType();

      this.result.tmdbId = this.result.tmdbId ? this.result.tmdbId : this.result.id;
    }
  }

  getMediaType(): string {
    if (this.result.mediaType) {
      return this.result.mediaType;
    } else if (this.result.title) {
      return 'movie';
    } else if (this.result.name) {
      return 'tv';
    }
    return '';
  }

  addMedia(event: any) {
    event.stopPropagation();

    const tmdbId = this.result.tmdbId;
    const mediaType = this.mediaType;
    const title = this.result.title || this.result.name;
    const releaseDate = this.result.release_date || this.result.first_air_date;
    const posterPath = this.result.poster_path;
    this.dataService.addMediaItem({ tmdbId, mediaType, listName: "My_Personal_List", title, releaseDate, posterPath }).subscribe({
      next: (response: any) => {
        console.log(response);
      },
      error: (error) => {
        console.log(error);
      }
    });

    this.manageStorage({ tmdbId, mediaType, title, releaseDate, posterPath });
  }

  removeMedia(event: any) {
    event.stopPropagation();

    const tmdbId = this.result.tmdbId;
    const mediaType = this.mediaType;

    this.dataService.deleteMediaItemFromList({ tmdbId, mediaType, listName: "My_Personal_List" }).subscribe({
      next: (response: any) => {
        console.log(response);

        // Trigger the item removed event
        this.localStorageService.triggerItemRemoved();
      },
      error: (error) => {
        console.log(error);
      }
    });

    this.manageStorage({ tmdbId, mediaType });
  }

  isChecked(tmdbId: number): boolean {
    const storedIdsString: string | null = localStorage.getItem('userPersonalList');
    const storedIds: { tmdbId: number, mediaType: string }[] = storedIdsString ? JSON.parse(storedIdsString) : [];
    return storedIds.some(item => item.tmdbId === tmdbId);
  }

  onNavigateToDetail() {
    this.router.navigate(['/media/detail', this.mediaType, this.result.tmdbId], { state: { media: this.result } });
  }


  manageStorage(data: Media) {
    const storedIdsString = localStorage.getItem('userPersonalList');
    let storedIds = storedIdsString ? JSON.parse(storedIdsString) : [];
    const index = storedIds.findIndex((item: { tmdbId: number, mediaType: string }) => item.tmdbId === data.tmdbId);
    if (index === -1) {
      storedIds.push(data);
    } else {
      storedIds.splice(index, 1);
    }
    localStorage.setItem('userPersonalList', JSON.stringify(storedIds));
  }
}
