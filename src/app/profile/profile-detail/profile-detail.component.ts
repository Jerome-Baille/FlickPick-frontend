import { Component } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { UserService } from 'src/app/services/user.service';
import { CreateGroupModalComponent } from 'src/app/shared/create-group-modal/create-group-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { MatCardModule } from '@angular/material/card';
import { MatListModule } from '@angular/material/list';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { User } from 'src/app/models/User';

@Component({
    selector: 'app-profile-detail',
    imports: [
      CommonModule, 
      MatButtonModule,
      MatCardModule, 
      MatListModule, 
      MatIconModule, 
      FontAwesomeModule, 
      RouterLink,
      FormsModule,
      MatInputModule,
      MatFormFieldModule
    ],
    templateUrl: './profile-detail.component.html',
    styleUrls: ['./profile-detail.component.scss'],
    standalone: true
})
export class ProfileDetailComponent {
  movies!: any[];
  tvShows!: any[];
  userProfile: User = {
    username: '',
    Groups: [],
    Lists: [],
    MediaItems: []
  };
  listName: string = '';
  isEditing = false;
  editedProfile: Partial<User> = {};

  faCirclePlus = faCirclePlus;

  constructor(
    private userService: UserService,
    private dataService: DataService,
    private snackbarService: SnackbarService,
    public dialog: MatDialog
  ) {
    this.userService.getUserProfileById().subscribe({
      next: (response: User) => {
        this.userProfile = {
          ...response,
          Groups: response.Groups || [],
          Lists: response.Lists || [],
          MediaItems: response.MediaItems || []
        };
      },
      error: (err: any) => {
        this.snackbarService.showError(err);
      }
    });
  }

  enterEditMode(): void {
    this.isEditing = true;
    this.editedProfile = { ...this.userProfile };
  }

  updateProfile(): void {
    this.userService.updateProfile(this.editedProfile).subscribe({
      next: (response: any) => {
        this.userProfile = response;
        this.isEditing = false;
        this.snackbarService.showSuccess('Profile updated successfully');
      },
      error: (err: any) => {
        this.snackbarService.showError(err);
      }
    });
  }

  cancelEdit(): void {
    this.isEditing = false;
    this.editedProfile = {};
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
            this.userProfile.Groups!.push(response.group);

            // check if the list already exists in the list of lists
            const listExists = this.userProfile.Lists!.some((list: any) => list.name === result.listName);

            // if it doesn't push the new list to the list of lists
            if (!listExists) {
              this.userProfile.Lists!.push(response.list);
            }
          },
          error: (err: any) => {
            this.snackbarService.showError(err);
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
            this.snackbarService.showSuccess(response.message);
            this.userProfile.Lists!.push(response.list);
          },
          error: (err: any) => {
            this.snackbarService.showError(err);
          }
        });
      }
    });
  }

  deleteList(list: any) {
    this.dataService.deleteList(list.id).subscribe({
      next: (response: any) => {
        window.alert(response.message);
        this.userProfile.Lists = this.userProfile.Lists!.filter((l: any) => l.id !== list.id);
      },
      error: (err: any) => {
        this.snackbarService.showError(err);
      }
    })
  }

  deleteGroup(group: any) {
    this.dataService.deleteGroup(group.id).subscribe({
      next: (response: any) => {
        window.alert(response.message);
        this.userProfile.Groups = this.userProfile.Groups!.filter((g: any) => g.id !== group.id);
      },
      error: (err: any) => {
        this.snackbarService.showError(err);
      }
    })
  }

  removeFromFavorites(item: any){
    this.dataService.removeFromFavorites({tmdbId: item.tmdbId, mediaType: item.mediaType}).subscribe({
      next: (response: any) => {
        window.alert(response.message);
        this.userProfile.MediaItems = this.userProfile.MediaItems!.filter((f: any) => f.id !== item.id);
      },
      error: (err: any) => {
        this.snackbarService.showError(err);
      }
    })
  }
}