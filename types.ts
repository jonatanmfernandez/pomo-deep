
export enum TimerMode {
  FOCUS = 'FOCUS',
  SHORT_BREAK = 'SHORT_BREAK',
  LONG_BREAK = 'LONG_BREAK',
}

export interface Category {
  id: string;
  name: string;
  color: string; // Tailwind class or hex
}

export interface Note {
  id: string;
  content: string;
  createdAt: Date;
}

export interface InboxItem {
  id: string;
  title: string;
  type: 'note' | 'notification'; 
  noteContent: string;
  createdAt: Date;
  deadline: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'scheduled';
  categoryId?: string;
  nextAction?: string;
  scheduledDate?: Date;
  isRead?: boolean;
  timeSpent?: number; // Minutes spent on this task
  fullSessionsCount?: number; // Number of full focus sessions completed
  pausedTime?: number; // Time left in seconds when the session was paused/saved
  currentSessionNumber?: number; // The session number that was paused
  reminderSet?: boolean;
  projectId?: string;
  isSomedayMaybe?: boolean;
  isArchived?: boolean;
  context?: string; // GTD context like @home, @work, etc.
  isProcessed?: boolean;
  folderId?: string;
}

export interface ProjectFolder {
  id: string;
  name: string;
  projectId: string;
  createdAt: Date;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  color: string;
  createdAt: Date;
  status: 'active' | 'completed' | 'archived';
  folders?: ProjectFolder[];
}

export interface UserCredits {
  available: number;
  used: number;
}

export interface Settings {
  focusDuration: number; // in minutes
  shortBreakDuration: number;
  longBreakDuration: number;
  language: 'en' | 'es';
  longBreakInterval: number;
}

export interface SessionHistoryItem {
  id: string;
  startTime: Date;
  endTime: Date;
  mode: TimerMode;
  duration: number; // in minutes
  noteSnapshot?: string;
  relatedTaskId?: string;
}

export type View = 'timer' | 'inbox' | 'projects' | 'someday' | 'dashboard' | 'settings' | 'history' | 'categories' | 'integrations' | 'profile';
