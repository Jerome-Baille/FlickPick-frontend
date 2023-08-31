import { Component, Input } from '@angular/core';
import { faCircleCheck, faCirclePlus } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-search-result-card',
  templateUrl: './search-result-card.component.html',
  styleUrls: ['./search-result-card.component.sass']
})
export class SearchResultCardComponent {
  @Input() result: any;
  imageUrlBase = 'https://image.tmdb.org/t/p/original';

  faCircleCheck = faCircleCheck;
  faCirclePlus = faCirclePlus;

  onCardClick() {
    let media_type = '';
    if (this.result.title) {
      media_type = 'movie';
    } else if (this.result.name) {
      media_type = 'tv';
    }
    const storedIdsString = localStorage.getItem('storedIds');
    let storedIds = storedIdsString ? JSON.parse(storedIdsString) : [];
    const index = storedIds.findIndex((item: { id: number, media_type: string }) => item.id === this.result.id);
    if (index === -1) {
      storedIds.push({ id: this.result.id, media_type });
    } else {
      storedIds.splice(index, 1);
    }
    localStorage.setItem('storedIds', JSON.stringify(storedIds));
  }

  isChecked(id: number): boolean {
    const storedIdsString: string | null = localStorage.getItem('storedIds');
    const storedIds: { id: number, media_type: string }[] = storedIdsString ? JSON.parse(storedIdsString) : [];
    return storedIds.some(item => item.id === id);
  }
}
