import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { Router, RouterLink } from '@angular/router';
import { DataService } from 'src/app/core/services/data.service';
import { UserService } from 'src/app/core/services/user.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { CreateCollectionModalComponent } from 'src/app/shared/components/create-collection-modal/create-collection-modal.component';
import { User } from 'src/app/shared/models/User';
import { Group } from 'src/app/shared/models/Group';

interface GroupItem {
  id: number;
  name: string;
  isAdmin?: boolean;
  code?: string;
  Users?: { id: number; username: string }[];
  coverImage?: string;
  status?: 'voting' | 'selecting' | 'scheduled' | 'completed';
  nextSession?: string;
  scheduledMovie?: string;
}

interface MediaItem {
  id: number;
  title: string;
  mediaType: string;
  tmdbId: number;
  posterPath?: string;
}

interface UpcomingSession {
  groupName: string;
  movieTitle: string;
  posterPath?: string;
  dateTime: string;
  isWinner?: boolean;
  status: 'confirmed' | 'voting';
}

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
  favoriteMedia: MediaItem[] = [];
  upcomingSessions: UpcomingSession[] = [];
  watchedCount = 0;

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
    this.loadFavorites();
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
            coverImage: this.groupCovers[index % this.groupCovers.length],
            status: this.getRandomStatus(),
            nextSession: this.getRandomSessionText()
          }));
          // Calculate pending votes (placeholder logic)
          this.pendingVotes = this.recentGroups.filter(g => g.status === 'voting').length;
        } else {
          this.recentGroups = [];
        }
      },
      error: (err) => this.snackbarService.showError(err.message)
    });
  }

  private loadFavorites() {
    this.dataService.getUserFavorites().subscribe({
      next: (response: unknown) => {
        const favorites = response as MediaItem[];
        if (favorites && Array.isArray(favorites) && favorites.length > 0) {
          this.favoriteMedia = favorites.slice(0, 3);
          this.watchedCount = favorites.length;
          
          // Create upcoming sessions from favorites (placeholder)
          if (favorites.length > 0) {
            this.upcomingSessions = [
              {
                groupName: this.recentGroups[0]?.name || 'Movie Night',
                movieTitle: favorites[0].title,
                posterPath: favorites[0].posterPath,
                dateTime: 'Tonight · 8:00 PM',
                isWinner: true,
                status: 'confirmed'
              }
            ];
          }
        } else {
          this.favoriteMedia = [];
        }
      },
      error: (err) => this.snackbarService.showError(err.message)
    });
  }

  private getRandomStatus(): 'voting' | 'selecting' | 'scheduled' {
    const statuses: ('voting' | 'selecting' | 'scheduled')[] = ['voting', 'selecting', 'scheduled'];
    return statuses[Math.floor(Math.random() * statuses.length)];
  }

  private getRandomSessionText(): string {
    const texts = ['Friday the 13th', 'This weekend', 'Next Saturday', 'TBD'];
    return texts[Math.floor(Math.random() * texts.length)];
  }

  getStatusLabel(status?: string): string {
    switch (status) {
      case 'voting': return 'VOTING ACTIVE';
      case 'selecting': return 'HOST SELECTING';
      case 'scheduled': return 'SCHEDULED';
      default: return '';
    }
  }

  getStatusIcon(status?: string): string {
    switch (status) {
      case 'voting': return 'how_to_vote';
      case 'selecting': return 'edit_note';
      case 'scheduled': return 'event_available';
      default: return 'groups';
    }
  }

  createGroup() {
    this.router.navigate(['/group/create']);
  }
}
