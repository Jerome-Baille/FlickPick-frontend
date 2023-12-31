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
  overview?: string;
}

interface Group {
  name: string;
  userIds: number[];
  listName: string;
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

  createList(list: any) {
    return this.http.post(BACKEND_API_URL.list, list);
  }

  addMediaItem(data: Media){
    return this.http.post(BACKEND_API_URL.media, data);
  }

  deleteMediaItemFromList(data: Media) {
    return this.http.delete(`${BACKEND_API_URL.media}/list`, { body: data });
  }

  getMediaItemsInList(listId: number) {
    return this.http.get(`${BACKEND_API_URL.media}/list/${listId}`);
  }

  getPersonnalList() {
    return this.http.get(`${BACKEND_API_URL.media}/list/My_Personal_List`);
  }

  createGroup(groupData: Group) {
    return this.http.post(BACKEND_API_URL.group, groupData); // needs name, userIds and listName.
  }

  updateList(listId: number, updatedList: any) {
    return this.http.patch(`${BACKEND_API_URL.list}/${listId}`, updatedList);
  }

  getUsers(){
    return this.http.get(BACKEND_API_URL.user);
  }

  getGroupById(groupId: number) {
    return this.http.get(`${BACKEND_API_URL.group}/${groupId}`);
  }

  updateGroup(groupId: number, updatedGroup: any) {
    return this.http.patch(`${BACKEND_API_URL.group}/${groupId}`, updatedGroup);
  }

  deleteList(listId: number) {
    return this.http.delete(`${BACKEND_API_URL.list}/${listId}`);
  }

  deleteGroup(groupId: number) {
    return this.http.delete(`${BACKEND_API_URL.group}/${groupId}`);
  }

  addToFavorites(data: Media) {
    return this.http.post(`${BACKEND_API_URL.user}/favorite`, data);
  }

  removeFromFavorites(data: Media) {
    return this.http.delete(`${BACKEND_API_URL.user}/favorite`, { body: data });
  }

  getUserFavorites() {
    return this.http.get(`${BACKEND_API_URL.user}/favorite`);
  }

  createVote(data: Media) {
    return this.http.post(`${BACKEND_API_URL.vote}`, data);
  }

  getVotesByUserAndGroup(groupId: number) {
    return this.http.get(`${BACKEND_API_URL.vote}/group-and-user/${groupId}`);
  }

  deleteVote(data: Media) {
    return this.http.delete(`${BACKEND_API_URL.vote}`, { body: data });
  }

  getAllMediaItemsForUserInGroup(groupId: number) {
    return this.http.get(`${BACKEND_API_URL.group}/media/${groupId}`);
  }

  getVotesByGroup(groupId: number) {
    return this.http.get(`${BACKEND_API_URL.vote}/group/${groupId}`);
  }

  deleteVotesByGroup(groupId: number) {
    return this.http.delete(`${BACKEND_API_URL.vote}/group/${groupId}`);
  }
}
