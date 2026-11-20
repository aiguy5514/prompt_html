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
    'romance.html',
    'gym.html'
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
        '.btn-ref-unlock',
        '.ref-archetype-box',
        '.ref-archetype-grid',
        '.ref-archetype-btn',
        '.ref-shift-badge',
        '.ref-intensity-row',
        '.ref-intensity-btn',
        '.ref-tip-box'
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
      ok('ai_face_negatives_present', pAi.includes('cloned face') || pAi.includes('duplicate face'));
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
      ok('full_look_radical_face_replacement', pFull.includes('FULL AUTONOMOUS FACIAL ANATOMY (MANDATORY 100% INDEPENDENT IDENTITY)'));
      ok('full_look_discard_reference_face', pFull.includes('unique, photorealistic facial architecture') && pFull.includes('completely independent facial anatomy'));
      ok('full_look_archetype_tokens', pFull.includes('distinct high-fashion bone structure with defined cheekbones'));
      ok('full_look_anti_resemblance_negs', pFull.includes('cloned face') && pFull.includes('duplicate face') && pFull.includes('twin likeness'));
      ok('full_look_decoupled_makeup', pFull.includes("without copying the reference subject's lips"));
      ok('full_look_decoupled_accessories', pFull.includes("fitted naturally onto this new model"));
      ok('full_look_skin_tone_decoupled', !pFull.includes('Keep skin tone consistent with the reference image') && pFull.includes('rendered on this newly synthesized model'));

      // Test archetype switching
      rp.setFaceArchetype('chiseled');
      api.buildPrompt();
      const pChiseled = document.getElementById('prompt').value;
      ok('archetype_chiseled_tokens_emitted', pChiseled.includes('chiseled architectural bone structure with sharp prominent high cheekbones'));
      rp.setFaceArchetype('auto');

      // Test Sibling Variation mode
      rp.setFaceSynthesisMode('sibling');
      api.buildPrompt();
      const pSibling = document.getElementById('prompt').value;
      ok('synthesis_mode_sibling_directive', pSibling.includes('MANDATORY SIBLING DIFFERENTIATION (BIOLOGICAL SISTER, NOT A CLONE)'));
      ok('synthesis_mode_sibling_header', pSibling.includes('AI SIBLING VARIATION FACE WITH FULL REFERENCE LOOK RETENTION'));
      ok('synthesis_mode_sibling_alter_jaw', pSibling.includes('alter the jawline width and chin contour, reshape the eye contour'));
      ok('synthesis_mode_sibling_anti_clone_neg', pSibling.includes('cloned face') && pSibling.includes('twin likeness'));

      // Test Sibling with Dramatic Intensity
      rp.setDivergenceIntensity('dramatic');
      api.buildPrompt();
      const pSiblingDram = document.getElementById('prompt').value;
      ok('synthesis_mode_sibling_dramatic', pSiblingDram.includes('Mandatory dramatic sibling divergence: render strong structural contrast in facial planes'));
      rp.setDivergenceIntensity('distinct');

      // Test Editorial Re-imagination mode
      rp.setFaceSynthesisMode('reimagined');
      api.buildPrompt();
      const pReimagined = document.getElementById('prompt').value;
      ok('synthesis_mode_reimagined_directive', pReimagined.includes('HAUTE COUTURE EDITORIAL FACIAL RE-SCULPTING & STRUCTURAL REMODELING'));
      ok('synthesis_mode_reimagined_header', pReimagined.includes('AI RE-IMAGINED EDITORIAL FACE WITH FULL REFERENCE LOOK RETENTION'));
      ok('synthesis_mode_reimagined_cheekbones', pReimagined.includes('carve razor-sharp, prominent high cheekbones with sculpted hollows'));
      ok('synthesis_mode_reimagined_no_preserve_eyes', !pReimagined.toLowerCase().includes('preserve her eye shape'));
      ok('synthesis_mode_reimagined_anti_casual_neg', pReimagined.includes('casual snapshot face'));

      // Test Editorial with Dramatic Intensity
      rp.setDivergenceIntensity('dramatic');
      api.buildPrompt();
      const pReimaginedDram = document.getElementById('prompt').value;
      ok('synthesis_mode_reimagined_dramatic', pReimaginedDram.includes('Mandatory dramatic editorial transformation: apply extreme haute couture bone architecture'));
      rp.setDivergenceIntensity('distinct');

      // Restore to unrelated
      rp.setFaceSynthesisMode('unrelated');

      // Test User's Exact Configuration: Unrelated Person + Selective Transfer (Haircut, Texture, Color, Pose)
      rp.setDivergenceIntensity('dramatic');
      rp.setFaceArchetype('auto');
      rp.setFeature('haircut', true);
      rp.setFeature('hairTexture', true);
      rp.setFeature('hairColor', true);
      rp.setFeature('wardrobe', false);
      rp.setFeature('makeup', false);
      rp.setFeature('accessories', false);
      rp.setFeature('pose', true);
      rp.setFeature('background', false);
      api.buildPrompt();
      const pUserConfig = document.getElementById('prompt').value;

      ok('unrelated_dramatic_mandate', pUserConfig.includes('Mandatory dramatic face swap: total anatomical decoupling'));
      ok('unrelated_anti_bleed_negs', pUserConfig.includes('identical facial structure') && pUserConfig.includes('duplicate facial geometry'));
      ok('unrelated_no_ref_makeup_leak', !pUserConfig.includes('makeup consistent with the reference image'));
      ok('unrelated_no_ref_acc_leak', !pUserConfig.includes('retain any signature jewelry or nose ring visible in the reference'));
      ok('unrelated_no_checklist_acc_leak', !pUserConfig.includes('Retain signature reference accessories when visible and requested'));
      ok('unrelated_no_full_look_hallucination', !pUserConfig.includes('strictly retains the full original look, hairstyle, wardrobe, pose, and aesthetic environment'));
      ok('unrelated_has_neutral_makeup', pUserConfig.includes("fresh, natural editorial makeup tailored to this new model's distinct facial features"));
      ok('unrelated_has_neutral_acc', pUserConfig.includes("tasteful contemporary accessories chosen to complement the outfit (strictly zero reference jewelry or nose ring)"));
      ok('unrelated_has_selective_intent', pUserConfig.includes("transferring strictly her selected reference elements [Hairstyle & Cut, Hair Texture, Hair Color, Pose & Stance]"));
      ok('unrelated_skin_tone_decoupled', !pUserConfig.includes('Keep skin tone consistent with the reference image') && pUserConfig.includes('rendered on this newly synthesized model'));
      ok('unrelated_seed_stabilization_negs', pUserConfig.includes('cloned face') && pUserConfig.includes('artificial face twin') && pUserConfig.includes('digital face swap mask'));

      // Test User Scenario 2: Soft Oval + Dramatic + Unchecked Hair Color
      rp.setFaceArchetype('soft_oval');
      rp.setFeature('hairColor', false);
      api.buildPrompt();
      const pSoftOval = document.getElementById('prompt').value;
      ok('soft_oval_dramatic_harmonious', pSoftOval.includes('unmistakably distinct soft oval silhouette') && !pSoftOval.includes('sharply sculpted mandibular angle'));
      ok('hair_color_unchecked_no_leak', !pSoftOval.includes('the original hair color from the reference image') && pSoftOval.includes('natural rich dark hair color'));
      const negBlock = pSoftOval.split('AVOID / NEGATIVE GUIDANCE')[1] || '';
      ok('zero_reference_photo_in_negatives', !negBlock.includes('reference photo') && !negBlock.includes('reference image'));
      rp.setFaceArchetype('auto');
      rp.setFeature('hairColor', true);

      // Test Lookbook Mode Neutralization
      const btnLookbook = document.getElementById('btnLookbookMode');
      if(btnLookbook) btnLookbook.click();
      api.buildPrompt();
      const pLbConfig = document.getElementById('prompt').value;
      ok('lookbook_ai_face_no_same_adult_woman', !pLbConfig.includes('same adult woman'));
      ok('lookbook_ai_face_no_ref_identity_continuity', !pLbConfig.includes('Identical identity from reference'));
      ok('lookbook_ai_face_new_model_continuity', pLbConfig.includes('this newly synthesized adult model') || pLbConfig.includes('Consistent newly synthesized model identity'));
      const btnSingle = document.getElementById('btnSingleMode');
      if(btnSingle) btnSingle.click();
      api.buildPrompt();

      // Test 1-click unlock
      rp.setFeature('haircut', false);
      ok('hair_unlocked_after_toggle', !rp.isFieldLocked('hair'));

      // Test User Scenario 3: AI Generate Fresh Face with ONLY haircut, hairTexture, hairColor
      rp.setFaceMode('ai_generated');
      rp.setFeature('haircut', true);
      rp.setFeature('hairTexture', true);
      rp.setFeature('hairColor', true);
      rp.setFeature('wardrobe', false);
      rp.setFeature('makeup', false);
      rp.setFeature('accessories', false);
      rp.setFeature('pose', false);
      rp.setFeature('background', false);
      api.buildPrompt();
      const pHairOnly = document.getElementById('prompt').value;
      ok('hair_only_has_decoupling_bullet', pHairOnly.includes('CRITICAL FACE DECOUPLING & ZERO IDENTITY RETENTION'));
      ok('hair_only_no_preserve_adult_woman', !pHairOnly.includes('Strictly preserve the adult woman from the reference') && !pHairOnly.includes('Preserve the same adult woman'));
      ok('hair_only_no_recognizable_facial_identity', !pHairOnly.includes('recognizable facial identity'));
      ok('hair_only_no_ref_subject_hair_texture', !pHairOnly.includes("reference subject's natural organic hair texture"));
      ok('hair_only_has_face_freedom_negs', pHairOnly.includes('original face from reference') && pHairOnly.includes('reference woman face'));

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
      ok('salon_ai_face_anti_clone_neg', pAi.includes('cloned face') || pAi.includes('duplicate face'));
      ok('salon_ai_face_skin_tone_decoupled', !pAi.includes('Consistent with the reference image') && pAi.includes('rendered on this newly synthesized model'));

      // Test Retain Original Look + Fresh AI Face in salon
      rp.applyPreset('original_look_fresh_face');
      api.buildPrompt();
      const pSalonFull = document.getElementById('prompt').value;
      ok('salon_full_look_no_builder_hair_collision', !pSalonFull.includes('shoulder-length bob with soft wispy bangs'));
      ok('salon_full_look_retains_ref_venue', pSalonFull.includes('Venue & Atmosphere: Faithfully maintain the exact original background environment'));
      ok('salon_full_look_no_creative_intent_contradiction', !pSalonFull.includes('preserving the same adult woman'));

      // Test Hair-Only AI Face in Salon
      rp.setFaceMode('ai_generated');
      rp.setFeature('haircut', true);
      rp.setFeature('hairTexture', true);
      rp.setFeature('hairColor', true);
      rp.setFeature('wardrobe', false);
      rp.setFeature('makeup', false);
      rp.setFeature('accessories', false);
      rp.setFeature('pose', false);
      rp.setFeature('background', false);
      api.buildSalonPrompt();
      const pSalonHairOnly = document.getElementById('prompt').value;
      ok('salon_hair_only_has_decoupling_bullet', pSalonHairOnly.includes('CRITICAL FACE DECOUPLING & ZERO IDENTITY RETENTION'));
      ok('salon_hair_only_no_preserve_adult_woman', !pSalonHairOnly.includes('Strictly preserve the adult woman from the reference') && !pSalonHairOnly.includes('Preserve the same adult woman'));
      ok('salon_hair_only_no_full_look_hallucination', !pSalonHairOnly.includes('strictly retains the full original look, hairstyle, styling, and atmosphere'));
      ok('salon_hair_only_no_ref_subject_hair_texture', !pSalonHairOnly.includes("Maintain the client's authentic natural Indian hair fiber, natural density"));

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
      ok('tattoo_ai_face_negatives', pAi.includes('cloned face') || pAi.includes('duplicate face'));

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
      ok('prep_ai_face_negatives', pAi.includes('cloned face') || pAi.includes('duplicate face'));

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
      ok('vid_ai_face_negatives', pAi.includes('cloned face') || pAi.includes('duplicate face'));

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
      ok('sb_ai_face_negatives', pAi.includes('cloned face') || pAi.includes('duplicate face'));

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
      ok('romance_ai_face_negatives', pAi.includes('cloned face') || pAi.includes('duplicate face'));

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

    # Test 8: Gym & Fitness Studio
    print('\n--- GYM & FITNESS STUDIO (gym.html) ---')
    gym_tests = run_page_test(browser, 'gym.html', '''
      ok('ref_picker_available', typeof window.AfterglowRefPicker === 'object');
      const api = window.AfterglowGym;
      ok('gym_api_available', typeof api === 'object');
      const rp = window.AfterglowRefPicker;

      // Navigate to step 3 and verify card is rendered in DOM
      document.querySelector('[data-section="gymPhysiqueSec"]').click();
      const card = document.getElementById('refPickerCard');
      ok('gym_ref_picker_card_rendered', !!card && !!card.querySelector('.ref-face-seg'));

      // Test toolbar toggle button focuses / scrolls to card
      document.querySelector('[data-section="gymVenueSec"]').click();
      document.getElementById('btnToggleRefPicker').click();
      ok('gym_ref_toggle_btn_switches_section', document.querySelector('.tab.active')?.dataset?.section === 'gymPhysiqueSec');
      ok('gym_ref_card_present_after_toggle', !!document.getElementById('refPickerCard'));

      // Test haircut locking
      rp.setFeature('haircut', true);
      ok('gym_hair_locked', rp.isFieldLocked('gymHair'));
      ok('gym_hair_restraint_locked', rp.isFieldLocked('gymHairRestraint'));

      api.buildPrompt();
      const p1 = document.getElementById('prompt').value;
      ok('gym_haircut_bullet', p1.includes('Strictly replicate and sculpt the exact haircut') || p1.includes('Replicate'));

      // Test AI Face Mode
      rp.setFaceMode('ai_generated');
      api.buildPrompt();
      const pAi = document.getElementById('prompt').value;
      ok('gym_ai_face_header', pAi.includes('AI-GENERATED FACE WITH SELECTIVE REFERENCE TRANSFER · GYM & ATHLETIC FITNESS STUDIO'));
      ok('gym_ai_face_negatives', pAi.includes('cloned face') || pAi.includes('duplicate face') || pAi.includes('identical face'));

      // Reset
      rp.applyPreset('clear');
      rp.setFaceMode('reference');
      api.buildPrompt();
    ''')
    for r in gym_tests:
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
