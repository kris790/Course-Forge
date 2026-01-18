

import { GoogleGenAI, Type } from "@google/genai";
import { Course, Lesson, TerminalObjective, EnablingObjective, SubSection, TestItem, TestVersion } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const cleanJson = (text: string): string => {
  return text.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
};

export const generateTLO = async (lessonTitle: string, refMaterial: string): Promise<TerminalObjective> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Act as a TRADOC Senior Training Developer. 
    Generate a Terminal Learning Objective (TLO) for the lesson: "${lessonTitle}". 
    MANDATORY RULES:
    1. Use Bloom's Taxonomy Level 5 (Synthesis) or Level 6 (Evaluation) action verbs.
    2. BOLD all doctrinal references (e.g. **AR 27-10**, **TRADOC Pam 350-70-14**).
    3. References must be verifiable.
    
    Reference Material provided by user: ${refMaterial}`,
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
    TLO context: ${JSON.stringify(lesson.tlo)}
    
    MANDATORY RULES:
    1. Use Bloom's verbs.
    2. BOLD all doctrinal references (e.g. **ATP 3-37.2**).
    3. Map LSAs clearly to the ELOs.
    
    Reference Material: ${refMaterial}`,
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
    contents: `Develop highly detailed instructional content for Subsection: "${subSection.title}".
    Parent Lesson: "${lesson.title}"
    TLO Context: ${JSON.stringify(lesson.tlo)}

    REQUIREMENTS:
    1. BOLD all doctrinal references (e.g. **AR 600-20**) in both the script and the slide.
    2. Provide a narrative instructor script with [SHOW SLIDE] markers.
    3. Provide one detailed instructional slide.
    4. Provide a mandatory Practical Exercise (PE) for this subsection with steps and scoring criteria.
    5. Ensure all text taken from regs is referenced and bolded.

    Reference Material: ${refMaterial}`,
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
      },
      thinkingConfig: { thinkingBudget: 8000 }
    }
  });
  return JSON.parse(cleanJson(response.text));
};

export const generateSectionCOL = async (lesson: Lesson, refMaterial: string): Promise<TestItem[]> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Generate 4 Check on Learning (COL) questions for the end of the lesson section: "${lesson.title}".
    BOLD references in questions/answers.
    Questions must verify mastery of the lesson objectives.`,
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
    contents: `Create three distinct versions (A, B, and C) of a comprehensive final examination for: "${course.title}".
    Each version must test the same core competencies but with different scenarios and questions.
    This allows for retesting failed students and identifying specific retraining needs.
    BOLD all doctrinal references. 10 questions per test.`,
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          versionA: { 
            type: Type.OBJECT, 
            properties: { 
              purpose: { type: Type.STRING }, 
              items: { 
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
          },
          versionB: { type: Type.OBJECT, properties: { purpose: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, answer: { type: Type.STRING }, bloomLevel: { type: Type.STRING } } } } } },
          versionC: { type: Type.OBJECT, properties: { purpose: { type: Type.STRING }, items: { type: Type.ARRAY, items: { type: Type.OBJECT, properties: { type: { type: Type.STRING }, question: { type: Type.STRING }, options: { type: Type.ARRAY, items: { type: Type.STRING } }, answer: { type: Type.STRING }, bloomLevel: { type: Type.STRING } } } } } }
        }
      },
      thinkingConfig: { thinkingBudget: 12000 }
    }
  });
  return JSON.parse(cleanJson(response.text));
};

// Updated signature to handle extra parameters from AddieWizard
export const generateCourseStructure = async (
  mos: string, 
  topic: string, 
  duration: number, 
  refMaterial: string,
  keyTasks?: string,
  goldStandard?: string
): Promise<Partial<Course>> => {
  const response = await ai.models.generateContent({
    model: 'gemini-3-pro-preview',
    contents: `Generate a POI structure for an Army course on "${topic}" for MOS ${mos}. Total hours: ${duration}.
    Ref Material provided: ${refMaterial.substring(0, 2000)}
    ${keyTasks ? `Key Tasks: ${keyTasks}` : ''}
    ${goldStandard ? `Gold Standard Style Guide: ${goldStandard}` : ''}
    BOLD references.`,
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
        { text: "Extract all instructional text from these slides. BOLD all regulatory references." }
      ]
    }
  });

  return response.text || "";
};
