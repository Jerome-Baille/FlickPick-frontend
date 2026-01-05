import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-header-badge',
  standalone: true,
  imports: [CommonModule, MatIconModule],
  templateUrl: './header-badge.component.html',
  styleUrls: ['./header-badge.component.scss']
})
export class HeaderBadgeComponent {
  /** Text to show next to the icon (e.g. "Hall of Fame") */
  @Input() text = '';

  /** Material icon name to render (default: emoji_events) */
  @Input() icon: string = 'emoji_events';

  /** Optional CSS class to apply to the root element */
  @Input() className = '';
}
