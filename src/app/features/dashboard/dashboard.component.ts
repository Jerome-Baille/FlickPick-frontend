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
  groupId: number;
  groupName: string;
  eventId: number;
  movieTitle: string;
  posterPath?: string;
  dateTime: string;
  isWinner?: boolean;
  status: 'scheduled';
}

type DashboardTab = 'active' | 'archived';

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
  activeTab: DashboardTab = 'active';
  
  // All groups from API
  private allGroups: GroupItem[] = [];
  
  // Filtered groups for display
  activeGroups: GroupItem[] = [];
  archivedGroups: GroupItem[] = [];
  
  // Coming soon sessions (scheduled events with future dates)
  upcomingSessions: UpcomingSession[] = [];
  readonly maxUpcomingSessions = 5;

  /**
   * Formats a date string as 'SAT, JAN 3 · 7:00 PM' or 'TONIGHT · 7:00 PM' if today.
   */
  formatSessionDateTime(dateTime: string): string {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    const now = new Date();
    // Check if the date is today (local time)
    const isToday = date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();
    // Always show minutes (e.g., 7:00 PM)
    const timeString = date.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
    if (isToday) {
      return `TONIGHT · ${timeString}`;
    }
    const day = date.toLocaleDateString('en-US', { weekday: 'short' });
    const month = date.toLocaleDateString('en-US', { month: 'short' });
    const dayNum = date.getDate();
    return `${day}, ${month} ${dayNum} · ${timeString}`;
  }

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
          this.allGroups = groups.map((group, index) => ({
            ...group,
            coverImage: this.groupCovers[index % this.groupCovers.length]
          }));
          
          this.categorizeGroups();
          this.extractUpcomingSessions();
          
          // Calculate pending votes from events with voting status
          this.pendingVotes = this.allGroups.reduce((count, group) => {
            return count + (group.Events?.filter(e => e.status === 'voting').length || 0);
          }, 0);
        } else {
          this.allGroups = [];
          this.activeGroups = [];
          this.archivedGroups = [];
        }
      },
      error: (err) => this.snackbarService.showError(err.message)
    });
  }

  /**
   * Categorizes groups into active and archived based on their events.
   * Active: Groups with at least one event in 'draft' or 'voting' status
   * Archived: Groups where all events are 'completed' or 'cancelled'
   */
  private categorizeGroups(): void {
    this.activeGroups = [];
    this.archivedGroups = [];

    this.allGroups.forEach(group => {
      const hasActiveEvents = group.Events?.some(
        e => e.status === 'draft' || e.status === 'voting'
      );
      
      if (hasActiveEvents || !group.Events || group.Events.length === 0) {
        // Groups with active events or no events go to active tab
        this.activeGroups.push(group);
      } else {
        // Groups where all events are completed/cancelled go to archived
        this.archivedGroups.push(group);
      }
    });
  }

  /**
   * Extracts upcoming sessions from all groups.
   * Only includes events with a future eventDate that are scheduled (completed voting or draft with date).
   * Sorted by date ascending, limited to maxUpcomingSessions.
   */
  private extractUpcomingSessions(): void {
    const now = new Date();
    const sessions: UpcomingSession[] = [];

    this.allGroups.forEach(group => {
      group.Events?.forEach(event => {
        // Only include events with a scheduled date in the future
        // that are either completed (winner chosen) or draft with a date set
        if (event.eventDate) {
          const eventDate = new Date(event.eventDate);
          if (eventDate > now && (event.status === 'completed' || event.status === 'draft')) {
            sessions.push({
              groupId: group.id,
              groupName: group.name,
              eventId: event.id,
              movieTitle: event.name,
              dateTime: event.eventDate as string,
              status: 'scheduled',
              isWinner: event.status === 'completed'
            });
          }
        }
      });
    });

    // Sort by date ascending and limit
    this.upcomingSessions = sessions
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
      .slice(0, this.maxUpcomingSessions);
  }

  /**
   * Returns the groups to display based on the active tab.
   */
  get displayedGroups(): GroupItem[] {
    return this.activeTab === 'active' ? this.activeGroups : this.archivedGroups;
  }

  /**
   * Switches between active and archived tabs.
   */
  switchTab(tab: DashboardTab): void {
    this.activeTab = tab;
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
