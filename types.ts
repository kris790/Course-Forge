
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

export interface SubSection {
  id: string;
  title: string;
  type: 'ELO' | 'LSA';
  script?: string;
  slide?: Slide;
  practicalExercise?: PracticalExercise;
  isVerified: boolean;
}

export interface LearningStepActivity {
  title: string;
  timeMinutes: number;
  method: 'Lecture' | 'Practical Exercise' | 'Discussion' | 'Demonstration' | 'Role Play';
  description: string;
  practicalExercise?: PracticalExercise;
  checkOnLearning?: CheckOnLearning;
  guidance?: string;
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

export type TestItemType = 'Multiple Choice' | 'Complex Multiple Choice' | 'Short Answer Essay' | 'True/False' | 'Fill in the Blank' | 'Matching' | 'Sequencing';

export interface TestItem {
  id?: string;
  type: TestItemType;
  question: string;
  options?: string[];
  answer: string;
  rubric?: string;
  bloomLevel: 'K1' | 'K2' | 'K3' | 'K4';
}

export interface TestVersion {
  versionType: 'Diagnostic' | 'Formative' | 'Summative' | 'A' | 'B' | 'C';
  purpose: string;
  items: TestItem[];
}

export interface Slide {
  id: string;
  title: string;
  bulletPoints: string[];
  instructorNotes: string;
}

export type DevelopmentStage = 
  | 'TLO_Generation' 
  | 'ELO_LSA_Generation' 
  | 'Outline_Verification' 
  | 'Subsection_Development' 
  | 'Section_COL' 
  | 'Complete';

export interface Lesson {
  id: string;
  title: string;
  durationHours: number;
  tlo?: TerminalObjective;
  elos: EnablingObjective[];
  subSections: SubSection[];
  checkOnLearningItems?: TestItem[]; // 3-4 questions at the end of the lesson
  slides?: Slide[];
  script?: string;
  armyRegulations?: string[];
  scope?: string;
  prerequisites?: string;
  instructorQualifications?: string;
  summary?: string;
  referencesVerified?: boolean;
  detectedReferences?: string[];
  stage: DevelopmentStage;
  currentSubSectionIndex: number;
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
    versionA: TestVersion;
    versionB: TestVersion;
    versionC: TestVersion;
  };
  references: string[];
  status: 'Draft' | 'Validated' | 'Accredited';
  referenceMaterial?: string;
  goldStandardExamples?: string;
  date?: string;
}
