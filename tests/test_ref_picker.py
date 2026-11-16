#!/usr/bin/env python3
"""
Comprehensive test suite for the Selective Reference Transfer and Autonomous AI Face Direction Hub.
Validates:
1. Script tags and UI elements across all 7 studio pages:
   - photoshoot.html
   - salon.html
   - tattoo.html
   - makeup_spa.html
   - video.html
   - storyboard.html
   - romance.html
2. CSS styling in css/shared.css for picker card, face mode segments, chips, and field locks.
3. Decoupling and independence of features (e.g. Haircut vs Hair Texture vs Hair Color vs Wardrobe).
4. Headless browser verification of prompt output across all 7 studio pages in:
   - Default reference mode (zero regression)
   - Selective haircut preservation
   - Selective hair texture preservation
   - Selective wardrobe preservation
   - Autonomous AI Face Generation mode (AI-GENERATED FACE header, synthesis directives, anti-cloning negatives)
5. 1-click unlock behavior.
"""

import html as pyhtml
import json
import os
import re
import shutil
import subprocess
import sys
import tempfile

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME_CANDIDATES = [
    r'C:\Program Files\Google\Chrome\Application\chrome.exe',
    r'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
    r'C:\Program Files\Microsoft\Edge\Application\msedge.exe',
]

STUDIO_FILES = [
    'photoshoot.html',
    'salon.html',
    'tattoo.html',
    'makeup_spa.html',
    'video.html',
    'storyboard.html',
    'romance.html'
]


def find_browser():
    for path in CHROME_CANDIDATES:
        if os.path.exists(path):
            return path
    raise RuntimeError('No headless Chromium/Chrome binary found in standard Windows locations.')


def run_page_test(browser, rel_path, test_js):
    page_path = os.path.join(ROOT, rel_path)
    with open(page_path, 'r', encoding='utf-8') as f:
        src = f.read()

    harness = f'''
<script>
window.__testErrors = [];
window.addEventListener('error', function(e) {{
  window.__testErrors.push('Error: ' + (e.message || e.error));
}});
window.addEventListener('unhandledrejection', function(e) {{
  window.__testErrors.push('Rejection: ' + (e.reason && e.reason.message ? e.reason.message : String(e.reason)));
}});
setTimeout(function() {{
  const results = [];
  const ok = (name, cond, detail) => results.push({{ name, ok: !!cond, detail: cond ? '' : (detail || 'assertion failed') }});
  try {{
    ok('zero_startup_js_errors', window.__testErrors.length === 0, window.__testErrors.join(' | '));
    (function() {{
      {test_js}
    }})();
    ok('zero_runtime_js_errors', window.__testErrors.length === 0, window.__testErrors.join(' | '));
  }} catch (err) {{
    results.push({{ name: 'fatal_harness_exception', ok: false, detail: (err && err.stack) ? err.stack : String(err) }});
  }}
  const out = document.createElement('div');
  out.id = 'afterglow-test-report';
  out.textContent = JSON.stringify(results);
  document.body.appendChild(out);
}}, 250);
</script>
'''
    injected = src.replace('</body>', harness + '\n</body>', 1)
    assert injected != src, f'</body> not found in {rel_path}'

    fd, tmp_path = tempfile.mkstemp(prefix='_tmp_test_ref_', suffix='.html', dir=ROOT)
    os.close(fd)
    with open(tmp_path, 'w', encoding='utf-8') as f:
        f.write(injected)

    user_data_dir = tempfile.mkdtemp(prefix='_tmp_chrome_ref_profile_')

    try:
        proc = subprocess.run(
            [
                browser,
                '--headless=new',
                '--disable-gpu',
                '--no-sandbox',
                '--virtual-time-budget=4000',
                f'--user-data-dir={user_data_dir}',
                '--dump-dom',
                f'file:///{tmp_path.replace(os.sep, "/")}'
            ],
            capture_output=True,
            text=True,
            timeout=25,
            check=True
        )
        html_out = proc.stdout
        m = re.search(r'<div id="afterglow-test-report">([^<]+)</div>', html_out)
        if not m:
            raise RuntimeError(f'Could not find test report in output from {rel_path}. Raw output snippet:\n{html_out[:500]}')
        raw_json = pyhtml.unescape(m.group(1).strip())
        return json.loads(raw_json)
    finally:
        try:
            os.remove(tmp_path)
        except OSError:
            pass
        shutil.rmtree(user_data_dir, ignore_errors=True)


def test_static_markup():
    print('\n--- STATIC MARKUP & CSS AUDIT ---')
    all_passed = True

    # 1. Check shared script tag and toolbar button in each studio HTML
    for fname in STUDIO_FILES:
        path = os.path.join(ROOT, fname)
        with open(path, 'r', encoding='utf-8') as f:
            content = f.read()
        
        has_script = 'src="js/shared-ref-picker.js"' in content
        has_btn = 'id="btnToggleRefPicker"' in content
        
        print(f"  [{'PASS' if has_script else 'FAIL'}] {fname}: shared-ref-picker.js script tag")
        print(f"  [{'PASS' if has_btn else 'FAIL'}] {fname}: #btnToggleRefPicker toolbar button")
        if not (has_script and has_btn):
            all_passed = False

    # 2. Check css/shared.css for essential classes
    css_path = os.path.join(ROOT, 'css', 'shared.css')
    with open(css_path, 'r', encoding='utf-8') as f:
        css = f.read()

    css_classes = [
        '.ref-picker-card',
        '.ref-face-seg',
        '.ref-chip-grid',
        '.ref-chip',
        '.ref-preset-btn',
        '.field.ref-locked',
        '.ref-locked-badge',
        '.btn-ref-unlock'
    ]
    for c in css_classes:
        has_cls = c in css
        print(f"  [{'PASS' if has_cls else 'FAIL'}] css/shared.css: contains {c}")
        if not has_cls:
            all_passed = False

    return all_passed


def run_all_studio_tests(browser):
    total_passed = 0
    total_failed = 0

    # Test 1: Photoshoot Studio
    print('\n--- PHOTOSHOOT STUDIO (photoshoot.html) ---')
    ps_tests = run_page_test(browser, 'photoshoot.html', '''
      ok('ref_picker_available', typeof window.AfterglowRefPicker === 'object');
      const api = window.AfterglowStudio;
      ok('photoshoot_api_available', typeof api === 'object');
      
      const rp = window.AfterglowRefPicker;
      ok('default_face_mode_reference', rp.getFaceMode() === 'reference');
      ok('default_all_features_false', Object.keys(rp.FEATURES).every(k => !rp.isFeatureInherited(k)));
      ok('hair_unlocked_by_default', !rp.isFieldLocked('hair'));
      ok('hair_texture_unlocked_by_default', !rp.isFieldLocked('hairTexture'));

      // Test selective haircut locking (hair locked, hairTexture unlocked)
      rp.setFeature('haircut', true);
      rp.setFeature('hairTexture', false);
      ok('hair_locked_when_haircut_true', rp.isFieldLocked('hair'));
      ok('hair_texture_still_unlocked', !rp.isFieldLocked('hairTexture'));
      ok('outfit_still_unlocked', !rp.isFieldLocked('outfit'));

      // Rebuild photoshoot prompt and verify haircut inheritance bullet
      api.buildPrompt();
      const p1 = document.getElementById('prompt').value;
      ok('prompt_has_inherited_haircut_bullet', p1.includes('Replicate the exact hairstyle silhouette, length, haircut, and parting directly from the reference photo'));

      // Test selective hair texture locking (haircut unlocked, hairTexture locked)
      rp.setFeature('haircut', false);
      rp.setFeature('hairTexture', true);
      ok('hair_unlocked_when_haircut_false', !rp.isFieldLocked('hair'));
      ok('hair_texture_locked', rp.isFieldLocked('hairTexture'));

      // Test AI-generated face mode
      rp.setFaceMode('ai_generated');
      rp.setFeature('haircut', true);
      rp.setFeature('wardrobe', true);
      api.buildPrompt();
      const pAi = document.getElementById('prompt').value;
      ok('ai_face_header_present', pAi.includes('AI-GENERATED FACE WITH SELECTIVE REFERENCE TRANSFER · BOLD POST-MAKEOVER PHOTOSHOOT'));
      ok('ai_face_subject_bullet_present', pAi.includes('Synthesize a fresh, photorealistic, unique face autonomously'));
      ok('ai_face_negatives_present', pAi.includes('cloned reference face') || pAi.includes('copied reference facial identity'));
      ok('identity_drift_removed_from_negs', !pAi.includes('• identity drift or a different face'));

      // Test Retain Original Look + Fresh AI Face (all 8 features active)
      rp.applyPreset('original_look_fresh_face');
      api.buildPrompt();
      const pFull = document.getElementById('prompt').value;
      ok('full_look_ai_face_header', pFull.includes('AI-GENERATED FACE WITH FULL REFERENCE LOOK RETENTION · BOLD POST-MAKEOVER PHOTOSHOOT'));
      ok('full_look_ai_face_master_directive', pFull.includes('Master Synthesis Directive (Retain Original Look + Fresh AI Face)'));
      ok('full_look_wardrobe_replicated', pFull.includes('Faithfully retain and replicate the exact original wardrobe'));
      ok('full_look_no_builder_dress_collision', !pFull.includes('bold red asymmetrical off-shoulder'));
      ok('full_look_no_builder_hair_collision', !pFull.includes('shoulder-length bob with soft wispy bangs'));
      ok('full_look_no_builder_studio_collision', !pFull.includes('clean, seamless white studio'));
      ok('full_look_no_creative_intent_contradiction', !pFull.includes('preserving the same adult woman'));

      // Test 1-click unlock
      rp.setFeature('haircut', false);
      ok('hair_unlocked_after_toggle', !rp.isFieldLocked('hair'));

      // Restore defaults
      rp.applyPreset('clear');
      rp.setFaceMode('reference');
      api.buildPrompt();
    ''')
    for r in ps_tests:
        status = 'PASS' if r['ok'] else 'FAIL'
        detail = f" - {r['detail']}" if r['detail'] else ""
        print(f"  [{status}] {r['name']}{detail}")
        if r['ok']: total_passed += 1
        else: total_failed += 1

    # Test 2: Salon & Barbershop Studio
    print('\n--- SALON & BARBERSHOP STUDIO (salon.html) ---')
    salon_tests = run_page_test(browser, 'salon.html', '''
      ok('ref_picker_available', typeof window.AfterglowRefPicker === 'object');
      const api = window.AfterglowStudio;
      ok('salon_api_available', typeof api === 'object');
      const rp = window.AfterglowRefPicker;

      // Selective haircut locking in salon
      rp.setFeature('haircut', true);
      rp.setFeature('hairTexture', false);
      ok('salon_haircut_locked', rp.isFieldLocked('salonHaircut'));
      ok('salon_hair_texture_unlocked', !rp.isFieldLocked('salonHairTexture'));

      api.buildPrompt();
      const p1 = document.getElementById('prompt').value;
      ok('salon_prompt_has_haircut_bullet', p1.includes('Strictly replicate and sculpt the exact hairstyle, haircut, length, and silhouette from the reference image'));

      // AI-generated face in salon
      rp.setFaceMode('ai_generated');
      api.buildPrompt();
      const pAi = document.getElementById('prompt').value;
      ok('salon_ai_face_header', pAi.includes('AI-GENERATED FACE WITH SELECTIVE REFERENCE TRANSFER · AUTHENTIC SALON & BARBERSHOP SCENE'));
      ok('salon_ai_face_anti_clone_neg', pAi.includes('cloned reference face') || pAi.includes('copied reference facial identity'));

      // Test Retain Original Look + Fresh AI Face in salon
      rp.applyPreset('original_look_fresh_face');
      api.buildPrompt();
      const pSalonFull = document.getElementById('prompt').value;
      ok('salon_full_look_no_builder_hair_collision', !pSalonFull.includes('shoulder-length bob with soft wispy bangs'));
      ok('salon_full_look_retains_ref_venue', pSalonFull.includes('Venue & Atmosphere: Faithfully maintain the exact original background environment'));
      ok('salon_full_look_no_creative_intent_contradiction', !pSalonFull.includes('preserving the same adult woman'));

      rp.applyPreset('clear');
      rp.setFaceMode('reference');
      api.buildPrompt();
    ''')
    for r in salon_tests:
        status = 'PASS' if r['ok'] else 'FAIL'
        detail = f" - {r['detail']}" if r['detail'] else ""
        print(f"  [{status}] {r['name']}{detail}")
        if r['ok']: total_passed += 1
        else: total_failed += 1

    # Test 3: Tattoo Studio
    print('\n--- TATTOO STUDIO (tattoo.html) ---')
    tattoo_tests = run_page_test(browser, 'tattoo.html', '''
      ok('ref_picker_available', typeof window.AfterglowRefPicker === 'object');
      const api = window.AfterglowTattoo;
      ok('tattoo_api_available', typeof api === 'object');
      const rp = window.AfterglowRefPicker;

      rp.setFeature('haircut', true);
      ok('tattoo_hair_locked', rp.isFieldLocked('tattooHair'));

      api.buildPrompt();
      const p1 = document.getElementById('prompt').value;
      ok('tattoo_haircut_bullet', p1.includes('Strictly replicate and sculpt the exact hairstyle, haircut, length, and silhouette from the reference image'));

      rp.setFaceMode('ai_generated');
      api.buildPrompt();
      const pAi = document.getElementById('prompt').value;
      ok('tattoo_ai_face_header', pAi.includes('AI-GENERATED FACE WITH SELECTIVE REFERENCE TRANSFER · FINE-LINE TATTOO BEAUTY EDITORIAL'));
      ok('tattoo_ai_face_negatives', pAi.includes('cloned reference face') || pAi.includes('copied reference facial identity'));

      rp.applyPreset('clear');
      rp.setFaceMode('reference');
      api.buildPrompt();
    ''')
    for r in tattoo_tests:
        status = 'PASS' if r['ok'] else 'FAIL'
        detail = f" - {r['detail']}" if r['detail'] else ""
        print(f"  [{status}] {r['name']}{detail}")
        if r['ok']: total_passed += 1
        else: total_failed += 1

    # Test 4: Makeup & Spa Studio
    print('\n--- MAKEUP & SPA STUDIO (makeup_spa.html) ---')
    makeup_tests = run_page_test(browser, 'makeup_spa.html', '''
      ok('ref_picker_available', typeof window.AfterglowRefPicker === 'object');
      const api = window.AfterglowMakeupSpa;
      ok('makeup_spa_api_available', typeof api === 'object');
      const rp = window.AfterglowRefPicker;

      rp.setFeature('haircut', true);
      ok('prep_hair_locked', rp.isFieldLocked('prepHair'));

      api.buildPrompt();
      const p1 = document.getElementById('prompt').value;
      ok('prep_haircut_bullet', p1.includes('Strictly replicate and sculpt the exact hairstyle, haircut, length, and silhouette from the reference image'));

      rp.setFaceMode('ai_generated');
      api.buildPrompt();
      const pAi = document.getElementById('prompt').value;
      ok('prep_ai_face_header', pAi.includes('AI-GENERATED FACE WITH SELECTIVE REFERENCE TRANSFER · MAKEUP CHAIR & FACIAL SPA PREP'));
      ok('prep_ai_face_negatives', pAi.includes('cloned reference face') || pAi.includes('copied reference facial identity'));

      rp.applyPreset('clear');
      rp.setFaceMode('reference');
      api.buildPrompt();
    ''')
    for r in makeup_tests:
        status = 'PASS' if r['ok'] else 'FAIL'
        detail = f" - {r['detail']}" if r['detail'] else ""
        print(f"  [{status}] {r['name']}{detail}")
        if r['ok']: total_passed += 1
        else: total_failed += 1

    # Test 5: Video Director Studio
    print('\n--- VIDEO DIRECTOR STUDIO (video.html) ---')
    video_tests = run_page_test(browser, 'video.html', '''
      ok('ref_picker_available', typeof window.AfterglowRefPicker === 'object');
      const api = window.AfterglowVideo;
      ok('video_api_available', typeof api === 'object');
      const rp = window.AfterglowRefPicker;

      rp.setFeature('haircut', true);
      ok('vid_hair_locked', rp.isFieldLocked('vidHair'));

      api.buildPrompt();
      const p1 = document.getElementById('prompt').value;
      ok('vid_haircut_bullet', p1.includes('Strictly replicate and sculpt the exact hairstyle, haircut, length, and silhouette from the reference image'));

      rp.setFaceMode('ai_generated');
      api.buildPrompt();
      const pAi = document.getElementById('prompt').value;
      ok('vid_ai_face_header', pAi.includes('AI-GENERATED FACE WITH SELECTIVE REFERENCE TRANSFER · CINEMA MOTION DIRECTOR'));
      ok('vid_ai_face_negatives', pAi.includes('cloned reference face') || pAi.includes('copied reference facial identity'));

      rp.applyPreset('clear');
      rp.setFaceMode('reference');
      api.buildPrompt();
    ''')
    for r in video_tests:
        status = 'PASS' if r['ok'] else 'FAIL'
        detail = f" - {r['detail']}" if r['detail'] else ""
        print(f"  [{status}] {r['name']}{detail}")
        if r['ok']: total_passed += 1
        else: total_failed += 1

    # Test 6: Storyboarder Studio
    print('\n--- STORYBOARDER STUDIO (storyboard.html) ---')
    storyboard_tests = run_page_test(browser, 'storyboard.html', '''
      ok('ref_picker_available', typeof window.AfterglowRefPicker === 'object');
      const api = window.AfterglowStoryboard;
      ok('storyboard_api_available', typeof api === 'object');
      const rp = window.AfterglowRefPicker;

      rp.setFeature('haircut', true);
      ok('sb_hair_locked', rp.isFieldLocked('sbHair'));

      rp.setFaceMode('ai_generated');
      api.setOutputMode('grid');
      api.buildPrompt();
      const pAi = document.getElementById('prompt').value;
      ok('sb_ai_face_grid_title', pAi.includes('AI-GENERATED FACE WITH SELECTIVE REFERENCE TRANSFER — UNIFIED'));
      ok('sb_ai_face_negatives', pAi.includes('cloned reference face') || pAi.includes('copied reference facial identity'));

      rp.applyPreset('clear');
      rp.setFaceMode('reference');
      api.setOutputMode('pack');
      api.buildPrompt();
    ''')
    for r in storyboard_tests:
        status = 'PASS' if r['ok'] else 'FAIL'
        detail = f" - {r['detail']}" if r['detail'] else ""
        print(f"  [{status}] {r['name']}{detail}")
        if r['ok']: total_passed += 1
        else: total_failed += 1

    # Test 7: Romance & Couple Studio
    print('\n--- ROMANCE & COUPLE STUDIO (romance.html) ---')
    romance_tests = run_page_test(browser, 'romance.html', '''
      ok('ref_picker_available', typeof window.AfterglowRefPicker === 'object');
      const api = window.AfterglowRomance;
      ok('romance_api_available', typeof api === 'object');
      const rp = window.AfterglowRefPicker;

      rp.setFeature('haircut', true);
      ok('romance_hair_locked', rp.isFieldLocked('romanceHair'));

      api.buildPrompt();
      const p1 = document.getElementById('prompt').value;
      ok('romance_haircut_bullet', p1.includes('Replicate the exact hairstyle silhouette, length, haircut, and parting directly from the reference photo'));

      rp.setFaceMode('ai_generated');
      api.buildPrompt();
      const pAi = document.getElementById('prompt').value;
      ok('romance_ai_face_header', pAi.includes('AI-GENERATED FACE WITH SELECTIVE REFERENCE TRANSFER · ROMANTIC & COUPLE EDITORIAL'));
      ok('romance_ai_face_negatives', pAi.includes('cloned reference face') || pAi.includes('copied reference facial identity'));

      // Test reel mode with AI face
      api.setReelMode(true);
      api.buildPrompt();
      const pReel = document.getElementById('prompt').value;
      ok('romance_ai_face_reel_header', pReel.includes('AI-GENERATED FACE WITH SELECTIVE REFERENCE TRANSFER · HIGHWAY & INTIMACY SEQUENCE'));

      rp.applyPreset('clear');
      rp.setFaceMode('reference');
      api.setReelMode(false);
      api.buildPrompt();
    ''')
    for r in romance_tests:
        status = 'PASS' if r['ok'] else 'FAIL'
        detail = f" - {r['detail']}" if r['detail'] else ""
        print(f"  [{status}] {r['name']}{detail}")
        if r['ok']: total_passed += 1
        else: total_failed += 1

    print('\n==========================================')
    print(f'REF PICKER TEST RESULTS: {total_passed} passed, {total_failed} failed')
    print('==========================================')
    return total_failed == 0


def main():
    static_ok = test_static_markup()
    if not static_ok:
        print('FAILED: Static markup audit failed.')
        sys.exit(1)

    browser = find_browser()
    print(f'Using browser binary: {browser}')
    tests_ok = run_all_studio_tests(browser)

    if not tests_ok:
        sys.exit(1)
    print('\nALL TESTS PASSED SUCCESSFULLY!')


if __name__ == '__main__':
    main()
