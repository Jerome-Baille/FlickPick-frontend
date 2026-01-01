import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatRadioModule } from '@angular/material/radio';
import { debounceTime, firstValueFrom, Subject } from 'rxjs';
import { TmdbService } from 'src/app/core/services/tmdb.service';
import { DataService } from 'src/app/core/services/data.service';
import { SnackbarService } from 'src/app/core/services/snackbar.service';
import { environment } from 'src/environments/environment';

interface Genre {
  id: number;
  name: string;
}

interface SelectedMedia {
  tmdbId: number;
  mediaType: 'movie' | 'tv';
  title: string;
  releaseDate?: string;
  posterPath?: string;
  overview?: string;
  voteAverage?: number;
  runtime?: number;
  genres?: Genre[];
}

interface SearchResult {
  id: number;
  title?: string;
  name?: string;
  release_date?: string;
  first_air_date?: string;
  poster_path?: string;
  overview?: string;
  vote_average?: number;
  media_type?: 'movie' | 'tv';
}

interface GroupOption {
  id: number;
  name: string;
  code: string;
  memberCount: number;
}

interface ApiEventResponse {
  message: string;
  event?: {
    id: number;
    name: string;
    groupId: number;
  };
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
  selector: 'app-create-event',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSelectModule,
    MatRadioModule
  ],
  templateUrl: './create-event.component.html',
  styleUrl: './create-event.component.scss'
})
export class CreateEventComponent implements OnInit {
  private tmdbService = inject(TmdbService);
  private dataService = inject(DataService);
  private snackbarService = inject(SnackbarService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  TMDB_IMAGE_BASE_URL = environment.TMDB_IMAGE_BASE_URL_300;

  // Current step
  currentStep: 'group' | 'movies' | 'schedule' = 'group';

  // Group selection
  groupMode: 'existing' | 'new' = 'existing';
  existingGroups: GroupOption[] = [];
  selectedGroupId: number | null = null;
  newGroupName = '';
  isLoadingGroups = true;

  // Search state
  searchQuery = '';
  searchResults: SelectedMedia[] = [];
  isSearching = false;
  private searchSubject = new Subject<string>();

  // Ballot state
  selectedMovies: SelectedMedia[] = [];
  maxSelections = 10;

  // Expanded cards state
  expandedCards = new Set<number>();

  // Event details
  eventName = '';
  listName = '';

  // Calendar state
  currentMonth = new Date();
  selectedDate: Date | null = null;
  calendarDays: (number | null)[] = [];
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Time selection
  startTime = '20:00';
  endTime = '23:00';
  timeOptions: string[] = [];

  // Loading state
  isSubmitting = false;

  ngOnInit() {
    // Check if groupId is provided in query params
    const groupIdParam = this.route.snapshot.queryParams['groupId'];
    if (groupIdParam) {
      this.selectedGroupId = +groupIdParam;
      this.groupMode = 'existing';
    }

    // Load existing groups
    this.loadExistingGroups();

    // Set up debounced search
    this.searchSubject.pipe(
      debounceTime(500)
    ).subscribe(query => {
      if (query.trim().length > 0) {
        this.performSearch(query);
      } else {
        this.searchResults = [];
      }
    });

    // Initialize calendar
    this.generateCalendarDays();

    // Generate time options
    this.generateTimeOptions();
  }

  loadExistingGroups(): void {
    this.isLoadingGroups = true;
    this.dataService.getAllGroupsForUser().subscribe({
      next: (response: unknown) => {
        const groups = response as {
          id: number;
          name: string;
          code: string;
          Users?: unknown[];
        }[];
        this.existingGroups = groups.map(g => ({
          id: g.id,
          name: g.name,
          code: g.code,
          memberCount: g.Users?.length || 0
        }));
        this.isLoadingGroups = false;
        
        // If groupId was passed and found, proceed to movies step
        if (this.selectedGroupId && this.existingGroups.some(g => g.id === this.selectedGroupId)) {
          this.currentStep = 'movies';
        }
      },
      error: (err: Error) => {
        this.snackbarService.showError('Failed to load groups: ' + err.message);
        this.isLoadingGroups = false;
      }
    });
  }

  // ===== STEP NAVIGATION =====

  canProceedFromGroup(): boolean {
    if (this.groupMode === 'existing') {
      return this.selectedGroupId !== null;
    }
    return this.newGroupName.trim().length > 0;
  }

  canProceedFromMovies(): boolean {
    return this.selectedMovies.length >= 2;
  }

  canSubmit(): boolean {
    return this.selectedDate !== null && this.eventName.trim().length > 0;
  }

  goToStep(step: 'group' | 'movies' | 'schedule'): void {
    if (step === 'movies' && !this.canProceedFromGroup()) {
      this.snackbarService.showError('Please select or create a group first');
      return;
    }
    if (step === 'schedule' && !this.canProceedFromMovies()) {
      this.snackbarService.showError('Please add at least 2 movies');
      return;
    }
    this.currentStep = step;
  }

  nextStep(): void {
    if (this.currentStep === 'group') {
      this.goToStep('movies');
    } else if (this.currentStep === 'movies') {
      this.goToStep('schedule');
    }
  }

  previousStep(): void {
    if (this.currentStep === 'movies') {
      this.currentStep = 'group';
    } else if (this.currentStep === 'schedule') {
      this.currentStep = 'movies';
    }
  }

  // ===== SEARCH & MOVIE SELECTION =====

  onSearchInput(value: string) {
    this.searchQuery = value;
    this.isSearching = true;
    this.searchSubject.next(value);
  }

  private performSearch(query: string) {
    this.tmdbService.searchMulti(query).subscribe({
      next: (response: unknown) => {
        const data = response as { results: SearchResult[] };
        this.searchResults = data.results
          .filter(item => item.media_type === 'movie' || item.media_type === 'tv')
          .slice(0, 12)
          .map(item => this.mapSearchResult(item));
        this.isSearching = false;
      },
      error: (err) => {
        this.snackbarService.showError('Search failed: ' + err.message);
        this.isSearching = false;
      }
    });
  }

  private mapSearchResult(item: SearchResult): SelectedMedia {
    return {
      tmdbId: item.id,
      mediaType: item.media_type || 'movie',
      title: item.title || item.name || '',
      releaseDate: item.release_date || item.first_air_date,
      posterPath: item.poster_path,
      overview: item.overview,
      voteAverage: item.vote_average
    };
  }

  addToShortlist(movie: SelectedMedia) {
    if (this.selectedMovies.length >= this.maxSelections) {
      this.snackbarService.showError(`Maximum ${this.maxSelections} movies allowed`);
      return;
    }

    if (this.selectedMovies.some(m => m.tmdbId === movie.tmdbId)) {
      this.snackbarService.showError('Movie already in shortlist');
      return;
    }

    this.selectedMovies.push(movie);
  }

  removeFromShortlist(index: number) {
    this.selectedMovies.splice(index, 1);
  }

  clearAll() {
    this.selectedMovies = [];
  }

  isInShortlist(movie: SelectedMedia): boolean {
    return this.selectedMovies.some(m => m.tmdbId === movie.tmdbId);
  }

  toggleCardExpand(tmdbId: number) {
    if (this.expandedCards.has(tmdbId)) {
      this.expandedCards.delete(tmdbId);
    } else {
      this.expandedCards.add(tmdbId);
    }
  }

  isCardExpanded(tmdbId: number): boolean {
    return this.expandedCards.has(tmdbId);
  }

  // ===== CALENDAR & TIME =====

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
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      this.calendarDays.push(null);
    }
    
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

  // ===== SUBMIT =====

  async createEvent(): Promise<void> {
    if (!this.canSubmit()) {
      this.snackbarService.showError('Please fill in all required fields');
      return;
    }

    this.isSubmitting = true;

    try {
      let groupId = this.selectedGroupId;

      // Create new group if needed
      if (this.groupMode === 'new') {
        const groupData = {
          name: this.newGroupName.trim(),
          listName: `${this.newGroupName.trim()} Shortlist`
        };

        const groupResponse = await firstValueFrom(this.dataService.createGroup(groupData)) as ApiGroupResponse;
        if (groupResponse?.group?.id) {
          groupId = groupResponse.group.id;
          this.snackbarService.showSuccess(`Group created! Share code: ${groupResponse.code}`);
        } else {
          throw new Error('Failed to create group');
        }
      }

      if (!groupId) {
        throw new Error('No group selected');
      }

      // Combine date and time
      const [startHours, startMinutes] = this.startTime.split(':');
      const eventDate = new Date(this.selectedDate!);
      eventDate.setHours(parseInt(startHours, 10), parseInt(startMinutes, 10), 0, 0);

      // Create event with media items
      const eventData = {
        groupId: groupId,
        name: this.eventName.trim() || `Movie Night`,
        eventDate: eventDate.toISOString(),
        startTime: this.startTime,
        endTime: this.endTime,
        listName: this.listName.trim() || `${this.eventName.trim()} Shortlist`,
        selectedMedia: this.selectedMovies.map(media => ({
          tmdbId: media.tmdbId,
          mediaType: media.mediaType,
          title: media.title,
          releaseDate: media.releaseDate,
          posterPath: media.posterPath,
          overview: media.overview
        }))
      };

      this.dataService.createEventWithMedia(eventData).subscribe({
        next: (response: ApiEventResponse) => {
          this.snackbarService.showSuccess('Event created successfully!');
          this.router.navigate(['/event/detail', response.event?.id]);
        },
        error: (err: Error) => {
          this.snackbarService.showError('Failed to create event: ' + err.message);
          this.isSubmitting = false;
        }
      });

    } catch (error) {
      this.snackbarService.showError('Failed to create event: ' + (error as Error).message);
      this.isSubmitting = false;
    }
  }

  // ===== HELPERS =====

  getRatingStars(rating?: number): string {
    if (!rating) return '0.0';
    return rating.toFixed(1);
  }

  getYear(releaseDate?: string): string {
    if (!releaseDate) return 'TBD';
    return new Date(releaseDate).getFullYear().toString();
  }

  getPosterUrl(posterPath?: string): string {
    if (!posterPath) return 'assets/placeholder-poster.png';
    return this.TMDB_IMAGE_BASE_URL + posterPath;
  }

  getSelectedGroupName(): string {
    if (this.groupMode === 'new') {
      return this.newGroupName;
    }
    const group = this.existingGroups.find(g => g.id === this.selectedGroupId);
    return group?.name || '';
  }

  goBack(): void {
    this.router.navigate(['/group/overview']);
  }
}
