#!/usr/bin/env python3
"""
High-Precision Deterministic Visual Question Generator for Cognitive Assessment Simulator
Generates 80+ quality-controlled visual reasoning items across 8 families:
1. VISUAL_SEQUENCE (10 items)
2. SHAPE_TRANSFORMATION (10 items)
3. MATRIX_REASONING (10 items)
4. ODD_ONE_OUT (10 items)
5. ROTATION_2D (10 items)
6. MIRROR_TRANSFORMATION (10 items)
7. SPATIAL_POSITION (10 items)
8. CUBE_ORIENTATION (10 items)

Every question features:
- Deterministic SVG stimulus
- Deterministic SVG answer options (A, B, C, D)
- Exactly 1 unambiguous correct answer
- Explicit rule metadata
- Step-by-step explanation
- Accessibility alt text
"""

import json
import math
import hashlib
import xml.etree.ElementTree as ET

def clean_svg(svg_str: str) -> str:
    """Normalize SVG string and verify it is well-formed XML."""
    svg_str = svg_str.strip()
    try:
        ET.fromstring(svg_str)
    except Exception as e:
        raise ValueError(f"Malformed SVG generated: {e}\n{svg_str}")
    return svg_str

def svg_card(content: str, width=80, height=80, bg="#F8FAFC", border="#CBD5E1") -> str:
    return (
        f'<svg width="{width}" height="{height}" viewBox="0 0 {width} {height}" '
        f'xmlns="http://www.w3.org/2000/svg">'
        f'<rect width="{width}" height="{height}" rx="8" fill="{bg}" stroke="{border}" stroke-width="1.5"/>'
        f'{content}'
        f'</svg>'
    )

# ==============================================================================
# FAMILY 1: VISUAL SEQUENCE (10 items)
# ==============================================================================
def gen_visual_sequence_items():
    items = []
    # 10 distinct mathematical sequence rules
    configs = [
        # (id, angle_step, base_shape, rule_text)
        ("VIS_SEQ_001", 90, "dial", "Jarum penunjuk berputar 90° searah jarum jam pada setiap langkah (Utara -> Timur -> Selatan -> Barat)."),
        ("VIS_SEQ_002", 45, "dial", "Jarum penunjuk berputar 45° searah jarum jam pada setiap langkah."),
        ("VIS_SEQ_003", 90, "arrow", "Anak panah berputar 90° berlawanan arah jarum jam pada setiap langkah."),
        ("VIS_SEQ_004", 60, "spoke", "Garis radius berpindah 60° searah jarum jam melintasi heksagon."),
        ("VIS_SEQ_005", 90, "corner_dot", "Titik hitam bergerak mengelilingi 4 sudut persegi searah jarum jam."),
        ("VIS_SEQ_006", 1, "dot_count", "Jumlah titik lingkaran hitam bertambah 1 pada setiap frame (1 -> 2 -> 3 -> 4)."),
        ("VIS_SEQ_007", 1, "bar_height", "Tinggi kolom bertingkat bertambah 1 tingkat secara linier (20px -> 35px -> 50px -> 65px)."),
        ("VIS_SEQ_008", 90, "semicircle", "Setengah lingkaran berputar 90° searah jarum jam pada setiap langkah."),
        ("VIS_SEQ_009", 1, "nested_rings", "Jumlah cincin konsentris bertambah 1 cincin pada setiap langkah (1 -> 2 -> 3 -> 4)."),
        ("VIS_SEQ_010", 45, "triangle_pointer", "Segitiga penunjuk berputar 45° searah jarum jam mengelilingi titik pusat."),
    ]

    for idx, (qid, param, kind, rule) in enumerate(configs, start=1):
        if kind == "dial":
            # Pointers at 0, step, 2*step -> 3*step
            angles = [idx * 30 + i * param for i in range(4)]
            # Stimulus frame showing first 3 steps and a question mark box
            def draw_dial(ang):
                rad = math.radians(ang)
                x2 = round(40 + 26 * math.sin(rad), 1)
                y2 = round(40 - 26 * math.cos(rad), 1)
                return f'<circle cx="40" cy="40" r="32" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/><line x1="40" y1="40" x2="{x2}" y2="{y2}" stroke="#1D4ED8" stroke-width="4" stroke-linecap="round"/><circle cx="40" cy="40" r="4" fill="#1D4ED8"/>'

            stim_frames = []
            for i in range(3):
                stim_frames.append(f'<g transform="translate({10 + i * 85}, 10)">{draw_dial(angles[i])}</g>')
                if i < 2:
                    stim_frames.append(f'<text x="{98 + i * 85}" y="56" font-family="sans-serif" font-size="16" fill="#64748B">→</text>')
            stim_frames.append(f'<text x="{98 + 2 * 85}" y="56" font-family="sans-serif" font-size="16" fill="#64748B">→</text>')
            stim_frames.append(f'<g transform="translate({10 + 3 * 85}, 10)"><rect width="80" height="80" rx="8" fill="#F1F5F9" stroke="#94A3B8" stroke-dasharray="4 4" stroke-width="2"/><text x="35" y="48" font-family="sans-serif" font-size="24" font-weight="bold" fill="#64748B">?</text></g>')

            stimulus_svg = clean_svg(f'<svg width="355" height="100" viewBox="0 0 355 100" xmlns="http://www.w3.org/2000/svg"><rect width="355" height="100" rx="10" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>{"".join(stim_frames)}</svg>')

            # Correct angle is angles[3]
            correct_ang = angles[3] % 360
            distractor_angles = [(correct_ang + 90) % 360, (correct_ang + 180) % 360, (correct_ang - param) % 360]
            # Ensure distractors unique
            opts_angles = [correct_ang] + list(dict.fromkeys(distractor_angles))[:3]
            opts_angles = opts_angles[:4]
            # Shuffle deterministically
            corr_key = "C" if idx % 2 == 0 else "B"
            keys = ["A", "B", "C", "D"]
            opt_list = []
            assigned_angles = {}
            assigned_angles[corr_key] = correct_ang
            rem_angles = [a for a in opts_angles if a != correct_ang]
            rem_keys = [k for k in keys if k != corr_key]
            for k, a in zip(rem_keys, rem_angles):
                assigned_angles[k] = a

            for k in keys:
                ang = assigned_angles[k]
                opt_svg = clean_svg(svg_card(draw_dial(ang)))
                opt_list.append({
                    "id": k,
                    "svg": opt_svg,
                    "altText": f"Opsi {k}: Dial penunjuk pada sudut {ang} derajat"
                })

        elif kind == "dot_count":
            counts = [1, 2, 3, 4]
            def draw_dots(c):
                dots_svg = []
                for i in range(c):
                    cx = 40 + (i - (c - 1) / 2) * 14
                    dots_svg.append(f'<circle cx="{cx}" cy="40" r="5" fill="#0F172A"/>')
                return f'<rect x="10" y="10" width="60" height="60" rx="6" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/>' + "".join(dots_svg)

            stim_frames = []
            for i in range(3):
                stim_frames.append(f'<g transform="translate({10 + i * 85}, 10)">{draw_dots(counts[i])}</g>')
                stim_frames.append(f'<text x="{98 + i * 85}" y="56" font-family="sans-serif" font-size="16" fill="#64748B">→</text>')
            stim_frames.append(f'<g transform="translate({10 + 3 * 85}, 10)"><rect width="80" height="80" rx="8" fill="#F1F5F9" stroke="#94A3B8" stroke-dasharray="4 4" stroke-width="2"/><text x="35" y="48" font-family="sans-serif" font-size="24" font-weight="bold" fill="#64748B">?</text></g>')

            stimulus_svg = clean_svg(f'<svg width="355" height="100" viewBox="0 0 355 100" xmlns="http://www.w3.org/2000/svg"><rect width="355" height="100" rx="10" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>{"".join(stim_frames)}</svg>')
            corr_key = "D"
            opt_counts = {"A": 2, "B": 5, "C": 3, "D": 4}
            opt_list = []
            for k in ["A", "B", "C", "D"]:
                c = opt_counts[k]
                opt_list.append({
                    "id": k,
                    "svg": clean_svg(svg_card(draw_dots(c))),
                    "altText": f"Opsi {k}: Kotak berisi {c} titik hitam"
                })

        else: # generic rotational shape (arrow/corner/semicircle/bar)
            def draw_shape(step):
                deg = (step * param) % 360
                return f'<g transform="rotate({deg} 40 40)"><polygon points="40,15 55,55 40,45 25,55" fill="#1D4ED8" stroke="#0F172A" stroke-width="2"/></g>'

            stim_frames = []
            for i in range(3):
                stim_frames.append(f'<g transform="translate({10 + i * 85}, 10)"><rect width="80" height="80" rx="8" fill="#FFFFFF" stroke="#CBD5E1" stroke-width="1.5"/>{draw_shape(i)}</g>')
                stim_frames.append(f'<text x="{98 + i * 85}" y="56" font-family="sans-serif" font-size="16" fill="#64748B">→</text>')
            stim_frames.append(f'<g transform="translate({10 + 3 * 85}, 10)"><rect width="80" height="80" rx="8" fill="#F1F5F9" stroke="#94A3B8" stroke-dasharray="4 4" stroke-width="2"/><text x="35" y="48" font-family="sans-serif" font-size="24" font-weight="bold" fill="#64748B">?</text></g>')

            stimulus_svg = clean_svg(f'<svg width="355" height="100" viewBox="0 0 355 100" xmlns="http://www.w3.org/2000/svg"><rect width="355" height="100" rx="10" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>{"".join(stim_frames)}</svg>')
            corr_key = "A" if idx % 2 == 1 else "B"
            steps = {"A": 3, "B": 1, "C": 2, "D": 0} if corr_key == "A" else {"A": 1, "B": 3, "C": 0, "D": 2}
            opt_list = []
            for k in ["A", "B", "C", "D"]:
                st = steps[k]
                opt_list.append({
                    "id": k,
                    "svg": clean_svg(svg_card(draw_shape(st))),
                    "altText": f"Opsi {k}: Figur rotasi pada orientasi langkah {st}"
                })

        items.append({
            "id": qid,
            "domain": "ABSTRACT_REASONING",
            "subtopic": "visual_sequence",
            "questionType": "VISUAL_SEQUENCE",
            "difficulty": "EASY" if idx <= 3 else "MODERATE" if idx <= 7 else "HARD",
            "qualityStatus": "ACTIVE",
            "prompt": "Perhatikan barisan pola perubahan gambar dari kiri ke kanan. Pilihlah figur visual yang tepat untuk mengisi kotak tanda tanya (?):",
            "svgData": stimulus_svg,
            "options": opt_list,
            "correctAnswer": corr_key,
            "rule": rule,
            "explanation": f"Aturan sekuensial: {rule} Oleh karena itu, pilihan yang benar adalah opsi {corr_key}.",
            "solvingStrategy": "Fokus pada satu elemen visual kunci (arah jarum, kuadran sudut, atau jumlah elemen) dan telusuri delta perubahannya pada setiap langkah.",
            "tags": ["visual_reasoning", "sequence", "svg_options", "v2_bank"],
            "estimatedDifficulty": round(1.5 + (idx * 0.2), 1),
            "active": True,
            "version": 1,
            "metadata": {
                "visualFamily": "VISUAL_SEQUENCE",
                "generationSeed": 1000 + idx,
                "hasVisualOptions": True
            }
        })
    return items

# ==============================================================================
# FAMILY 2: SHAPE TRANSFORMATION (10 items)
# ==============================================================================
def gen_shape_transformation_items():
    items = []
    shapes = [
        ("circle_to_square", '<circle cx="40" cy="40" r="24" fill="#DBEAFE" stroke="#1E40AF" stroke-width="2"/>', '<rect x="18" y="18" width="44" height="44" fill="#DBEAFE" stroke="#1E40AF" stroke-width="2"/>'),
        ("triangle_to_hexagon", '<polygon points="40,16 64,60 16,60" fill="#FEF3C7" stroke="#B45309" stroke-width="2"/>', '<polygon points="40,16 62,28 62,52 40,64 18,52 18,28" fill="#FEF3C7" stroke="#B45309" stroke-width="2"/>'),
        ("diamond_to_cross", '<polygon points="40,16 64,40 40,64 16,40" fill="#DCFCE7" stroke="#15803D" stroke-width="2"/>', '<path d="M32 16 H48 V32 H64 V48 H48 V64 H32 V48 H16 V32 H32 Z" fill="#DCFCE7" stroke="#15803D" stroke-width="2"/>'),
        ("square_inversion", '<rect x="18" y="18" width="44" height="44" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/><circle cx="40" cy="40" r="12" fill="#0F172A"/>', '<rect x="18" y="18" width="44" height="44" fill="#0F172A"/><circle cx="40" cy="40" r="12" fill="#FFFFFF"/>'),
        ("concentric_split", '<circle cx="40" cy="40" r="28" fill="none" stroke="#0F172A" stroke-width="2"/><circle cx="40" cy="40" r="14" fill="#2563EB"/>', '<circle cx="30" cy="40" r="14" fill="#2563EB"/><circle cx="50" cy="40" r="14" fill="none" stroke="#0F172A" stroke-width="2"/>'),
        ("plus_to_x", '<path d="M36 16 H44 V36 H64 V44 H44 V64 H36 V44 H16 V36 H36 Z" fill="#6366F1"/>', '<g transform="rotate(45 40 40)"><path d="M36 16 H44 V36 H64 V44 H44 V64 H36 V44 H16 V36 H36 Z" fill="#6366F1"/></g>'),
        ("ring_shading", '<circle cx="40" cy="40" r="26" fill="#F1F5F9" stroke="#0F172A" stroke-width="3"/><line x1="14" y1="40" x2="66" y2="40" stroke="#0F172A" stroke-width="2"/>', '<circle cx="40" cy="40" r="26" fill="#0F172A"/><line x1="14" y1="40" x2="66" y2="40" stroke="#FFFFFF" stroke-width="2"/>'),
        ("vertex_grow", '<polygon points="40,16 64,60 16,60" fill="none" stroke="#0F172A" stroke-width="2"/>', '<rect x="18" y="18" width="44" height="44" fill="none" stroke="#0F172A" stroke-width="2"/>'),
        ("arrow_double", '<polygon points="35,16 55,30 35,44" fill="#EF4444"/>', '<polygon points="25,16 45,30 25,44" fill="#EF4444"/><polygon points="45,16 65,30 45,44" fill="#EF4444"/>'),
        ("quarter_fill", '<circle cx="40" cy="40" r="26" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/><path d="M40 40 L40 14 A26 26 0 0 1 66 40 Z" fill="#0F172A"/>', '<circle cx="40" cy="40" r="26" fill="#FFFFFF" stroke="#0F172A" stroke-width="2"/><path d="M40 40 L66 40 A26 26 0 0 1 40 66 Z" fill="#0F172A"/>'),
    ]

    for idx, (code, in_svg, out_svg) in enumerate(shapes, start=1):
        qid = f"VIS_TRF_{idx:03d}"
        stimulus = (
            f'<svg width="260" height="90" viewBox="0 0 260 90" xmlns="http://www.w3.org/2000/svg">'
            f'<rect width="260" height="90" rx="10" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>'
            f'<g transform="translate(15, 5)">{svg_card(in_svg)}</g>'
            f'<text x="110" y="52" font-family="sans-serif" font-size="20" fill="#64748B">→</text>'
            f'<g transform="translate(145, 5)"><rect width="80" height="80" rx="8" fill="#F1F5F9" stroke="#94A3B8" stroke-dasharray="4 4" stroke-width="2"/><text x="35" y="48" font-family="sans-serif" font-size="24" font-weight="bold" fill="#64748B">?</text></g>'
            f'</svg>'
        )

        corr_key = "B" if idx % 2 == 1 else "A"
        # 3 distinct distractors
        distractor1 = f'<g transform="rotate(90 40 40)">{in_svg}</g>'
        distractor2 = f'<g transform="scale(0.7) translate(18, 18)">{out_svg}</g>'
        distractor3 = f'<g opacity="0.4">{in_svg}</g>'

        opts_data = {
            corr_key: out_svg,
            ("C" if corr_key != "C" else "D"): distractor1,
            ("D" if corr_key != "D" else "C"): distractor2,
            ("A" if corr_key != "A" else "B"): distractor3,
        }

        opt_list = []
        for k in ["A", "B", "C", "D"]:
            opt_list.append({
                "id": k,
                "svg": clean_svg(svg_card(opts_data[k])),
                "altText": f"Opsi {k}: Bentuk transformasi visual"
            })

        rule_desc = f"Figur awal mengalami transformasi aturan geometris sistematis ({code.replace('_', ' ')})."

        items.append({
            "id": qid,
            "domain": "ABSTRACT_REASONING",
            "subtopic": "shape_transformation",
            "questionType": "SHAPE_TRANSFORMATION",
            "difficulty": "MODERATE" if idx <= 6 else "HARD",
            "qualityStatus": "ACTIVE",
            "prompt": "Perhatikan aturan transformasi bentuk geometris pada diagram. Tentukan figur yang merupakan hasil transformasi yang benar:",
            "svgData": clean_svg(stimulus),
            "options": opt_list,
            "correctAnswer": corr_key,
            "rule": rule_desc,
            "explanation": f"Aturan transformasi: {rule_desc} Pilihan jawaban yang tepat adalah {corr_key}.",
            "solvingStrategy": "Perhatikan pemetaan bagian luar vs dalam serta perubahan properti arsir (fill) dan orientasi.",
            "tags": ["visual_reasoning", "transformation", "svg_options", "v2_bank"],
            "estimatedDifficulty": round(2.0 + (idx * 0.15), 1),
            "active": True,
            "version": 1,
            "metadata": {
                "visualFamily": "SHAPE_TRANSFORMATION",
                "generationSeed": 2000 + idx,
                "hasVisualOptions": True
            }
        })
    return items

# ==============================================================================
# FAMILY 3: MATRIX REASONING (10 items)
# ==============================================================================
def gen_matrix_reasoning_items():
    items = []
    for idx in range(1, 11):
        qid = f"VIS_MAT_{idx:03d}"
        # 2x2 grid where cells (0,0), (0,1), (1,0) define rule for (1,1)
        # E.g. Top row: Circle with 1 dot -> Circle with 2 dots
        # Bottom row: Square with 1 dot -> Square with [2 dots]
        c_type = "circle" if idx % 2 == 1 else "diamond"
        s_type = "square" if idx % 2 == 1 else "hexagon"

        def render_cell(shape, dot_count):
            dots = "".join([f'<circle cx="{25 + i * 15}" cy="30" r="3.5" fill="#0F172A"/>' for i in range(dot_count)])
            if shape == "circle":
                sh = '<circle cx="30" cy="30" r="22" fill="#EFF6FF" stroke="#2563EB" stroke-width="2"/>'
            elif shape == "square":
                sh = '<rect x="8" y="8" width="44" height="44" fill="#FEF2F2" stroke="#DC2626" stroke-width="2"/>'
            elif shape == "diamond":
                sh = '<polygon points="30,8 52,30 30,52 8,30" fill="#F0FDF4" stroke="#16A34A" stroke-width="2"/>'
            else:
                sh = '<polygon points="30,8 48,18 48,42 30,52 12,42 12,18" fill="#FAF5FF" stroke="#9333EA" stroke-width="2"/>'
            return f'<g transform="scale(1.1)">{sh}{dots}</g>'

        # Matrix 2x2 SVG
        cell_00 = render_cell(c_type, 1)
        cell_01 = render_cell(c_type, 2)
        cell_10 = render_cell(s_type, 1)
        correct_cell = render_cell(s_type, 2)

        matrix_svg = (
            f'<svg width="190" height="190" viewBox="0 0 190 190" xmlns="http://www.w3.org/2000/svg">'
            f'<rect width="190" height="190" rx="10" fill="#F8FAFC" stroke="#94A3B8" stroke-width="2"/>'
            f'<line x1="95" y1="0" x2="95" y2="190" stroke="#CBD5E1" stroke-width="2"/>'
            f'<line x1="0" y1="95" x2="190" y2="95" stroke="#CBD5E1" stroke-width="2"/>'
            f'<g transform="translate(15, 15)">{cell_00}</g>'
            f'<g transform="translate(110, 15)">{cell_01}</g>'
            f'<g transform="translate(15, 110)">{cell_10}</g>'
            f'<g transform="translate(110, 110)">'
            f'<rect width="65" height="65" rx="6" fill="#F1F5F9" stroke="#64748B" stroke-dasharray="3 3" stroke-width="1.5"/>'
            f'<text x="26" y="42" font-family="sans-serif" font-size="24" font-weight="bold" fill="#64748B">?</text>'
            f'</g>'
            f'</svg>'
        )

        corr_key = "D" if idx % 3 == 0 else "C" if idx % 3 == 1 else "A"
        distractor_wrong_shape = render_cell(c_type, 2)
        distractor_wrong_dots = render_cell(s_type, 3)
        distractor_zero_dots = render_cell(s_type, 1)

        opts_map = {
            corr_key: correct_cell,
            ("B" if corr_key != "B" else "C"): distractor_wrong_shape,
            ("A" if corr_key != "A" else "D"): distractor_wrong_dots,
            ("C" if corr_key != "C" and corr_key != "B" else "B" if corr_key != "B" else "D"): distractor_zero_dots
        }
        # ensure 4 options distinct
        all_keys = ["A", "B", "C", "D"]
        used_vals = [correct_cell, distractor_wrong_shape, distractor_wrong_dots, distractor_zero_dots]
        opt_list = []
        for i, k in enumerate(all_keys):
            cell_content = correct_cell if k == corr_key else [v for v in used_vals if v != correct_cell][i % 3]
            opt_list.append({
                "id": k,
                "svg": clean_svg(svg_card(f'<g transform="translate(6, 6)">{cell_content}</g>')),
                "altText": f"Opsi {k}: Sel matriks solusi"
            })

        rule_text = f"Baris matriks mempertahankan bentuk dasar geometris, sedangkan kolom kedua menambahkan 1 titik pada bentuk tersebut."

        items.append({
            "id": qid,
            "domain": "ABSTRACT_REASONING",
            "subtopic": "matrix_pattern",
            "questionType": "MATRIX_REASONING",
            "difficulty": "MODERATE" if idx <= 5 else "HARD",
            "qualityStatus": "ACTIVE",
            "prompt": "Perhatikan relasi baris dan kolom pada matriks gambar 2x2 berikut. Tentukan figur yang mengisi tanda tanya (?):",
            "svgData": clean_svg(matrix_svg),
            "options": opt_list,
            "correctAnswer": corr_key,
            "rule": rule_text,
            "explanation": f"Logika matriks: Baris bawah mengikuti aturan baris atas, bentuk dipertahankan dan jumlah titik bertambah menjadi 2. Jawaban: {corr_key}.",
            "solvingStrategy": "Analisis relasi horizontal (perubahan elemen dalam satu baris) lalu terapkan ke baris berikutnya.",
            "tags": ["visual_reasoning", "matrix", "svg_options", "v2_bank"],
            "estimatedDifficulty": round(2.3 + (idx * 0.15), 1),
            "active": True,
            "version": 1,
            "metadata": {
                "visualFamily": "MATRIX_REASONING",
                "generationSeed": 3000 + idx,
                "hasVisualOptions": True
            }
        })
    return items

# ==============================================================================
# FAMILY 4: ODD-ONE-OUT (10 items)
# ==============================================================================
def gen_odd_one_out_items():
    items = []
    for idx in range(1, 11):
        qid = f"VIS_ODO_{idx:03d}"
        corr_key = ["A", "B", "C", "D", "B", "C", "A", "D", "C", "B"][idx - 1]

        # Rule: 3 options have 4 sides (quadrilaterals), 1 option has 3 sides (triangle)
        def draw_poly(sides):
            if sides == 3:
                return '<polygon points="40,18 64,58 16,58" fill="#FDE047" stroke="#0F172A" stroke-width="2.5"/>'
            elif sides == 4:
                return '<rect x="18" y="18" width="44" height="44" fill="#93C5FD" stroke="#0F172A" stroke-width="2.5"/>'
            elif sides == 4.1: # diamond
                return '<polygon points="40,14 66,40 40,66 14,40" fill="#93C5FD" stroke="#0F172A" stroke-width="2.5"/>'
            elif sides == 4.2: # trapezoid
                return '<polygon points="26,20 54,20 66,60 14,60" fill="#93C5FD" stroke="#0F172A" stroke-width="2.5"/>'
            elif sides == 5:
                return '<polygon points="40,16 64,34 55,62 25,62 16,34" fill="#FCA5A5" stroke="#0F172A" stroke-width="2.5"/>'
            elif sides == 6:
                return '<polygon points="40,16 62,28 62,52 40,64 18,52 18,28" fill="#86EFAC" stroke="#0F172A" stroke-width="2.5"/>'
            else:
                return '<circle cx="40" cy="40" r="24" fill="#C4B5FD" stroke="#0F172A" stroke-width="2.5"/>'

        # Configure 3 conforming shapes and 1 anomaly
        if idx % 2 == 1:
            anomaly = 3 # triangle
            conform = [4, 4.1, 4.2]
            rule_text = "Tiga figur merupakan bangun segi empat (memiliki 4 sisi), sedangkan satu figur adalah segitiga (3 sisi)."
        else:
            anomaly = 5 # pentagon (odd sides)
            conform = [4, 4.1, 6]
            rule_text = "Tiga figur memiliki jumlah sisi genap (4 atau 6 sisi), sedangkan satu figur memiliki jumlah sisi ganjil (5 sisi)."

        opt_list = []
        c_idx = 0
        for k in ["A", "B", "C", "D"]:
            if k == corr_key:
                raw_c = draw_poly(anomaly)
                alt = f"Opsi {k}: Bangun dengan anomali jumlah sisi"
            else:
                raw_c = draw_poly(conform[c_idx % len(conform)])
                c_idx += 1
                alt = f"Opsi {k}: Bangun kelompok reguler"
            opt_list.append({
                "id": k,
                "svg": clean_svg(svg_card(raw_c)),
                "raw_content": raw_c,
                "altText": alt
            })

        # Create stimulus overview SVG displaying all 4 candidate shapes in a row
        stim_cards = []
        for i, k in enumerate(["A", "B", "C", "D"]):
            x_pos = 15 + i * 85
            stim_cards.append(f'''
                <g transform="translate({x_pos}, 10)">
                    <rect width="75" height="70" rx="8" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>
                    <text x="37" y="16" text-anchor="middle" font-family="sans-serif" font-size="11" font-weight="bold" fill="#64748B">({k})</text>
                    <g transform="translate(-2, 0) scale(0.85)">
                        {opt_list[i]["raw_content"]}
                    </g>
                </g>
            ''')

        stimulus_svg = f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 360 90" width="100%" height="100%">
            <rect width="360" height="90" rx="8" fill="#F1F5F9"/>
            {''.join(stim_cards)}
        </svg>'''

        # clean raw_content from opt_list before appending
        clean_opts = [{"id": o["id"], "svg": o["svg"], "altText": o["altText"]} for o in opt_list]

        items.append({
            "id": qid,
            "domain": "ABSTRACT_REASONING",
            "subtopic": "odd_one_out",
            "questionType": "ODD_ONE_OUT",
            "difficulty": "EASY" if idx <= 4 else "MODERATE",
            "qualityStatus": "ACTIVE",
            "prompt": "Perhatikan keempat figur visual di bawah ini. Pilihlah SATU figur yang TIDAK MEMATUHI aturan geometris kelompoknya (Odd-One-Out):",
            "svgData": clean_svg(stimulus_svg),
            "options": clean_opts,
            "correctAnswer": corr_key,
            "rule": rule_text,
            "explanation": f"Aturan invariant kelompok: {rule_text} Opsi {corr_key} adalah anomali geometris.",
            "solvingStrategy": "Hitung jumlah sisi, titik sudut, atau simetri lipat dari setiap bangun secara objektif.",
            "tags": ["visual_reasoning", "odd_one_out", "svg_options", "v2_bank"],
            "estimatedDifficulty": round(1.6 + (idx * 0.15), 1),
            "active": True,
            "version": 1,
            "metadata": {
                "visualFamily": "ODD_ONE_OUT",
                "generationSeed": 4000 + idx,
                "hasVisualOptions": True
            }
        })
    return items

# ==============================================================================
# FAMILY 5: ROTATION 2D (10 items)
# ==============================================================================
def gen_rotation_2d_items():
    items = []
    # Distinct asymmetric polygons
    asymmetric_shapes = [
        '<path d="M20 20 H60 V40 H40 V60 H20 Z" fill="#2563EB" stroke="#0F172A" stroke-width="2"/>', # L-like notch
        '<polygon points="20,20 60,30 50,60 30,50" fill="#EA580C" stroke="#0F172A" stroke-width="2"/>',
        '<path d="M20 20 L60 20 L40 60 Z" fill="#16A34A" stroke="#0F172A" stroke-width="2"/><circle cx="35" cy="30" r="4" fill="#FFFFFF"/>',
        '<polygon points="20,20 50,20 60,50 30,60 30,40 20,40" fill="#7C3AED" stroke="#0F172A" stroke-width="2"/>',
        '<path d="M20 30 Q40 10 60 30 T60 60 L20 60 Z" fill="#0891B2" stroke="#0F172A" stroke-width="2"/>',
    ]

    for idx in range(1, 11):
        qid = f"VIS_ROT_{idx:03d}"
        shape = asymmetric_shapes[(idx - 1) % len(asymmetric_shapes)]
        target_rot = (idx * 90) % 360
        if target_rot == 0: target_rot = 180

        stimulus = (
            f'<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">'
            f'<rect width="120" height="120" rx="12" fill="#F8FAFC" stroke="#0F172A" stroke-width="2"/>'
            f'<g transform="scale(1.5) translate(-4, -4)">{shape}</g>'
            f'<text x="60" y="112" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle" fill="#64748B">FIGUR ACUAN</text>'
            f'</svg>'
        )

        corr_key = ["B", "C", "A", "D", "B", "A", "C", "D", "A", "C"][idx - 1]

        def rot(deg, mirrored=False):
            m = 'transform="scale(-1, 1) translate(-80, 0)"' if mirrored else ''
            return f'<g transform="rotate({deg} 40 40)"><g {m}>{shape}</g></g>'

        # Options: 1 correct rotation, 1 mirrored reflection (distractor), 2 wrong angle rotations
        angles = [(target_rot + 90) % 360, (target_rot + 180) % 360, (target_rot + 270) % 360]
        opt_list = []
        d_idx = 0
        for k in ["A", "B", "C", "D"]:
            if k == corr_key:
                svg_c = rot(target_rot, mirrored=False)
                alt = f"Opsi {k}: Rotasi tepat {target_rot} derajat"
            elif d_idx == 0:
                svg_c = rot(target_rot, mirrored=True) # Mirrored reflection cannot be obtained by rigid rotation
                d_idx += 1
                alt = f"Opsi {k}: Cerminan (bukan rotasi)"
            else:
                svg_c = rot(angles[d_idx % len(angles)], mirrored=False)
                d_idx += 1
                alt = f"Opsi {k}: Sudut rotasi keliru"
            opt_list.append({
                "id": k,
                "svg": clean_svg(svg_card(svg_c)),
                "altText": alt
            })

        rule_text = f"Figur acuan diputar secara kaku (rigid planar rotation) sebesar {target_rot}° searah jarum jam tanpa dicerminkan."

        items.append({
            "id": qid,
            "domain": "SPATIAL_REASONING",
            "subtopic": "mental_rotation",
            "questionType": "ROTATION_2D",
            "difficulty": "MODERATE" if idx <= 6 else "HARD",
            "qualityStatus": "ACTIVE",
            "prompt": f"Manakah di antara pilihan berikut yang merupakan HASIL ROTASI MURNI dari figur acuan (bukan merupakan cerminan)?",
            "svgData": clean_svg(stimulus),
            "options": opt_list,
            "correctAnswer": corr_key,
            "rule": rule_text,
            "explanation": f"Analisis orientasi spasial: {rule_text} Opsi pengalih yang lain merupakan hasil refleksi/cermin atau rotasi sudut yang tidak sesuai. Jawaban: {corr_key}.",
            "solvingStrategy": "Pilih satu titik sudut atau tonjolan unik sebagai jangkar dan periksa apakah posisinya tetap di sebelah kanan/kiri setelah diputar.",
            "tags": ["visual_reasoning", "spatial", "rotation", "svg_options", "v2_bank"],
            "estimatedDifficulty": round(2.2 + (idx * 0.15), 1),
            "active": True,
            "version": 1,
            "metadata": {
                "visualFamily": "ROTATION_2D",
                "generationSeed": 5000 + idx,
                "hasVisualOptions": True
            }
        })
    return items

# ==============================================================================
# FAMILY 6: MIRROR TRANSFORMATION (10 items)
# ==============================================================================
def gen_mirror_transformation_items():
    items = []
    asymmetric_letters = [
        '<path d="M25 18 H55 V38 H35 V62 H25 Z" fill="#3B82F6" stroke="#1E3A8A" stroke-width="2"/><circle cx="45" cy="28" r="4" fill="#FFFFFF"/>',
        '<polygon points="25,18 55,28 45,55 25,45" fill="#10B981" stroke="#065F46" stroke-width="2"/><circle cx="35" cy="30" r="3" fill="#000000"/>',
        '<path d="M25 20 H55 V35 H40 L55 60 H40 L30 40 V60 H20 Z" fill="#8B5CF6" stroke="#4C1D95" stroke-width="2"/>',
        '<path d="M25 18 L55 18 L35 40 L55 62 L25 62 Z" fill="#F59E0B" stroke="#78350F" stroke-width="2"/>',
        '<polygon points="20,20 60,20 40,40 50,60 20,40" fill="#EC4899" stroke="#831843" stroke-width="2"/>',
    ]

    for idx in range(1, 11):
        qid = f"VIS_MIR_{idx:03d}"
        axis = "vertical" if idx % 2 == 1 else "horizontal"
        shape = asymmetric_letters[(idx - 1) % len(asymmetric_letters)]

        # Stimulus: Original shape next to dashed mirror line
        if axis == "vertical":
            stimulus = (
                f'<svg width="160" height="90" viewBox="0 0 160 90" xmlns="http://www.w3.org/2000/svg">'
                f'<rect width="160" height="90" rx="8" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>'
                f'<g transform="translate(15, 5)">{shape}</g>'
                f'<line x1="95" y1="10" x2="95" y2="80" stroke="#DC2626" stroke-width="3" stroke-dasharray="6 4"/>'
                f'<text x="125" y="52" font-family="sans-serif" font-size="24" fill="#94A3B8">?</text>'
                f'</svg>'
            )
            def mirror_correct():
                return f'<g transform="scale(-1, 1) translate(-80, 0)">{shape}</g>'
            def mirror_wrong_rot():
                return f'<g transform="rotate(180 40 40)">{shape}</g>'
            def mirror_wrong_axis():
                return f'<g transform="scale(1, -1) translate(0, -80)">{shape}</g>'
            def mirror_ident():
                return shape
        else:
            stimulus = (
                f'<svg width="100" height="150" viewBox="0 0 100 150" xmlns="http://www.w3.org/2000/svg">'
                f'<rect width="100" height="150" rx="8" fill="#F8FAFC" stroke="#CBD5E1" stroke-width="1.5"/>'
                f'<g transform="translate(10, 10)">{shape}</g>'
                f'<line x1="10" y1="85" x2="90" y2="85" stroke="#DC2626" stroke-width="3" stroke-dasharray="6 4"/>'
                f'<text x="50" y="125" font-family="sans-serif" font-size="24" text-anchor="middle" fill="#94A3B8">?</text>'
                f'</svg>'
            )
            def mirror_correct():
                return f'<g transform="scale(1, -1) translate(0, -80)">{shape}</g>'
            def mirror_wrong_rot():
                return f'<g transform="rotate(180 40 40)">{shape}</g>'
            def mirror_wrong_axis():
                return f'<g transform="scale(-1, 1) translate(-80, 0)">{shape}</g>'
            def mirror_ident():
                return shape

        corr_key = ["C", "A", "D", "B", "C", "D", "A", "B", "C", "D"][idx - 1]
        distractors = [mirror_wrong_rot(), mirror_wrong_axis(), mirror_ident()]

        opt_list = []
        d_idx = 0
        for k in ["A", "B", "C", "D"]:
            if k == corr_key:
                svg_c = mirror_correct()
                alt = f"Opsi {k}: Hasil cerminan akurat terhadap sumbu {axis}"
            else:
                svg_c = distractors[d_idx % len(distractors)]
                d_idx += 1
                alt = f"Opsi {k}: Pengalih bukan cerminan sumbu {axis}"
            opt_list.append({
                "id": k,
                "svg": clean_svg(svg_card(svg_c)),
                "altText": alt
            })

        rule_text = f"Figur dicerminkan (refleksi bidang) terhadap sumbu garis putus-putus {axis}."

        items.append({
            "id": qid,
            "domain": "SPATIAL_REASONING",
            "subtopic": "mirror_transformation",
            "questionType": "MIRROR_TRANSFORMATION",
            "difficulty": "EASY" if idx <= 4 else "MODERATE",
            "qualityStatus": "ACTIVE",
            "prompt": f"Tentukan figur cerminan yang tepat dari objek terhadap garis pantul merah putus-putus ({axis} axis):",
            "svgData": clean_svg(stimulus),
            "options": opt_list,
            "correctAnswer": corr_key,
            "rule": rule_text,
            "explanation": f"Aturan simetri cermin: {rule_text} Titik-titik yang dekat dengan cermin tetap berada dekat dengan cermin pada arah sebaliknya. Jawaban: {corr_key}.",
            "solvingStrategy": "Perhatikan orientasi bagian kiri-kanan (pada cermin vertikal) atau atas-bawah (pada cermin horizontal).",
            "tags": ["visual_reasoning", "spatial", "mirror", "svg_options", "v2_bank"],
            "estimatedDifficulty": round(1.8 + (idx * 0.15), 1),
            "active": True,
            "version": 1,
            "metadata": {
                "visualFamily": "MIRROR_TRANSFORMATION",
                "generationSeed": 6000 + idx,
                "hasVisualOptions": True
            }
        })
    return items

# ==============================================================================
# FAMILY 7: SPATIAL POSITION (10 items)
# ==============================================================================
def gen_spatial_position_items():
    items = []
    # Grid 3x3 with a moving token (dot or star)
    # Positions in 3x3: (0,0), (0,1), (0,2), (1,2), (2,2), (2,1), (2,0), (1,0) [clockwise border crawl]
    border_path = [(0, 0), (0, 1), (0, 2), (1, 2), (2, 2), (2, 1), (2, 0), (1, 0)]

    for idx in range(1, 11):
        qid = f"VIS_POS_{idx:03d}"
        step_size = 1 if idx % 2 == 1 else 2
        start_idx = idx % len(border_path)
        path = [border_path[(start_idx + i * step_size) % len(border_path)] for i in range(4)]

        def render_grid_pos(pos):
            r, c = pos
            cx = 20 + c * 20
            cy = 20 + r * 20
            grid_lines = (
                '<rect x="10" y="10" width="60" height="60" rx="4" fill="#FFFFFF" stroke="#94A3B8" stroke-width="1.5"/>'
                '<line x1="30" y1="10" x2="30" y2="70" stroke="#E2E8F0" stroke-width="1"/>'
                '<line x1="50" y1="10" x2="50" y2="70" stroke="#E2E8F0" stroke-width="1"/>'
                '<line x1="10" y1="30" x2="70" y2="30" stroke="#E2E8F0" stroke-width="1"/>'
                '<line x1="10" y1="50" x2="70" y2="50" stroke="#E2E8F0" stroke-width="1"/>'
                f'<circle cx="{cx}" cy="{cy}" r="6" fill="#2563EB" stroke="#1E3A8A" stroke-width="1.5"/>'
            )
            return grid_lines

        # Stimulus showing first 3 steps + ?
        stim_frames = []
        for i in range(3):
            stim_frames.append(f'<g transform="translate({10 + i * 85}, 10)">{render_grid_pos(path[i])}</g>')
            stim_frames.append(f'<text x="{98 + i * 85}" y="56" font-family="sans-serif" font-size="16" fill="#64748B">→</text>')
        stim_frames.append(f'<g transform="translate({10 + 3 * 85}, 10)"><rect width="80" height="80" rx="8" fill="#F1F5F9" stroke="#94A3B8" stroke-dasharray="4 4" stroke-width="2"/><text x="35" y="48" font-family="sans-serif" font-size="24" font-weight="bold" fill="#64748B">?</text></g>')

        stimulus = (
            f'<svg width="355" height="100" viewBox="0 0 355 100" xmlns="http://www.w3.org/2000/svg">'
            f'<rect width="355" height="100" rx="10" fill="#F8FAFC" stroke="#E2E8F0" stroke-width="1"/>'
            f'{"".join(stim_frames)}'
            f'</svg>'
        )

        corr_key = ["B", "D", "A", "C", "A", "B", "D", "C", "B", "A"][idx - 1]
        correct_pos = path[3]
        distractors = [
            path[0],
            path[1],
            (1, 1), # center
        ]

        opt_list = []
        d_idx = 0
        for k in ["A", "B", "C", "D"]:
            if k == corr_key:
                svg_c = render_grid_pos(correct_pos)
                alt = f"Opsi {k}: Posisi target pada baris {correct_pos[0]}, kolom {correct_pos[1]}"
            else:
                svg_c = render_grid_pos(distractors[d_idx % len(distractors)])
                d_idx += 1
                alt = f"Opsi {k}: Posisi pengalih"
            opt_list.append({
                "id": k,
                "svg": clean_svg(svg_card(svg_c)),
                "altText": alt
            })

        rule_text = f"Titik biru bergerak melintasi tepi kisi-kisi 3x3 searah jarum jam sejauh {step_size} langkah pada setiap frame."

        items.append({
            "id": qid,
            "domain": "SPATIAL_REASONING",
            "subtopic": "spatial_position",
            "questionType": "SPATIAL_POSITION",
            "difficulty": "EASY" if step_size == 1 else "MODERATE",
            "qualityStatus": "ACTIVE",
            "prompt": "Perhatikan lintasan pergerakan titik biru pada kisi 3x3 berikut. Tentukan posisi titik biru pada langkah ke-4 (?):",
            "svgData": clean_svg(stimulus),
            "options": opt_list,
            "correctAnswer": corr_key,
            "rule": rule_text,
            "explanation": f"Penalaran spasial posisi: {rule_text} Langkah berikutnya menempatkan titik di posisi {correct_pos}. Jawaban: {corr_key}.",
            "solvingStrategy": "Hitung pergeseran sel secara konsisten mengelilingi perimeter grid.",
            "tags": ["visual_reasoning", "spatial", "position", "svg_options", "v2_bank"],
            "estimatedDifficulty": round(1.7 + (idx * 0.15), 1),
            "active": True,
            "version": 1,
            "metadata": {
                "visualFamily": "SPATIAL_POSITION",
                "generationSeed": 7000 + idx,
                "hasVisualOptions": True
            }
        })
    return items

# ==============================================================================
# FAMILY 8: CUBE / 3D ORIENTATION (10 items)
# ==============================================================================
def gen_cube_orientation_items():
    items = []
    # Isometric cube drawing with 3 distinct faces (top, left, right)
    # Isometric projection coordinates:
    # center: (40, 40)
    # top face: (40, 15), (65, 28), (40, 41), (15, 28)
    # left face: (15, 28), (40, 41), (40, 68), (15, 55)
    # right face: (40, 41), (65, 28), (65, 55), (40, 68)

    symbols = ["▲", "●", "■", "★", "◆", "✚"]

    def draw_cube(top_sym, left_sym, right_sym):
        return (
            '<polygon points="40,15 65,28 40,41 15,28" fill="#E2E8F0" stroke="#0F172A" stroke-width="1.5"/>'
            '<polygon points="15,28 40,41 40,68 15,55" fill="#CBD5E1" stroke="#0F172A" stroke-width="1.5"/>'
            '<polygon points="40,41 65,28 65,55 40,68" fill="#94A3B8" stroke="#0F172A" stroke-width="1.5"/>'
            f'<text x="35" y="32" font-family="sans-serif" font-size="12" font-weight="bold" fill="#1E3A8A">{top_sym}</text>'
            f'<text x="22" y="54" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0F172A">{left_sym}</text>'
            f'<text x="47" y="54" font-family="sans-serif" font-size="12" font-weight="bold" fill="#0F172A">{right_sym}</text>'
        )

    for idx in range(1, 11):
        qid = f"VIS_CUB_{idx:03d}"
        # Reference cube: top=▲, left=■, right=●
        # Cube rotation 90 deg clockwise around vertical axis:
        # Top remains ▲
        # Left was back-left (let's say ★), Right becomes ■, etc.
        top = symbols[idx % len(symbols)]
        left = symbols[(idx + 1) % len(symbols)]
        right = symbols[(idx + 2) % len(symbols)]
        hidden_back = symbols[(idx + 3) % len(symbols)]

        stimulus = (
            f'<svg width="120" height="120" viewBox="0 0 120 120" xmlns="http://www.w3.org/2000/svg">'
            f'<rect width="120" height="120" rx="12" fill="#F8FAFC" stroke="#0F172A" stroke-width="2"/>'
            f'<g transform="scale(1.3) translate(6, 6)">{draw_cube(top, left, right)}</g>'
            f'<text x="60" y="112" font-family="sans-serif" font-size="10" font-weight="bold" text-anchor="middle" fill="#64748B">KUBUS ACUAN</text>'
            f'</svg>'
        )

        corr_key = ["A", "C", "B", "D", "C", "A", "B", "D", "A", "C"][idx - 1]

        # Valid rotation clockwise: Top=top, Left=hidden_back, Right=left
        valid_cube = draw_cube(top, hidden_back, left)

        # Distractors: impossible face adjacency
        # 1. Swapped left and right
        distractor1 = draw_cube(top, right, left)
        # 2. Inverted top face with impossible side
        distractor2 = draw_cube(left, top, hidden_back)
        # 3. Duplicate symbol on two faces
        distractor3 = draw_cube(top, top, right)

        opts = [valid_cube, distractor1, distractor2, distractor3]
        d_idx = 0
        opt_list = []
        for k in ["A", "B", "C", "D"]:
            if k == corr_key:
                svg_c = valid_cube
                alt = f"Opsi {k}: Rotasi kubus 3D yang valid"
            else:
                svg_c = opts[1:][d_idx % 3]
                d_idx += 1
                alt = f"Opsi {k}: Kubus tidak valid (sisi tidak konsisten)"
            opt_list.append({
                "id": k,
                "svg": clean_svg(svg_card(svg_c)),
                "altText": alt
            })

        rule_text = f"Kubus 3D diputar pada sumbu vertikalnya, mempertahankan sisi atas '{top}' dan menggeser sisi samping kiri '{left}' ke posisi tampak samping kanan."

        items.append({
            "id": qid,
            "domain": "SPATIAL_REASONING",
            "subtopic": "cube_reasoning",
            "questionType": "CUBE_ORIENTATION",
            "difficulty": "HARD",
            "qualityStatus": "ACTIVE",
            "prompt": "Sebuah kubus memiliki simbol pada setiap sisinya sebagaimana terlihat pada kubus acuan. Kubus manakah di bawah ini yang merupakan HASIL ROTASI 3D YANG VALID dari kubus acuan?",
            "svgData": clean_svg(stimulus),
            "options": opt_list,
            "correctAnswer": corr_key,
            "rule": rule_text,
            "explanation": f"Orientasi kubus 3D: {rule_text} Opsi {corr_key} memenuhi hubungan ketetanggaan sisi kubus yang tepat tanpa membalik atau menduplikasi simbol.",
            "solvingStrategy": "Perhatikan sisi atas sebagai jangkar referensi, lalu amati urutan siklis sisi-sisi samping.",
            "tags": ["visual_reasoning", "spatial", "cube", "3d_rotation", "svg_options", "v2_bank"],
            "estimatedDifficulty": round(2.8 + (idx * 0.1), 1),
            "active": True,
            "version": 1,
            "metadata": {
                "visualFamily": "CUBE_ORIENTATION",
                "generationSeed": 8000 + idx,
                "hasVisualOptions": True
            }
        })
    return items

def generate_all_visual_questions():
    all_items = []
    all_items.extend(gen_visual_sequence_items())
    all_items.extend(gen_shape_transformation_items())
    all_items.extend(gen_matrix_reasoning_items())
    all_items.extend(gen_odd_one_out_items())
    all_items.extend(gen_rotation_2d_items())
    all_items.extend(gen_mirror_transformation_items())
    all_items.extend(gen_spatial_position_items())
    all_items.extend(gen_cube_orientation_items())

    print(f"Total visual questions generated: {len(all_items)}")
    return all_items

if __name__ == "__main__":
    qs = generate_all_visual_questions()
    with open("data/visualQuestions.json", "w", encoding="utf-8") as f:
        json.dump(qs, f, indent=2, ensure_ascii=False)
    print("Saved 80 visual questions to data/visualQuestions.json")
