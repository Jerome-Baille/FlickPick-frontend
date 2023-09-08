import { Component } from '@angular/core';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-profile-detail',
  templateUrl: './profile-detail.component.html',
  styleUrls: ['./profile-detail.component.sass']
})
export class ProfileDetailComponent {
  movies!: any[];
  tvShows!: any[];

  userProfile!: any;

  constructor(
    private userService: UserService
  ) {
    this.userService.getUserProfileById().subscribe({
      next: (response: any) => {
        this.userProfile = response;
      },
      error: (error) => {
        console.log(error);
      }
    });
  }
}
