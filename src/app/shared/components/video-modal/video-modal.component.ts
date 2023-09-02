import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-video-modal',
  templateUrl: './video-modal.component.html',
  styleUrls: ['./video-modal.component.sass']
})
export class VideoModalComponent implements OnInit {
  videoId!: string;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
  ) {
    this.videoId = data.trailers[0].key;
  }

  ngOnInit(): void {
    const tag = document.createElement('script');
    tag.src = 'https://www.youtube.com/iframe_api';
    document.body.appendChild(tag);
  }
}