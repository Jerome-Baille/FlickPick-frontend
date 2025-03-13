import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { TmdbService } from 'src/app/services/tmdb.service';
import { forkJoin, Observable } from 'rxjs';
import { SnackbarService } from 'src/app/services/snackbar.service';
import { environment } from 'src/environments/environment.prod';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MediaTableViewComponent } from 'src/app/shared/media-table-view/media-table-view.component';
import { trigger, state, style, animate, transition } from '@angular/animations';

@Component({
    selector: 'app-choosing-game',
    imports: [
      CommonModule,
      MatCardModule,
      MatCheckboxModule,
      MatProgressBarModule,
      MatIconModule,
      MatButtonModule,
      MediaTableViewComponent
    ],
    templateUrl: './choosing-game.component.html',
    styleUrls: ['./choosing-game.component.scss'],
    animations: [
      // Fade animation for general transitions
      trigger('fadeAnimation', [
        transition(':enter', [
          style({ opacity: 0 }),
          animate('400ms ease-in', style({ opacity: 1 }))
        ]),
        transition(':leave', [
          animate('400ms ease-out', style({ opacity: 0 }))
        ])
      ]),
      // Card selection animation
      trigger('cardAnimation', [
        state('A', style({
          transform: 'translateX(-10px)'
        })),
        state('B', style({
          transform: 'translateX(10px)'
        })),
        transition('* => A', [
          animate('300ms ease-out')
        ]),
        transition('* => B', [
          animate('300ms ease-out')
        ]),
        transition('* => null', [
          animate('300ms ease-in')
        ])
      ]),
      // Genre animation for staggered entry
      trigger('genreAnimation', [
        transition(':enter', [
          style({ opacity: 0, transform: 'translateY(20px)' }),
          animate('400ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
        ])
      ]),
      // Celebration animation for game completion
      trigger('celebrateAnimation', [
        transition(':enter', [
          style({ opacity: 0, transform: 'scale(0.8)' }),
          animate('600ms cubic-bezier(0.175, 0.885, 0.32, 1.275)', 
            style({ opacity: 1, transform: 'scale(1)' }))
        ])
      ])
    ],
    standalone: true
})
export class ChoosingGameComponent implements OnInit {
  TMDB_IMAGE_BASE_URL_300 = environment.TMDB_IMAGE_BASE_URL_300;
  mediaItems!: any[];
  selectedChoice: string | null = null;
  choiceA: any = { title: 'Movies', condition: 'mediaItem.mediaType === "movie"' };
  choiceB: any = { title: 'TV Shows', condition: 'mediaItem.mediaType === "tv"' };
  isGameOver = false;
  currentRound = 1;
  displayedItems: any[] = [];
  winningItems: any[] = [];
  genresSet: Set<string> = new Set();
  userSelectedGenres: Set<string> = new Set();
  rankings: any[] = [];
  filteredMediaItems: any[] = [];
  groupId!: number;
  initialMediaItemCount: number = 0;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private tmdbService: TmdbService,
    private snackbarService: SnackbarService
  ) { }

  // Get the step description without round number
  getRoundDescription(): string {
    switch (this.currentRound) {
      case 1:
        return 'Choose media type preference';
      case 2:
        return 'Select your favorite genres';
      default:
        return 'Pick your favorite';
    }
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.groupId = params['groupId'];
      this.dataService.getAllMediaItemsForUserInGroup(this.groupId).subscribe({
        next: (data: any) => {
          let mediaItems = data.mediaItems.MediaItems;
          this.initialMediaItemCount = mediaItems.length;

          // Create an array of observables to fetch runtime and genres for each media item
          const fetchObservables: Observable<any>[] = mediaItems.map((mediaItem: any) => {
            if (mediaItem.mediaType === 'movie') {
              return this.tmdbService.getMovieDetails(mediaItem.tmdbId);
            } else if (mediaItem.mediaType === 'tv') {
              return this.tmdbService.getTVShowDetails(mediaItem.tmdbId);
            }
            return null;
          });

          // Use forkJoin to wait for all fetchObservables to complete
          forkJoin(fetchObservables).subscribe((movieDetails: any[]) => {
            // Assign runtime and genres to media items
            mediaItems.forEach((mediaItem: any, index: number) => {
              if (mediaItem.mediaType === 'movie') {
                mediaItem.runtime = movieDetails[index].runtime;
                mediaItem.genres = movieDetails[index].genres;
                this.updateGenresSet(mediaItem.genres);
              } else if (mediaItem.mediaType === 'tv') {
                mediaItem.runtime = movieDetails[index].episode_run_time[0];
                mediaItem.genres = movieDetails[index].genres;
                this.updateGenresSet(mediaItem.genres);
              }
            });

            this.mediaItems = mediaItems;

            // Initialize the game (you can customize this logic)
            this.initializeGame();
          });
        },
        error: (err: any) => {
          this.snackbarService.showError(err);
        }
      });
    });
  }

  initializeGame() {
    // Initialize points for media items
    for (const mediaItem of this.mediaItems) {
      mediaItem.points = 0;
    }

    // Check if all media items are of the same type to skip Round 1 if needed
    const hasMovies = this.mediaItems.some(item => item.mediaType === 'movie');
    const hasTVShows = this.mediaItems.some(item => item.mediaType === 'tv');
    
    // If all items are of the same type, skip to Round 2
    if (hasMovies && !hasTVShows) {
      this.selectedChoice = 'A'; // Movies
      this.currentRound = 2;
    } else if (!hasMovies && hasTVShows) {
      this.selectedChoice = 'B'; // TV Shows
      this.currentRound = 2;
    }
    
    // Start the game
    this.startRound();
  }

  startRound() {
    if (this.currentRound === 1) {
      // The first round, select choices based on media type (movie vs TV)
      this.displayedItems = this.mediaItems.slice();
      // Update the choices for the first round
      this.choiceA = { title: 'Movies', condition: 'mediaItem.mediaType === "movie"' };
      this.choiceB = { title: 'TV Shows', condition: 'mediaItem.mediaType === "tv"' };
    } else if (this.currentRound === 2) {
      // Second round, filter by user-selected media type (movie or TV show)
      this.displayedItems = this.mediaItems.filter((mediaItem: any) => {
        if (this.selectedChoice === 'A' && mediaItem.mediaType === 'movie') {
          return true;
        } else if (this.selectedChoice === 'B' && mediaItem.mediaType === 'tv') {
          return true;
        }
        return false;
      });

      if (this.displayedItems.length === 0) {
        // No media items match the user's selection
        this.snackbarService.showError('No media items match your selection');
        return;
      }

      if (this.displayedItems.length === 1) {
        // give one point to the winning media item
        this.displayedItems[0].points += 1;
        this.isGameOver = true;
        this.rankings = [...this.mediaItems].sort((a, b) => b.points - a.points);

        // Save the rankings to the database
        this.saveVotes();

        return;
      }
    } else {
      // Subsequent rounds, use the remaining media items
      this.displayedItems = this.filteredMediaItems.slice();
    }

    this.mediaSelection();
  }

  mediaSelection() {
    if (this.currentRound > 2) {
      this.displayedItems = this.filteredMediaItems;
    }

    // Check if there's only one media item left
    if (this.displayedItems.length <= 1) {

      if (this.winningItems.length > 1) {
        this.displayedItems = this.winningItems;
        this.winningItems = [];
        this.currentRound++;
      }

      if (this.winningItems.length === 1) {
        this.isGameOver = true;
        this.rankings = [...this.mediaItems].sort((a, b) => b.points - a.points);

        // Save the rankings to the database
        this.saveVotes();

        return;
      }

      if (this.displayedItems.length === 1 && this.winningItems.length === 0) {
        this.displayedItems[0].points += 1;
        this.isGameOver = true;
        this.rankings = [...this.mediaItems].sort((a, b) => b.points - a.points);

        // Save the rankings to the database
        this.saveVotes();
        return;
      }
    }

    // Select two random media items for the round
    const [choice1, choice2] = this.selectRandomMediaItems(this.displayedItems);
    this.choiceA.mediaItem = choice1;
    this.choiceB.mediaItem = choice2;

    if (this.currentRound > 2) {
      this.choiceA.title = choice1.title;
      this.choiceB.title = choice2.title;
    }

    // Reset user choice and genres for the new round
    this.selectedChoice = null;
    this.userSelectedGenres.clear();
  }

  selectRandomMediaItems(mediaItems: any[]): [any, any] {
    // Implement logic to select two random media items for the round
    const index1 = Math.floor(Math.random() * mediaItems.length);
    let index2;
    do {
      index2 = Math.floor(Math.random() * mediaItems.length);
    } while (index2 === index1);

    return [mediaItems[index1], mediaItems[index2]];
  }

  makeChoice(choice: string) {
    if (this.selectedChoice !== null) {
      // User has already made a choice for this round
      return;
    }

    this.selectedChoice = choice;

    if (this.currentRound === 1) {
      // Add genres from all media items of the selected type to user-selected genres
      const selectedMediaType = choice === 'A' ? 'movie' : 'tv';
      
      // Find all media items of the selected type
      const selectedMediaItems = this.mediaItems.filter(item => item.mediaType === selectedMediaType);
      
      // Extract unique genres from the selected media items
      for (const mediaItem of selectedMediaItems) {
        if (mediaItem.genres) {
          for (const genre of mediaItem.genres) {
            this.userSelectedGenres.add(genre.name);
          }
        }
      }
    }

    if (this.currentRound > 2) {
      const winningMediaItem = choice === 'A' ? this.choiceA.mediaItem : this.choiceB.mediaItem;
      winningMediaItem.points += 1;

      this.winningItems.push(winningMediaItem);

      // Remove the winning media item from filteredMediaItems
      this.filteredMediaItems = this.filteredMediaItems.filter(item => item !== winningMediaItem);

      // Check if there's only one media item left
      if (this.filteredMediaItems.length <= 1) {
        this.mediaSelection();
        return;
      }
    }

    // Start the next round only if it's not round 3 with 2 or more items
    if (!(this.currentRound === 3 && this.filteredMediaItems.length >= 2)) {
      this.currentRound++;
    }

    // Update rankings and check if the game is over
    this.updateRankings();
    this.checkGameOver();
  }

  updateRankings() {
    // Sort media items by points in descending order
    this.rankings = [...this.mediaItems].sort((a, b) => b.points - a.points);
  }

  checkGameOver() {
    if (this.isGameOver) {
      // Game over logic
      // Display rankings and the winning media item
    } else {
      // Continue to the next round
      this.startRound();
    }
  }

  updateGenresSet(genres: any[]) {
    // Update the genres set with unique genre names
    for (const genre of genres) {
      this.genresSet.add(genre.name);
    }
  }

  onGenreSelect(genre: string) {
    // Handle genre selection here
    // Add the selected genre to the userSelectedGenres set
    if (this.userSelectedGenres.has(genre)) {
      this.userSelectedGenres.delete(genre); // Deselect genre if already selected
    } else {
      this.userSelectedGenres.add(genre); // Select genre
    }
  }

  submitGenreSelection() {
    // Filter media items by selected genres and media type
    this.filteredMediaItems = this.mediaItems.filter((mediaItem: any) => {
      // First filter by media type based on choice in round 1
      if (this.selectedChoice === 'A' && mediaItem.mediaType !== 'movie') {
        return false;
      }
      if (this.selectedChoice === 'B' && mediaItem.mediaType !== 'tv') {
        return false;
      }
      
      // Then filter by selected genres
      for (const genre of mediaItem.genres) {
        if (this.userSelectedGenres.has(genre.name)) {
          return true;
        }
      }
      return false;
    });

    // Start the next round
    this.currentRound++;

    this.mediaSelection();
  }

  // Calculate progress percentage for the progress bar
  getGameProgress(): number {
    const totalItems = this.initialMediaItemCount;
    const remainingItems = this.filteredMediaItems.length + this.winningItems.length;
    
    if (totalItems === 0) return 0;
    
    // Calculate how far along in the process we are
    const progress = ((totalItems - remainingItems) / totalItems) * 100;
    return progress;
  }

  // Save votes to backend
  saveVotes() {
    // Save the rankings to the database
    this.rankings.forEach((mediaItem: any) => {
      const data = {
        groupId: this.groupId,
        tmdbId: mediaItem.tmdbId,
        mediaType: mediaItem.mediaType,
        rating: mediaItem.points
      };

      this.dataService.createVote(data).subscribe({
        next: (response: any) => {
          this.snackbarService.showSuccess(response.message);
        },
        error: (err: any) => {
          this.snackbarService.showError(err);
        }
      });
    });
  }

  // Restart the game
  restartGame() {
    // First, delete existing votes for this group before starting a new game
    this.deleteUserVotesForGroup().subscribe({
      next: () => {
        this.isGameOver = false;
        this.currentRound = 1;
        this.selectedChoice = null;
        this.userSelectedGenres.clear();
        this.filteredMediaItems = [];
        this.winningItems = [];
        
        // Reset points for all media items
        for (const mediaItem of this.mediaItems) {
          mediaItem.points = 0;
        }
        
        // Start from beginning
        this.initializeGame();
      },
      error: (err: any) => {
        this.snackbarService.showError('Failed to reset previous votes: ' + err.message);
        // Continue with restarting the game even if deleting votes failed
        this.isGameOver = false;
        this.currentRound = 1;
        this.selectedChoice = null;
        this.userSelectedGenres.clear();
        this.filteredMediaItems = [];
        this.winningItems = [];
        
        for (const mediaItem of this.mediaItems) {
          mediaItem.points = 0;
        }
        
        this.initializeGame();
      }
    });
  }

  // Delete all votes for the current user in this group
  deleteUserVotesForGroup() {
    return this.dataService.deleteVotesInGroup(this.groupId);
  }
}