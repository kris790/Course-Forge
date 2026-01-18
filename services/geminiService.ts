
import { GoogleGenAI, Type } from "@google/genai";
import { Course, Lesson, TerminalObjective, EnablingObjective, SubSection, TestItem, TestVersion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const cleanJson = (text: string): string => {
  return text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
};

export const generateTLO = async (lessonTitle: string, refMaterial: string): Promise<TerminalObjective> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Act as a TRADOC Training Developer. Generate a Terminal Learning Objective (TLO) for the lesson: "${lessonTitle}". 
    Use Bloom's Taxonomy Level 5 (Synthesis) or Level 6 (Evaluation) action verbs.
    Reference Material: ${refMaterial}
    BOLD all doctrinal references (e.g. **AR 27-10**).`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          action: { type: Type.STRING },
          condition: { type: Type.STRING },
          standard: { type: Type.STRING }
        },
        required: ["action", "condition", "standard"]
      }
    }
  });
  return JSON.parse(cleanJson(response.text));
};

export const generateELOsAndLSAs = async (lesson: Lesson, refMaterial: string): Promise<EnablingObjective[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Generate Enabling Learning Objectives (ELOs) and Learning Step Activities (LSAs) for: "${lesson.title}".
    TLO: ${JSON.stringify(lesson.tlo)}
    Ref: ${refMaterial}
    Use Bloom's verbs. BOLD all doctrinal references.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
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
                  description: { type: Type.STRING }
                }
              }
            }
          }
        }
      }
    }
  });
  return JSON.parse(cleanJson(response.text));
};

export const generateSubSectionContent = async (subSection: SubSection, lesson: Lesson, refMaterial: string): Promise<Partial<SubSection>> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Develop instructional content for Subsection: "${subSection.title}".
    Part of Lesson: "${lesson.title}"
    Ref Material: ${refMaterial}

    MANDATORY:
    1. BOLD all doctrinal references (e.g. **AR 27-10**).
    2. Provide an instructor script.
    3. Provide one corresponding slide.
    4. Provide a Practical Exercise (PE) with steps and scoring criteria.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          script: { type: Type.STRING },
          slide: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              bulletPoints: { type: Type.ARRAY, items: { type: Type.STRING } },
              instructorNotes: { type: Type.STRING }
            }
          },
          practicalExercise: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING },
              type: { type: Type.STRING },
              description: { type: Type.STRING },
              steps: { type: Type.ARRAY, items: { type: Type.STRING } },
              scoringCriteria: { type: Type.ARRAY, items: { type: Type.STRING } }
            }
          }
        }
      }
    }
  });
  return JSON.parse(cleanJson(response.text));
};

export const generateSectionCOL = async (lesson: Lesson, refMaterial: string): Promise<TestItem[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Generate 4 Check on Learning (COL) questions for the completed lesson: "${lesson.title}".
    Based on the following TLO/ELOs: ${JSON.stringify(lesson.tlo)}
    BOLD references. Include various question types.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            type: { type: Type.STRING },
            question: { type: Type.STRING },
            options: { type: Type.ARRAY, items: { type: Type.STRING } },
            answer: { type: Type.STRING },
            bloomLevel: { type: Type.STRING }
          }
        }
      }
    }
  });
  return JSON.parse(cleanJson(response.text));
};

export const generateThreeExamVersions = async (course: Course): Promise<{ versionA: TestVersion, versionB: TestVersion, versionC: TestVersion }> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Generate three versions (A, B, and C) of a final exam for the course: "${course.title}".
    Each version must cover the same objectives but use different questions to allow for retesting.
    BOLD references.
    Each test needs 10 questions.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          versionA: { type: Type.OBJECT, properties: { purpose: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, question: { type: Type.STRING }, answer: { type: Type.STRING } } } } } },
          versionB: { type: Type.OBJECT, properties: { purpose: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, question: { type: Type.STRING }, answer: { type: Type.STRING } } } } } },
          versionC: { type: Type.OBJECT, properties: { purpose: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, question: { type: Type.STRING }, answer: { type: Type.STRING } } } } } }
        }
      }
    }
  });
  return JSON.parse(cleanJson(response.text));
};

export const extractContentFromSlides = async (images: { data: string, mimeType: string }[]): Promise<string> => {
  const parts = images.map(img => ({
    inlineData: {
      data: img.data.split(',')[1],
      mimeType: img.mimeType
    }
  }));

  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: {
      parts: [
        ...parts,
        { text: "Extract all instructional content from these slide images. BOLD doctrinal references." }
      ]
    }
  });

  return response.text || "";
};

export const generateCourseStructure = async (
  mos: string, 
  topic: string, 
  duration: number, 
  referenceMaterial?: string,
  keyTasks?: string,
  goldStandardExamples?: string
): Promise<Partial<Course>> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Generate a POI skeleton for: "${topic}". BOLD references.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          title: { type: Type.STRING },
          lessons: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                title: { type: Type.STRING },
                durationHours: { type: Type.NUMBER }
              }
            }
          }
        }
      }
    }
  });
  return JSON.parse(cleanJson(response.text));
};
