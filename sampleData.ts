import { Course } from './types';

export const SAMPLE_COURSE: Course = {
  id: 'sample-27d-001',
  courseNumber: 'TJAGLCS-27D-ADV',
  schoolName: 'The Judge Advocate General\'s Legal Center and School',
  mos: '27D',
  title: 'Senior Paralegal Leadership & Management',
  description: 'Advanced leadership course for senior paralegals focusing on administrative law oversight and ethical decision making in legal operations.',
  audience: 'Senior Paralegals (E6-E7)',
  totalDuration: 12,
  status: 'Validated',
  date: new Date().toISOString().split('T')[0],
  references: ['AR 27-10 (Military Justice)', 'AR 135-178 (Enlisted Administrative Separations)', 'TRADOC Pam 350-70-14'],
  lessons: [
    {
      id: 'l1',
      title: 'Ethical Oversight in Legal Operations',
      durationHours: 4,
      scope: 'This lesson covers the ethical responsibilities of senior paralegals in managing legal offices.',
      tlo: {
        action: 'Manage legal office ethical compliance',
        condition: 'Given a complex legal office scenario with conflicting staff interests and Army regulations.',
        standard: 'Achieve 100% compliance with TJAG ethical standards and AR 27-10.'
      },
      elos: [
        {
          id: 'e1',
          title: 'Analyze potential ethical conflicts in paralegal-attorney relationships.',
          learningStepActivities: [
            {
              title: 'Practical Exercise: Ethical Conflict Simulation',
              timeMinutes: 45,
              method: 'Practical Exercise',
              description: 'Analyze a case study involving a conflict of interest in an administrative separation board.',
              practicalExercise: {
                id: 'pe1',
                title: 'Legal Office Ethics Simulation',
                type: 'Simulation',
                description: 'Respond to three high-pressure scenarios where ethical boundaries are tested.',
                steps: [
                  'Review the conflict of interest memo.',
                  'Identify regulatory violations using AR 27-10.',
                  'Draft a recommendation for the Staff Judge Advocate.'
                ],
                scoringCriteria: [
                  'Identified 3 out of 3 regulatory violations.',
                  'Recommendation cites correct sections of the Manual for Courts-Martial.',
                  'Zero safety violations during board simulation.'
                ]
              }
            }
          ]
        }
      ],
      script: "[SHOW SLIDE 1]\nGood morning. Today we transition from technical experts to ethical leaders. As senior paralegals, you are the conscience of the legal office.",
      slides: [
        {
          id: 's1',
          title: 'The Ethical Paradigm',
          bulletPoints: ['Defining the Senior Paralegal role', 'AR 27-10 Ethics overview', 'Professional Responsibility'],
          instructorNotes: 'Emphasize the difference between paralegal ethics and attorney ethics.'
        }
      ]
    }
  ],
  courseTests: {
    diagnostic: {
      versionType: 'Diagnostic',
      purpose: 'Assess baseline knowledge of military justice regulations.',
      items: [
        {
          type: 'Multiple Choice',
          question: 'What regulation governs Military Justice?',
          options: ['AR 600-20', 'AR 27-10', 'AR 15-6', 'AR 670-1'],
          answer: 'AR 27-10',
          bloomLevel: 'K1',
          rubric: ''
        }
      ]
    },
    formative: {
      versionType: 'Formative',
      purpose: 'Verify understanding of ethical oversight concepts.',
      items: [
        {
          type: 'Short Answer Essay',
          question: 'Analyze how a Senior Paralegal prevents a conflict of interest during a summary court-martial.',
          answer: 'Student must detail the screening process and referral steps.',
          bloomLevel: 'K4',
          rubric: '1. Mentions screening process (2pts)\n2. Cites AR 27-10 correctly (2pts)\n3. Explains referral to Trial Defense Services (1pt)'
        }
      ]
    },
    summative: {
      versionType: 'Summative',
      purpose: 'Final proficiency validation for Course Graduation.',
      items: [
        {
          type: 'Matching',
          question: 'Match the legal term to its correct definition.',
          options: ['Jurisdiction|Legal power to hear a case', 'Preponderance|Standard for civil actions', 'Nexus|Connection between conduct and service'],
          answer: '1-A, 2-B, 3-C',
          bloomLevel: 'K2',
          rubric: ''
        }
      ]
    }
  }
};