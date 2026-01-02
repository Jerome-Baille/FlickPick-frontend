import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DataService } from '../../core/services/data.service';
import { EventStatus } from '../../shared/models/Event';
import { forkJoin } from 'rxjs';
import { RouterLink } from "@angular/router";

interface CalendarDay {
  day: number;
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  events: CalendarEvent[];
}

interface CalendarEvent {
  id: number;
  name: string;
  groupName: string;
  groupId: number;
  eventDate: Date;
  startTime?: string;
  endTime?: string;
  status: EventStatus;
  posterPath?: string;
}

interface Group {
  id: number;
  name: string;
  adminIds: number[];
}

interface ApiEvent {
  id: number;
  name: string;
  eventDate: string | Date | null;
  startTime?: string | null;
  endTime?: string | null;
  status: EventStatus;
  shortlist?: {
    MediaItems?: {
      posterPath?: string | null;
    }[];
  };
}

@Component({
  selector: 'app-calendar',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss'
})
export class CalendarComponent implements OnInit {
  private dataService = inject(DataService);
  
  currentDate: Date = new Date();
  currentMonth: number = this.currentDate.getMonth();
  currentYear: number = this.currentDate.getFullYear();
  
  calendarDays: CalendarDay[] = [];
  monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  
  allEvents: CalendarEvent[] = [];
  groups: Group[] = [];
  selectedGroups = new Set<number>();
  
  nextUpEvents: CalendarEvent[] = [];
  isLoading = true;

  ngOnInit() {
    this.loadData();
  }

  loadData() {
    this.isLoading = true;
    
    // Get all user groups
    this.dataService.getAllGroupsForUser().subscribe({
      next: (groupsData: Group[]) => {
        this.groups = groupsData || [];
        
        // Initialize all groups as selected
        this.groups.forEach(group => this.selectedGroups.add(group.id));
        
        // Fetch events for each group
        if (this.groups.length > 0) {
          const eventRequests = this.groups.map(group => 
            this.dataService.getEventsByGroup(group.id)
          );
          
          forkJoin(eventRequests).subscribe({
            next: (results: { events: ApiEvent[] }[]) => {
              this.allEvents = [];
              results.forEach((result, index) => {
                const group = this.groups[index];
                const events: ApiEvent[] = result.events || [];
                events.forEach((event: ApiEvent) => {
                  if (event.eventDate) {
                    this.allEvents.push({
                      id: event.id,
                      name: event.name,
                      groupName: group.name,
                      groupId: group.id,
                      eventDate: new Date(event.eventDate),
                      startTime: event.startTime ?? undefined,
                      endTime: event.endTime ?? undefined,
                      status: event.status,
                      posterPath: event.shortlist?.MediaItems?.[0]?.posterPath ?? undefined
                    });
                  }
                });
              });
              
              // Sort events by date
              this.allEvents.sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime());
              
              // Get next up events
              this.updateNextUpEvents();
              
              // Generate calendar
              this.generateCalendar();
              
              this.isLoading = false;
            },
            error: (error) => {
              console.error('Error loading events:', error);
              this.isLoading = false;
              this.generateCalendar();
            }
          });
        } else {
          this.isLoading = false;
          this.generateCalendar();
        }
      },
      error: (error) => {
        console.error('Error loading groups:', error);
        this.isLoading = false;
        this.generateCalendar();
      }
    });
  }

  generateCalendar() {
    this.calendarDays = [];
    
    const firstDay = new Date(this.currentYear, this.currentMonth, 1);
    const lastDay = new Date(this.currentYear, this.currentMonth + 1, 0);
    
    // Get day of week (0 = Sunday, 1 = Monday, etc.)
    let firstDayOfWeek = firstDay.getDay();
    // Convert to Monday = 0, Sunday = 6
    firstDayOfWeek = firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1;
    
    // Add days from previous month
    const prevMonthLastDay = new Date(this.currentYear, this.currentMonth, 0);
    for (let i = firstDayOfWeek - 1; i >= 0; i--) {
      const day = prevMonthLastDay.getDate() - i;
      const date = new Date(this.currentYear, this.currentMonth - 1, day);
      this.calendarDays.push({
        day,
        date,
        isCurrentMonth: false,
        isToday: false,
        events: []
      });
    }
    
    // Add days from current month
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    for (let day = 1; day <= lastDay.getDate(); day++) {
      const date = new Date(this.currentYear, this.currentMonth, day);
      const dateStr = date.toDateString();
      const todayStr = today.toDateString();
      
      // Get events for this day
      const dayEvents = this.getFilteredEvents().filter(event => {
        const eventDateStr = event.eventDate.toDateString();
        return eventDateStr === dateStr;
      });
      
      this.calendarDays.push({
        day,
        date,
        isCurrentMonth: true,
        isToday: dateStr === todayStr,
        events: dayEvents
      });
    }
    
    // Add days from next month to fill grid (7 columns)
    const remainingDays = 7 - (this.calendarDays.length % 7);
    if (remainingDays < 7) {
      for (let day = 1; day <= remainingDays; day++) {
        const date = new Date(this.currentYear, this.currentMonth + 1, day);
        this.calendarDays.push({
          day,
          date,
          isCurrentMonth: false,
          isToday: false,
          events: []
        });
      }
    }
  }

  getFilteredEvents(): CalendarEvent[] {
    return this.allEvents.filter(event => this.selectedGroups.has(event.groupId));
  }

  updateNextUpEvents() {
    const now = new Date();
    const filteredEvents = this.getFilteredEvents();
    
    this.nextUpEvents = filteredEvents
      .filter(event => event.eventDate >= now)
      .sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime())
      .slice(0, 5);
  }

  previousMonth() {
    if (this.currentMonth === 0) {
      this.currentMonth = 11;
      this.currentYear--;
    } else {
      this.currentMonth--;
    }
    this.generateCalendar();
  }

  nextMonth() {
    if (this.currentMonth === 11) {
      this.currentMonth = 0;
      this.currentYear++;
    } else {
      this.currentMonth++;
    }
    this.generateCalendar();
  }

  toggleGroup(groupId: number) {
    if (this.selectedGroups.has(groupId)) {
      this.selectedGroups.delete(groupId);
    } else {
      this.selectedGroups.add(groupId);
    }
    this.updateNextUpEvents();
    this.generateCalendar();
  }

  isGroupSelected(groupId: number): boolean {
    return this.selectedGroups.has(groupId);
  }

  getEventStatusIcon(status: EventStatus): string {
    switch (status) {
      case 'completed':
        return 'check_circle';
      case 'voting':
        return 'how_to_vote';
      case 'draft':
        return 'edit_note';
      default:
        return 'event';
    }
  }

  getEventStatusClass(status: EventStatus): string {
    switch (status) {
      case 'completed':
        return 'watched';
      case 'voting':
        return 'voting';
      case 'draft':
        return 'selecting';
      default:
        return '';
    }
  }

  getEventTimeDisplay(event: CalendarEvent): string {
    if (event.status === 'completed') {
      return 'Watched';
    }
    if (event.status === 'voting') {
      return 'Voting Active';
    }
    if (event.status === 'draft') {
      return event.startTime ? this.formatTime(event.startTime) : 'Time TBD';
    }
    return event.startTime ? this.formatTime(event.startTime) : '';
  }

  formatTime(time: string): string {
    if (!time) return '';
    
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    
    return `${displayHour}:${minutes} ${ampm}`;
  }

  formatEventDate(event: CalendarEvent): string {
    const date = event.eventDate;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const eventDate = new Date(date);
    eventDate.setHours(0, 0, 0, 0);
    
    if (eventDate.getTime() === today.getTime()) {
      return event.startTime ? `Tonight · ${this.formatTime(event.startTime)}` : 'Tonight';
    }
    
    const month = this.monthNames[date.getMonth()].substring(0, 3);
    const day = date.getDate();
    const time = event.startTime ? ` · ${this.formatTime(event.startTime)}` : '';
    
    return `${month} ${day}${time}`;
  }

  isEventTonight(event: CalendarEvent): boolean {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const eventDate = new Date(event.eventDate);
    eventDate.setHours(0, 0, 0, 0);
    
    return eventDate.getTime() === today.getTime();
  }

  getMonthYearDisplay(): string {
    return `${this.monthNames[this.currentMonth]} ${this.currentYear}`;
  }
}
