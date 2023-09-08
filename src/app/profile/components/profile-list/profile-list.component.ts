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

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService
  ) {
    this.route.params.subscribe(params => {
      const listId = params['listId'];
      this.dataService.getMediaItemsInList(listId).subscribe({
        next: (response: any) => {
          this.listName = response.name;
          this.movies = response.MediaItems.filter((item: any) => item.mediaType === 'movie');
          this.tvShows = response.MediaItems.filter((item: any) => item.mediaType === 'tv');
        },
        error: (error) => {
          console.log(error);
        }
      })
    });
  }
}
