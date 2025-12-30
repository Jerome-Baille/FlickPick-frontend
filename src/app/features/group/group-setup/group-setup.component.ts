import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ShortlistService, SelectedMedia } from 'src/app/core/services/shortlist.service';
import { DataService } from 'src/app/core/services/data.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { environment } from 'src/environments/environment.prod';

interface GuestMember {
  id: string;
  name: string;
  email: string;
  isHost: boolean;
  status: 'confirmed' | 'pending';
  initials: string;
}

interface ApiResponse {
  message: string;
  group?: unknown;
  code?: string;
}

@Component({
  selector: 'app-group-setup',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './group-setup.component.html',
  styleUrl: './group-setup.component.scss'
})
export class GroupSetupComponent implements OnInit {
  private shortlistService = inject(ShortlistService);
  private dataService = inject(DataService);
  private snackbarService = inject(SnackbarService);
  private router = inject(Router);

  TMDB_IMAGE_BASE_URL = environment.TMDB_IMAGE_BASE_URL_300;

  // Group data from previous step
  groupName = '';
  selectedMovies: SelectedMedia[] = [];

  // Calendar state
  currentMonth = new Date();
  selectedDate: Date | null = null;
  calendarDays: (number | null)[] = [];
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Time selection
  startTime = '20:00';
  endTime = '23:00';
  timeOptions: string[] = [];

  // Guest list
  guestEmail = '';
  guests: GuestMember[] = [];

  // Loading state
  isSubmitting = false;

  ngOnInit(): void {
    // Get data from shortlist service
    const data = this.shortlistService.getShortlistData();
    if (!data) {
      this.snackbarService.showError('No shortlist data found. Please start over.');
      this.router.navigate(['/group/create']);
      return;
    }

    this.groupName = data.groupName;
    this.selectedMovies = data.selectedMovies;

    // Initialize calendar
    this.generateCalendarDays();

    // Generate time options (every 30 minutes)
    this.generateTimeOptions();

    // Add host as first guest (mock data - in real app, get from auth)
    this.guests.push({
      id: 'host',
      name: 'You',
      email: '',
      isHost: true,
      status: 'confirmed',
      initials: 'ME'
    });
  }

  generateTimeOptions(): void {
    for (let hour = 0; hour < 24; hour++) {
      for (const minute of ['00', '30']) {
        const time = `${hour.toString().padStart(2, '0')}:${minute}`;
        this.timeOptions.push(time);
      }
    }
  }

  formatTime(time: string): string {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours, 10);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const hour12 = hour % 12 || 12;
    return `${hour12.toString().padStart(2, '0')}:${minutes} ${ampm}`;
  }

  generateCalendarDays(): void {
    const year = this.currentMonth.getFullYear();
    const month = this.currentMonth.getMonth();
    
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const startingDayOfWeek = firstDay.getDay();
    const totalDays = lastDay.getDate();
    
    this.calendarDays = [];
    
    // Add empty slots for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      this.calendarDays.push(null);
    }
    
    // Add all days of the month
    for (let day = 1; day <= totalDays; day++) {
      this.calendarDays.push(day);
    }
  }

  get currentMonthName(): string {
    return this.currentMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
  }

  previousMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() - 1,
      1
    );
    this.generateCalendarDays();
  }

  nextMonth(): void {
    this.currentMonth = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth() + 1,
      1
    );
    this.generateCalendarDays();
  }

  selectDate(day: number | null): void {
    if (day === null) return;
    
    const selected = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth(),
      day
    );
    
    // Don't allow past dates
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (selected < today) {
      this.snackbarService.showError('Cannot select a past date');
      return;
    }
    
    this.selectedDate = selected;
  }

  isSelectedDay(day: number | null): boolean {
    if (day === null || !this.selectedDate) return false;
    return (
      this.selectedDate.getDate() === day &&
      this.selectedDate.getMonth() === this.currentMonth.getMonth() &&
      this.selectedDate.getFullYear() === this.currentMonth.getFullYear()
    );
  }

  isToday(day: number | null): boolean {
    if (day === null) return false;
    const today = new Date();
    return (
      today.getDate() === day &&
      today.getMonth() === this.currentMonth.getMonth() &&
      today.getFullYear() === this.currentMonth.getFullYear()
    );
  }

  isPastDay(day: number | null): boolean {
    if (day === null) return false;
    const date = new Date(
      this.currentMonth.getFullYear(),
      this.currentMonth.getMonth(),
      day
    );
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  }

  addGuest(): void {
    if (!this.guestEmail.trim()) return;
    
    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(this.guestEmail)) {
      this.snackbarService.showError('Please enter a valid email address');
      return;
    }

    // Check for duplicates
    if (this.guests.some(g => g.email === this.guestEmail)) {
      this.snackbarService.showError('This email is already added');
      return;
    }

    // Create initials from email
    const namePart = this.guestEmail.split('@')[0];
    const initials = namePart.substring(0, 2).toUpperCase();

    this.guests.push({
      id: crypto.randomUUID(),
      name: namePart,
      email: this.guestEmail,
      isHost: false,
      status: 'pending',
      initials
    });

    this.guestEmail = '';
  }

  removeGuest(guestId: string): void {
    this.guests = this.guests.filter(g => g.id !== guestId);
  }

  get guestCount(): number {
    return this.guests.length;
  }

  copyInviteLink(): void {
    // In real app, generate actual invite link
    const inviteLink = `${window.location.origin}/group/join?invite=PENDING`;
    navigator.clipboard.writeText(inviteLink).then(() => {
      this.snackbarService.showSuccess('Invite link copied to clipboard!');
    });
  }

  goBack(): void {
    this.router.navigate(['/group/create']);
  }

  saveDraft(): void {
    // In real app, save to local storage or server
    this.snackbarService.showSuccess('Draft saved!');
  }

  launchVotingSession(): void {
    if (!this.selectedDate) {
      this.snackbarService.showError('Please select a date for the event');
      return;
    }

    if (this.selectedMovies.length < 2) {
      this.snackbarService.showError('Please add at least 2 movies to vote on');
      return;
    }

    this.isSubmitting = true;

    // Combine date and time
    const [startHours, startMinutes] = this.startTime.split(':');
    const eventDate = new Date(this.selectedDate);
    eventDate.setHours(parseInt(startHours, 10), parseInt(startMinutes, 10), 0, 0);

    // Create list first
    const listData = {
      name: `${this.groupName} Shortlist`,
      selectedMedia: this.selectedMovies.map(media => ({
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
        // Then create group with event date
        const groupData = {
          name: this.groupName.trim(),
          listName: listData.name,
          eventDate: eventDate.toISOString(),
          startTime: this.startTime,
          endTime: this.endTime,
          invitedEmails: this.guests.filter(g => !g.isHost).map(g => g.email)
        };

        this.dataService.createGroup(groupData).subscribe({
          next: (groupResponse: unknown) => {
            const res = groupResponse as ApiResponse;
            this.snackbarService.showSuccess(`Group created! Share code: ${res.code}`);
            
            // Clear shortlist data
            this.shortlistService.clearShortlistData();
            
            // Navigate to group overview
            setTimeout(() => {
              this.router.navigate(['/group/overview']);
            }, 2000);
          },
          error: (err: Error) => {
            this.snackbarService.showError('Failed to create group: ' + err.message);
            this.isSubmitting = false;
          }
        });
      },
      error: (err: Error) => {
        this.snackbarService.showError('Failed to create list: ' + err.message);
        this.isSubmitting = false;
      }
    });
  }

  getYear(releaseDate?: string): string {
    if (!releaseDate) return 'TBD';
    return new Date(releaseDate).getFullYear().toString();
  }

  getPosterUrl(posterPath?: string): string {
    if (!posterPath) return 'assets/placeholder-poster.png';
    return this.TMDB_IMAGE_BASE_URL + posterPath;
  }
}
