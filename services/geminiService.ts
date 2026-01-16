
import { GoogleGenAI, Type } from "@google/genai";
import { Course, Lesson, PracticalExercise, TestVersion, TestItem } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

const COURSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    description: { type: Type.STRING },
    totalDuration: { type: Type.NUMBER },
    lessons: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          durationHours: { type: Type.NUMBER },
          learningObjectives: { type: Type.ARRAY, items: { type: Type.STRING } },
        }
      }
    }
  },
  required: ["title", "description", "totalDuration", "lessons"]
};

const LESSON_CONTENT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    practicalExercises: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          type: { 
            type: Type.STRING,
            description: "Must be one of: 'Simulation', 'Hands-on', 'Team Scenario', 'Individual Job Aid'"
          },
          description: { type: Type.STRING },
          steps: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Sequential, step-by-step execution instructions for the student."
          },
          scoringCriteria: { 
            type: Type.ARRAY, 
            items: { type: Type.STRING },
            description: "Measurable rubric items (e.g., 'Correctly identified discrepancy per AR 15-6')."
          }
        },
        required: ["id", "title", "type", "description", "steps", "scoringCriteria"]
      }
    },
    slides: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          bulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          instructorNotes: { type: Type.STRING }
        },
        required: ["title", "bulletPoints", "instructorNotes"]
      }
    },
    tests: {
      type: Type.OBJECT,
      properties: {
        diagnostic: {
          type: Type.OBJECT,
          properties: {
            versionType: { type: Type.STRING },
            purpose: { type: Type.STRING },
            items: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  question: { type: Type.STRING },
                  options: { type: Type.ARRAY, items: { type: Type.STRING } },
                  answer: { type: Type.STRING },
                  bloomLevel: { type: Type.STRING }
                }
              }
            }
          }
        },
        formative: {
           type: Type.OBJECT,
           properties: {
             versionType: { type: Type.STRING },
             purpose: { type: Type.STRING },
             items: {
               type: Type.ARRAY,
               items: {
                 type: Type.OBJECT,
                 properties: {
                   question: { type: Type.STRING },
                   options: { type: Type.ARRAY, items: { type: Type.STRING } },
                   answer: { type: Type.STRING },
                   bloomLevel: { type: Type.STRING }
                 }
               }
             }
           }
        },
        summative: {
           type: Type.OBJECT,
           properties: {
             versionType: { type: Type.STRING },
             purpose: { type: Type.STRING },
             items: {
               type: Type.ARRAY,
               items: {
                 type: Type.OBJECT,
                 properties: {
                   question: { type: Type.STRING },
                   options: { type: Type.ARRAY, items: { type: Type.STRING } },
                   answer: { type: Type.STRING },
                   bloomLevel: { type: Type.STRING }
                 }
               }
             }
           }
        }
      }
    }
  },
  required: ["practicalExercises", "slides", "tests"]
};

export const generateCourseStructure = async (mos: string, topic: string, duration: number, referenceMaterial?: string): Promise<Partial<Course>> => {
  const referencePrompt = referenceMaterial 
    ? `\n\nUSE THE FOLLOWING REFERENCE MATERIAL AS THE PRIMARY SOURCE FOR TERMINOLOGY AND STANDARDS:\n${referenceMaterial}`
    : '';

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Generate a US Army Program of Instruction (POI) structure for MOS ${mos} on the topic of "${topic}" with a total duration of ${duration} hours. Follow TRADOC Pamphlet 350-70-14.${referencePrompt}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: COURSE_SCHEMA,
      thinkingConfig: { thinkingBudget: 2000 }
    }
  });

  return JSON.parse(response.text);
};

export const generateLessonDetails = async (courseTitle: string, lessonTitle: string, objectives: string[], referenceMaterial?: string): Promise<any> => {
  const referencePrompt = referenceMaterial 
    ? `\n\nCRITICAL SOURCE MATERIAL:\nThe following text is the authoritative reference for this lesson. You MUST extract specific terminology, regulatory procedures, and Army standards from this text to create the exercises, slides, and test questions:\n${referenceMaterial}`
    : '\n\nNote: No specific reference material provided. Use general US Army TRADOC standards and doctrinal knowledge for the specified topic.';

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Generate comprehensive instructional materials for a US Army lesson following the ADDIE development model.
    
Course: "${courseTitle}"
Lesson: "${lessonTitle}"
Target Learning Objectives: ${objectives.join(', ')}

${referencePrompt}

Requirements for Generation:
1. Practical Exercises: Generate 3 rigorous, high-fidelity practical exercises (select from: Simulation, Hands-on, Team Scenario, Individual Job Aid).
   - Each exercise MUST have a title reflecting a real-world military task.
   - Steps: Provide granular, sequential execution steps. These must follow a logical military workflow (e.g., Prepare, Execute, Assess).
   - Scoring Criteria: Define specific, measurable rubric items directly derived from the standards in the reference material (e.g., 'Pass if student identifies AR 15-6 violation in step 3').
   - Alignment: Every instruction and criterion MUST be traceable back to the reference material or objectives.
2. Presentation Slides: Create 5-7 classroom-ready slides. Each slide requires a clear title, 3-5 high-impact bullet points, and detailed Instructor Briefing Notes that provide background, explanation, and "Instructor Tips" for that specific slide.
3. Validated Test Versions: Create three distinct, unique test variants:
   - Diagnostic (Pre-test): Assessing prerequisites.
   - Formative (Check-on-Learning): Questions for mid-lesson checks.
   - Summative (End-of-Unit): Comprehensive final assessment.
   - Quality Standard: All questions must correspond to Bloom's Taxonomy levels (K1-K4) and have answers explicitly supported by the provided source material.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: LESSON_CONTENT_SCHEMA,
      thinkingConfig: { thinkingBudget: 8000 }
    }
  });

  return JSON.parse(response.text);
};
