import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BACKEND_API_URL } from 'config/backend-api';
import { Observable } from 'rxjs';

interface UserProfile {
  id: number;
  name: string;
  email: string;
  lists: List[];
  groups: Group[];
}

interface List {
  id: number;
  name: string;
  description: string;
}

interface Group {
  id: number;
  name: string;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {

  constructor(private http: HttpClient) { }

  getUserProfileById(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${BACKEND_API_URL.user}/profile`);
  }
}