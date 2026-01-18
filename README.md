# 🪖 Army CourseForge

**Army CourseForge** is an automated course development platform designed specifically for US Army Training Developers and Proponents. It streamlines the creation of Programs of Instruction (POI) and Training Support Packages (TSP) by leveraging the **TRADOC ADDIE model** (Analysis, Design, Development, Implementation, Evaluation) as codified in **TRADOC Pamphlet 350-70-14**.

## 🎯 Mission
To reduce the administrative burden on training developers by automating the "Design" and "Development" phases of the ADDIE process, ensuring 100% compliance with doctrinal standards and Bloom's Taxonomy.

## 🚀 Core Features

### 1. Rapid Forge (Wizard)
- **Architecture Setup:** Define MOS, key tasks, and audience to generate a skeletal POI.
- **Doctrinal Grounding:** Upload Army Regulations (AR), Field Manuals (FM), and Army Techniques Publications (ATP) as the "Source of Truth" for AI generation.
- **Gold Standard Integration:** Upload previous high-quality TSPs to serve as a style guide for the AI.

### 2. Instructional Development Forge
- **Hierarchical Generation:** Iteratively builds Terminal Learning Objectives (TLOs), Enabling Learning Objectives (ELOs), and Learning Step Activities (LSAs).
- **Automated Media:** Generates instructor scripts with `[SHOW SLIDE]` cues and matching instructional slides.
- **Practical Exercises (PE):** Creates hands-on scenarios, role plays, and simulations with built-in scoring criteria and observer checklists.

### 3. Assessment Engine
- **Check on Learning (COL):** Integrated formative assessments at the end of every module.
- **Master Exams:** Generates three distinct versions (A, B, and C) of the final course exam to support student retesting and avoid academic compromise.

### 4. Proponent Export (TSP)
- **Automatic TSP Generation:** Compiles all scripts, objectives, PEs, and exams into a formal, print-ready Training Support Package.

## 🛠 Tech Stack
- **Frontend:** React 19, Tailwind CSS (Design System: Military/SaaS Hybrid).
- **Intelligence:** 
  - `gemini-3-pro-preview`: Used for complex reasoning, Bloom's level verification, and pedagogical structure.
  - `gemini-3-flash-preview`: Used for high-speed OCR extraction from legacy slide screenshots.
- **State Management:** LocalStorage persistence for solo-dev offline capability.

## 📋 Compliance Standards
- **TRADOC Pam 350-70-14:** (Instructional Development).
- **Bloom’s Taxonomy:** Level 5+ required for TLO actions.
- **Experiential Learning Model (ELM):** LSA guidance follows the Concrete Experience, Publish and Process, Generalize New Information, and Develop stages.

---
*RESTRICTED USE: This tool is intended for use by authorized Army Training Developers.*