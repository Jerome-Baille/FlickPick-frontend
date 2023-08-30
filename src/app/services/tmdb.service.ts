import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class TmdbService {

  private baseUrl = 'https://api.themoviedb.org/3/';
  private apiKey = '1f379756d9cf728c273549e86c37e695';

  constructor(private http: HttpClient) { }

  searchMovies(query: string): Observable<any> {
    const params = new HttpParams()
      .set('api_key', this.apiKey) 
      .set('query', query)
      .set('include_adult', 'false');

    return this.http.get(`${this.baseUrl}search/movie`, { params });
  }

  searchTVShows(query: string): Observable<any> {
    const params = new HttpParams()
      .set('api_key', this.apiKey)
      .set('query', query)
      .set('include_adult', 'false');

    return this.http.get(`${this.baseUrl}search/tv`, { params }); 
  }

}