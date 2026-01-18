# Product Requirements Document (PRD): Army CourseForge

**Version:** 1.1  
**Status:** Active Development  
**Owner:** Senior Frontend Lead / Training Proponent Partner  

## 1. Executive Summary
Army CourseForge is a high-fidelity generative AI platform designed to automate the creation of US Army Training Support Packages (TSP). By codifying **TRADOC Pamphlet 350-70-14** into a sequential AI workflow, the application enables MOS Proponents to transform raw regulatory text and legacy slides into doctrinally sound, ready-to-train Programs of Instruction (POI).

## 2. Strategic Objectives
- **Modernize ADDIE:** Transition from manual, document-heavy workflows to an AI-assisted "Design & Development" phase.
- **Doctrinal Integrity:** Enforce Bloom's Taxonomy Level 5+ for Terminal Learning Objectives (TLO) and ensure 100% regulatory citation coverage via automated bolding.
- **Standardization:** Produce consistent instructional scripts and practical exercises across different Army schools.

## 3. Target Audience
- **Course Managers (SFC-MSG/CPT-MAJ):** SMEs who understand the "what" but struggle with the "how" of instructional design.
- **Training Developers:** Professional designers who need to scale their output.
- **Quality Assurance Elements (QAE):** Reviewers ensuring compliance with TRADOC standards.

## 4. Functional Requirements

### FR-01: The Rapid Forge Wizard
- **Architectural Skeleton:** Generates a full course structure (Lessons, Durations, MOS-mapping) based on high-level intent.
- **Reference Grounding:** Supports two-tier grounding:
  - *Tier 1 (Base):* Core regulatory and doctrinal material.
  - *Tier 2 (Gold Standard):* Style guides and previous high-quality examples to influence AI "voice."

### FR-02: Doctrinal Vision (OCR)
- **Capability:** Utilizes `gemini-3-flash-preview` to process batches of legacy slide screenshots.
- **Output:** Extracts text while identifying and bolding regulatory references (e.g., **AR 600-20**) to maintain traceability.

### FR-03: Lock-Step Development Workflow
The application enforces a sequential "Waterfall-within-Agile" model to prevent error propagation:
1. **Objectives Stage:** Generate and manually verify TLOs.
2. **Outline Stage:** Generate Enabling Learning Objectives (ELOs) and Learning Step Activities (LSAs).
3. **Content Stage:** Forge scripts, slides, and Practical Exercises (PE) for each individual subsection.
4. **Validation Stage:** Final "Check on Learning" (COL) generation and master exam creation.

### FR-04: Experiential Learning Model (ELM) Content
- **Narrative Scripts:** AI generates instructor-led talk tracks with embedded `[SHOW SLIDE X]` cues.
- **Hands-On Simulations:** Every module requires a Practical Exercise with step-by-step instructions and observer checklists.
- **Slide Deck Generation:** Structured, unclassified-formatted instructional visuals with detailed instructor notes.

### FR-05: Triple-Version Assessment Engine
- **Compromise Mitigation:** Automatically generates three distinct versions (A, B, and C) of the final exam.
- **Pedagogical Mapping:** Ensures test questions map directly to the Bloom's Level defined in the TLO/ELO.

## 5. Technical Specification

### 5.1 Tech Stack
- **Framework:** React 19 (Hooks, Context for State Management).
- **Styling:** Tailwind CSS (Tactical/Dark Slate Theme).
- **AI Models:**
  - `gemini-3-pro-preview`: Reasoning, Objective Synthesis, and Script Generation.
  - `gemini-3-flash-preview`: High-speed image extraction and OCR.
- **Persistence:** Browser LocalStorage for persistent local-only drafting (meeting initial privacy constraints).

### 5.2 Key Data Entities (Simplified)
- **Course:** Metadata, References, and an array of Lessons.
- **Lesson:** TLO, ELOs, SubSections, and Current Development Stage.
- **SubSection:** The atomic unit of training—contains 1 Script, 1 Slide, and 1 Practical Exercise.

## 6. UI/UX Design Principles
- **The "Command Console" Aesthetic:** Uses high-contrast typography and a slate/amber color palette.
- **Progress Transparency:** Visual "Forge Status" indicators at every level (Course, Lesson, Subsection).
- **Print-First Export:** The Training Support Package (TSP) view is optimized for CSS `media-print` to ensure official Army forms look authentic.

## 7. Security & Compliance
- **Data Locality:** No server-side storage of course content; all data remains in the user's browser session.
- **Classification:** Default headers set to "UNCLASSIFIED" with logic to bold specific sensitive regulatory citations.

## 8. Roadmap
- **v1.2:** PDF Export integration using `jsPDF` for the full TSP report.
- **v1.5:** Audio Simulation Forge using `gemini-2.5-flash-preview-tts` for role-play exercises.
- **v2.0:** Video scenario generation for tactical vignettes using `veo-3.1-fast-generate-preview`.