import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/core/services/data.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { BackButtonComponent } from 'src/app/shared/components/back-button/back-button.component';
import { MediaTableViewComponent } from 'src/app/shared/components/media-table-view/media-table-view.component';

interface MediaItem {
  id: number;
  title: string;
  mediaType: 'movie' | 'tv';
  tmdbId: number;
  isAdmin?: boolean;
}

interface ListResponse {
  id: number;
  name: string;
  isAdmin?: boolean;
  MediaItems?: MediaItem[];
}

interface ApiResponse {
  message: string;
}

@Component({
    selector: 'app-profile-list',
    imports: [
      CommonModule,
      MatCardModule,
      MatIconModule,
      ReactiveFormsModule,
      FormsModule,
      BackButtonComponent,
      MediaTableViewComponent
    ],
    templateUrl: './profile-list.component.html',
    styleUrls: ['./profile-list.component.scss'],
    standalone: true
})
export class ProfileListComponent {
  private route = inject(ActivatedRoute);
  private dataService = inject(DataService);
  private snackbarService = inject(SnackbarService);

  movies!: MediaItem[];
  tvShows!: MediaItem[];
  listName = '';
  listId!: number;
  isEditing = false;
  editedListName = "";

  constructor() {
    this.route.params.subscribe(params => {
      const listId = params['listId'];
      this.dataService.getMediaItemsInList(listId).subscribe({
        next: (response: unknown) => {
          const res = response as ListResponse;
          this.listName = res.name;
          this.listId = res.id;

          if (res.MediaItems && res.MediaItems.length > 0) {
            this.movies = res.MediaItems.filter((item: MediaItem) => item.mediaType === 'movie');
            this.tvShows = res.MediaItems.filter((item: MediaItem) => item.mediaType === 'tv');
            if (res.isAdmin) {
              this.movies.forEach((movie: MediaItem) => movie.isAdmin = true);
              this.tvShows.forEach((tvShow: MediaItem) => tvShow.isAdmin = true);
            }
          }
        },
        error: (err: Error) => {
          this.snackbarService.showError(err.message);
        }
      })
    });
  }

  enterEditMode(): void {
    this.isEditing = true;
    this.editedListName = this.listName;
  }

  updateListName(newListName: string): void {
    this.listName = newListName;
    this.isEditing = false;

    const updatedList = {
      name: this.listName
    }
    this.dataService.updateList(this.listId, updatedList).subscribe({
      next: (response: unknown) => {
        const res = response as ApiResponse;
        this.snackbarService.showSuccess(res.message);
      },
      error: (err: Error) => {
        this.snackbarService.showError(err.message);
      }
    });
  }

  replaceSpacesWithUnderscores(event: Event) {
    const input = event.target as HTMLInputElement;
    input.value = input.value.replace(/\s+/g, '_');
  }
}
