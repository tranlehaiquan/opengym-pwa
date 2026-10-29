import type { ReactNode } from 'react';
import type { PersistedGymState } from './storage';

export interface SheetItem {
  id: string;
  render: (close: () => void) => ReactNode;
  kind?: 'sheet' | 'center';
  locked?: boolean;
  wide?: boolean;
}

export interface ToastAction {
  label: string;
  run: () => void;
  id: number;
}

export interface RestTimer {
  left: number;
  total: number;
  endsAt: number;
  forIdx?: number;
  forSet?: number;
  ready?: boolean;
  paused?: boolean;
  kind?: 'switch' | string;
}

export interface WorkOwner {
  idx: number;
  i: number;
  id: string;
}

export interface WorkTimer {
  left: number;
  total: number;
  endsAt: number;
  label: string;
  overtime?: boolean;
  alerted?: boolean;
  owner?: WorkOwner;
}

export interface UIState {
  sheets: SheetItem[];
  toastMsg: string;
  toastAction: ToastAction | null;
  swipeHint: { idx: number; i: number; id: string } | null;
  setFlash: { idx: number; i: number; id: string } | null;
  timer: RestTimer | null;
  work: WorkTimer | null;
  timerFlashId: number;

  flashTimer: () => void;
  openSheet: (
    render: (close: () => void) => ReactNode,
    options?: { kind?: 'sheet' | 'center'; locked?: boolean; wide?: boolean }
  ) => { id: string; close: () => void; lock: (v: boolean) => void };
  closeSheet: (id: string) => void;
  closeAll: () => void;

  toast: (msg: string, options?: { action?: string; onAction?: () => void; ms?: number }) => void;
  runToastAction: () => void;
  dismissToast: () => void;
  pauseToast: () => void;
  resumeToast: () => void;

  startRest: (sec: number, forIdx?: number, options?: { kind?: string; forSet?: number }) => void;
  pauseRest: () => void;
  resumeRest: () => void;
  addRest: (sec: number) => void;
  shiftRestOwner: (at: number, delta: number) => void;
  followNativeRest: (data: { endsAt: number; left: number; total: number; paused?: boolean }) => void;
  stopRest: () => void;

  startWork: (
    sec: number,
    label: string,
    onDone?: (elapsedSec: number, meta?: { chimed?: boolean; abandoned?: boolean }) => void,
    owner?: WorkOwner | null
  ) => void;
  bindWork: (make: (work: WorkTimer) => (elapsedSec: number, meta?: { chimed?: boolean; abandoned?: boolean }) => void) => void;
  finishWorkEarly: () => void;
  abandonWork: () => void;
  stopWork: () => void;
}

export interface AppStoreState {
  S: PersistedGymState;
  user: { id?: string; email?: string; name?: string } | null;
  ready: boolean;
  sync: {
    offline: boolean;
    pending: boolean;
    auth: boolean;
    lastError: unknown;
    lastSynced: number;
    server: string | null;
    held: boolean;
    status: string;
  };
  config: unknown;
  needsMobileOnboarding: boolean;
  permSteps: boolean;
  finishPermSteps: () => void;
  linkCode: string | null;
  coachLocal: unknown;
  setCoachLocal: (patch: unknown) => Promise<void>;
  saveNow: () => Promise<void>;
  update: (mut: (draft: PersistedGymState) => void, push?: boolean) => void;
  [key: string]: any;
}
