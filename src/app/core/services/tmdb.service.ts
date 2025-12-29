import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

interface TmdbSearchResponse {
  page: number;
  results: TmdbSearchResult[];
  total_pages: number;
  total_results: number;
}

interface TmdbSearchResult {
  id: number;
  media_type: string;
  title?: string;
  name?: string;
  poster_path?: string;
  release_date?: string;
  first_air_date?: string;
  overview?: string;
}

interface TmdbMovieDetails {
  id: number;
  title: string;
  runtime: number;
  genres: { id: number; name: string }[];
  poster_path?: string;
  release_date?: string;
  overview?: string;
  videos?: { results: { type: string; key: string }[] };
  credits?: { cast: unknown[]; crew: unknown[] };
  similar?: { results: unknown[] };
  vote_average?: number;
  tagline?: string;
  status?: string;
}

interface TmdbTvDetails {
  id: number;
  name: string;
  episode_run_time: number[];
  genres: { id: number; name: string }[];
  poster_path?: string;
  first_air_date?: string;
  overview?: string;
  videos?: { results: { type: string; key: string }[] };
  credits?: { cast: unknown[]; crew: unknown[] };
  recommendations?: { results: unknown[] };
  vote_average?: number;
  tagline?: string;
  status?: string;
  number_of_seasons?: number;
  number_of_episodes?: number;
}

@Injectable({
  providedIn: 'root'
})
export class TmdbService {
  private http = inject(HttpClient);


  searchMulti(query: string): Observable<TmdbSearchResponse> {
    return this.http.get<TmdbSearchResponse>(`${environment.tmdbUrl}/search/multi?query=${query}`);
  }

  getMovieDetails(id: number): Observable<TmdbMovieDetails> {
    return this.http.get<TmdbMovieDetails>(`${environment.tmdbUrl}/movie/${id}`)
  }

  getTVShowDetails(id: number): Observable<TmdbTvDetails> {
    return this.http.get<TmdbTvDetails>(`${environment.tmdbUrl}/tv/${id}`);
  }
}