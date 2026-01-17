
import { GoogleGenAI, Type } from "@google/genai";
import { Course, Lesson, TloSuggestion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const cleanJson = (text: string): string => {
  return text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
};

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

const TEST_ITEM_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    type: { 
      type: Type.STRING, 
      description: "One of: 'Multiple Choice', 'Complex Multiple Choice', 'Short Answer Essay', 'True/False', 'Fill in the Blank'" 
    },
    question: { type: Type.STRING },
    options: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Required for Multiple Choice, Complex Multiple Choice, and True/False."
    },
    answer: { 
      type: Type.STRING, 
      description: "The correct answer or solution key." 
    },
    rubric: { 
      type: Type.STRING, 
      description: "Required for Short Answer Essay. Define 3-5 specific grading points." 
    },
    bloomLevel: { 
      type: Type.STRING, 
      description: "K1, K2, K3, or K4" 
    }
  },
  required: ["type", "question", "answer", "bloomLevel"]
};

const TEST_VERSION_SCHEMA = {
  type: Type.OBJECT,
  properties: {
    purpose: { type: Type.STRING },
    items: {
      type: Type.ARRAY,
      items: TEST_ITEM_SCHEMA
    }
  },
  required: ["purpose", "items"]
};

export const generateCourseStructure = async (
  mos: string, 
  topic: string, 
  duration: number, 
  referenceMaterial?: string,
  keyTasks?: string
): Promise<Partial<Course>> => {
  const taskPrompt = keyTasks ? `\n\nCORE TASKS/SKILLS TO COVER (MANDATORY):\n${keyTasks}` : '';
  const referencePrompt = referenceMaterial ? `\n\nREFERENCE DATA:\n${referenceMaterial}` : '';

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Generate a US Army POI structure for Senior Paralegals at TJAGLCS. 
    Topic: "${topic}". MOS: ${mos}. Target Duration: ${duration} hours. 
    
    GUIDANCE: 
    The user has already completed the Task Analysis. Use the provided "CORE TASKS/SKILLS" as the absolute foundation for the lesson modules. Each lesson should map back to one or more of these tasks.${taskPrompt}${referencePrompt}
    
    Action verbs for TLOs MUST be Bloom's Taxonomy Level 5 or 6.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: COURSE_SCHEMA,
      thinkingConfig: { thinkingBudget: 2000 }
    }
  });
  return JSON.parse(cleanJson(response.text));
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
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          scope: { type: Type.STRING },
          prerequisites: { type: Type.STRING },
          instructorQualifications: { type: Type.STRING },
          safetyConsiderations: { type: Type.STRING },
          summary: { type: Type.STRING },
          media: { type: Type.STRING },
          ratio: { type: Type.STRING },
          script: { type: Type.STRING },
          armyRegulations: { type: Type.ARRAY, items: { type: Type.STRING } },
          elos: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, title: { type: Type.STRING }, learningStepActivities: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { title: { type: Type.STRING }, timeMinutes: { type: Type.NUMBER }, method: { type: Type.STRING }, description: { type: Type.STRING }, guidance: { type: Type.STRING } } } } } } },
          slides: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { id: { type: Type.STRING }, title: { type: Type.STRING }, bulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } }, instructorNotes: { type: Type.STRING } } } }
        }
      },
      thinkingConfig: { thinkingBudget: 4000 }
    }
  });
  return JSON.parse(cleanJson(response.text));
};

export const generateCourseTests = async (course: Course): Promise<any> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Generate three versions of a test (Diagnostic, Formative, Summative) for the course: "${course.title}".
    
    MANDATORY: Each test version MUST include a balanced mix of:
    - Multiple Choice
    - Complex Multiple Choice (Select all that apply)
    - Short Answer Essay (Include a clear grading RUBRIC)
    - True/False
    - Fill in the Blank
    
    Ensure questions align with MOS ${course.mos} standards and the course references.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          diagnostic: TEST_VERSION_SCHEMA,
          formative: TEST_VERSION_SCHEMA,
          summative: TEST_VERSION_SCHEMA
        },
        required: ["diagnostic", "formative", "summative"]
      },
      thinkingConfig: { thinkingBudget: 8000 }
    }
  });
  return JSON.parse(cleanJson(response.text));
};

export const reviewCourseTlos = async (course: Course): Promise<TloSuggestion[]> => {
  const lessonsData = course.lessons.map(l => ({
    id: l.id,
    title: l.title,
    tlo: l.tlo
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Review TLOs for ${course.title}. Bloom's Level 5-6 Action verbs, specific conditions, measurable standards.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            lessonId: { type: Type.STRING },
            lessonTitle: { type: Type.STRING },
            suggestedAction: { type: Type.STRING },
            suggestedCondition: { type: Type.STRING },
            suggestedStandard: { type: Type.STRING },
            reasoning: { type: Type.STRING }
          }
        }
      }
    }
  });
  return JSON.parse(cleanJson(response.text));
};
