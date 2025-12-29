import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';

export interface Media {
  tmdbId: number;
  mediaType: string; // movie or tv
  listName?: string;
  listId?: number;
  title?: string;
  releaseDate?: string;
  posterPath?: string;
  overview?: string;
  groupId?: number;
  rating?: number;
}

export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path?: string;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  profile_path?: string;
}

export interface ApiMessageResponse {
  message: string;
}

export interface ListItem {
  id: number;
  name: string;
}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private http = inject(HttpClient);

  private userURL = environment.userURL;
  private groupURL = environment.groupURL;
  private listURL = environment.listURL;
  private mediaURL = environment.mediaURL;
  private voteURL = environment.voteURL;

  private castData = new BehaviorSubject<CastMember[] | null>(null);
  private crewData = new BehaviorSubject<CrewMember[] | null>(null);

  castData$ = this.castData.asObservable();
  crewData$ = this.crewData.asObservable();

  setCastData(data: CastMember[]) {
    this.castData.next(data);
  }

  setCrewData(data: CrewMember[]) {
    this.crewData.next(data);
  }

  getAllListsForUser(): Observable<ListItem[]> {
    return this.http.get<ListItem[]>(`${this.listURL}`);
  }

  createList(listData: { 
    name: string, 
    groupId?: number,
    selectedMedia?: {
      tmdbId: number,
      mediaType: 'movie' | 'tv',
      title?: string,
      releaseDate?: string,
      posterPath?: string,
      overview?: string
    }[] 
  }): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>(`${this.listURL}`, listData);
  }

  addMediaItem(data: Media): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>(`${this.mediaURL}`, data);
  }

  deleteMediaItemFromList(data: Media): Observable<ApiMessageResponse> {
    return this.http.delete<ApiMessageResponse>(`${this.mediaURL}/list`, { body: data });
  }

  getMediaItemsInList(listId: number) {
    return this.http.get(`${this.mediaURL}/list/${listId}`);
  }

  getPersonnalList() {
    return this.http.get(`${this.mediaURL}/list/My_Personal_List`);
  }

  createGroup(groupData: { name: string, listName: string }) {
    return this.http.post(`${this.groupURL}`, groupData);
  }

  joinGroup(code: string) {
    return this.http.post(`${this.groupURL}/join`, { code });
  }

  updateList(listId: number, updatedList: { name?: string }) {
    return this.http.patch(`${this.listURL}/${listId}`, updatedList);
  }

  getUsers(){
    return this.http.get(`${this.userURL}`);
  }

  getGroupById(groupId: number) {
    return this.http.get(`${this.groupURL}/${groupId}`);
  }

  updateGroup(groupId: number, updatedGroup: { name?: string; listName?: string }) {
    return this.http.patch(`${this.groupURL}/${groupId}`, updatedGroup);
  }

  deleteList(listId: number) {
    return this.http.delete(`${this.listURL}/${listId}`);
  }

  deleteGroup(groupId: number) {
    return this.http.delete(`${this.groupURL}/${groupId}`);
  }

  addToFavorites(data: Media): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>(`${this.userURL}/favorite`, data);
  }

  removeFromFavorites(data: Media): Observable<ApiMessageResponse> {
    return this.http.delete<ApiMessageResponse>(`${this.userURL}/favorite`, { body: data });
  }

  getUserFavorites() {
    return this.http.get(`${this.userURL}/favorite`);
  }

  createVote(data: Media): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>(`${this.voteURL}`, data);
  }

  getVotesByUserAndGroup(groupId: number) {
    return this.http.get(`${this.voteURL}/group-and-user/${groupId}`);
  }

  deleteVote(data: Media): Observable<ApiMessageResponse> {
    return this.http.delete<ApiMessageResponse>(`${this.voteURL}`, { body: data });
  }

  getAllMediaItemsForUserInGroup(groupId: number) {
    return this.http.get(`${this.groupURL}/media/${groupId}`);
  }

  getVotesByGroup(groupId: number) {
    return this.http.get(`${this.voteURL}/group/${groupId}`);
  }

  getVotesByUserInGroup(groupId: number) {
    return this.http.get(`${this.voteURL}/group-and-user/${groupId}`)
  }

  deleteVotesByGroup(groupId: number) {
    return this.http.delete(`${this.voteURL}/group/${groupId}`);
  }

  deleteVotesInGroup(groupId: number) {
    return this.http.delete(`${this.voteURL}/user-in-group/${groupId}`);
  }

  getAllGroupsForUser() {
    return this.http.get(`${this.groupURL}`, { withCredentials: true });
  }

  deleteUserVotesInGroup(groupId: number) {
    return this.http.delete(`${this.voteURL}/group-and-user/${groupId}`, { withCredentials: true });
  }

  getUserGroups() {
    return this.http.get(`${this.groupURL}`, { withCredentials: true });
  }
}
