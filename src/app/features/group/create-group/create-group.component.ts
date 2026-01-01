import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { DataService } from 'src/app/core/services/data.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';

interface InvitedMember {
  id: string;
  email: string;
  initials: string;
}

interface ApiGroupResponse {
  message: string;
  code?: string;
  group?: {
    id: number;
    name: string;
    code: string;
  };
}

@Component({
  selector: 'app-create-group',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule
  ],
  templateUrl: './create-group.component.html',
  styleUrl: './create-group.component.scss'
})
export class CreateGroupComponent {
  private dataService = inject(DataService);
  private snackbarService = inject(SnackbarService);
  private router = inject(Router);

  // Group data
  groupName = '';

  // Member invitation
  memberEmail = '';
  invitedMembers: InvitedMember[] = [];

  // Loading state
  isSubmitting = false;

  // Validation
  get canCreateGroup(): boolean {
    return this.groupName.trim().length > 0;
  }

  addMember(): void {
    if (!this.memberEmail.trim()) return;

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.memberEmail)) {
      this.snackbarService.showError('Please enter a valid email address');
      return;
    }

    // Check for duplicates
    if (this.invitedMembers.some(m => m.email === this.memberEmail)) {
      this.snackbarService.showError('This email is already added');
      return;
    }

    // Create initials from email
    const namePart = this.memberEmail.split('@')[0];
    const initials = namePart.substring(0, 2).toUpperCase();

    this.invitedMembers.push({
      id: crypto.randomUUID(),
      email: this.memberEmail,
      initials
    });

    this.memberEmail = '';
  }

  removeMember(memberId: string): void {
    this.invitedMembers = this.invitedMembers.filter(m => m.id !== memberId);
  }

  handleEmailKeydown(event: KeyboardEvent): void {
    if (event.key === 'Enter') {
      event.preventDefault();
      this.addMember();
    }
  }

  createGroup(): void {
    if (!this.canCreateGroup) {
      this.snackbarService.showError('Please enter a group name');
      return;
    }

    this.isSubmitting = true;

    const groupData = {
      name: this.groupName.trim(),
      listName: `${this.groupName.trim()} List`,
      invitedEmails: this.invitedMembers.map(m => m.email)
    };

    this.dataService.createGroup(groupData).subscribe({
      next: (response: unknown) => {
        const res = response as ApiGroupResponse;
        this.snackbarService.showSuccess(`Group "${this.groupName}" created! Share code: ${res.code}`);
        
        // Navigate to the new group's detail page
        if (res.group?.id) {
          this.router.navigate(['/group/detail', res.group.id]);
        } else {
          this.router.navigate(['/group/overview']);
        }
      },
      error: (err: Error) => {
        this.snackbarService.showError('Failed to create group: ' + err.message);
        this.isSubmitting = false;
      }
    });
  }

  goBack(): void {
    this.router.navigate(['/group/overview']);
  }
}

