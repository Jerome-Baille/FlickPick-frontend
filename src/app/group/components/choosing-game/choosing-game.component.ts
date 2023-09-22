import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { DataService } from 'src/app/services/data.service';
import { TmdbService } from 'src/app/services/tmdb.service';
import { forkJoin, Observable } from 'rxjs';
import { TMDB_IMAGE_BASE_URL_300 } from 'config/tmdb-api';
import { SnackbarService } from 'src/app/services/snackbar.service';

@Component({
  selector: 'app-choosing-game',
  templateUrl: './choosing-game.component.html',
  styleUrls: ['./choosing-game.component.sass']
})
export class ChoosingGameComponent implements OnInit {
  TMDB_IMAGE_BASE_URL_300 = TMDB_IMAGE_BASE_URL_300;
  mediaItems!: any[];
  selectedChoice: string | null = null;
  choiceA: any = { title: 'Short', condition: 'mediaItem.runtime < 60' };
  choiceB: any = { title: 'Long', condition: 'mediaItem.runtime >= 60' };
  isGameOver = false;
  currentRound = 1;
  displayedItems: any[] = [];
  winningItems: any[] = [];
  genresSet: Set<string> = new Set();
  userSelectedGenres: Set<string> = new Set();
  rankings: any[] = [];
  filteredMediaItems: any[] = [];
  groupId!: number;

  constructor(
    private route: ActivatedRoute,
    private dataService: DataService,
    private tmdbService: TmdbService,
    private snackbarService: SnackbarService
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.groupId = params['groupId'];
      this.dataService.getAllMediaItemsForUserInGroup(this.groupId).subscribe({
        next: (data: any) => {
          let mediaItems = data.mediaItems.MediaItems;

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
    // Start the game
    this.startRound();

    // Initialize points for media items
    for (const mediaItem of this.mediaItems) {
      mediaItem.points = 0;
    }
  }

  startRound() {
    if (this.currentRound === 1) {
      // The first round, select choices based on runtime only
      this.displayedItems = this.mediaItems.slice();
    } else if (this.currentRound === 2) {
      // Second round, filter by user-selected genres and runtime
      this.displayedItems = this.mediaItems.filter((mediaItem: any) => {
        if (this.selectedChoice === 'A' && mediaItem.runtime < 60) {
          return true;
        } else if (this.selectedChoice === 'B' && mediaItem.runtime >= 60) {
          return true;
        }
        return false;
      });

      if (this.displayedItems.length === 0) {
        // No media items match the user's selection
        this.snackbarService.showError('No media items match the user\'s selection');
        return;
      }

      if (this.displayedItems.length === 1) {
        // give one point to the winning media item
        this.displayedItems[0].points += 1;
        this.isGameOver = true;
        this.rankings = [...this.mediaItems].sort((a, b) => b.points - a.points);

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

        return;
      }

      if (this.displayedItems.length === 1 && this.winningItems.length === 0) {
        this.displayedItems[0].points += 1;
        this.isGameOver = true;
        this.rankings = [...this.mediaItems].sort((a, b) => b.points - a.points);

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
      // Add genres from the selected media item to user-selected genres
      const selectedMediaItem = choice === 'A' ? this.choiceA.mediaItem : this.choiceB.mediaItem;

      if (selectedMediaItem.genres === undefined) {
        return;
      }

      for (const genre of selectedMediaItem.genres) {
        this.userSelectedGenres.add(genre.name);
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
    // Filter media items by selected genres and store them in filteredMediaItems
    this.filteredMediaItems = this.mediaItems.filter((mediaItem: any) => {
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
}