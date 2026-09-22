# Cognitive Assessment Simulator

> **Independent Training Simulator for Speeded Psychometric Batteries**

>
> **Release Version**: [![Version](https://img.shields.io/badge/version-v0.2.0--beta.1-blue.svg)](lib/version.ts)

---

## 1. Project Overview

The **Cognitive Assessment Simulator** is a production-quality, containerized web platform architected to train candidates for high-speed psychometric evaluations (specifically inspired by Part 1 of the ParagonCorp Online Assessment).

The platform trains candidates to maintain accuracy, focus, and visual discrimination under extreme time limits (~60 seconds per module) across rapidly changing cognitive domains.

---

## 2. Educational Purpose & Core Objectives

The platform provides deliberate practice on:
- **Rapid recognition** of diverse question types (numerical, series, figural patterns, spatial transformations, syllogisms, and attention matching).
- **Speeded problem solving** under a strict 60-second module budget.
- **Cognitive stamina** to sustain vigilance across 21 consecutive subtests without mid-test pauses.
- **Objective diagnostic analytics** separating speed from accuracy to pinpoint impulsive errors, perfectionist bottlenecks, and fatigue drop.
- **Question Quality Assurance**: In-simulation reporting of ambiguous or visually unclear questions, dual previewing in authoring, transparent explanations, and historical versioning.

---

## 3. Important Legal & Educational Disclaimer

> [!IMPORTANT]
> **Independent Simulator — No Official Affiliation**
> - This application is an **independent educational training simulator** and is **NOT** an official assessment of PT Paragon Technology and Innovation.
> - This repository contains **ZERO** proprietary Paragon questions, zero leaked or scraped question banks, and zero proprietary graphics, logos, or commercial assets.
> - All questions, diagrams, SVG visualizations, procedural generators, and code are **100% original**.
> - The application outputs **objective training performance metrics**; it does not provide clinical psychological diagnoses, IQ scores, or employment guarantees.

---

## 4. What's New in `v0.2.0-beta.1`

Version `v0.2.0-beta.1` introduces comprehensive quality control, visual clarification, and administrative tools:

1. **Visible SemVer Versioning & Beta Tagging**:
   - Centralized version constant in `lib/version.ts` synchronized with `package.json`.
   - Subtle, modern `<BetaBadge />` displayed across the header, simulator, and admin interfaces.
2. **Question Quality & Ambiguity Reporting**:
   - Candidates can report ambiguous, incomplete, or visually unclear questions during the simulation without disrupting their timer.
   - Distinct user duplicate prevention.
   - Automatic transition of question status to `REVIEW_REQUIRED` when $\ge 3$ distinct reports are received.
   - Dedicated Admin Reports Dashboard at `/admin/question-reports` with filterable statuses (`OPEN`, `IN_REVIEW`, `RESOLVED`, `DISMISSED`, `DUPLICATE`) and admin notes.
3. **Question Authoring Enhancements & Image Support**:
   - Support for uploading stimulus images (above question, below question, or inline) and option images for A, B, C, D.
   - Supports PNG, JPEG, WEBP, and SVG formats up to 5MB.
   - Images stored in persistent Docker volume `question_uploads` at `/app/public/uploads/questions`.
4. **Visual Question Quality Tools (Dual Preview)**:
   - "Preview as User": renders exactly what test-takers experience, with clickable options and answer key hidden.
   - "Preview with Answer Key": clearly highlights the verified correct answer, step-by-step explanation, and time-saving strategy.
5. **Answer-Key Validation & Transparency**:
   - Server-side validation requires questions to have a valid matching option and non-empty explanation before being marked `ACTIVE`.
   - In `FULL_SIMULATION` mode, answer keys and explanations are securely stripped on the server to prevent candidate inspection leaks.
6. **Question Versioning**:
   - Every edit creates an immutable snapshot in `QuestionVersion` and increments the version number.
   - Attempts reference the specific `questionVersion` answered.
7. **Authentication & Role-Based Authorization**:
   - User roles: `USER` and `ADMIN`.
   - Standard password hashing with salted `crypto.scrypt` and signed HTTP-only cookies (`cas_session`).
   - Corporate login page at `/login` with demo quick-fill helpers.
   - Admin routes protected via Next.js `middleware.ts`.
   - Admin user management dashboard at `/admin/users` with last-admin protection.

---

## 5. Confirmed Assessment Characteristics (Source A)

Drawn directly from the official participant manual (*Manual Guide Peserta Paragon.pdf*):

1. **Assessment Name**: "Psychometrics Online Assessment".
2. **Assessment Structure**: Exactly **21 subtests** executed non-stop until the final completion page.
3. **Time Budget**: Approximately **1 minute per subtest/module** ("sekitar 1 menit").
4. **Timer Display**: Remaining time is visibly displayed in the top-right corner during the test.
5. **Automatic Advancement**: When module time expires, the system automatically saves selected answers and advances to the next subtest.
6. **Repetitive Question Presentation**: Questions may appear repetitive within a module; participants are instructed to keep working and scroll down.
7. **Fullscreen & Security**: Intended to be completed in fullscreen (F11 / Control+Cmd+F); calculators and external assistance are prohibited.
8. **Start & Finish**: Timer begins only after clicking *"Selanjutnya"* on the dual-checkbox agreement page; test terminates at a dedicated *"Terima Kasih"* completion page.
9. **Reload Resilience**: In case of network drop or blank page, participants can press `CTRL+R` to resume the active subtest without losing completed answers.

---

## 6. Reconstructed Curriculum Explanation (Source B)

Because the official manual does not disclose the proprietary names of all 21 subtests, this simulator uses a **reconstructed training curriculum** based on candidate reports and psychometric standards:

| Module # | Module Title | Domain | Pacing Focus |
| :---: | :--- | :--- | :---: |
| **01** | 01 — Numerical Speed | SPEED_ACCURACY | Rapid Mental Math (5s/item) |
| **02** | 02 — Number Series | NUMBER_SERIES | Arithmetic & Delta Sequences (10s/item) |
| **03** | 03 — Verbal Analogy | VERBAL_REASONING | Semantic Relationships (7.5s/item) |
| **04** | 04 — Abstract Pattern | ABSTRACT_REASONING | Figural Transformations (10s/item) |
| **05** | 05 — Logical Deduction | LOGICAL_REASONING | Conditional Statements (12s/item) |
| **06** | 06 — Spatial Reasoning | SPATIAL_REASONING | Mental Rotation & Reflection (12s/item) |
| **07** | 07 — Attention Scan | ATTENTION_CONCENTRATION | Target Symbol Grid Search (6s/item) |
| **08** | 08 — Numerical Comparison | NUMERICAL_REASONING | Inequality & Magnitude Check (7.5s/item) |
| **09** | 09 — Verbal Classification | VERBAL_REASONING | Odd-Word-Out Categorization (7.5s/item) |
| **10** | 10 — Pattern Transformation | ABSTRACT_REASONING | 2-step Shape Morphing (10s/item) |
| **11** | 11 — Logical Sequence | LOGICAL_REASONING | Linear Ordering & Puzzles (12s/item) |
| **12** | 12 — Mental Rotation | SPATIAL_REASONING | 3D Isometric Cube Folding (12s/item) |
| **13** | 13 — Rapid Arithmetic | SPEED_ACCURACY | Mental Arithmetic Recovery (5s/item) |
| **14** | 14 — Visual Odd-One-Out | ABSTRACT_REASONING | Invariant Geometric Anomalies (10s/item) |
| **15** | 15 — Ratio & Proportion | NUMERICAL_REASONING | Business Math & Scaling (12s/item) |
| **16** | 16 — Syllogism | LOGICAL_REASONING | Formal Syllogistic Deduction (12s/item) |
| **17** | 17 — Symbol Matching | ATTENTION_CONCENTRATION | High-Speed Code Verification (5s/item) |
| **18** | 18 — Mixed Numerical Logic | NUMERICAL_REASONING | Arithmetic Constraint Solving (10s/item) |
| **19** | 19 — Abstract Matrix | ABSTRACT_REASONING | 3x3 Raven-Style Visual Matrix (15s/item) |
| **20** | 20 — Speed & Accuracy | SPEED_ACCURACY | Rapid Statement Verification (5s/item) |
| **21** | 21 — Mixed Cognitive Challenge | MULTI_DOMAIN | Peak Task-Switching Finale (10s/item) |

---

## 7. Installation & Docker Instructions

### Running with Docker Compose (Recommended)

To start the complete application (PostgreSQL + Next.js web application + persistent volumes):

```bash
docker compose up --build
```

The database will initialize, apply schema pushes, seed 160+ original questions and curriculum blueprint, bootstrap admin accounts, and expose the web application at:
👉 **`http://localhost:3000`**

### Default Demo Credentials

| Role | Email | Password | Access |
| :--- | :--- | :--- | :--- |
| **Administrator** | `admin@simulator.local` | `AdminPass123!` | Full Access (`/admin`, `/admin/users`, `/admin/question-reports`) |
| **Candidate** | `user@simulator.local` | `UserPass123!` | Assessment Simulation, Practice Drills, Personal History |
| **Guest** | *One-click guest login* | *None* | Anonymous testing & practice |

### Running Locally (Development)

Prerequisites: Node.js 20+, PostgreSQL running locally, Python 3.10+ in `.venv`.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/cognitive_assessment_db?schema=public"
   AUTH_SECRET="cas-production-fallback-secret-key-2026-secure"
   ADMIN_EMAIL="admin@simulator.local"
   ADMIN_PASSWORD="AdminPass123!"
   ```
3. Push database schema & seed questions:
   ```bash
   npx prisma db push
   npx tsx prisma/seed.ts
   ```
4. Start development server:
   ```bash
   npm run dev
   ```

---

## 8. Environment Variables

| Variable | Description | Default |
| :--- | :--- | :--- |
| `DATABASE_URL` | PostgreSQL connection string with schema | `postgresql://postgres:postgrespassword@db:5432/cognitive_assessment_db?schema=public` |
| `AUTH_SECRET` | HMAC-SHA256 secret for session tokens | `cas-production-fallback-secret-key-2026-secure` |
| `ADMIN_EMAIL` | Bootstrap admin email | `admin@simulator.local` |
| `ADMIN_PASSWORD` | Bootstrap admin password | `AdminPass123!` |
| `NODE_ENV` | Application runtime environment | `production` / `development` |
| `PORT` | HTTP server listening port | `3000` |

---

## 9. Full Simulation Integrity & Browser Constraints

In **Full Simulation Mode**, the simulator enforces strict assessment environment integrity:

- **Pre-Simulation Warning Gate**: Mandatory explicit consent checkbox acknowledging that leaving the environment terminates the test.
- **Fullscreen Verification**: The candidate must enter fullscreen mode before simulation integrity monitoring is armed (`simulationIntegrityActive = true`).
- **Immediate Termination Events**:
  - `Escape` key pressed
  - `Alt` key pressed
  - Fullscreen exit event
  - Window blur or tab hidden (`visibilitychange` / `blur`)
- **Idempotent Termination API**: Calls `/api/assessment/terminate` idempotently, logs an `IntegrityEvent`, sets session status to `INTEGRITY_TERMINATED`, and computes partial score metrics labeled `PARTIAL SIMULATION`.
- **Termination Screen & Resume Guard**: Candidates are redirected to `/simulation/[sessionId]/terminated` displaying their progress and saved answer confirmation. Resumption is strictly prohibited.
- **Exemptions**: Practice Mode, Calibration Drills, and Admin Previews are completely exempt from integrity termination.

> [!WARNING]
> **Browser Environment Limitations**: Modern web browsers do not grant web applications absolute low-level control to suppress operating-system shortcuts (such as `Alt+Tab`, `Alt+F4`, or Windows/Meta keys). The platform implements best-effort browser event listeners (`keydown`, `visibilitychange`, `fullscreenchange`, `blur`) and terminates the assessment immediately upon detecting any departure attempt.

---

## 10. Question Bank Architecture & Visual Reasoning v2.0

The question bank contains 240 items (200 active items, 40 deprecated legacy visual items):

### Visual Question Bank Replacement
To address ambiguity and ensure genuine figural reasoning, all 40 legacy visual questions (`ABS_001`–`020` and `SPA_001`–`020`) have been marked `DEPRECATED` (`active: false`) and replaced by **80 new deterministic visual items** across 8 families where **every answer choice (A, B, C, D) is a visual SVG diagram**:

1. **Visual Sequence Completion** (`VIS_SEQ_001`–`010`): Clockwise/counter-clockwise stepped rotation with deterministic step-size rules.
2. **Shape Transformation & Analogy** (`VIS_TRN_001`–`010`): Two-step morphing (inversion, color inversion, secondary element addition).
3. **Matrix Reasoning** (`VIS_MAT_001`–`010`): 2x2 Raven-style visual matrices with row/column invariant logic.
4. **Visual Odd-One-Out** (`VIS_ODO_001`–`010`): Invariant geometric rules (sides, symmetry, parity) with pure visual candidate options.
5. **2D Mental Rotation** (`VIS_ROT_001`–`010`): Rigid-body rotated targets vs. mirrored distractors.
6. **Mirror Transformation** (`VIS_MIR_001`–`010`): Horizontal and vertical reflection symmetry.
7. **Spatial Grid Position** (`VIS_POS_001`–`010`): Dot and symbol movements along perimeter/diagonal trajectories.
8. **3D Cube Orientation** (`VIS_CUB_001`–`010`): Isometric projection cube rotations with distinct face patterns.

### 7-Point Quality Gate Audit
Run the automated quality gate auditor:

```bash
./scripts/audit-visual-questions
```

The script evaluates:
1. `visualIntegrity`: Valid SVG syntax and responsive `viewBox` on stimulus and all options.
2. `answerUniqueness`: Exactly 1 correct answer matching options A–D.
3. `renderIntegrity`: Visual SVG options (no text-only options).
4. `ruleClarity`: Explicit deterministic `rule`, `explanation`, and `solvingStrategy`.
5. `optionCompleteness`: 4 complete options A–D.
6. `accessibilityMetadata`: Descriptive `altText` on all options.
7. `overallQualityGate`: PASS / FAIL status report per question and overall summary.

---

## 11. Scoring Methodology & Speed-Accuracy Matrix

The platform evaluates performance through multi-dimensional metrics:

1. **Accuracy Rate**:
   $$\text{Accuracy (\%)} = \frac{N_{\text{correct}}}{N_{\text{attempted}}} \times 100$$
2. **Speed-Accuracy Quadrant Matrix**:
   - **Fast + Accurate**: Accuracy $\ge 75\%$, Median Time $\le 8.0$s *(Target zone)*.
   - **Fast + Inaccurate**: Accuracy $< 75\%$, Median Time $\le 8.0$s *(Impulsive risk)*.
   - **Slow + Accurate**: Accuracy $\ge 75\%$, Median Time $> 8.0$s *(Perfectionist risk)*.
   - **Slow + Inaccurate**: Accuracy $< 75\%$, Median Time $> 8.0$s *(Foundational weakness)*.
3. **Partial Simulation Metric**: Terminated sessions retain all submitted answers up to the point of termination and display a prominent `PARTIAL SIMULATION` badge.

---

## 12. Testing & Verification

Run automated test suites:

```bash
# Run Python-based integrity, crypto, validation, and algorithm test suite (via .venv)
./.venv/bin/python3 tests/run_python_tests.py

# Run visual question quality gate audit
./scripts/audit-visual-questions
```

All 13 verification tests pass successfully:
- Question bank integrity (240 questions across 8 domains)
- 21-module curriculum blueprint
- Scoring & pacing formulas
- Speed vs. Accuracy matrix (4 quadrants)
- Timer grace window
- SemVer versioning (`v0.2.0-beta.1`)
- Question quality status & answer-key validation
- Reporting threshold & duplicate prevention
- Question versioning & historical snapshots
- Answer-key privacy in full simulation
- Auth password hashing & tamper-proof HMAC tokens
- Full simulation integrity termination & idempotency
- Visual question bank v2.0 replacement & 7-point quality gate

