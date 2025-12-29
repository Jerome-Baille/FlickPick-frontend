import { Component, inject } from '@angular/core';
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

interface SelectedMedia {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title?: string;
  releaseDate?: string;
  posterPath?: string;
  overview?: string;
}

interface DialogResult {
  name: string;
  listName: string;
  selectedMedia: SelectedMedia[];
}

interface ApiResponse {
  message: string;
  list?: unknown;
  group?: Group;
  code?: string;
}

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
    private dataService = inject(DataService);
    private snackbarService = inject(SnackbarService);
    dialog = inject(MatDialog);

    groups: Group[] = [];
    faCirclePlus = faCirclePlus;
    faUsers = faUsers;

    constructor() {
        this.loadGroups();
    }

    loadGroups() {
        this.dataService.getUserGroups().subscribe({
            next: (response: unknown) => {
                this.groups = (response as Group[]) || [];
            },
            error: (err: Error) => {
                this.snackbarService.showError(err.message);
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

        dialogRef.afterClosed().subscribe((result: DialogResult | undefined) => {
            if (result) {
                const listData = {
                    name: result.listName,
                    selectedMedia: result.selectedMedia.map((media: SelectedMedia) => ({
                        tmdbId: media.tmdbId,
                        mediaType: media.mediaType,
                        title: media.title,
                        releaseDate: media.releaseDate,
                        posterPath: media.posterPath,
                        overview: media.overview
                    }))
                };

                this.dataService.createList(listData).subscribe({
                    next: () => {
                        const groupData = {
                            name: result.name,
                            listName: result.listName
                        };

                        this.dataService.createGroup(groupData).subscribe({
                            next: (groupResponse: unknown) => {
                                const res = groupResponse as ApiResponse;
                                if (res.group) {
                                    this.groups.push(res.group);
                                }
                                this.snackbarService.showSuccess(`Group created successfully. Share this code with others to join: ${res.code}`);
                            },
                            error: (err: Error) => {
                                this.snackbarService.showError(err.message);
                            }
                        });
                    },
                    error: (err: Error) => {
                        this.snackbarService.showError(err.message);
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

        dialogRef.afterClosed().subscribe((code: string | undefined) => {
            if (code) {
                this.dataService.joinGroup(code).subscribe({
                    next: (response: unknown) => {
                        const res = response as ApiResponse;
                        this.snackbarService.showSuccess(res.message);
                        if (res.group) {
                            this.groups.push(res.group);
                        }
                    },
                    error: (err: Error) => {
                        this.snackbarService.showError(err.message);
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

        dialogRef.afterClosed().subscribe((result: boolean | undefined) => {
            if (result) {
                this.dataService.deleteGroup(group.id).subscribe({
                    next: (response: unknown) => {
                        const res = response as ApiResponse;
                        this.snackbarService.showSuccess(res.message);
                        this.groups = this.groups.filter(g => g.id !== group.id);
                    },
                    error: (err: Error) => {
                        this.snackbarService.showError(err.message);
                    }
                });
            }
        });
    }
}
