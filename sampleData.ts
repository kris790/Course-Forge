
import { Course } from './types';

export const SAMPLE_COURSE: Course = {
  id: 'sample-27d-001',
  courseNumber: 'TJAGLCS-27D-ADV',
  schoolName: 'The Judge Advocate General\'s Legal Center and School',
  mos: '27D',
  title: 'Senior Paralegal Leadership & Management',
  description: 'Advanced leadership course for senior paralegals focusing on administrative law oversight.',
  audience: 'Senior Paralegals (E6-E7)',
  totalDuration: 12,
  status: 'Validated',
  date: new Date().toISOString().split('T')[0],
  references: ['AR 27-10', 'TRADOC Pam 350-70-14'],
  lessons: [
    {
      id: 'l1',
      title: 'Ethical Oversight',
      durationHours: 4,
      stage: 'Complete',
      currentSubSectionIndex: 0,
      subSections: [
        {
          id: 'sub1',
          title: 'Ethical Conflict Simulation',
          type: 'LSA',
          isVerified: true,
          script: 'Welcome to the Ethical Oversight module. **AR 27-10** requires...',
          // Fix: Rename 'slide' to 'slides' and wrap the slide object in an array to comply with the SubSection interface
          slides: [{ id: 's1', title: 'Ethics Board', bulletPoints: ['Ref AR 27-10', 'Conflict Analysis'], instructorNotes: 'Focus on case law.' }]
        }
      ],
      elos: [],
      tlo: { action: 'Manage Ethics', condition: 'Classroom', standard: '100% Accuracy' }
    }
  ],
  courseTests: {
    versionA: { versionType: 'A', purpose: 'Primary Exam', items: [] },
    versionB: { versionType: 'B', purpose: 'Retest Version 1', items: [] },
    versionC: { versionType: 'C', purpose: 'Retest Version 2', items: [] }
  }
};
