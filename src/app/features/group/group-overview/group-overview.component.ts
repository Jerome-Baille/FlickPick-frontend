import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { RouterLink } from '@angular/router';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { faCirclePlus, faUsers } from '@fortawesome/free-solid-svg-icons';
import { MatDialog } from '@angular/material/dialog';
import { Group } from 'src/app/shared/models/Group';
import { DataService } from 'src/app/core/services/data.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { CreateCollectionModalComponent } from 'src/app/shared/components/create-collection-modal/create-collection-modal.component';
import { BasicModalComponent } from 'src/app/shared/components/basic-modal/basic-modal.component';

@Component({
    selector: 'app-group-overview',
    templateUrl: './group-overview.component.html',
    styleUrls: ['./group-overview.component.scss'],
    standalone: true,
    imports: [
        CommonModule,
        MatCardModule,
        MatIconModule,
        MatButtonModule,
        MatTooltipModule,
        RouterLink,
        FontAwesomeModule
    ]
})
export class GroupOverviewComponent {
    groups: Group[] = [];
    faCirclePlus = faCirclePlus;
    faUsers = faUsers;

    constructor(
        private dataService: DataService,
        private snackbarService: SnackbarService,
        public dialog: MatDialog
    ) {
        this.loadGroups();
    }

    loadGroups() {
        this.dataService.getUserGroups().subscribe({
            next: (response: any) => {
                this.groups = response || [];
            },
            error: (err: any) => {
                this.snackbarService.showError(err);
            }
        });
    }

    copyGroupCode(event: Event, code: string) {
        event.stopPropagation();
        navigator.clipboard.writeText(code).then(() => {
            this.snackbarService.showSuccess('Group code copied to clipboard!');
        }).catch(err => {
            this.snackbarService.showError('Failed to copy code');
            console.error('Failed to copy code', err);
        });
    }

    createGroup() {
        const dialogRef = this.dialog.open(CreateCollectionModalComponent, {
            width: '800px',
            data: {
                formType: 'all'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const listData = {
                    name: result.listName,
                    selectedMedia: result.selectedMedia.map((media: any) => ({
                        tmdbId: media.tmdbId,
                        mediaType: media.mediaType,
                        title: media.title,
                        releaseDate: media.releaseDate,
                        posterPath: media.posterPath,
                        overview: media.overview
                    }))
                };

                this.dataService.createList(listData).subscribe({
                    next: (listResponse: any) => {
                        const groupData = {
                            name: result.name,
                            listName: result.listName
                        };

                        this.dataService.createGroup(groupData).subscribe({
                            next: (groupResponse: any) => {
                                this.groups.push(groupResponse.group);
                                this.snackbarService.showSuccess(`Group created successfully. Share this code with others to join: ${groupResponse.code}`);
                            },
                            error: (err: any) => {
                                this.snackbarService.showError(err);
                            }
                        });
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
                            this.groups.push(response.group);
                        }
                    },
                    error: (err: any) => {
                        this.snackbarService.showError(err);
                    }
                });
            }
        });
    }

    deleteGroup(group: Group) {
        const dialogRef = this.dialog.open(BasicModalComponent, {
            data: {
                title: 'Delete Group',
                message: `Are you sure you want to delete the group "${group.name}"? This action cannot be undone.`,
                confirmText: 'Delete'
            }
        });

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.dataService.deleteGroup(group.id).subscribe({
                    next: (response: any) => {
                        this.snackbarService.showSuccess(response.message);
                        this.groups = this.groups.filter(g => g.id !== group.id);
                    },
                    error: (err: any) => {
                        this.snackbarService.showError(err);
                    }
                });
            }
        });
    }
}
