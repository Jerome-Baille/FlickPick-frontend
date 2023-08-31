import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TMDB_API_KEY } from 'config/tmdb-api';

@Injectable({
  providedIn: 'root'
})
export class TmdbService {

  private baseUrl = 'https://api.themoviedb.org/3/';

  constructor(private http: HttpClient) { }

  searchMovies(query: string): Observable<any> {
    const params = new HttpParams()
      .set('api_key', TMDB_API_KEY) 
      .set('query', query)
      .set('include_adult', 'false');

    return this.http.get(`${this.baseUrl}search/movie`, { params });
  }

  searchTVShows(query: string): Observable<any> {
    const params = new HttpParams()
      .set('api_key', TMDB_API_KEY)
      .set('query', query)
      .set('include_adult', 'false');

    return this.http.get(`${this.baseUrl}search/tv`, { params }); 
  }

}