import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';
import { YouTubePlayer } from '@angular/youtube-player';

@Component({
    selector: 'app-video-modal',
    imports: [
      YouTubePlayer
    ],
    templateUrl: './video-modal.component.html',
    styleUrls: ['./video-modal.component.scss'],
    standalone: true
})
export class VideoModalComponent {
  data = inject(MAT_DIALOG_DATA);

  videoId!: string;

  // Provide origin to the YouTube player to avoid postMessage origin warnings
  playerVars = { origin: window.location.origin };

  constructor() {
    const data = this.data;

    this.videoId = data.trailers[0].key;
  }
}