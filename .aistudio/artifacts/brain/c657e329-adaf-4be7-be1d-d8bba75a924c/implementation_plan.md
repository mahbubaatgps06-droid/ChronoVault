# ChronoVault — Stealth Clock & App Hider Implementation Plan

A comprehensive architectural blueprint for a functional Clock disguise application with an integrated app concealment engine, center-crown biometric/PIN gateway, intruder frequency analytics, and device gallery icon customization.

---

## User Review & Critical Decisions

> [!IMPORTANT]
> The following architectural parameters have been established based on your requirements and recommended security practices:

- **Access Policy**: The Clock application can **only** be accessed from its genuine app icon on the smartphone launcher. All home-bar and switch-view shortcuts are permanently removed from default screens.
- **Camouflage Integrity**: No notification badges, counters, or alert pills are displayed anywhere on the home screen or clock interface. Observers see an authentic, operational Time app.
- **Vault Gateway Trigger**: Access to the PIN prompt is exclusively unlocked by pressing and holding down the central pivot of the clock hands for 750ms.
- **Custom Disguise Icon**: Users can replace the Clock icon with any picture from their personal device gallery, photos from the vault, or curated camouflage presets.
- **Data Persistence**: Offline-first encrypted `localStorage` architecture ensures zero external cloud exposure and immediate offline responsiveness.

---

## 1. Overview & Core Concept

ChronoVault addresses the challenge of on-device digital privacy. Rather than presenting an overt "App Locker" that signals secrecy to anyone viewing the phone, ChronoVault poses as an authentic system Clock with real-time analog ticking hands, world timezones, alarms, a millisecond stopwatch, and countdown timers.

### Core Capabilities
- **Real-Time Timekeeping**: Live clockwork physics with continuous second-hand sweeps and multi-city UTC calculations.
- **Zero-Trace App Concealment**: Hidden applications are completely removed from the host phone's Home Screen grid and dock, becoming visible and executable exclusively within ChronoVault.
- **Hardened PIN Vault**: Protected by a 4-to-8 digit master PIN with tactile Web Audio sound synthesis, haptic vibration, and coercion defense via an emergency Decoy PIN (`0000`).
- **Intruder Frequency Analytics**: Recharts-powered visualization displaying failed PIN attempts over 7-day or 24-hour intervals with peak threat identification.

---

## 2. User Experience & Visual Design

### Key User Flows

```
[Phone Home Screen] ───────────► Tap Clock Icon ───────────► [Authentic Clock App]
       │                                                            │
       │ (Hidden apps absent from launcher)                         │ (Press & hold center 750ms)
       │                                                            ▼
       │                                                   [Tactile PIN Modal]
       │                                                            │
       │                                      ┌─────────────────────┴─────────────────────┐
       │                                      ▼                                           ▼
       │                                [Master PIN]                                 [Decoy PIN]
       │                                      │                                           │
       ▼                                      ▼                                           ▼
[Return via Home Bar] ◄──────────── [ChronoVault Unlocked]                        [Audio Equalizer]
                                     ├─ App Hider Matrix
                                     ├─ Secure Gallery
                                     ├─ Vault Notes & Chat
                                     ├─ Intruder Chart (Recharts)
                                     └─ Gallery Icon Customizer
```

### Visual Identity & Theme
- **Color Discipline**: 60% deep obsidian canvas (`bg-slate-950`), 30% structural charcoal cards (`bg-slate-900/80` with hairline `border-slate-800`), and 10% purposeful accents (amber `#F59E0B` for clockwork, purple `#8B5CF6` for secure vault elements, crimson `#EF4444` for intruder threat signals).
- **Zero-Pill Discipline**: Metadata displayed as clean, unboxed typography separated by `·` markers rather than enclosed pill badges.
- **Ergonomics & Touch Targets**: All interactive elements maintain $\ge 44 \times 44\text{px}$ hitboxes compliant with mobile thumb-zone ergonomics.

---

## 3. Key Product Decisions & Trade-Offs

### Decision 1: Icon-Only Entry vs. Multi-Touch Gestures
- **Chosen Approach**: The Clock app can only be entered by tapping the icon on the home screen. The vault inside can only be entered by pressing down the central clock pivot.
- **Rationale**: Eliminates accidental discovery and removes any visual "switch view" buttons that would compromise stealth.

### Decision 2: Local Encrypted Storage vs. Cloud Sync
- **Chosen Approach**: Local storage with Web Crypto / base64 serialization.
- **Rationale**: True privacy requires zero data transmission to external servers. Eliminates network latency and maintains offline usability.

### Decision 3: Recharts Analytical Telemetry
- **Chosen Approach**: Responsive `AreaChart` and `BarChart` toggle with 7-day daily and 24-hour interval aggregations.
- **Rationale**: Provides clear threat intelligence regarding when unauthorized access was attempted, paired with an interactive testing simulator.

---

## 4. Technical Architecture & Data Strategy

### System Component Diagram

```
┌────────────────────────────────────────────────────────────────────────┐
│                          PhoneShell (Container)                        │
├────────────────────────────────────────────────────────────────────────┤
│                                                                        │
│  ┌───────────────────────┐             ┌────────────────────────────┐  │
│  │   HomeScreen (View)   │             │       ClockApp (View)      │  │
│  │  - Device Status Bar  │   Tap Icon  │  - Analog/Digital Clock    │  │
│  │  - Time/Date Widget   │ ──────────► │  - World Clocks (UTC)      │  │
│  │  - Visible Apps Grid  │             │  - Alarm, Stopwatch, Timer │  │
│  │  - Dock (Custom Icon) │             │  - Center Crown Trigger    │  │
│  └───────────────────────┘             └─────────────┬──────────────┘  │
│                                                      │ Hold 750ms      │
│                                                      ▼                 │
│                                        ┌────────────────────────────┐  │
│                                        │     PinPadModal (Modal)    │  │
│                                        │  - Web Audio Tactile Clicks│  │
│                                        │  - Master / Decoy PIN Check│  │
│                                        └─────────────┬──────────────┘  │
│                                                      │ Verified        │
│                                                      ▼                 │
│                                        ┌────────────────────────────┐  │
│                                        │   VaultDashboard (Space)   │  │
│                                        ├────────────────────────────┤  │
│                                        │ • App Hider Toggle Matrix  │  │
│                                        │ • Built-in In-Vault Tools: │  │
│                                        │   - PhotoVaultApp          │  │
│                                        │   - NotesVaultApp          │  │
│                                        │   - BrowserVaultApp        │  │
│                                        │   - ChatVaultApp           │  │
│                                        │ • IntruderLogChart         │  │
│                                        │   (Recharts Area/Bar)      │  │
│                                        │ • Gallery Icon Customizer  │  │
│                                        │ • Panic Lock Action        │  │
│                                        └─────────────┬──────────────┘  │
│                                                      │                 │
│                                                      ▼                 │
│                                        ┌────────────────────────────┐  │
│                                        │    storage.ts (Local DB)   │  │
│                                        │  - apps, alarms, settings  │  │
│                                        │  - photos, notes, logs     │  │
│                                        └────────────────────────────┘  │
└────────────────────────────────────────────────────────────────────────┘
```

### Entity Data Models

```typescript
export interface VaultSettings {
  pin: string;              // Master PIN (e.g. "1234")
  decoyPin: string;         // Decoy PIN (e.g. "0000")
  disguiseName: string;     // Active label (e.g. "Clock", "Time OS")
  customIconUrl?: string;   // Image URL or base64 from gallery
  intruderLogs: IntruderAttempt[];
}

export interface IntruderAttempt {
  id: string;
  timestamp: string;
  date?: string;            // "YYYY-MM-DD"
  time?: string;            // "HH:MM"
  hour?: number;            // 0 - 23
  dayName?: string;         // "Mon", "Tue", etc.
  enteredPin: string;
  success: boolean;
}

export interface AppItem {
  id: string;
  name: string;
  iconName: string;
  color: string;
  category: AppCategory;
  isHidden: boolean;        // If true, omitted from HomeScreen
  isBuiltInTool?: 'photos' | 'notes' | 'browser' | 'chat' | 'files' | 'custom';
  customUrl?: string;
}
```

---

## 5. Verification & Execution Status

- [x] **Camouflage Verification**: Launching the app directly opens the smartphone launcher; opening the Clock app reveals an authentic, operational clock face with live sweep hand, world clocks, alarms, stopwatch, and timer. Zero hint badges, notifications, or counters exist anywhere.
- [x] **Access Isolation**: The physical home bar cannot open the app; it only functions as an exit/panic return to the home screen. All "switch view" controls have been permanently removed.
- [x] **Trigger Mechanics**: Holding down the center pivot of the analog clock face for 750ms triggers the secret PIN pad with Web Audio feedback and haptic vibration.
- [x] **Intruder Frequency Recharts**: Recharts visualization with 7-day daily and 24-hour interval aggregations, custom dark tooltip, and real-time simulator is active in the Security & Intruder Logs tab.
- [x] **Gallery Icon Customization**: Users can select custom images from their device gallery or vault photos to replace the Clock app icon on both the home screen grid and dock, with one-tap reset to default.

