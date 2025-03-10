import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
    selector: 'app-profile-list',
    templateUrl: './profile-list.component.html',
    styleUrls: ['./profile-list.component.sass'],
    standalone: false
})
export class ProfileListComponent {
  movies!: any[];
  tvShows!: any[];
  listName: string = '';
  listId!: number;
  isEditing: boolean = false;
  editedListName: string = "";

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private snackbarService: SnackbarService
  ) {
    this.route.params.subscribe(params => {
      const listId = params['listId'];
      this.dataService.getMediaItemsInList(listId).subscribe({
        next: (response: any) => {
          this.listName = response.name;
          this.listId = response.id;

          if (response.MediaItems?.length > 0) {
            this.movies = response.MediaItems.filter((item: any) => item.mediaType === 'movie');
            this.tvShows = response.MediaItems.filter((item: any) => item.mediaType === 'tv');
            if (response.isAdmin) {
              this.movies.forEach((movie: any) => movie.isAdmin = true);
              this.tvShows.forEach((tvShow: any) => tvShow.isAdmin = true);
            }
          }
        },
        error: (err: any) => {
          this.snackbarService.showError(err);
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
      next: (response: any) => {
        this.snackbarService.showSuccess(response.message);
      },
      error: (err: any) => {
        this.snackbarService.showError(err);
      }
    });
  }

  replaceSpacesWithUnderscores(event: any) {
    event.target.value = event.target.value.replace(/\s+/g, '_');
  }
}
