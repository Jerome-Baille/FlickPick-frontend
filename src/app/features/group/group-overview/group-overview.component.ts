import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Group } from 'src/app/shared/models/Group';
import { DataService } from 'src/app/core/services/data.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { ConfirmationDialogComponent } from 'src/app/shared/components/confirmation-dialog/confirmation-dialog.component';
import { ViewToggleComponent } from 'src/app/shared/components/view-toggle/view-toggle.component';

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
        RouterLink,
        ViewToggleComponent
    ]
})
export class GroupOverviewComponent {
    private dataService = inject(DataService);
    private snackbarService = inject(SnackbarService);
    private router = inject(Router);
    dialog = inject(MatDialog);

    groups: Group[] = [];
    viewMode: 'grid' | 'list' = (localStorage.getItem('groupViewMode') as 'grid' | 'list') || 'grid';

    // Mock images for demonstration
    private mockImages = [
        'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1574267432644-f74f8ec13f37?w=800&h=600&fit=crop',
        'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=600&fit=crop'
    ];

    private mockAvatars = [
        'https://i.pravatar.cc/150?img=1',
        'https://i.pravatar.cc/150?img=2',
        'https://i.pravatar.cc/150?img=3',
        'https://i.pravatar.cc/150?img=4'
    ];

    constructor() {
        this.loadGroups();
    }

    getGroupImage(group: Group): string {
        const index = group.id % this.mockImages.length;
        return this.mockImages[index];
    }

    getMockMembers(group: Group): string[] {
        const count = Math.min(3, group.Users.length || 1);
        return this.mockAvatars.slice(0, count);
    }

    setViewMode(mode: 'grid' | 'list') {
        this.viewMode = mode;
        try { localStorage.setItem('groupViewMode', mode); } catch {}
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
        this.router.navigate(['/group/create']);
    }

    joinGroup() {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '480px',
            maxWidth: '90vw',
            panelClass: 'confirmation-dialog-panel',
            disableClose: false,
            autoFocus: false,
            data: {
                title: 'Join Group',
                message: 'Enter the group code to join an existing group.',
                icon: 'group_add',
                showInput: true,
                inputPlaceholder: 'Group Code',
                confirmText: 'Join',
                cancelText: 'Cancel'
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
        const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
            width: '480px',
            maxWidth: '90vw',
            panelClass: 'confirmation-dialog-panel',
            disableClose: false,
            autoFocus: false,
            data: {
                title: 'Delete Group',
                message: `Are you sure you want to delete <strong>${group.name}</strong>? This action cannot be undone.`,
                icon: 'delete',
                iconFilled: true,
                confirmText: 'Delete',
                cancelText: 'Cancel'
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
