import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';

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
  private userURL = environment.userURL;

  constructor(private http: HttpClient) { }

  getUserProfileById(): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.userURL}/profile`);
  }

  createUser(userId: string, username: string) {
    return this.http.post(`${this.userURL}/create`, {userId, username}, {withCredentials: true});
  }
}