# Cognitive Assessment Simulator

> **Independent Training Simulator for Speeded Psychometric Batteries**
> *Reproducing the structure and time pressure of Part 1 Cognitive Assessments*

---

## 1. Project Overview

The **Cognitive Assessment Simulator** is a production-quality, containerized web platform architected to train candidates for high-speed psychometric evaluations (specifically inspired by Part 1 of the ParagonCorp Online Assessment).

The platform trains candidates to maintain accuracy and focus under extreme time limits (~60 seconds per module) across rapidly changing cognitive domains.

---

## 2. Educational Purpose & Core Objectives

The platform provides deliberate practice on:
- **Rapid recognition** of diverse question types (numerical, series, figural patterns, spatial transformations, syllogisms, and attention matching).
- **Speeded problem solving** under a strict 60-second module budget.
- **Cognitive stamina** to sustain vigilance across 21 consecutive subtests without mid-test pauses.
- **Objective diagnostic analytics** separating speed from accuracy to pinpoint impulsive errors, perfectionist bottlenecks, and fatigue drop.

---

## 3. Important Legal & Educational Disclaimer

> [!IMPORTANT]
> **Independent Simulator — No Official Affiliation**
> - This application is an **independent educational training simulator** and is **NOT** an official assessment of PT Paragon Technology and Innovation.
> - This repository contains **ZERO** proprietary Paragon questions, zero leaked or scraped question banks, and zero proprietary graphics, logos, or commercial assets.
> - All questions, diagrams, SVG visualizations, procedural generators, and code are **100% original**.
> - The application outputs **objective training performance metrics**; it does not provide clinical psychological diagnoses, IQ scores, or employment guarantees.

---

## 4. Confirmed Assessment Characteristics (Source A)

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

## 5. Reconstructed Curriculum Explanation (Source B)

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

## 6. Architecture

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide Icons.
- **State & Timer Subsystem**: Server-authoritative timestamps (`expiresAt = startedAt + 60,000ms`), client drift-compensated ticker, 3-second network transit grace period.
- **Persistence & ORM**: PostgreSQL 16 + Prisma ORM.
- **Analytics & Visualizations**: Recharts + custom SVG vector radar and fatigue bar charts.
- **Validation**: Zod schema validation.
- **Containerization**: Multi-stage Docker build + Docker Compose with PostgreSQL health checks.

---

## 7. Installation & Docker Instructions

### Running with Docker Compose (Recommended)

To start the complete application (PostgreSQL + Next.js web application) with one command:

```bash
docker compose up --build
```

The database will initialize, apply schema pushes, seed 160+ original questions and the 21-module curriculum, and expose the web application at:
👉 **`http://localhost:3000`**

### Running Locally (Development)

Prerequisites: Node.js 20+, PostgreSQL running locally, Python 3.10+ in `.venv`.

1. Install dependencies:
   ```bash
   npm install
   ```
2. Configure `.env`:
   ```env
   DATABASE_URL="postgresql://postgres:postgrespassword@localhost:5432/cognitive_assessment_db?schema=public"
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
| `NODE_ENV` | Application runtime environment | `production` / `development` |
| `PORT` | HTTP server listening port | `3000` |

---

## 9. Question Bank Architecture

- **Minimum Seed Volume**: 160+ hand-crafted, psychometrically calibrated items (20 items across 8 distinct domain families).
- **Externalized Storage**: Questions reside in `data/seedQuestions.json` and are seeded into PostgreSQL via `prisma/seed.ts`.
- **Procedural Generators**: Located in `features/questions/procedural/` for algorithmic generation of number series, numerical word problems, visual rotation patterns, 3D cubes, and symbol grids.
- **Item Metadata**: Each question contains prompt, options, correctAnswer, step-by-step explanation, solvingStrategy, estimatedDifficulty, and SVG visual assets.

---

## 10. Scoring Methodology & Speed-Accuracy Matrix

The platform evaluates performance through multi-dimensional metrics:

1. **Accuracy Rate**:
   $$\text{Accuracy (\%)} = \frac{N_{\text{correct}}}{N_{\text{attempted}}} \times 100$$
2. **Speed-Accuracy Quadrant Matrix**:
   - **Fast + Accurate**: Accuracy $\ge 75\%$, Median Time $\le 8.0$s *(Target zone)*.
   - **Fast + Inaccurate**: Accuracy $< 75\%$, Median Time $\le 8.0$s *(Impulsive risk)*.
   - **Slow + Accurate**: Accuracy $\ge 75\%$, Median Time $> 8.0$s *(Perfectionist risk)*.
   - **Slow + Inaccurate**: Accuracy $< 75\%$, Median Time $> 8.0$s *(Foundational weakness)*.
3. **Cognitive Fatigue Index**: Compares performance in Modules 1–7 vs Modules 15–21 to detect stamina degradation.
4. **Cognitive Error Taxonomy**: Categorizes mistakes into Careless Rapid ($< 1.5$s), Arithmetic, Pattern Misrecognition, Spatial Orientation, Distractor Selection, and Timeouts.

---

## 11. Testing & Verification

Run automated test suites:

```bash
# Run Python-based integrity and algorithm test suite (via .venv)
./.venv/bin/python3 tests/run_python_tests.py

# Run Vitest unit & integration tests
npm test

# Run Playwright End-to-End tests
npx playwright test
```

---

## 12. Limitations & Future Roadmap

- **Part 1 Focus**: This application specifically simulates Part 1 cognitive speed tests. Part 2 (personality/Talentlytica self-assessment) can be integrated in future phases via the modular assessment engine.
- **Offline Mode**: Client local storage caches answers optimistically during active tests, syncing with the server. A full ServiceWorker offline PWA mode is planned for future iterations.
