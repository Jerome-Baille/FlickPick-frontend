import { Component, OnInit } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { LocalStorageService } from 'src/app/services/local-storage.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile-detail',
  templateUrl: './profile-detail.component.html',
  styleUrls: ['./profile-detail.component.sass']
})
export class ProfileDetailComponent implements OnInit {
  movies!: any[];
  tvShows!: any[];

  private itemRemovedSubscription!: Subscription;

  constructor(
    private dataService: DataService,
    private localStorageService: LocalStorageService
  ) { }

  ngOnInit(): void {
    // Call the getMediaDetails function to retrieve media data
    this.getMediaDetails();

    // Subscribe to the item removed event
    this.itemRemovedSubscription = this.localStorageService.itemRemoved$.subscribe(() => {
      // Refresh the data when an item is removed
      this.getMediaDetails();
    });
  }

  ngOnDestroy(): void {
    // Unsubscribe from the itemRemovedSubscription to prevent memory leaks
    if (this.itemRemovedSubscription) {
      this.itemRemovedSubscription.unsubscribe();
    }
  }

  async getMediaDetails() {
    this.dataService.getPersonnalList().subscribe({
      next: (response: any) => {
        localStorage.setItem('userPersonalList', JSON.stringify(response));

        // Split the media data into movies and TV shows
        this.movies = response.filter((item: any) => item.mediaType === 'movie');
        this.tvShows = response.filter((item: any) => item.mediaType === 'tv');
      },
      error: (error) => {
        console.log(error);
      }
    });
  }
}
