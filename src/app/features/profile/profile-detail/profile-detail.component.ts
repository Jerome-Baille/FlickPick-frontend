import { Component } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { faCirclePlus, faList, faUser, faSignOut } from '@fortawesome/free-solid-svg-icons';
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
import { User } from 'src/app/shared/models/User';
import { UserService } from 'src/app/core/services/user.service';
import { DataService } from 'src/app/core/services/data.service';
import { AuthService } from 'src/app/core/services/auth.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { CreateCollectionModalComponent } from 'src/app/shared/components/create-collection-modal/create-collection-modal.component';
import { BasicModalComponent } from 'src/app/shared/components/basic-modal/basic-modal.component';

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
    userProfile: User = {
        username: '',
        Lists: [],
        Favorites: []
    };

    // Icons
    faCirclePlus = faCirclePlus;
    faList = faList;
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
                    Lists: response.Lists || []
                };
            },
            error: (err: any) => {
                this.snackbarService.showError(err);
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