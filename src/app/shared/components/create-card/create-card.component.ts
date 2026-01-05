import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-create-card',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './create-card.component.html',
  styleUrls: ['./create-card.component.scss']
})
export class CreateCardComponent {
  @Input() title = 'Create';
  @Input() description = '';
  @Input() icon = 'add';
  @Input() routerLink?: any[] | string;
  @Input() ariaLabel?: string;
  @Input() variant: 'default' | 'compact' = 'default';
  @Output() action = new EventEmitter<void>();

  onClick(event: MouseEvent) {
    if (!this.routerLink) {
      this.action.emit();
    }
  }

  onKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      if (!this.routerLink) {
        this.action.emit();
      }
    }
  }
}
