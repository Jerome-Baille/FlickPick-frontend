import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.prod';
import { User } from '../models/User';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private userURL = environment.userURL;

  constructor(private http: HttpClient) { }

  getUserProfileById(): Observable<User> {
    return this.http.get<User>(`${this.userURL}/profile`);
  }

  createUser(userId: string, username: string) {
    return this.http.post(`${this.userURL}/create`, {userId, username}, {withCredentials: true});
  }

  updateProfile(profile: Partial<User>) {
    return this.http.patch<User>(`${this.userURL}/profile`, profile);
  }
}