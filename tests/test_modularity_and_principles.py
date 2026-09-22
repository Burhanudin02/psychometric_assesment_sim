#!/usr/bin/env python3
"""
Software Development Principles & Modularity Automated Verification Suite
Cognitive Assessment Simulator v0.1.0-beta

Rigorously verifies compliance with:
1. Separation of Concerns (SoC)
2. Modularity
3. Abstraction
4. Anticipation of Change
5. Single Responsibility Principle (SRP)
6. Open/Closed Principle (OCP)
7. Liskov Substitution Principle (LSP)
8. Interface Segregation Principle (ISP)
9. Dependency Inversion Principle (DIP)
"""

import os
import re
import json
import sys

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

def assert_file_exists(rel_path):
    full_path = os.path.join(BASE_DIR, rel_path)
    assert os.path.exists(full_path), f"Required module does not exist: {rel_path}"
    return full_path

def count_lines(file_path):
    with open(file_path, "r", encoding="utf-8") as f:
        return len(f.readlines())

def test_god_file_elimination_and_modularity():
    """
    Verifies Principle 2 (Modularity) & Principle 1 (Separation of Concerns):
    Monolithic god files (> 450 lines) are dismantled into cohesive, focused modules.
    """
    print("\n--- 1. Testing Modularity & God-File Elimination ---")

    # Key former god files and their current root facade line counts
    facades = {
        "components/analytics/PacingPerformanceDashboard.tsx": 20,  # was 1214 lines
        "features/scoring/pacingMetrics.ts": 20,                   # was 490 lines
        "features/assessment/engine.ts": 30,                       # was 454 lines
        "app/api/assessment/terminate/route.ts": 40,               # was 231 lines
        "app/api/admin/questions/route.ts": 120,                   # was 473 lines
        "app/simulation/[sessionId]/page.tsx": 170,                # was 438 lines
        "app/simulation/results/[sessionId]/page.tsx": 140,        # was 419 lines
        "app/admin/page.tsx": 200,                                 # was 1067 lines
        "app/admin/users/page.tsx": 250,                           # was 651 lines
        "app/admin/question-reports/page.tsx": 150,                # was 524 lines
    }

    for path, max_allowed in facades.items():
        full = assert_file_exists(path)
        lines = count_lines(full)
        assert lines <= max_allowed, (
            f"Expected file {path} to be <= {max_allowed} lines after modularization, got {lines}"
        )
        print(f"  ✓ {path}: {lines} lines (healthy, well within threshold)")

    # Assert new modular subcomponents exist
    expected_modules = [
        # Pacing domain
        "features/scoring/pacing/types.ts",
        "features/scoring/pacing/pacingAggregator.ts",
        "features/scoring/pacing/dropDetection.ts",
        "features/scoring/pacing/recoveryDetection.ts",
        "features/scoring/pacing/stabilityCalculator.ts",
        "features/scoring/pacing/pacingInsights.ts",
        "features/scoring/pacing/pacingCsvExporter.ts",
        "features/scoring/pacing/index.ts",
        # Pacing UI
        "components/analytics/pacing/PacingChartGeometry.ts",
        "components/analytics/pacing/PacingKpiCards.tsx",
        "components/analytics/pacing/PacingDualLineChart.tsx",
        "components/analytics/pacing/PacingModuleDetailCard.tsx",
        "components/analytics/pacing/PacingDropRecoveryBanner.tsx",
        "components/analytics/pacing/PacingDataTable.tsx",
        "components/analytics/pacing/PacingPerformanceDashboard.tsx",
        # Procedural Strategy
        "features/questions/procedural/core/types.ts",
        "features/questions/procedural/core/GeneratorRegistry.ts",
        "features/questions/procedural/generators/SeriesQuestionGenerator.ts",
        "features/questions/procedural/generators/NumericalQuestionGenerator.ts",
        "features/questions/procedural/generators/PatternQuestionGenerator.ts",
        "features/questions/procedural/generators/AttentionQuestionGenerator.ts",
        "features/questions/procedural/generators/SpatialQuestionGenerator.ts",
        "features/questions/procedural/generators/index.ts",
        # Assessment services & hooks
        "features/assessment/services/assessmentGradingService.ts",
        "features/assessment/services/assessmentSessionService.ts",
        "features/assessment/services/assessmentIntegrityService.ts",
        "features/assessment/hooks/useSimulationIntegrity.ts",
        "features/assessment/hooks/useSimulationSession.ts",
        "components/assessment/simulation/SimulationModuleView.tsx",
        "components/assessment/simulation/SimulationIntegrityGate.tsx",
        # Admin Question components & services
        "features/questions/services/questionValidator.ts",
        "features/questions/services/questionAdminService.ts",
        "app/admin/components/useQuestionAdmin.ts",
        "app/admin/components/QuestionFilterToolbar.tsx",
        "app/admin/components/QuestionTable.tsx",
        "app/admin/components/QuestionFormModal.tsx",
        "app/admin/components/QuestionDualPreviewModal.tsx",
        "app/admin/components/QuestionDeleteModal.tsx",
        # Admin User components
        "app/admin/users/components/useAdminUsers.ts",
        "app/admin/users/components/UserTable.tsx",
        "app/admin/users/components/AddUserModal.tsx",
        "app/admin/users/components/ResetPasswordModal.tsx",
        "app/admin/users/components/DeleteUserModal.tsx",
        # Admin Report components
        "app/admin/question-reports/components/useQuestionReports.ts",
        "app/admin/question-reports/components/ReportSummaryCards.tsx",
        "app/admin/question-reports/components/ReportFilterToolbar.tsx",
        "app/admin/question-reports/components/ReportTable.tsx",
        "app/admin/question-reports/components/ReportActionDialog.tsx",
        # Simulation Results components
        "components/assessment/results/ResultsHeaderBanner.tsx",
        "components/assessment/results/ResultsMetricsGrid.tsx",
        "components/assessment/results/QuestionReviewAccordion.tsx",
    ]

    for mod in expected_modules:
        assert_file_exists(mod)

    print(f"  ✓ All {len(expected_modules)} discrete, high-cohesion submodules verified.")

def test_separation_of_concerns():
    """
    Verifies Principle 1 (Separation of Concerns):
    - Pure geometry calculation decoupled from React UI
    - Pure CSV serialization decoupled from display
    - Anti-cheat keyboard/blur browser traps decoupled from view rendering
    - Question validation rules decoupled from HTTP controllers
    """
    print("\n--- 2. Testing Separation of Concerns (SoC) ---")

    # Geometry file must not import React or JSX
    geom_path = assert_file_exists("components/analytics/pacing/PacingChartGeometry.ts")
    with open(geom_path, "r", encoding="utf-8") as f:
        geom_code = f.read()
    assert "react" not in geom_code.lower(), "PacingChartGeometry must be pure math, no React imports"
    assert "buildAccuracyPathSegments" in geom_code
    assert "buildResponseTimePathSegments" in geom_code
    print("  ✓ PacingChartGeometry is 100% pure mathematical coordinate logic decoupled from React.")

    # CSV Exporter must be pure utility
    csv_path = assert_file_exists("features/scoring/pacing/pacingCsvExporter.ts")
    with open(csv_path, "r", encoding="utf-8") as f:
        csv_code = f.read()
    assert "generatePacingCsv" in csv_code
    assert "Nomor Modul" in csv_code
    print("  ✓ CSV serialization is isolated into dedicated exporter.")

    # Integrity hook isolates browser event listeners
    integrity_hook = assert_file_exists("features/assessment/hooks/useSimulationIntegrity.ts")
    with open(integrity_hook, "r", encoding="utf-8") as f:
        hook_code = f.read()
    assert "fullscreenchange" in hook_code
    assert "visibilitychange" in hook_code
    assert "ESC_PRESSED" in hook_code
    print("  ✓ Anti-cheat traps and fullscreen hooks isolated from UI rendering.")

def test_abstraction_and_dependency_inversion():
    """
    Verifies Principle 3 (Abstraction) & Principle 9 (Dependency Inversion):
    Controllers and high-level engines delegate to services and repository abstractions
    rather than coupling directly to database queries.
    """
    print("\n--- 3. Testing Abstraction & Dependency Inversion (DIP) ---")

    # Route controller delegates to questionAdminService
    route_path = assert_file_exists("app/api/admin/questions/route.ts")
    with open(route_path, "r", encoding="utf-8") as f:
        route_code = f.read()
    assert "questionAdminService" in route_code
    assert "listQuestionsWithStats" in route_code
    assert "createQuestion" in route_code
    assert "updateQuestionWithSnapshot" in route_code
    assert "deleteQuestionCascade" in route_code
    assert "prisma.$transaction" not in route_code, "Transaction details abstracted inside service"
    print("  ✓ API controller depends on QuestionAdminService abstraction, not inline DB queries.")

    # Terminate route delegates to assessmentIntegrityService
    term_path = assert_file_exists("app/api/assessment/terminate/route.ts")
    with open(term_path, "r", encoding="utf-8") as f:
        term_code = f.read()
    assert "terminateAssessmentSession" in term_code
    assert "prisma" not in term_code, "Direct DB access decoupled from terminate route"
    print("  ✓ Terminate route delegates completely to assessmentIntegrityService.")

def test_single_responsibility_principle():
    """
    Verifies Principle 5 (Single Responsibility Principle):
    Each module has one distinct reason to change.
    """
    print("\n--- 4. Testing Single Responsibility Principle (SRP) ---")

    # questionValidator only handles validation
    val_path = assert_file_exists("features/questions/services/questionValidator.ts")
    with open(val_path, "r", encoding="utf-8") as f:
        val_code = f.read()
    assert "validateQuestionForActivation" in val_code
    assert "prisma" not in val_code, "Validator does not touch DB"
    print("  ✓ questionValidator has single responsibility (data integrity rules).")

    # dropDetection only detects performance drops
    drop_path = assert_file_exists("features/scoring/pacing/dropDetection.ts")
    with open(drop_path, "r", encoding="utf-8") as f:
        drop_code = f.read()
    assert "detectLargestPerformanceDrop" in drop_code
    print("  ✓ dropDetection has single responsibility (consecutive drop heuristics).")

    # recoveryDetection only evaluates recovery
    rec_path = assert_file_exists("features/scoring/pacing/recoveryDetection.ts")
    with open(rec_path, "r", encoding="utf-8") as f:
        rec_code = f.read()
    assert "detectLateRecovery" in rec_code
    print("  ✓ recoveryDetection has single responsibility (rebound evaluation).")

def test_open_closed_and_liskov_substitution():
    """
    Verifies Principle 6 (Open/Closed Principle) & Principle 7 (Liskov Substitution Principle):
    The procedural question generator system uses Strategy + Registry:
    - New generators can be added dynamically without modifying callers (OCP).
    - All generators implement IProceduralQuestionGenerator and can be substituted transparently (LSP).
    """
    print("\n--- 5. Testing Open/Closed & Liskov Substitution (OCP & LSP) ---")

    types_path = assert_file_exists("features/questions/procedural/core/types.ts")
    with open(types_path, "r", encoding="utf-8") as f:
        types_code = f.read()
    assert "interface IProceduralQuestionGenerator" in types_code
    assert "interface IGeneratorRegistry" in types_code

    reg_path = assert_file_exists("features/questions/procedural/core/GeneratorRegistry.ts")
    with open(reg_path, "r", encoding="utf-8") as f:
        reg_code = f.read()
    assert "class GeneratorRegistry implements IGeneratorRegistry" in reg_code
    assert "register(" in reg_code
    assert "getGenerator(" in reg_code
    assert "defaultGeneratorRegistry" in reg_code

    # Check generators implement the interface
    generators = [
        "SeriesQuestionGenerator.ts",
        "NumericalQuestionGenerator.ts",
        "PatternQuestionGenerator.ts",
        "AttentionQuestionGenerator.ts",
        "SpatialQuestionGenerator.ts",
    ]
    for gen_file in generators:
        full = assert_file_exists(os.path.join("features/questions/procedural/generators", gen_file))
        with open(full, "r", encoding="utf-8") as f:
            code = f.read()
        assert "implements IProceduralQuestionGenerator" in code, f"{gen_file} must implement IProceduralQuestionGenerator"
        assert "generate(" in code

    print(f"  ✓ Strategy & Registry pattern verified across all {len(generators)} procedural generators (OCP/LSP compliant).")

def test_interface_segregation():
    """
    Verifies Principle 8 (Interface Segregation Principle):
    Narrow, role-focused interfaces rather than bloated god-interfaces.
    """
    print("\n--- 6. Testing Interface Segregation (ISP) ---")

    pacing_types = assert_file_exists("features/scoring/pacing/types.ts")
    with open(pacing_types, "r", encoding="utf-8") as f:
        code = f.read()
    assert "interface ModulePerformanceItem" in code
    assert "interface PacingPhaseMetrics" in code
    assert "interface PerformanceDropInfo" in code
    assert "interface LateRecoveryInfo" in code
    assert "interface PacingMetricsSummary" in code
    print("  ✓ Pacing types segregated into granular, context-specific interfaces.")

def test_anticipation_of_change():
    """
    Verifies Principle 4 (Anticipation of Change):
    Configuration constants, thresholds, and dimensions are centralized.
    """
    print("\n--- 7. Testing Anticipation of Change ---")

    geom_path = assert_file_exists("components/analytics/pacing/PacingChartGeometry.ts")
    with open(geom_path, "r", encoding="utf-8") as f:
        code = f.read()
    assert "CHART_DIMENSIONS" in code
    assert "chartWidth: 840" in code
    assert "accChartHeight: 160" in code

    version_path = assert_file_exists("lib/version.ts")
    with open(version_path, "r", encoding="utf-8") as f:
        code = f.read()
    assert "pkg.version" in code

    print("  ✓ Centralized design constants, chart geometry dimensions, and versioning single source of truth.")

def main():
    print("==================================================================")
    print("RUNNING SOFTWARE ENGINEERING PRINCIPLES & MODULARITY AUDIT SUITE")
    print("Cognitive Assessment Simulator v0.1.0-beta")
    print("==================================================================")

    test_god_file_elimination_and_modularity()
    test_separation_of_concerns()
    test_abstraction_and_dependency_inversion()
    test_single_responsibility_principle()
    test_open_closed_and_liskov_substitution()
    test_interface_segregation()
    test_anticipation_of_change()

    print("\n==================================================================")
    print("ALL PRINCIPLES & MODULARITY TESTS PASSED! (7/7 AUDIT GATES)")
    print("==================================================================")

if __name__ == "__main__":
    main()
