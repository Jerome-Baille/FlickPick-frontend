import { Component } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { UserService } from 'src/app/services/user.service';
import { CreateGroupModalComponent } from 'src/app/shared/components/create-group-modal/create-group-modal.component';
import { MatDialog } from '@angular/material/dialog';

@Component({
  selector: 'app-profile-detail',
  templateUrl: './profile-detail.component.html',
  styleUrls: ['./profile-detail.component.sass']
})
export class ProfileDetailComponent {
  movies!: any[];
  tvShows!: any[];

  userProfile!: any;
  listName: string = '';

  constructor(
    private userService: UserService,
    private dataService: DataService,
    public dialog: MatDialog
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
    const dialogRef = this.dialog.open(CreateGroupModalComponent, {
      data: {
        formType: 'all'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const groupData = {
          name: result.name,
          userIds: result.users.map((user: any) => user.id),
          listName: result.listName
        }

        this.dataService.createGroup(groupData).subscribe({
          next: (response: any) => {
            this.userProfile.Groups.push(response.group);

            // check if the list already exists in the list of lists
            const listExists = this.userProfile.Lists.some((list: any) => list.name === result.listName);

            // if it doesn't push the new list to the list of lists
            if (!listExists) {
              this.userProfile.Lists.push(response.list);
            }
          },
          error: (error) => {
            console.log(error);
          }
        });
      }
    });
  }

  createList() {
    const dialogRef = this.dialog.open(CreateGroupModalComponent, {
      data: {
        formType: 'name'
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const listData = {
          name: result.name
        }

        this.dataService.createList(listData).subscribe({
          next: (response: any) => {
            console.log(response);
            this.userProfile.Lists.push(response.list);
          },
          error: (error) => {
            console.log(error);
          }
        });
      }
    });
  }

  deleteList(list: any) {
    this.dataService.deleteList(list.id).subscribe({
      next: (response: any) => {
        window.alert(response.message);
        this.userProfile.Lists = this.userProfile.Lists.filter((l: any) => l.id !== list.id);
      },
      error: (error) => {
        console.log(error);
      }
    })
  }

  deleteGroup(group: any) {
    this.dataService.deleteGroup(group.id).subscribe({
      next: (response: any) => {
        window.alert(response.message);
        this.userProfile.Groups = this.userProfile.Groups.filter((g: any) => g.id !== group.id);
      },
      error: (error) => {
        console.log(error);
      }
    })
  }
}