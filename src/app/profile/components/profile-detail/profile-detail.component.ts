import { Component } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
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
  groupName: string = '';
  listName: string = '';

  constructor(
    private userService: UserService,
    private dataService: DataService
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

  createGroup() {
    const groupData = {
      name: this.groupName
    }
    this.dataService.createGroup(groupData).subscribe({
      next: (response: any) => {
        console.log(response);
        this.groupName = '';
      },
      error: (error) => {
        console.log(error);
      }
    });
  }

  createList() {
    const listData = {
      name: this.listName
    }
    this.dataService.createList(listData).subscribe({
      next: (response: any) => {
        console.log(response);
        this.listName = '';
      },
      error: (error) => {
        console.log(error);
      }
    });
  }
}