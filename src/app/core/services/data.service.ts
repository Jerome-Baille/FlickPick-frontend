import { Injectable, inject } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Event, EventStatus } from '../../shared/models/Event';

export interface Media {
  tmdbId: number;
  mediaType: string; // movie or tv
  listName?: string;
  listId?: number;
  title?: string;
  releaseDate?: string;
  posterPath?: string;
  overview?: string;
  eventId?: number;
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
  private eventURL = environment.eventURL;
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
    eventId?: number,
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

  // ===== GROUP METHODS =====
  
  createGroup(groupData: { 
    name: string; 
    listName: string;
    eventDate?: string;
    startTime?: string;
    endTime?: string;
    invitedEmails?: string[];
  }) {
    return this.http.post(`${this.groupURL}`, groupData);
  }

  joinGroup(code: string) {
    return this.http.post(`${this.groupURL}/join`, { code });
  }

  getGroupById(groupId: number) {
    return this.http.get(`${this.groupURL}/${groupId}`);
  }

  updateGroup(groupId: number, updatedGroup: { name?: string }) {
    return this.http.patch(`${this.groupURL}/${groupId}`, updatedGroup);
  }

  deleteGroup(groupId: number) {
    return this.http.delete(`${this.groupURL}/${groupId}`);
  }

  getAllGroupsForUser() {
    return this.http.get(`${this.groupURL}`, { withCredentials: true });
  }

  getUserGroups() {
    return this.http.get(`${this.groupURL}`, { withCredentials: true });
  }

  // ===== EVENT METHODS =====

  createEvent(eventData: {
    groupId: number;
    name: string;
    eventDate?: string;
    startTime?: string;
    endTime?: string;
  }): Observable<{ message: string; event: Event }> {
    return this.http.post<{ message: string; event: Event }>(`${this.eventURL}`, eventData);
  }

  createEventWithMedia(eventData: {
    groupId: number;
    name: string;
    eventDate?: string;
    startTime?: string;
    endTime?: string;
    listName?: string;
    selectedMedia?: {
      tmdbId: number;
      mediaType: 'movie' | 'tv';
      title?: string;
      releaseDate?: string;
      posterPath?: string;
      overview?: string;
    }[];
  }): Observable<{ message: string; event: Event }> {
    return this.http.post<{ message: string; event: Event }>(`${this.eventURL}/group/${eventData.groupId}`, eventData);
  }

  getEventById(eventId: number): Observable<Event> {
    return this.http.get<Event>(`${this.eventURL}/${eventId}`);
  }

  getEventsByGroup(groupId: number): Observable<Event[]> {
    return this.http.get<Event[]>(`${this.eventURL}/group/${groupId}`);
  }

  updateEvent(eventId: number, updatedEvent: {
    name?: string;
    eventDate?: string;
    startTime?: string;
    endTime?: string;
    status?: EventStatus;
  }): Observable<{ message: string; event: Event }> {
    return this.http.patch<{ message: string; event: Event }>(`${this.eventURL}/${eventId}`, updatedEvent);
  }

  deleteEvent(eventId: number): Observable<ApiMessageResponse> {
    return this.http.delete<ApiMessageResponse>(`${this.eventURL}/${eventId}`);
  }

  getEventMediaItems(eventId: number) {
    return this.http.get(`${this.eventURL}/${eventId}/media`);
  }

  launchVoting(eventId: number): Observable<{ message: string; event: Event }> {
    return this.http.post<{ message: string; event: Event }>(`${this.eventURL}/${eventId}/launch-voting`, {});
  }

  completeEvent(eventId: number): Observable<{ message: string; event: Event }> {
    return this.http.post<{ message: string; event: Event }>(`${this.eventURL}/${eventId}/complete`, {});
  }

  // ===== LIST METHODS =====

  updateList(listId: number, updatedList: { name?: string }) {
    return this.http.patch(`${this.listURL}/${listId}`, updatedList);
  }

  deleteList(listId: number) {
    return this.http.delete(`${this.listURL}/${listId}`);
  }

  // ===== USER METHODS =====

  getUsers(){
    return this.http.get(`${this.userURL}`);
  }

  // ===== VOTE METHODS (now event-based) =====

  createVote(data: Media): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>(`${this.voteURL}`, data);
  }

  submitBallot(data: { eventId: number; rankings: (Media & { rating: number })[] }): Observable<ApiMessageResponse> {
    return this.http.post<ApiMessageResponse>(`${this.voteURL}/ballot`, data);
  }

  getVotesByUserAndEvent(eventId: number) {
    return this.http.get(`${this.voteURL}/event-and-user/${eventId}`);
  }

  deleteVote(data: Media): Observable<ApiMessageResponse> {
    return this.http.delete<ApiMessageResponse>(`${this.voteURL}`, { body: data });
  }

  getVotesByEvent(eventId: number) {
    return this.http.get(`${this.voteURL}/event/${eventId}`);
  }

  deleteVotesByEvent(eventId: number) {
    return this.http.delete(`${this.voteURL}/event/${eventId}`);
  }

  deleteVotesInEvent(eventId: number) {
    return this.http.delete(`${this.voteURL}/user-in-event/${eventId}`);
  }

  deleteUserVotesInEvent(eventId: number) {
    return this.http.delete(`${this.voteURL}/event-and-user/${eventId}`, { withCredentials: true });
  }

  // Legacy aliases (deprecated - use event-based methods)
  /** @deprecated Use getVotesByUserAndEvent instead */
  getVotesByUserAndGroup(groupId: number) {
    console.warn('getVotesByUserAndGroup is deprecated. Use getVotesByUserAndEvent with eventId.');
    return this.getVotesByUserAndEvent(groupId);
  }

  /** @deprecated Use getVotesByEvent instead */
  getVotesByGroup(groupId: number) {
    console.warn('getVotesByGroup is deprecated. Use getVotesByEvent with eventId.');
    return this.getVotesByEvent(groupId);
  }

  /** @deprecated Use getVotesByUserAndEvent instead */
  getVotesByUserInGroup(groupId: number) {
    console.warn('getVotesByUserInGroup is deprecated. Use getVotesByUserAndEvent with eventId.');
    return this.getVotesByUserAndEvent(groupId);
  }

  /** @deprecated Use deleteVotesByEvent instead */
  deleteVotesByGroup(groupId: number) {
    console.warn('deleteVotesByGroup is deprecated. Use deleteVotesByEvent with eventId.');
    return this.deleteVotesByEvent(groupId);
  }

  /** @deprecated Use deleteUserVotesInEvent instead */
  deleteUserVotesInGroup(groupId: number) {
    console.warn('deleteUserVotesInGroup is deprecated. Use deleteUserVotesInEvent with eventId.');
    return this.deleteUserVotesInEvent(groupId);
  }
}
