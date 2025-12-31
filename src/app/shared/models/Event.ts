import { List } from './List';

export type EventStatus = 'draft' | 'voting' | 'completed' | 'cancelled';

export interface Event {
  id: number;
  name: string;
  groupId: number;
  eventDate: string | Date;
  startTime?: string;
  endTime?: string;
  status: EventStatus;
  createdAt?: string;
  updatedAt?: string;
  
  // Relations
  shortlist?: List;
}
