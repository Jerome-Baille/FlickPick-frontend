import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { ActivatedRoute, Router } from '@angular/router';
import { faFilm } from '@fortawesome/free-solid-svg-icons';
import { DataService } from 'src/app/core/services/data.service';
import { TmdbService } from 'src/app/core/services/tmdb.service';
import { BackButtonComponent } from 'src/app/shared/components/back-button/back-button.component';
import { VideoModalComponent } from 'src/app/shared/components/video-modal/video-modal.component';
import { environment } from 'src/environments/environment';

interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path?: string;
}

interface SimilarItem {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
}

interface CrewMember {
  id: number;
  name: string;
  job: string;
  profile_path?: string;
}

interface MediaDetails {
  id: number;
  title?: string;
  name?: string;
  poster_path?: string;
  tagline?: string;
  vote_average?: number;
  release_date?: string;
  first_air_date?: string;
  genres?: { id: number; name: string }[];
  status?: string;
  runtime?: number;
  episode_run_time?: number[];
  number_of_seasons?: number;
  number_of_episodes?: number;
  overview?: string;
  videos?: { results: { type: string; key: string }[] };
  credits?: { cast: CastMember[]; crew: CrewMember[] };
  similar?: { results: SimilarItem[] };
  recommendations?: { results: SimilarItem[] };
}

@Component({
    selector: 'app-search-detail-view',
    imports: [
        CommonModule, 
        MatCardModule,
        MatIconModule,
        MatProgressSpinnerModule,
        BackButtonComponent
    ],
    templateUrl: './search-detail-view.component.html',
    styleUrls: ['./search-detail-view.component.scss'],
    standalone: true
})
export class SearchDetailViewComponent {
  private tmdbService = inject(TmdbService);
  private route = inject(ActivatedRoute);
  dialog = inject(MatDialog);
  private dataService = inject(DataService);
  private router = inject(Router);

  media!: MediaDetails;
  TMDB_IMAGE_BASE_URL = environment.TMDB_IMAGE_BASE_URL;
  mediaType!: string;
  castArray!: CastMember[];
  similarArray!: SimilarItem[];

  faFilm = faFilm;

  constructor() {
    const id = parseInt(this.route.snapshot.paramMap.get('id')!, 10);

    const url = this.route.snapshot.url.join('/');
    this.mediaType = url.includes('movie') ? 'movie' : 'tv';

    const handleMediaResponse = (media: MediaDetails) => {
      this.media = media;
      this.getCast();
      this.getSimilar(this.mediaType);
      if (this.media?.credits?.cast) {
        this.dataService.setCastData(this.media.credits.cast);
      }
      if (this.media?.credits?.crew) {
        this.dataService.setCrewData(this.media.credits.crew);
      }
    };

    const handleError = (error: Error) => {
      console.error('Error:', error);
    };

    if (this.mediaType === 'movie') {
      this.tmdbService.getMovieDetails(id).subscribe({
        next: (media) => handleMediaResponse(media as MediaDetails),
        error: handleError
      });
    } else {
      this.tmdbService.getTVShowDetails(id).subscribe({
        next: (media) => handleMediaResponse(media as MediaDetails),
        error: handleError
      });
    }
  }


  getDuration(duration: number | number[] | undefined): string {
    if (duration === undefined) return '';
    const durationNum = Array.isArray(duration) ? duration[0] ?? 0 : duration;
    const hours = Math.floor(durationNum / 60);
    const minutes = durationNum % 60;
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
    const videos = this.media?.videos?.results ?? [];
    // Filter the videos to only include those that are trailers
    const trailers = videos.filter((video: { type: string }) => video.type === 'Trailer');

    this.dialog.open(VideoModalComponent, {
      data: {
        trailers: trailers
      }
    })
  }

  getCast() {
    const cast = this.media?.credits?.cast ?? [];
    this.castArray = cast.slice(0, 8);
  }

  getSimilar(mediaType: string) {
    const similar = mediaType === 'movie' ? this.media?.similar?.results : this.media?.recommendations?.results;
    this.similarArray = (similar ?? []).slice(0, 8);
  }

  onNavigateToCast() {
    const baseUrl = this.route.snapshot.url.join('/') + '/cast';
    const fullUrl = '/media/' + baseUrl;
    this.router.navigate([fullUrl]);
  }
}
