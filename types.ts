
export interface PracticalExercise {
  id: string;
  title: string;
  type: 'Simulation' | 'Hands-on' | 'Team Scenario' | 'Individual Job Aid' | 'Role Play';
  description: string;
  steps: string[];
  scoringCriteria: string[];
}

export interface CheckOnLearning {
  question: string;
  answer: string;
  remediation?: string;
}

export interface LearningStepActivity {
  title: string;
  timeMinutes: number;
  method: 'Lecture' | 'Practical Exercise' | 'Discussion' | 'Demonstration' | 'Role Play';
  description: string;
  practicalExercise?: PracticalExercise;
  checkOnLearning?: CheckOnLearning;
  guidance?: string; // Step-by-step guidance for ELM
}

export interface EnablingObjective {
  id: string;
  title: string;
  learningStepActivities: LearningStepActivity[];
}

export interface TerminalObjective {
  action: string;
  condition: string;
  standard: string;
}

export interface TloSuggestion {
  lessonId: string;
  lessonTitle: string;
  suggestedAction: string;
  suggestedCondition: string;
  suggestedStandard: string;
  reasoning: string;
}

export type TestItemType = 'Multiple Choice' | 'Complex Multiple Choice' | 'Short Answer Essay' | 'True/False' | 'Fill in the Blank';

export interface TestItem {
  id?: string;
  type: TestItemType;
  question: string;
  options?: string[];
  answer: string;
  rubric?: string; // Specific to Short Answer Essay
  bloomLevel: 'K1' | 'K2' | 'K3' | 'K4';
}

export interface TestVersion {
  versionType: 'Diagnostic' | 'Formative' | 'Summative';
  purpose: string;
  items: TestItem[];
}

export interface Slide {
  id: string;
  title: string;
  bulletPoints: string[];
  instructorNotes: string;
}

export interface Lesson {
  id: string;
  title: string;
  durationHours: number;
  tlo?: TerminalObjective;
  elos: EnablingObjective[];
  slides?: Slide[];
  script?: string;
  armyRegulations?: string[];
  // Lesson Plan Specifics
  scope?: string;
  prerequisites?: string;
  instructorQualifications?: string;
  safetyConsiderations?: string;
  summary?: string;
  media?: string;
  ratio?: string;
}

export interface Course {
  id: string;
  courseNumber?: string;
  schoolName?: string;
  mos: string;
  title: string;
  description: string;
  audience: string;
  totalDuration: number;
  lessons: Lesson[];
  courseTests: {
    diagnostic: TestVersion;
    formative: TestVersion;
    summative: TestVersion;
  };
  references: string[];
  status: 'Draft' | 'Validated' | 'Accredited';
  referenceMaterial?: string;
  date?: string;
}

export type AddiePhase = 'Analysis' | 'Design' | 'Development' | 'Implementation' | 'Evaluation';
