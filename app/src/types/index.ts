// Tipler
export interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  startingWeight?: number;
}

export interface WorkoutDay {
  id: string;
  name: string;
  exercises: Exercise[];
}

export interface SetProgress {
  setNumber: number;
  completed: boolean;
  weight?: number;
  lastRep?: number; // Son sette kaçıncı tekrarda kaldı (gelişim takibi için)
}

export interface ExerciseProgress {
  exerciseId: string;
  sets: SetProgress[];
}

export interface WorkoutSession {
  dayId: string;
  startTime: number;
  endTime?: number;
  exercises: ExerciseProgress[];
}

export interface Measurement {
  id: string;
  date: string;
  weight: number;
  waist: number;
  chest: number;
  arm: number;
  leg: number;
}

export type View = 'home' | 'workout' | 'edit' | 'measurements' | 'history';

// Varsayılan program
export const defaultProgram: WorkoutDay[] = [
  {
    id: 'day1',
    name: 'GÖĞÜS & SIRT',
    exercises: [
      { id: 'd1e1', name: 'Bench Press', sets: 4, reps: 12, startingWeight: 0 },
      { id: 'd1e2', name: 'Machine Pec Fly', sets: 4, reps: 12, startingWeight: 0 },
      { id: 'd1e3', name: 'Machine Pulldown', sets: 4, reps: 12, startingWeight: 0 },
      { id: 'd1e4', name: 'Machine Plate Loaded Row', sets: 4, reps: 12, startingWeight: 0 },
    ],
  },
  {
    id: 'day2',
    name: 'BACAK & OMUZ',
    exercises: [
      { id: 'd2e1', name: 'Machine Leg Extension', sets: 4, reps: 12, startingWeight: 0 },
      { id: 'd2e2', name: 'Machine Hamstring Curl', sets: 4, reps: 12, startingWeight: 0 },
      { id: 'd2e3', name: 'Squat', sets: 4, reps: 12, startingWeight: 0 },
      { id: 'd2e4', name: 'Machine Overhand Overhead Press', sets: 4, reps: 12, startingWeight: 0 },
      { id: 'd2e5', name: 'Dumbbell Lateral Raise', sets: 3, reps: 12, startingWeight: 0 },
      { id: 'd2e6', name: 'Machine Reverse Fly', sets: 3, reps: 12, startingWeight: 0 },
    ],
  },
  {
    id: 'day3',
    name: 'GÖĞÜS & ARKA KOL',
    exercises: [
      { id: 'd3e1', name: 'Bench Press', sets: 4, reps: 12, startingWeight: 0 },
      { id: 'd3e2', name: 'Incline Bench Press', sets: 4, reps: 12, startingWeight: 0 },
      { id: 'd3e3', name: 'Machine Pec Fly', sets: 4, reps: 12, startingWeight: 0 },
      { id: 'd3e4', name: 'Dumbbell Weighted Dip', sets: 2, reps: 12, startingWeight: 0 },
      { id: 'd3e5', name: 'Cable Push Down', sets: 3, reps: 12, startingWeight: 0 },
      { id: 'd3e6', name: 'Cable Skullcrusher', sets: 3, reps: 12, startingWeight: 0 },
    ],
  },
  {
    id: 'day4',
    name: 'SIRT & ÖN KOL',
    exercises: [
      { id: 'd4e1', name: 'Machine Pulldown', sets: 4, reps: 12, startingWeight: 0 },
      { id: 'd4e2', name: 'Machine Plate Loaded Row', sets: 4, reps: 12, startingWeight: 0 },
      { id: 'd4e3', name: 'Machine Chest Supported T Bar Row', sets: 4, reps: 12, startingWeight: 0 },
      { id: 'd4e4', name: 'Dumbbell Curl', sets: 3, reps: 12, startingWeight: 0 },
      { id: 'd4e5', name: 'Dumbbell Hammer Curl', sets: 3, reps: 12, startingWeight: 0 },
    ],
  },
];

// LocalStorage anahtarları
export const STORAGE_KEYS = {
  PROGRAM: 'antrenmanim_program',
  MEASUREMENTS: 'antrenmanim_measurements',
  HISTORY: 'antrenmanim_history',
} as const;
