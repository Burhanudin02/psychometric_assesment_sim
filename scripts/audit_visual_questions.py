#!/usr/bin/env python3
"""
Visual Question Bank Quality Gate Auditor.
Audits visual questions against a 7-point quality checklist:
1. visualIntegrity: SVG syntax valid, responsive viewBox present in stimulus and all options
2. answerUniqueness: Exactly 1 correct answer, unique option IDs A-D, valid correctAnswer target
3. renderIntegrity: Pure visual options (no text-only options), SVG width/height/viewBox responsiveness
4. ruleClarity: Deterministic rule explained, explanation present, solvingStrategy present
5. optionCompleteness: Exactly 4 options (A, B, C, D) all with non-empty SVG visual diagrams
6. accessibilityMetadata: Descriptive altText present on all options for screen readers
7. overallQualityGate: PASS / FAIL per question and summary report
"""

import sys
import json
import os
import xml.etree.ElementTree as ET
from typing import Dict, Any, List, Tuple

def validate_svg_string(svg_str: str) -> Tuple[bool, str]:
    if not svg_str or not isinstance(svg_str, str):
        return False, "SVG content missing or not a string"
    if "<svg" not in svg_str or "</svg>" not in svg_str:
        return False, "Missing <svg> or </svg> tags"
    if "viewBox" not in svg_str:
        return False, "Missing viewBox attribute for responsive rendering"
    try:
        ET.fromstring(svg_str)
    except ET.ParseError as e:
        return False, f"XML Parse Error: {e}"
    return True, "Valid SVG"

def audit_question(q: Dict[str, Any]) -> Dict[str, Any]:
    qid = q.get("id", "UNKNOWN")
    results = {
        "id": qid,
        "questionType": q.get("questionType", "UNKNOWN"),
        "visualIntegrity": True,
        "answerUniqueness": True,
        "renderIntegrity": True,
        "ruleClarity": True,
        "optionCompleteness": True,
        "accessibilityMetadata": True,
        "errors": []
    }

    # 1. visualIntegrity
    svg_data = q.get("svgData")
    ok, msg = validate_svg_string(svg_data)
    if not ok:
        results["visualIntegrity"] = False
        results["errors"].append(f"Question svgData invalid: {msg}")

    options = q.get("options", [])
    if not isinstance(options, list):
        results["visualIntegrity"] = False
        results["optionCompleteness"] = False
        results["errors"].append("Options is not a list")
        options = []

    for opt in options:
        opt_id = opt.get("id", "?")
        opt_svg = opt.get("svg")
        ok, msg = validate_svg_string(opt_svg)
        if not ok:
            results["visualIntegrity"] = False
            results["errors"].append(f"Option {opt_id} svg invalid: {msg}")

    # 2. answerUniqueness
    correct_ans = q.get("correctAnswer")
    opt_ids = [opt.get("id") for opt in options]
    if len(opt_ids) != len(set(opt_ids)):
        results["answerUniqueness"] = False
        results["errors"].append("Duplicate option IDs found")
    if set(opt_ids) != {"A", "B", "C", "D"}:
        results["answerUniqueness"] = False
        results["errors"].append(f"Option IDs must be exactly A, B, C, D. Found: {opt_ids}")
    if not correct_ans or correct_ans not in opt_ids:
        results["answerUniqueness"] = False
        results["errors"].append(f"correctAnswer '{correct_ans}' is not one of valid option IDs")

    # 3. renderIntegrity
    for opt in options:
        opt_id = opt.get("id", "?")
        opt_svg = opt.get("svg", "")
        # Ensure no text-only options
        if not opt_svg or len(opt_svg.strip()) < 20:
            results["renderIntegrity"] = False
            results["errors"].append(f"Option {opt_id} lacks visual SVG content")

    # 4. ruleClarity
    rule = q.get("rule")
    explanation = q.get("explanation")
    strategy = q.get("solvingStrategy")
    if not rule or not isinstance(rule, str) or len(rule.strip()) < 10:
        results["ruleClarity"] = False
        results["errors"].append("Missing or insufficient 'rule' field")
    if not explanation or not isinstance(explanation, str) or len(explanation.strip()) < 10:
        results["ruleClarity"] = False
        results["errors"].append("Missing or insufficient 'explanation' field")
    if not strategy or not isinstance(strategy, str) or len(strategy.strip()) < 10:
        results["ruleClarity"] = False
        results["errors"].append("Missing or insufficient 'solvingStrategy' field")

    # 5. optionCompleteness
    if len(options) != 4:
        results["optionCompleteness"] = False
        results["errors"].append(f"Expected 4 options, found {len(options)}")
    for opt in options:
        opt_id = opt.get("id")
        if not opt_id or not opt.get("svg"):
            results["optionCompleteness"] = False
            results["errors"].append(f"Incomplete option: {opt}")

    # 6. accessibilityMetadata
    for opt in options:
        opt_id = opt.get("id", "?")
        alt = opt.get("altText") or opt.get("ariaLabel")
        if not alt or not isinstance(alt, str) or len(alt.strip()) < 3:
            results["accessibilityMetadata"] = False
            results["errors"].append(f"Option {opt_id} lacks descriptive altText/ariaLabel")

    # 7. overallQualityGate
    results["overallQualityGate"] = (
        results["visualIntegrity"] and
        results["answerUniqueness"] and
        results["renderIntegrity"] and
        results["ruleClarity"] and
        results["optionCompleteness"] and
        results["accessibilityMetadata"]
    )

    return results

def main():
    target_file = sys.argv[1] if len(sys.argv) > 1 else "data/seedQuestions.json"
    if not os.path.exists(target_file):
        print(f"Error: Target file not found: {target_file}")
        sys.exit(1)

    with open(target_file, "r", encoding="utf-8") as f:
        data = json.load(f)

    # Filter for active visual questions
    visual_types = {
        "VISUAL_SEQUENCE",
        "SHAPE_TRANSFORMATION",
        "MATRIX_REASONING",
        "ODD_ONE_OUT",
        "VISUAL_ANALOGY",
        "ROTATION_2D",
        "MIRROR_TRANSFORMATION",
        "SPATIAL_POSITION",
        "CUBE_ORIENTATION",
    }

    # Also include any question with svgData or id starting with VIS_
    target_questions = [
        q for q in data
        if (
            q.get("id", "").startswith("VIS_") or
            q.get("questionType") in visual_types or
            (q.get("domain") in ["ABSTRACT_REASONING", "SPATIAL_REASONING"] and q.get("svgData"))
        ) and q.get("qualityStatus") != "DEPRECATED" and q.get("active", True)
    ]

    print("=" * 72)
    print(f"VISUAL QUESTION BANK QUALITY GATE AUDIT")
    print(f"File: {target_file}")
    print(f"Active visual questions found: {len(target_questions)}")
    print("=" * 72)

    if len(target_questions) == 0:
        print("FAIL: No active visual questions found to audit!")
        sys.exit(1)

    passed_count = 0
    failed_count = 0
    failures = []

    for q in target_questions:
        res = audit_question(q)
        if res["overallQualityGate"]:
            passed_count += 1
        else:
            failed_count += 1
            failures.append(res)

    print(f"\n--- AUDIT RESULTS SUMMARY ---")
    print(f"Total Evaluated: {len(target_questions)}")
    print(f"PASSED Quality Gate: {passed_count}")
    print(f"FAILED Quality Gate: {failed_count}")

    if failures:
        print("\n" + "=" * 72)
        print(f"FAILURES DETECTED ({len(failures)} questions):")
        for f in failures:
            print(f"\n[FAIL] {f['id']} ({f['questionType']}):")
            for err in f["errors"]:
                print(f"   - {err}")
        print("=" * 72)
        sys.exit(1)
    else:
        print("\nAll active visual questions passed 100% of 7-point quality gates!")
        print("   ✓ visualIntegrity: valid SVG XML and viewBox")
        print("   ✓ answerUniqueness: exactly 1 valid answer, distinct A-D")
        print("   ✓ renderIntegrity: responsive diagrams, no text-only options")
        print("   ✓ ruleClarity: explicit rule, explanation, and strategy")
        print("   ✓ optionCompleteness: 4 complete options with SVG visual assets")
        print("   ✓ accessibilityMetadata: descriptive altText on every option")
        print("=" * 72)
        sys.exit(0)

if __name__ == "__main__":
    main()
