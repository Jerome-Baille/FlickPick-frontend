import { Component } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
import { UserService } from 'src/app/services/user.service';
import { CreateCollectionModalComponent } from 'src/app/shared/create-collection-modal/create-collection-modal.component';
import { MatDialog } from '@angular/material/dialog';
import { faCirclePlus, faUsers, faHeart, faList, faFilm, faTv, faUser, faSignOut } from '@fortawesome/free-solid-svg-icons';
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
import { MatTooltipModule } from '@angular/material/tooltip';
import { User } from 'src/app/models/User';
import { AuthService } from 'src/app/services/auth.service';
import { BasicModalComponent } from 'src/app/shared/basic-modal/basic-modal.component';

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
      MatFormFieldModule,
      MatTooltipModule
    ],
    templateUrl: './profile-detail.component.html',
    styleUrls: ['./profile-detail.component.scss'],
    standalone: true
})
export class ProfileDetailComponent {
    // Properties
    userProfile: User = {
        username: '',
        Groups: [],
        Lists: [],
        Favorites: []
    };
    listName: string = '';

    // Icons
    faCirclePlus = faCirclePlus;
    faUsers = faUsers;
    faHeart = faHeart;
    faList = faList;
    faFilm = faFilm;
    faTv = faTv;
    faUser = faUser;
    faSignOut = faSignOut;

    constructor(
        private userService: UserService,
        private dataService: DataService,
        private authService: AuthService,
        private snackbarService: SnackbarService,
        public dialog: MatDialog
    ) {
        this.userService.getUserProfileById().subscribe({
            next: (response: User) => {
                this.userProfile = {
                    ...response,
                    Groups: response.Groups || [],
                    Lists: response.Lists || [], 
                    Favorites: response.Favorites || []
                };
            },
            error: (err: any) => {
                this.snackbarService.showError(err);
            }
        });
    }

    copyGroupCode(event: Event, code: string) {
        event.stopPropagation(); // Prevent navigation when clicking the code
        navigator.clipboard.writeText(code).then(() => {
            this.snackbarService.showSuccess('Group code copied to clipboard!');
        }).catch(err => {
            this.snackbarService.showError('Failed to copy code');
            console.error('Failed to copy code', err);
        });
    }

    createGroup() {
        const dialogRef = this.dialog.open(CreateCollectionModalComponent, {
            data: {
                formType: 'all'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const groupData = {
                    name: result.name,
                    listName: result.listName
                }

                this.dataService.createGroup(groupData).subscribe({
                    next: (response: any) => {
                        this.userProfile.Groups!.push(response.group);
                        this.snackbarService.showSuccess(`Group created successfully. Share this code with others to join: ${response.code}`);

                        // check if the list already exists in the list of lists
                        const listExists = this.userProfile.Lists!.some((list: any) => list.name === result.listName);

                        // if it doesn't push the new list to the list of lists
                        if (!listExists && response.list) {
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

    joinGroup() {
        const dialogRef = this.dialog.open(BasicModalComponent, {
            data: {
                title: 'Join Group',
                message: 'Enter the group code:',
                showInput: true,
                placeholder: 'Group Code',
                confirmText: 'Join'
            }
        });

        dialogRef.afterClosed().subscribe(code => {
            if (code) {
                this.dataService.joinGroup(code).subscribe({
                    next: (response: any) => {
                        this.snackbarService.showSuccess(response.message);
                        if (response.group) {
                            this.userProfile.Groups!.push(response.group);
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
        const dialogRef = this.dialog.open(CreateCollectionModalComponent, {
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
                this.snackbarService.showSuccess(response.message);
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
                this.snackbarService.showSuccess(response.message);
                this.userProfile.Groups = this.userProfile.Groups!.filter((g: any) => g.id !== group.id);
            },
            error: (err: any) => {
                this.snackbarService.showError(err);
            }
        })
    }

    removeFromFavorites(favorite: any) {
        const mediaItem = favorite.MediaItem;
        this.dataService.removeFromFavorites({ tmdbId: mediaItem.tmdbId, mediaType: mediaItem.mediaType }).subscribe({
            next: (response: any) => {
                this.snackbarService.showSuccess(response.message);
                this.userProfile.Favorites = this.userProfile.Favorites!.filter((f: any) => f.id !== favorite.id);
            },
            error: (err: any) => {
                this.snackbarService.showError(err);
            }
        });
    }

    logout() {
        const dialogRef = this.dialog.open(BasicModalComponent, {
            data: {
                title: 'Logout',
                message: 'Are you sure you want to log out?'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                try {
                    this.authService.logout();
                } catch (error) {
                    this.snackbarService.showError('Failed to logout');
                    console.error('Failed to logout', error);
                }
            }
        });
    }
}