import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute } from '@angular/router';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ChoosingGameComponent } from '../choosing-game/choosing-game.component';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MediaTableViewComponent } from 'src/app/shared/components/media-table-view/media-table-view.component';
import { DataService } from 'src/app/core/services/data.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { CreateCollectionModalComponent } from 'src/app/shared/components/create-collection-modal/create-collection-modal.component';

interface GroupMember {
  id: number;
  username: string;
}

interface GroupMediaItem {
  tmdbId: number;
  mediaType: string;
  title: string;
  posterPath?: string;
  releaseDate?: string;
  overview?: string;
  points?: number;
  sumOfRatings?: number;
  isAdmin?: boolean;
  votes: unknown[];
}

interface GroupData {
  id: number;
  name: string;
  code: string;
  isAdmin?: boolean;
  hasVoted?: boolean;
  Users?: GroupMember[];
  Lists?: unknown[];
}

interface GroupResponse {
  group: GroupData;
  MediaItems: GroupMediaItem[];
}

interface ApiResponse {
  message: string;
  group?: {
    Lists: unknown[];
  };
}

@Component({
    selector: 'app-group-detail',
    imports: [
        CommonModule,
        MatButtonModule,
        MatCardModule, 
        MatIconModule, 
        ReactiveFormsModule, 
        FormsModule, 
        MatExpansionModule, 
        MatChipsModule,
        FontAwesomeModule,
        ChoosingGameComponent,
        MediaTableViewComponent,
        MatFormFieldModule,
        MatInputModule,
        MatTooltipModule
    ],
    templateUrl: './group-detail.component.html',
    styleUrls: ['./group-detail.component.scss'],
    standalone: true
})
export class GroupDetailComponent {
    private route = inject(ActivatedRoute);
    private dataService = inject(DataService);
    private snackbarService = inject(SnackbarService);
    dialog = inject(MatDialog);

    isEditing = false;
    editedGroupName = '';

    groupData: GroupData = { id: 0, name: '', code: '' };
    groupMembers: GroupMember[] = [];
    groupList: unknown[] = [];
    groupMedia: GroupMediaItem[] = [];


    faCirclePlus = faCirclePlus;
    faUsers = faUsers;

    constructor() {
        this.route.params.subscribe(params => {
            const groupId = params['groupId'];

            this.dataService.getGroupById(groupId).subscribe({
                next: (response: unknown) => {
                    const res = response as GroupResponse;
                    this.groupData = res.group;
                    this.groupMembers = res.group.Users || [];
                    this.groupMedia = res.MediaItems;

                    if (res.group.isAdmin && res.group.isAdmin === true) {
                        this.groupMedia = this.groupMedia.map(media => {
                            return { ...media, isAdmin: true };
                        });
                    }
                },
                error: (err: Error) => {
                    this.snackbarService.showError(err.message);
                }
            })
        });
    }

    enterEditMode(): void {
        this.isEditing = true;
        this.editedGroupName = this.groupData.name;
    }

    updateGroupName(newGroupName: string): void {
        this.groupData.name = newGroupName;
        this.isEditing = false;

        const updatedGroup = {
            name: this.groupData.name
        }
        this.dataService.updateGroup(this.groupData.id, updatedGroup).subscribe({
            next: (response: unknown) => {
                const res = response as ApiResponse;
                this.snackbarService.showSuccess(res.message);
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

    updateGroupList(event: Event) {
        event.stopPropagation();

        const dialogRef = this.dialog.open(CreateCollectionModalComponent, {
            data: {
                formType: 'listName'
            },
            panelClass: 'modal-container'
        })

        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                const updatedGroup = {
                    listName: result.listName
                }

                this.dataService.updateGroup(this.groupData.id, updatedGroup).subscribe({
                    next: (response: unknown) => {
                        const res = response as ApiResponse;
                        this.groupList = res.group?.Lists || [];
                    },
                    error: (err: Error) => {
                        this.snackbarService.showError(err.message);
                    }
                });
            }
        })
    }

    replaceSpacesWithUnderscores(event: Event) {
        const input = event.target as HTMLInputElement;
        input.value = input.value.replace(/\s+/g, '_');
    }

    resetVotes() {
        this.dataService.deleteVotesByGroup(this.groupData.id).subscribe({
            next: (response: unknown) => {
                const res = response as ApiResponse;
                this.snackbarService.showSuccess(res.message);
                this.groupData.hasVoted = false;
                this.groupMedia = this.groupMedia.map(media => {
                    return { ...media, votes: [] };
                });
            },
            error: (err: Error) => {
                this.snackbarService.showError(err.message);
            }
        })
    }

    hasMediaWithVotes(): boolean {
        return this.groupMedia.some(media => media.votes.length > 0);
    }
}
