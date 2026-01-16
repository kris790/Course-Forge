
export interface PracticalExercise {
  id: string;
  title: string;
  type: 'Simulation' | 'Hands-on' | 'Team Scenario' | 'Individual Job Aid';
  description: string;
  steps: string[];
  scoringCriteria: string[];
}

export interface TestItem {
  question: string;
  options?: string[];
  answer: string;
  bloomLevel: 'K1' | 'K2' | 'K3' | 'K4';
}

export interface TestVersion {
  versionType: 'Diagnostic' | 'Formative' | 'Summative';
  purpose: string;
  items: TestItem[];
}

export interface Slide {
  title: string;
  bulletPoints: string[];
  instructorNotes: string;
}

export interface Lesson {
  id: string;
  title: string;
  durationHours: number;
  learningObjectives: string[];
  practicalExercises: PracticalExercise[];
  tests: {
    diagnostic: TestVersion;
    formative: TestVersion;
    summative: TestVersion;
  };
  slides?: Slide[];
}

export interface Course {
  id: string;
  mos: string;
  title: string;
  description: string;
  audience: string;
  totalDuration: number;
  lessons: Lesson[];
  status: 'Draft' | 'Validated' | 'Accredited';
  referenceMaterial?: string;
}

export type AddiePhase = 'Analysis' | 'Design' | 'Development' | 'Implementation' | 'Evaluation';
