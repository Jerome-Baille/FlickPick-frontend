import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { DataService } from 'src/app/core/services/data.service';
import { UserService } from 'src/app/core/services/user.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { User } from 'src/app/shared/models/User';
import { Event as MovieNightEvent } from '../../shared/models/Event';

interface GroupItem {
  id: number;
  name: string;
  adminIds?: number[];
  isAdmin?: boolean;
  code?: string;
  Users?: { id: number; username: string }[];
  Events?: MovieNightEvent[];
  coverImage?: string;
}

interface UpcomingSession {
  groupName: string;
  movieTitle: string;
  posterPath?: string;
  dateTime: string;
  isWinner?: boolean;
  status: 'confirmed' | 'voting';
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    RouterLink
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private dataService = inject(DataService);
  private userService = inject(UserService);
  private snackbarService = inject(SnackbarService);
  private router = inject(Router);

  userName = '';
  pendingVotes = 0;
  recentGroups: GroupItem[] = [];
  upcomingSessions: UpcomingSession[] = [];

  // Placeholder cover images for groups
  private readonly groupCovers = [
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&q=80',
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&q=80',
    'https://images.unsplash.com/photo-1440404653325-ab127d49abc1?w=800&q=80',
    'https://images.unsplash.com/photo-1478720568477-152d9b164e26?w=800&q=80'
  ];

  ngOnInit() {
    this.loadUserProfile();
    this.loadGroups();
  }

  private loadUserProfile() {
    this.userService.getUserProfileById().subscribe({
      next: (user: User) => {
        this.userName = user.username || 'Movie Fan';
      },
      error: () => {
        this.userName = 'Movie Fan';
      }
    });
  }

  private loadGroups() {
    this.dataService.getAllGroupsForUser().subscribe({
      next: (response: unknown) => {
        const groups = response as GroupItem[];
        if (groups && Array.isArray(groups) && groups.length > 0) {
          this.recentGroups = groups.slice(0, 4).map((group, index) => ({
            ...group,
            coverImage: this.groupCovers[index % this.groupCovers.length]
          }));
          this.extractUpcomingSessions(groups);
          // Calculate pending votes from events with voting status
          this.pendingVotes = groups.reduce((count, group) => {
            return count + (group.Events?.filter(e => e.status === 'voting').length || 0);
          }, 0);
        } else {
          this.recentGroups = [];
        }
      },
      error: (err) => this.snackbarService.showError(err.message)
    });
  }

  private extractUpcomingSessions(groups: GroupItem[]): void {
    const sessions: UpcomingSession[] = [];
    groups.forEach(group => {
      group.Events?.forEach(event => {
        if (event.status === 'voting' || (event.status === 'draft' && event.eventDate)) {
          sessions.push({
            groupName: group.name,
            movieTitle: event.name,
            dateTime: event.eventDate as string,
            status: event.status === 'voting' ? 'voting' : 'confirmed',
            isWinner: false
          });
        }
      });
    });
    this.upcomingSessions = sessions.slice(0, 5);
  }

  getGroupStatus(group: GroupItem): { label: string; type: 'voting' | 'selecting' | 'scheduled' | 'none' } {
    const votingEvent = group.Events?.find(e => e.status === 'voting');
    if (votingEvent) {
      return { label: 'VOTING ACTIVE', type: 'voting' };
    }
    
    const upcomingEvent = group.Events?.find(e => e.status === 'draft' && e.eventDate);
    if (upcomingEvent) {
      return { label: 'SCHEDULED', type: 'scheduled' };
    }

    const draftEvent = group.Events?.find(e => e.status === 'draft');
    if (draftEvent) {
      return { label: 'PLANNING', type: 'selecting' };
    }

    return { label: '', type: 'none' };
  }

  getNextSession(group: GroupItem): string {
    const nextEvent = group.Events?.find(e => e.status !== 'completed' && e.status !== 'cancelled');
    if (nextEvent?.eventDate) {
      return new Date(nextEvent.eventDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    return 'TBD';
  }

  getStatusIcon(type: string): string {
    switch (type) {
      case 'voting': return 'how_to_vote';
      case 'selecting': return 'edit_note';
      case 'scheduled': return 'event_available';
      default: return 'groups';
    }
  }

  getPrimaryEventId(group: GroupItem): number | null {
    if (!group.Events || group.Events.length === 0) {
      return null;
    }
    
    // Priority: voting > scheduled > draft > any
    const votingEvent = group.Events.find(e => e.status === 'voting');
    if (votingEvent) return votingEvent.id;
    
    const scheduledEvent = group.Events.find(e => e.status === 'draft' && e.eventDate);
    if (scheduledEvent) return scheduledEvent.id;
    
    const draftEvent = group.Events.find(e => e.status === 'draft');
    if (draftEvent) return draftEvent.id;
    
    // Return the most recent event
    return group.Events[group.Events.length - 1].id;
  }

  getEventRoute(group: GroupItem): string[] {
    const eventId = this.getPrimaryEventId(group);
    if (!eventId) {
      return ['/group/detail', group.id.toString()];
    }
    
    const status = this.getGroupStatus(group);
    if (status.type === 'voting') {
      return ['/event/voting', eventId.toString()];
    }
    return ['/event/detail', eventId.toString()];
  }

  createGroup() {
    this.router.navigate(['/group/create']);
  }
}
