import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment.prod';

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
  userIds?: number[];
  listName: string;
  selectedMedia?: Array<{
    tmdbId: number;
    mediaType: string;
    title?: string;
    releaseDate?: string;
  }>;

}

@Injectable({
  providedIn: 'root'
})
export class DataService {
  private userURL = environment.userURL;
  private groupURL = environment.groupURL;
  private listURL = environment.listURL;
  private mediaURL = environment.mediaURL;
  private voteURL = environment.voteURL;

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
    return this.http.get(`${this.listURL}`);
  }

  createList(listData: { 
    name: string, 
    groupId?: number,
    selectedMedia?: Array<{
      tmdbId: number,
      mediaType: 'movie' | 'tv',
      title?: string,
      releaseDate?: string,
      posterPath?: string,
      overview?: string
    }> 
  }) {
    return this.http.post(`${this.listURL}`, listData);
  }

  addMediaItem(data: Media){
    return this.http.post(`${this.mediaURL}`, data);
  }

  deleteMediaItemFromList(data: Media) {
    return this.http.delete(`${this.mediaURL}/list`, { body: data });
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

  updateList(listId: number, updatedList: any) {
    return this.http.patch(`${this.listURL}/${listId}`, updatedList);
  }

  getUsers(){
    return this.http.get(`${this.userURL}`);
  }

  getGroupById(groupId: number) {
    return this.http.get(`${this.groupURL}/${groupId}`);
  }

  updateGroup(groupId: number, updatedGroup: any) {
    return this.http.patch(`${this.groupURL}/${groupId}`, updatedGroup);
  }

  deleteList(listId: number) {
    return this.http.delete(`${this.listURL}/${listId}`);
  }

  deleteGroup(groupId: number) {
    return this.http.delete(`${this.groupURL}/${groupId}`);
  }

  addToFavorites(data: Media) {
    return this.http.post(`${this.userURL}/favorite`, data);
  }

  removeFromFavorites(data: Media) {
    return this.http.delete(`${this.userURL}/favorite`, { body: data });
  }

  getUserFavorites() {
    return this.http.get(`${this.userURL}/favorite`);
  }

  createVote(data: Media) {
    return this.http.post(`${this.voteURL}`, data);
  }

  getVotesByUserAndGroup(groupId: number) {
    return this.http.get(`${this.voteURL}/group-and-user/${groupId}`);
  }

  deleteVote(data: Media) {
    return this.http.delete(`${this.voteURL}`, { body: data });
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
