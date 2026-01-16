
import { GoogleGenAI, Type } from "@google/genai";
import { Course, Lesson } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const COURSE_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    title: { type: Type.STRING },
    courseNumber: { type: Type.STRING },
    schoolName: { type: Type.STRING },
    description: { type: Type.STRING },
    totalDuration: { type: Type.NUMBER },
    references: { type: Type.ARRAY, items: { type: Type.STRING } },
    lessons: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          durationHours: { type: Type.NUMBER },
          tlo: {
            type: Type.OBJECT,
            properties: {
              action: { type: Type.STRING, description: "Bloom's Taxonomy Level 5 (Synthesis) or above action verb." },
              condition: { type: Type.STRING },
              standard: { type: Type.STRING }
            },
            required: ["action", "condition", "standard"]
          },
          elos: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: { id: { type: Type.STRING }, title: { type: Type.STRING } },
              required: ["id", "title"]
            }
          }
        },
        required: ["id", "title", "durationHours", "tlo", "elos"]
      }
    }
  },
  required: ["title", "description", "totalDuration", "lessons", "references"]
};

const LESSON_CONTENT_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    scope: { type: Type.STRING },
    prerequisites: { type: Type.STRING },
    instructorQualifications: { type: Type.STRING },
    safetyConsiderations: { type: Type.STRING },
    summary: { type: Type.STRING },
    media: { type: Type.STRING },
    ratio: { type: Type.STRING, description: "Instructor to Student Ratio" },
    script: { type: Type.STRING },
    armyRegulations: { type: Type.ARRAY, items: { type: Type.STRING } },
    elos: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          learningStepActivities: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                timeMinutes: { type: Type.NUMBER },
                method: { type: Type.STRING },
                description: { type: Type.STRING },
                guidance: { type: Type.STRING, description: "Detailed step-by-step guidance adhering to Experiential Learning Model (ELM)." },
                practicalExercise: {
                  type: Type.OBJECT,
                  properties: {
                    title: { type: Type.STRING },
                    type: { type: Type.STRING },
                    description: { type: Type.STRING },
                    steps: { type: Type.ARRAY, items: { type: Type.STRING } },
                    scoringCriteria: { type: Type.ARRAY, items: { type: Type.STRING } }
                  }
                },
                checkOnLearning: {
                  type: Type.OBJECT,
                  properties: {
                    question: { type: Type.STRING },
                    answer: { type: Type.STRING }
                  }
                }
              },
              required: ["title", "timeMinutes", "method", "description", "guidance"]
            }
          }
        },
        required: ["id", "title", "learningStepActivities"]
      }
    },
    slides: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          id: { type: Type.STRING },
          title: { type: Type.STRING },
          bulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
          instructorNotes: { type: Type.STRING }
        },
        required: ["id", "title", "bulletPoints", "instructorNotes"]
      }
    }
  },
  required: ["script", "elos", "slides", "scope", "summary"]
};

export const generateCourseStructure = async (mos: string, topic: string, duration: number, referenceMaterial?: string): Promise<Partial<Course>> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Generate a US Army POI structure for Senior Paralegals at TJAGLCS. 
    Topic: "${topic}". MOS: ${mos}. Duration: ${duration} hours. 
    Action verbs for TLOs MUST be Bloom's Taxonomy Level 5 or 6.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: COURSE_SCHEMA
    }
  });
  return JSON.parse(response.text);
};

export const generateLessonDetails = async (courseTitle: string, lesson: Lesson, referenceMaterial?: string): Promise<any> => {
  const referencePrompt = referenceMaterial ? `\n\nREFERENCE SOURCE:\n${referenceMaterial}` : '';
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Develop a TJAGLCS Lesson Plan for Senior Paralegals for: "${lesson.title}". 
    
    REQUIRED:
    1. Experiential Learning Model (ELM) flow for LSAs.
    2. Word-for-word instructor script with [SHOW SLIDE X] markers.
    3. Step-by-step guidance for every activity.
    4. Scope, Prerequisites, and Special Instructor Qualifications.${referencePrompt}`,
    config: {
      responseMimeType: "application/json",
      responseSchema: LESSON_CONTENT_SCHEMA,
      thinkingConfig: { thinkingBudget: 4000 }
    }
  });
  return JSON.parse(response.text);
};

export const generateCourseTests = async (course: Course): Promise<any> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Generate three versions of a test (Diagnostic, Formative, Summative) for the entire course: "${course.title}".`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          diagnostic: { type: Type.OBJECT, properties: { items: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, answer: { type: Type.STRING }, bloomLevel: { type: Type.STRING } } } } } },
          formative: { type: Type.OBJECT, properties: { items: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, answer: { type: Type.STRING }, bloomLevel: { type: Type.STRING } } } } } },
          summative: { type: Type.OBJECT, properties: { items: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, answer: { type: Type.STRING }, bloomLevel: { type: Type.STRING } } } } } }
        }
      },
      thinkingConfig: { thinkingBudget: 4000 }
    }
  });
  return JSON.parse(response.text);
};
