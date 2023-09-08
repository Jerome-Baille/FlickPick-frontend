import { Component, Input } from '@angular/core';
import { DataService } from 'src/app/services/data.service';
// import { MediaItem } from 'src/app/models/Media-item';

@Component({
  selector: 'app-media-table-view',
  templateUrl: './media-table-view.component.html',
  styleUrls: ['./media-table-view.component.sass']
})
export class MediaTableViewComponent {
  @Input() mediaItems: any[] = [];

  constructor(
    private dataService: DataService
  ) { }

  deleteMediaItem(mediaItem: any){
    const data = {
      tmdbId : mediaItem.tmdbId,
      mediaType: mediaItem.mediaType,
      listId: mediaItem.ListMediaItem?.ListId
    };

   this.dataService.deleteMediaItemFromList(data).subscribe({
      next: (response) => {
        console.log(response);
        this.mediaItems = this.mediaItems.filter(item => item.tmdbId !== mediaItem.tmdbId);
      },
      error: (err) => {
        console.log(err);
      }
   })
  }
}
