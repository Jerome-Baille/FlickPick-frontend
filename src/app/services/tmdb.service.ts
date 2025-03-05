import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

@Injectable({
  providedIn: 'root'
})
export class TmdbService {
  constructor(private http: HttpClient) { }

  searchMulti(query: string): Observable<any> {
    return this.http.get(`${environment.tmdbUrl}/search/multi?query=${query}`);
  }

  getMovieDetails(id: number): Observable<any> {
    return this.http.get(`${environment.tmdbUrl}/movie/${id}`)
  }

  getTVShowDetails(id: number): Observable<any> {
    return this.http.get(`${environment.tmdbUrl}/tv/${id}`);
  }
}