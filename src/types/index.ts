export type AppCategory = 'social' | 'gallery' | 'finance' | 'dating' | 'tools' | 'messaging' | 'entertainment' | 'custom';

export interface AppItem {
  id: string;
  name: string;
  iconName: string; // lucide icon identifier
  color: string;
  category: AppCategory;
  isHidden: boolean; // if true, hidden from home screen and only in vault
  isBuiltInTool?: 'photos' | 'notes' | 'browser' | 'chat' | 'files' | 'custom';
  description?: string;
  customUrl?: string;
  badgeCount?: number;
}

export interface AlarmItem {
  id: string;
  time: string; // "07:30"
  label: string;
  enabled: boolean;
  repeatDays: string[]; // ["Mon", "Tue", "Wed", "Thu", "Fri"]
  sound: string;
}

export interface WorldClockCity {
  id: string;
  city: string;
  country: string;
  timezone: string;
  offsetHours: number;
}

export interface VaultPhoto {
  id: string;
  title: string;
  dataUrl: string;
  dateAdded: string;
  sizeBytes?: number;
}

export interface VaultNote {
  id: string;
  title: string;
  content: string;
  dateModified: string;
  category: string;
  isPinned?: boolean;
}

export interface VaultChatMessage {
  id: string;
  contactName: string;
  avatarColor: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  messages: {
    id: string;
    sender: 'user' | 'contact';
    text: string;
    time: string;
  }[];
}

export interface IntruderAttempt {
  id: string;
  timestamp: string;
  date?: string; // "YYYY-MM-DD"
  time?: string; // "HH:MM"
  hour?: number; // 0-23
  dayName?: string; // "Mon", "Tue", etc.
  enteredPin: string;
  success: boolean;
}

export interface VaultSettings {
  pin: string; // e.g. "1234"
  decoyPin: string; // e.g. "0000"
  disguiseName: string; // "Clock", "Time OS", "Stopwatch", etc.
  disguiseIcon: 'clock' | 'watch' | 'timer' | 'compass' | 'hourglass';
  customIconUrl?: string; // Image selected from gallery or uploaded
  stealthTrigger: 'hold-center' | 'tap-digits' | 'secret-button';
  panicExitEnabled: boolean;
  requirePinOnAppSwitch: boolean;
  intruderLogs: IntruderAttempt[];
}
