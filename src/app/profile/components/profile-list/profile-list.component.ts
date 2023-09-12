import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-profile-list',
  templateUrl: './profile-list.component.html',
  styleUrls: ['./profile-list.component.sass']
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
    private dataService: DataService
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
          }
        },
        error: (error) => {
          console.log(error);
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
        console.log(response);
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  replaceSpacesWithUnderscores(event: any) {
    event.target.value = event.target.value.replace(/\s+/g, '_');
  }
}
