import type { Routine, WorkoutSession, Exercise } from './models';

export interface WeighIn {
  date: string;
  weight: number;
  time?: string;
  notes?: string;
  _ts?: number;
}

export interface DayNote {
  tag?: string;
  text?: string;
  _ts?: number;
}

export interface MeasurementEntry {
  date: string;
  values: Record<string, number>;
  photos?: string[];
  notes?: string;
  _ts?: number;
}

export interface GymStateSettings {
  unit: 'kg' | 'lbs';
  restSec: number;
  restPauseSec: number;
  sound: boolean;
  soundOnSilent: boolean;
  vibrateOnSilent: boolean;
  timerFlash: boolean;
  timedSetOvertime: boolean;
  keepAwake: boolean;
  lang: string;
  theme: string;
  accent: string;
  body: 'male' | 'female' | string;
  targetW: number | null;
  rateGoal: number | null;
  gifSize: 'full' | 'small' | string;
  heatmapMetric: string;
  volumeWarmups: boolean;
  scheduleMode: 'week' | 'rotation' | null;
}

export interface PersistedGymState extends Partial<GymStateSettings> {
  bodyweight: WeighIn[];
  routines: Routine[];
  week: Record<string, unknown>;
  dayPlan: Record<string, unknown>;
  dayNotes: Record<string, DayNote>;
  measurements: MeasurementEntry[];
  measurementEnabled: string[] | null;
  customMeasurements: unknown[];
  queue: unknown | null;
  rotation: unknown | null;
  exWeights: Record<string, number>;
  workouts: WorkoutSession[];
  active: unknown | null;
  customEx: Exercise[];
  _ts?: number;
}

export interface BackupArchive {
  version: number;
  exportedAt: string;
  appVersion: string;
  state: PersistedGymState;
  media?: Record<string, string>;
}

