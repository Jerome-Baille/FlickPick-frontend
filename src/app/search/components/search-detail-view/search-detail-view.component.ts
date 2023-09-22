import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { faFilm } from '@fortawesome/free-solid-svg-icons';
import { TMDB_IMAGE_BASE_URL } from 'config/tmdb-api';
import { DataService } from 'src/app/services/data.service';
import { TmdbService } from 'src/app/services/tmdb.service';
import { VideoModalComponent } from 'src/app/shared/components/video-modal/video-modal.component';

@Component({
  selector: 'app-search-detail-view',
  templateUrl: './search-detail-view.component.html',
  styleUrls: ['./search-detail-view.component.sass']
})
export class SearchDetailViewComponent {
  media!: any;
  TMDB_IMAGE_BASE_URL = TMDB_IMAGE_BASE_URL;
  mediaType!: string;
  castArray!: any[];
  similarArray!: any[];

  faFilm = faFilm;

  constructor(
    private tmdbService: TmdbService,
    private route: ActivatedRoute,
    public dialog: MatDialog,
    private dataService: DataService,
    private router: Router
  ) {
    const id = parseInt(this.route.snapshot.paramMap.get('id')!, 10);

    const url = this.route.snapshot.url.join('/');
    this.mediaType = url.includes('movie') ? 'movie' : 'tv';

    const mediaObservable = this.mediaType === 'movie' ?
      this.tmdbService.getMovieDetails(id) :
      this.tmdbService.getTVShowDetails(id);

    mediaObservable.subscribe({
      next: (media) => {
        this.media = media;
        this.getCast();
        this.getSimilar(this.mediaType);
        this.dataService.setCastData(this.media.credits.cast);
        this.dataService.setCrewData(this.media.credits.crew);
      },
      error: (error) => {
        console.error('Error:', error);
      }
    });
  }


  getDuration(duration: number) {
    const hours = Math.floor(duration / 60);
    const minutes = duration % 60;
    if (hours === 0) return `${minutes}m`;
    return `${hours}h ${minutes}m`;
  }

  getBorderColor(voteAverage: number): string {
    if (voteAverage > 6) {
      return 'primary';
    } else if (voteAverage >= 5) {
      return 'accent';
    } else {
      return 'warn';
    }
  }

  roundVoteAverage(voteAverage: number): number {
    return Math.floor(voteAverage * 10);
  }

  goToExternalLink() {
    const baseUrl = 'https://www.themoviedb.org';
    const id = this.media.id;
    const url = `${baseUrl}/${this.mediaType}/${id}`;

    window.open(url, '_blank');
  }

  findTrailer() {
    const videos = this.media.videos.results;
    // Filter the videos to only include those that are trailers
    const trailers = videos.filter((video: { type: string }) => video.type === 'Trailer');

    this.dialog.open(VideoModalComponent, {
      data: {
        trailers: trailers
      }
    })
  }

  getCast() {
    const cast = this.media.credits?.cast;
    this.castArray = cast.slice(0, 8);
  }

  getSimilar(mediaType: string) {
    const similar = mediaType === 'movie' ? this.media.similar?.results : this.media.recommendations?.results;
    this.similarArray = similar.slice(0, 8);
  }

  onNavigateToCast() {
    const baseUrl = this.route.snapshot.url.join('/') + '/cast';
    const fullUrl = '/media/' + baseUrl;
    this.router.navigate([fullUrl]);
  }
}
