import { Component, OnInit, inject } from '@angular/core';
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
export class VideoModalComponent implements OnInit {
  data = inject(MAT_DIALOG_DATA);

  videoId!: string;

  constructor() {
    const data = this.data;

    this.videoId = data.trailers[0].key;
  }

  ngOnInit(): void {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
  }
}