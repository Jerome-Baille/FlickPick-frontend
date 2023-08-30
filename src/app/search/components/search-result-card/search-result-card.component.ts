import { Component, Input } from '@angular/core';
import { faCircleCheck } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-search-result-card',
  templateUrl: './search-result-card.component.html',
  styleUrls: ['./search-result-card.component.sass']
})
export class SearchResultCardComponent {
  @Input() result: any;
  imageUrlBase = 'https://image.tmdb.org/t/p/original';

  faCircleCheck = faCircleCheck;

  onCardClick() {
    const storedIdsString = localStorage.getItem('storedIds');
    let storedIds = storedIdsString ? JSON.parse(storedIdsString) : [];
    if (!storedIds.includes(this.result.id)) {
      storedIds.push(this.result.id);
    } else {
      storedIds = storedIds.filter((id: number) => id !== this.result.id);
    }
    localStorage.setItem('storedIds', JSON.stringify(storedIds));
  }

  isChecked(id: number) {
    const storedIdsString = localStorage.getItem('storedIds');
    const storedIds = storedIdsString ? JSON.parse(storedIdsString) : [];
    return storedIds.includes(id);
  }
}
