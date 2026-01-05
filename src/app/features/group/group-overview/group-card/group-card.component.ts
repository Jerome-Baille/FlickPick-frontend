import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Group } from 'src/app/shared/models/Group';
import { Event as GroupEvent } from 'src/app/shared/models/Event';

@Component({
  selector: 'app-group-card',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './group-card.component.html',
  styleUrls: ['./group-card.component.scss']
})
export class GroupCardComponent {
  @Input() group!: Group;
  @Input() viewMode: 'grid' | 'list' = 'grid';
  @Output() copyCode = new EventEmitter<string>();

  constructor(private router: Router) {}

  onNavigate() {
    if (!this.group?.id) return;
    this.router.navigate(['/group/detail', this.group.id]);
  }

  private mockImages = [
    'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1574267432644-f74f8ec13f37?w=800&h=600&fit=crop',
    'https://images.unsplash.com/photo-1485846234645-a62644f84728?w=800&h=600&fit=crop'
  ];

  private mockAvatars = [
    'https://i.pravatar.cc/150?img=1',
    'https://i.pravatar.cc/150?img=2',
    'https://i.pravatar.cc/150?img=3',
    'https://i.pravatar.cc/150?img=4'
  ];

  getGroupImage(group: Group): string {
    const index = group.id % this.mockImages.length;
    return this.mockImages[index];
  }

  getMockMembers(group: Group): string[] {
    const count = Math.min(3, group.Users.length || 1);
    return this.mockAvatars.slice(0, count);
  }

  getNextEventDate(group: Group): string | null {
    const events = ((group?.Events || []) as GroupEvent[]).filter((e: GroupEvent) => e?.eventDate && e.status !== 'completed' && e.status !== 'cancelled');
    if (!events.length) return null;

    const now = Date.now();
    let closest = events[0];
    let minDiff = Math.abs(new Date(closest.eventDate).getTime() - now);

    for (const e of events) {
      const diff = Math.abs(new Date(e.eventDate).getTime() - now);
      if (diff < minDiff) {
        minDiff = diff;
        closest = e;
      }
    }

    const date = new Date(closest.eventDate);
    const dateStr = date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
    return closest.startTime ? `${dateStr} • ${closest.startTime}` : dateStr;
  }

  onCopy(ev: Event, code?: string) {
    ev.stopPropagation();
    if (!code) return;
    this.copyCode.emit(code);
  }
}
