import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { BACKEND_API_URL } from 'config/backend-api';
import { HttpClient } from '@angular/common/http';

interface List {
  name: string;
  groupId: number;
}

interface Media {
  tmdbId: number;
  mediaType: string; // movie or tv
  listName?: string;
  title?: string;
  releaseDate?: Date;
  posterPath?: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private castData = new BehaviorSubject<any>(null);
  private crewData = new BehaviorSubject<any>(null);

  castData$ = this.castData.asObservable();
  crewData$ = this.crewData.asObservable();

  constructor(
    private http: HttpClient
  ) { }

  setCastData(data: any) {
    this.castData.next(data);
  }

  setCrewData(data: any) {
    this.crewData.next(data);
  }

  getAllListsForUser() {
    return this.http.get(BACKEND_API_URL.list);
  }

  createList(list: List) {
    return this.http.post(BACKEND_API_URL.list, list);
  }

  addMediaItem(data: Media){
    if (data.listName) {
      data.listName = data.listName.replace(/ /g, "_");
    }
    return this.http.post(BACKEND_API_URL.media, data);
  }

  deleteMediaItemFromList(data: Media) {
    return this.http.delete(`${BACKEND_API_URL.media}/list`, { body: data });
  }

  getMediaItemsInList(listName: string) {
    return this.http.get(`${BACKEND_API_URL.media}/list/${listName}`);
  }

  getPersonnalList() {
    return this.http.get(`${BACKEND_API_URL.media}/list/My_Personal_List`);
  }
}
