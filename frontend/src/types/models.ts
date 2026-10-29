/**
 * Core workout domain models for openGym.
 */

export type WorkoutMode = 'reps' | 'time' | 'cardio';

export type SetPhase = 'work' | 'warmup';

export type SetType = 'straight' | 'dropset' | 'restpause';

export interface DropSetEntry {
  w: number;
  r: number;
}

export interface RestPauseCluster {
  r: number;
  restSec?: number;
}

export interface SideSetData {
  w?: number;
  r?: number;
  drops?: DropSetEntry[];
  clusters?: RestPauseCluster[];
}

export interface SetEntry {
  w?: number;
  r?: number;
  t?: number;
  phase?: SetPhase;
  warmup?: boolean;
  type?: SetType;
  failure?: boolean;
  effort?: number;
  drops?: DropSetEntry[];
  clusters?: RestPauseCluster[];
  sides?: {
    L: SideSetData;
    R: SideSetData;
  };
  completed?: boolean;
  restSec?: number;
}

export type MuscleGroup =
  | 'chest'
  | 'back'
  | 'shoulders'
  | 'biceps'
  | 'triceps'
  | 'forearms'
  | 'quads'
  | 'hamstrings'
  | 'glutes'
  | 'calves'
  | 'abs'
  | 'obliques'
  | 'traps'
  | 'cardio'
  | 'full_body'
  | string;

export interface Exercise {
  id: string;
  name: string;
  category?: string;
  muscle?: MuscleGroup;
  secondaryMuscles?: MuscleGroup[];
  equipment?: string;
  unilateral?: boolean;
  mode?: WorkoutMode;
  custom?: boolean;
  mediaHash?: string;
  notes?: string;
  aliases?: string[];
}

export interface WorkoutExercise {
  exerciseId: string;
  customName?: string;
  sets: SetEntry[];
  notes?: string;
  restSec?: number;
  supersetWith?: string[];
}

export interface WorkoutSession {
  id: string;
  date: string;
  routineId?: string;
  routineName?: string;
  exercises: WorkoutExercise[];
  notes?: string;
  durationSec?: number;
  startTime?: number;
  endTime?: number;
  bodyweight?: number;
}

export interface RoutineExercise {
  exerciseId: string;
  targetSets?: number;
  targetReps?: number;
  targetWeight?: number;
  targetTime?: number;
  restSec?: number;
  notes?: string;
}

export interface Routine {
  id: string;
  name: string;
  exercises: RoutineExercise[];
  color?: string;
  notes?: string;
  updatedAt?: number;
}

export interface DayPlan {
  dayIndex: number;
  routineId?: string;
  customLabel?: string;
  rest?: boolean;
}

