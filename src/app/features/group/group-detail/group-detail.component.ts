import { Component, inject } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';
import { faCirclePlus } from '@fortawesome/free-solid-svg-icons';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { MatCardModule } from '@angular/material/card';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatChipsModule } from '@angular/material/chips';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DataService } from 'src/app/core/services/data.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';

import { Event as MovieNightEvent, EventStatus } from '../../../shared/models/Event';

interface GroupMember {
  id: number;
  username: string;
  avatar?: string;
  isReady?: boolean;
  isHost?: boolean;
}

interface GroupData {
  id: number;
  name: string;
  code: string;
  adminIds: number[];
  isAdmin?: boolean;
  Users?: GroupMember[];
  Events?: MovieNightEvent[];
}

interface GroupResponse {
  group: GroupData;
}

interface ApiResponse {
  message: string;
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
    private router = inject(Router);
    private dataService = inject(DataService);
    private snackbarService = inject(SnackbarService);
    dialog = inject(MatDialog);

    isEditing = false;
    editedGroupName = '';

    groupData: GroupData = { id: 0, name: '', code: '', adminIds: [] };
    groupMembers: GroupMember[] = [];
    groupEvents: MovieNightEvent[] = [];

    faCirclePlus = faCirclePlus;
    faUsers = faUsers;

    constructor() {
        this.route.params.subscribe(params => {
            const groupId = +params['groupId'];
            if (groupId) {
                this.loadGroupData(groupId);
            }
        });
    }

    loadGroupData(groupId: number): void {
        this.dataService.getGroupById(groupId).subscribe({
            next: (response: unknown) => {
                const res = response as GroupResponse;
                this.groupData = res.group;
                const userId = Number(localStorage.getItem('userId'));
                // Defensive: ensure adminIds is an array and userId is valid
                if (Array.isArray(this.groupData.adminIds) && userId) {
                    this.groupData.isAdmin = this.groupData.adminIds.map(Number).includes(userId);
                } else {
                    this.groupData.isAdmin = false;
                }
                this.groupMembers = res.group.Users || [];
                this.loadGroupEvents(groupId);
            },
            error: (err: Error) => {
                this.snackbarService.showError('Failed to load group: ' + err.message);
            }
        });
    }

    loadGroupEvents(groupId: number): void {
        this.dataService.getEventsByGroup(groupId).subscribe({
            next: (events: MovieNightEvent[]) => {
                this.groupEvents = events;
            },
            error: (err: Error) => {
                this.snackbarService.showError('Failed to load events: ' + err.message);
            }
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
        this.snackbarService.showSuccess('List management is now done per movie night event.');
    }

    replaceSpacesWithUnderscores(event: Event) {
        const input = event.target as HTMLInputElement;
        input.value = input.value.replace(/\s+/g, '_');
    }

    copyLink(): void {
        const joinUrl = `${window.location.origin}/group/join?code=${this.groupData.code}`;
        navigator.clipboard.writeText(joinUrl).then(() => {
            this.snackbarService.showSuccess('Join link copied to clipboard!');
        }).catch(() => {
            this.snackbarService.showError('Failed to copy link');
        });
    }

    showQRCode(): void {
        this.snackbarService.showSuccess('QR Code feature coming soon!');
    }

    manageInvites(): void {
        this.snackbarService.showSuccess('Invite management coming soon!');
    }

    getMemberAvatar(member: GroupMember): string {
        return member.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(member.username)}&background=3a3727&color=bbb69b&size=128`;
    }

    createEvent(): void {
        this.router.navigate(['/event/create'], {
            queryParams: { groupId: this.groupData.id }
        });
    }

    viewEvent(eventToView: MovieNightEvent): void {
        // Always navigate to event detail page
        this.router.navigate(['/event/detail', eventToView.id]);
    }

    getEventStatusLabel(status: EventStatus): string {
        switch (status) {
            case 'draft': return 'Planning';
            case 'voting': return 'Voting Now';
            case 'completed': return 'Completed';
            case 'cancelled': return 'Cancelled';
            default: return status;
        }
    }

    getUpcomingEvent(): MovieNightEvent | undefined {
        return this.groupEvents.find(e => e.status === 'draft' || e.status === 'voting');
    }

    getActiveEventsCount(): number {
        return this.groupEvents.filter(e => e.status === 'draft' || e.status === 'voting').length;
    }
}
