import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { CreateCardComponent } from 'src/app/shared/components/create-card/create-card.component';
import { HeaderBadgeComponent } from 'src/app/shared/components/header-badge/header-badge.component';
import { DataService } from 'src/app/core/services/data.service';
import { UserService } from 'src/app/core/services/user.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { User } from 'src/app/shared/models/User';
import { Event as MovieNightEvent } from '../../shared/models/Event';

interface GroupItem {
  id: number;
  name: string;
  Users?: { id: number; username: string }[];
  Events?: MovieNightEvent[];
  coverImage?: string;
}

interface DisplayEvent {
  id: number;
  name: string;
  eventDate?: string | Date;
  status?: string;
  groupId: number;
  groupName: string;
  coverImage?: string;
  isWinner?: boolean;
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
    RouterLink,
    CreateCardComponent,
    HeaderBadgeComponent
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

  // Raw groups from API
  private allGroups: GroupItem[] = [];

  // Flattened events
  private allEvents: DisplayEvent[] = [];

  // Event lists for tabs
  activeEvents: DisplayEvent[] = [];
  archivedEvents: DisplayEvent[] = [];

  // Coming soon sessions (scheduled events with future dates)
  upcomingSessions: UpcomingSession[] = [];
  readonly maxUpcomingSessions = 5;

  /**
   * Formats a date string as 'SAT, JAN 3 · 7:00 PM' or 'TONIGHT · 7:00 PM' if today.
   */
  formatSessionDateTime(dateTime?: string | Date): string {
    if (!dateTime) return '';
    let date: Date;
    if (typeof dateTime === 'string') {
      date = new Date(dateTime);
    } else if (dateTime instanceof Date) {
      date = dateTime;
    } else {
      // Fallback - attempt to coerce
      date = new Date(String(dateTime));
    }

    if (isNaN(date.getTime())) return '';

    const now = new Date();
    const isToday = date.getFullYear() === now.getFullYear() &&
      date.getMonth() === now.getMonth() &&
      date.getDate() === now.getDate();

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

  // Placeholder cover images (used when group doesn't provide one)
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
        if (groups && Array.isArray(groups)) {
          // Ensure each group has a cover
          this.allGroups = groups.map((group, index) => ({
            ...group,
            coverImage: group.coverImage || this.groupCovers[index % this.groupCovers.length]
          }));

          // Build flattened events list and categorize
          this.extractEventsFromGroups();
          this.categorizeEvents();
          this.extractUpcomingSessions();

          // Calculate pending votes from events with voting status
          this.pendingVotes = this.allEvents.filter(e => e.status === 'voting').length;
        } else {
          this.allGroups = [];
          this.allEvents = [];
          this.activeEvents = [];
          this.archivedEvents = [];
        }
      },
      error: (err) => this.snackbarService.showError(err.message)
    });
  }

  private extractEventsFromGroups(): void {
    const events: DisplayEvent[] = [];
    this.allGroups.forEach(group => {
      group.Events?.forEach(ev => {
        events.push({
          id: ev.id,
          name: ev.name,
          eventDate: ev.eventDate,
          status: ev.status,
          groupId: group.id,
          groupName: group.name,
          coverImage: group.coverImage,
          isWinner: ev.status === 'completed'
        });
      });
    });
    this.allEvents = events;
  }

  /**
   * Categorizes events into active and archived based on their status.
   * Active: 'draft' or 'voting'
   * Archived: 'completed' or 'cancelled'
   */
  private categorizeEvents(): void {
    this.activeEvents = this.allEvents.filter(e => e.status === 'draft' || e.status === 'voting' || !e.status);
    this.archivedEvents = this.allEvents.filter(e => e.status === 'completed' || e.status === 'cancelled');
  }

  /**
   * Extracts upcoming sessions from all events.
   */
  private extractUpcomingSessions(): void {
    const now = new Date();
    const sessions: UpcomingSession[] = [];

    this.allEvents.forEach(event => {
      if (event.eventDate) {
        const eventDate = new Date(event.eventDate);
        if (eventDate > now) {
          sessions.push({
            groupId: event.groupId,
            groupName: event.groupName,
            eventId: event.id,
            movieTitle: event.name,
            dateTime: (typeof event.eventDate === 'string') ? event.eventDate : (event.eventDate ? event.eventDate.toISOString() : ''),
            status: 'scheduled',
            isWinner: event.isWinner
          });
        }
      }
    });

    this.upcomingSessions = sessions
      .sort((a, b) => new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime())
      .slice(0, this.maxUpcomingSessions);
  }

  /**
   * Returns the events to display based on the active tab.
   */
  get displayedEvents(): DisplayEvent[] {
    return this.activeTab === 'active' ? this.activeEvents : this.archivedEvents;
  }

  /**
   * Switches between active and archived tabs.
   */
  switchTab(tab: DashboardTab): void {
    this.activeTab = tab;
  }

  getEventStatus(event: DisplayEvent): { label: string; type: 'voting' | 'selecting' | 'scheduled' | 'archived' | 'none' } {
    if (event.status === 'voting') return { label: 'VOTING ACTIVE', type: 'voting' };
    if (event.status === 'draft' && event.eventDate) return { label: 'SCHEDULED', type: 'scheduled' };
    if (event.status === 'draft') return { label: 'PLANNING', type: 'selecting' };
    if (event.status === 'completed') return { label: 'COMPLETED', type: 'archived' };
    if (event.status === 'cancelled') return { label: 'CANCELLED', type: 'archived' };
    return { label: '', type: 'none' };
  }

  getStatusIcon(type: string): string {
    switch (type) {
      case 'voting': return 'how_to_vote';
      case 'selecting': return 'edit_note';
      case 'scheduled': return 'event_available';
      case 'archived': return 'archive';
      default: return 'event';
    }
  }

  getEventRoute(event: DisplayEvent): string[] {
    if (event.status === 'voting') {
      return ['/event/voting', event.id.toString()];
    }
    return ['/event/detail', event.id.toString()];
  }

  createGroup() {
    // Keep existing flow for creating groups as before
    this.router.navigate(['/group/create']);
  }
}
