import { AppItem, AlarmItem, VaultNote, VaultPhoto, VaultChatMessage, VaultSettings, IntruderAttempt } from '../types';

export const INITIAL_APPS: AppItem[] = [
  {
    id: 'app-photos',
    name: 'Secure Gallery',
    iconName: 'Image',
    color: '#3B82F6',
    category: 'gallery',
    isHidden: true,
    isBuiltInTool: 'photos',
    description: 'Encrypted photos and media storage with zero cloud backup',
  },
  {
    id: 'app-notes',
    name: 'Vault Notes',
    iconName: 'FileText',
    color: '#F59E0B',
    category: 'tools',
    isHidden: true,
    isBuiltInTool: 'notes',
    description: 'Private memos, seed phrases, and confidential notes',
  },
  {
    id: 'app-chat',
    name: 'Shadow Chat',
    iconName: 'MessageSquare',
    color: '#10B981',
    category: 'messaging',
    isHidden: true,
    isBuiltInTool: 'chat',
    description: 'End-to-end simulated encrypted conversation vault',
  },
  {
    id: 'app-browser',
    name: 'Ghost Web',
    iconName: 'Globe',
    color: '#8B5CF6',
    category: 'tools',
    isHidden: true,
    isBuiltInTool: 'browser',
    description: 'Zero-trace incognito web viewer and private bookmarks',
  },
  {
    id: 'app-crypto',
    name: 'Crypto Vault',
    iconName: 'Coins',
    color: '#EC4899',
    category: 'finance',
    isHidden: true,
    isBuiltInTool: 'custom',
    description: 'Hardware wallet backup and asset ledger',
  },
  {
    id: 'app-dating',
    name: 'Secret Match',
    iconName: 'Heart',
    color: '#EF4444',
    category: 'dating',
    isHidden: true,
    isBuiltInTool: 'custom',
    description: 'Dating profile and private rendezvous app',
  },
  {
    id: 'app-instagram',
    name: 'Instagram',
    iconName: 'Camera',
    color: '#E1306C',
    category: 'social',
    isHidden: false,
    description: 'Social photo sharing and reels',
  },
  {
    id: 'app-whatsapp',
    name: 'WhatsApp',
    iconName: 'MessageCircle',
    color: '#25D366',
    category: 'messaging',
    isHidden: false,
    description: 'Instant messaging and voice calls',
  },
  {
    id: 'app-spotify',
    name: 'Music',
    iconName: 'Headphones',
    color: '#1DB954',
    category: 'entertainment',
    isHidden: false,
    description: 'Stream music and podcasts',
  },
  {
    id: 'app-maps',
    name: 'Maps',
    iconName: 'Navigation',
    color: '#0EA5E9',
    category: 'tools',
    isHidden: false,
    description: 'GPS turn-by-turn navigation and transit',
  },
  {
    id: 'app-banking',
    name: 'Swiss Bank',
    iconName: 'Landmark',
    color: '#1E293B',
    category: 'finance',
    isHidden: false,
    description: 'Primary checking and wire transfer account',
  },
  {
    id: 'app-settings',
    name: 'Settings',
    iconName: 'Sliders',
    color: '#64748B',
    category: 'tools',
    isHidden: false,
    description: 'System configurations and network',
  },
];

export const INITIAL_ALARMS: AlarmItem[] = [
  {
    id: 'alarm-1',
    time: '06:45',
    label: 'Morning Workout',
    enabled: true,
    repeatDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    sound: 'Chime Bell',
  },
  {
    id: 'alarm-2',
    time: '07:30',
    label: 'Wake Up',
    enabled: true,
    repeatDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
    sound: 'Radial Pulse',
  },
  {
    id: 'alarm-3',
    time: '09:00',
    label: 'Team Standup Sync',
    enabled: false,
    repeatDays: ['Mon', 'Wed', 'Fri'],
    sound: 'Digital Beep',
  },
  {
    id: 'alarm-4',
    time: '23:00',
    label: 'Wind Down / Sleep',
    enabled: true,
    repeatDays: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    sound: 'Soft Harp',
  },
];

export const SEED_INTRUDER_LOGS: IntruderAttempt[] = [
  {
    id: 'attempt-seed-1',
    timestamp: 'Today, 02:05',
    date: '2026-10-24',
    time: '02:05',
    hour: 2,
    dayName: 'Sat',
    enteredPin: '1111',
    success: false,
  },
  {
    id: 'attempt-seed-2',
    timestamp: 'Today, 01:22',
    date: '2026-10-24',
    time: '01:22',
    hour: 1,
    dayName: 'Sat',
    enteredPin: '2580',
    success: false,
  },
  {
    id: 'attempt-seed-3',
    timestamp: 'Yesterday, 14:15',
    date: '2026-10-23',
    time: '14:15',
    hour: 14,
    dayName: 'Fri',
    enteredPin: '9999',
    success: false,
  },
  {
    id: 'attempt-seed-4',
    timestamp: 'Yesterday, 14:12',
    date: '2026-10-23',
    time: '14:12',
    hour: 14,
    dayName: 'Fri',
    enteredPin: '1235',
    success: false,
  },
  {
    id: 'attempt-seed-5',
    timestamp: 'Yesterday, 14:10',
    date: '2026-10-23',
    time: '14:10',
    hour: 14,
    dayName: 'Fri',
    enteredPin: '0000',
    success: false,
  },
  {
    id: 'attempt-seed-6',
    timestamp: 'Oct 22, 19:42',
    date: '2026-10-22',
    time: '19:42',
    hour: 19,
    dayName: 'Thu',
    enteredPin: '4321',
    success: false,
  },
  {
    id: 'attempt-seed-7',
    timestamp: 'Oct 21, 23:16',
    date: '2026-10-21',
    time: '23:16',
    hour: 23,
    dayName: 'Wed',
    enteredPin: '1357',
    success: false,
  },
  {
    id: 'attempt-seed-8',
    timestamp: 'Oct 21, 23:14',
    date: '2026-10-21',
    time: '23:14',
    hour: 23,
    dayName: 'Wed',
    enteredPin: '2468',
    success: false,
  },
];

export const INITIAL_SETTINGS: VaultSettings = {
  pin: '1234',
  decoyPin: '0000',
  disguiseName: 'Clock',
  disguiseIcon: 'clock',
  stealthTrigger: 'hold-center',
  panicExitEnabled: true,
  requirePinOnAppSwitch: true,
  intruderLogs: SEED_INTRUDER_LOGS,
};

export const INITIAL_PHOTOS: VaultPhoto[] = [
  {
    id: 'photo-1',
    title: 'Secret Recovery Keys & Vault Backup',
    dataUrl: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&auto=format&fit=crop&q=80',
    dateAdded: '2026-10-18',
  },
  {
    id: 'photo-2',
    title: 'Private Property Document Scan',
    dataUrl: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?w=600&auto=format&fit=crop&q=80',
    dateAdded: '2026-10-21',
  },
  {
    id: 'photo-3',
    title: 'Passport & Identity Verification',
    dataUrl: 'https://images.unsplash.com/photo-1526304640581-d334cdbbf45e?w=600&auto=format&fit=crop&q=80',
    dateAdded: '2026-10-22',
  },
];

export const INITIAL_NOTES: VaultNote[] = [
  {
    id: 'note-1',
    title: 'VIP Master Passwords & Seeds',
    content: 'Master Recovery phrase:\nmatrix-velocity-nebula-sapphire-timber-quantum-zenith-echo-falcon-blaze-canyon-shield\n\nSecondary Safe combination: 42-19-88',
    dateModified: 'Yesterday, 18:42',
    category: 'Security',
    isPinned: true,
  },
  {
    id: 'note-2',
    title: 'Private Swiss Account Router',
    content: 'Account: CH-89 0483 5012 9940 1102\nCorrespondent Bank: Credit Privée Genève\nClearance Agent: Marcus L.\nNote: Destroy after wire verification.',
    dateModified: 'Oct 20, 11:15',
    category: 'Finance',
    isPinned: false,
  },
  {
    id: 'note-3',
    title: 'Discreet Contacts & Safe Houses',
    content: 'Emergency Signal: Two taps on beacon #4\nSafe Location: Alpine Ridge Cabin 4B\nKey is beneath the copper rain collector.',
    dateModified: 'Oct 14, 09:30',
    category: 'Personal',
    isPinned: false,
  },
];

export const INITIAL_CHATS: VaultChatMessage[] = [
  {
    id: 'chat-1',
    contactName: 'Cipher Contact (Marcus)',
    avatarColor: '#6366F1',
    lastMessage: 'The encrypted drive is safe. Do not contact via cellular.',
    timestamp: '14:22',
    unread: 1,
    messages: [
      { id: 'm1', sender: 'contact', text: 'Are you using the secure clock vault?', time: '14:18' },
      { id: 'm2', sender: 'user', text: 'Yes, locked behind the PIN right now.', time: '14:20' },
      { id: 'm3', sender: 'contact', text: 'The encrypted drive is safe. Do not contact via cellular.', time: '14:22' },
    ],
  },
  {
    id: 'chat-2',
    contactName: 'Ghost Client #09',
    avatarColor: '#10B981',
    lastMessage: 'Documents received and shredded as requested.',
    timestamp: 'Yesterday',
    unread: 0,
    messages: [
      { id: 'm1', sender: 'user', text: 'Confirming receipt of the packet.', time: 'Yesterday' },
      { id: 'm2', sender: 'contact', text: 'Documents received and shredded as requested.', time: 'Yesterday' },
    ],
  },
];

const KEYS = {
  APPS: 'chronovault_apps_v2',
  ALARMS: 'chronovault_alarms_v2',
  SETTINGS: 'chronovault_settings_v2',
  PHOTOS: 'chronovault_photos_v2',
  NOTES: 'chronovault_notes_v2',
  CHATS: 'chronovault_chats_v2',
};

export const storage = {
  getApps: (): AppItem[] => {
    try {
      const data = localStorage.getItem(KEYS.APPS);
      return data ? JSON.parse(data) : INITIAL_APPS;
    } catch {
      return INITIAL_APPS;
    }
  },
  setApps: (apps: AppItem[]) => {
    try {
      localStorage.setItem(KEYS.APPS, JSON.stringify(apps));
    } catch {}
  },

  getAlarms: (): AlarmItem[] => {
    try {
      const data = localStorage.getItem(KEYS.ALARMS);
      return data ? JSON.parse(data) : INITIAL_ALARMS;
    } catch {
      return INITIAL_ALARMS;
    }
  },
  setAlarms: (alarms: AlarmItem[]) => {
    try {
      localStorage.setItem(KEYS.ALARMS, JSON.stringify(alarms));
    } catch {}
  },

  getSettings: (): VaultSettings => {
    try {
      const data = localStorage.getItem(KEYS.SETTINGS);
      if (!data) return INITIAL_SETTINGS;
      const parsed = JSON.parse(data);
      if (!parsed.intruderLogs || parsed.intruderLogs.length === 0) {
        parsed.intruderLogs = SEED_INTRUDER_LOGS;
      }
      return parsed;
    } catch {
      return INITIAL_SETTINGS;
    }
  },
  setSettings: (settings: VaultSettings) => {
    try {
      localStorage.setItem(KEYS.SETTINGS, JSON.stringify(settings));
    } catch {}
  },

  getPhotos: (): VaultPhoto[] => {
    try {
      const data = localStorage.getItem(KEYS.PHOTOS);
      return data ? JSON.parse(data) : INITIAL_PHOTOS;
    } catch {
      return INITIAL_PHOTOS;
    }
  },
  setPhotos: (photos: VaultPhoto[]) => {
    try {
      localStorage.setItem(KEYS.PHOTOS, JSON.stringify(photos));
    } catch {}
  },

  getNotes: (): VaultNote[] => {
    try {
      const data = localStorage.getItem(KEYS.NOTES);
      return data ? JSON.parse(data) : INITIAL_NOTES;
    } catch {
      return INITIAL_NOTES;
    }
  },
  setNotes: (notes: VaultNote[]) => {
    try {
      localStorage.setItem(KEYS.NOTES, JSON.stringify(notes));
    } catch {}
  },

  getChats: (): VaultChatMessage[] => {
    try {
      const data = localStorage.getItem(KEYS.CHATS);
      return data ? JSON.parse(data) : INITIAL_CHATS;
    } catch {
      return INITIAL_CHATS;
    }
  },
  setChats: (chats: VaultChatMessage[]) => {
    try {
      localStorage.setItem(KEYS.CHATS, JSON.stringify(chats));
    } catch {}
  },
};
