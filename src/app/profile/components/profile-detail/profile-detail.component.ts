import { Component, OnInit } from '@angular/core';
import { TMDB_API_KEY } from 'config/tmdb-api';

@Component({
  selector: 'app-profile-detail',
  templateUrl: './profile-detail.component.html',
  styleUrls: ['./profile-detail.component.sass']
})
export class ProfileDetailComponent implements OnInit {
  movies!: any[];
  tvShows!: any[];

  constructor() { }

  ngOnInit(): void {
    // Call the getMediaDetails function to retrieve media data
    this.getMediaDetails();
  }

  async getMediaDetails() {
    const storedIdsString: string | null = localStorage.getItem('storedIds');
    const storedIds: { id: number, media_type: string }[] = storedIdsString ? JSON.parse(storedIdsString) : [];
    const baseUrl: string = 'https://api.themoviedb.org/3';
    const mediaDetails: any[] = [];

    for (const item of storedIds) {
      const url: string = `${baseUrl}/${item.media_type}/${item.id}?api_key=${TMDB_API_KEY}`;
      const response: Response = await fetch(url);
      const data: any = await response.json();
      mediaDetails.push(data);
    }

    // Split the media data into movies and TV shows
    this.movies = mediaDetails.filter(item => item.title);
    this.tvShows = mediaDetails.filter(item => item.name);
  }
}
