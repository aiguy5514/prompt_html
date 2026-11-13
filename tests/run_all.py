#!/usr/bin/env python3
"""
Afterglow Studio Suite — Unified Headless Chrome Regression Suite (file:/// offline verification)
Tests index.html, salon.html, photoshoot.html, and tattoo.html directly against js/shared-*.js modules.
"""

import html as pyhtml
import json
import os
import re
import sys
import tempfile
import subprocess

ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
CHROME_CANDIDATES = [
    r'C:\Program Files\Google\Chrome\Application\chrome.exe',
    r'C:\Program Files (x86)\Google\Chrome\Application\chrome.exe',
    r'C:\Program Files\Microsoft\Edge\Application\msedge.exe',
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
}}, 180);
</script>
'''
    injected = src.replace('</body>', harness + '\n</body>', 1)
    assert injected != src, f'</body> not found in {rel_path}'

    # Write temp HTML inside ROOT so relative css/ and js/ paths resolve identically via file:///
    fd, tmp_path = tempfile.mkstemp(prefix='_tmp_test_', suffix='.html', dir=ROOT)
    os.close(fd)
    with open(tmp_path, 'w', encoding='utf-8') as f:
        f.write(injected)

    try:
        proc = subprocess.run(
            [
                browser,
                '--headless=new',
                '--disable-gpu',
                '--no-sandbox',
                '--virtual-time-budget=3500',
                '--dump-dom',
                'file:///' + tmp_path.replace('\\', '/'),
            ],
            capture_output=True,
            text=True,
            encoding='utf-8',
            timeout=35,
        )
        dom = proc.stdout
    finally:
        if os.path.exists(tmp_path):
            import time
            for _ in range(5):
                try:
                    os.remove(tmp_path)
                    break
                except OSError:
                    time.sleep(0.1)

    m = re.search(r'<div id="afterglow-test-report">([\s\S]*?)</div>', dom)
    if not m:
        return [{'name': 'missing_test_report_element', 'ok': False, 'detail': 'Chrome did not emit #afterglow-test-report'}]
    return json.loads(pyhtml.unescape(m.group(1)))


INDEX_JS = r'''
const links = [...document.querySelectorAll('a')].map(a => a.getAttribute('href') || '');
ok('index_has_photoshoot_link', links.some(h => h.includes('photoshoot.html')));
ok('index_has_salon_link', links.some(h => h.includes('salon.html')));
ok('index_has_tattoo_link', links.some(h => h.includes('tattoo.html')));
ok('index_has_makeup_spa_link', links.some(h => h.includes('makeup_spa.html')));
ok('index_has_video_link', links.some(h => h.includes('video.html')));
ok('index_has_storyboard_link', links.some(h => h.includes('storyboard.html')));
'''

SALON_JS = r'''
const api = window.AfterglowStudio;
ok('studio_api_exposed', !!api);
ok('salon_starts_in_salon_mode', api.getMode() === 'salon');
ok('salon_initial_section', document.querySelector('.tab.active')?.dataset?.section === 'salonVenueSec');
ok('salon_hero_title', document.getElementById('heroTitle').textContent.includes('Salon'));
ok('shared_datasets_loaded', api.getHair().length === 261 && api.getFields().outfit.opts.length === 438, `hair=${api.getHair().length}, outfit=${api.getFields().outfit.opts.length}`);

// Moisture tests in Salon Chair, Stool, Female Barber
const clickSeating = (mode) => {
  document.querySelector('[data-section="salonStageSec"]')?.click();
  const idMap = { chair: 'btnSeatingChair', stool: 'btnSeatingStool', grooming_men: 'btnRoleGrooming' };
  document.getElementById(idMap[mode]).click();
};
const clickMoisture = (m) => {
  document.querySelector('[data-section="salonHairSec"]')?.click();
  document.querySelector(`.moisture-pill[data-moisture="${m}"]`).click();
};

clickSeating('chair');
clickMoisture('dry');
const pDry = document.getElementById('prompt').value;
clickMoisture('damp');
const pDamp = document.getElementById('prompt').value;
clickMoisture('wet');
const pWet = document.getElementById('prompt').value;
const [posDry, negDry] = pDry.split('AVOID / NEGATIVE GUIDANCE');
const [posWet, negWet] = pWet.split('AVOID / NEGATIVE GUIDANCE');
ok('salon_dry_physics', posDry.includes('Dry Blown-Out Hair Physics') && negDry.includes('wet hair'));
ok('salon_wet_physics', posWet.includes('Mandatory Soaked Wet Hair Physics') && !posWet.includes('delicate micro-flyaways') && negWet.includes('merely lightly misted dry-looking hair'));
const diffLines = pDamp.split('\n').filter((l, i) => l !== (pWet.split('\n')[i] || '')).length;
ok('salon_damp_wet_diff_ge_8', diffLines >= 8, `diffLines=${diffLines}`);

clickSeating('stool');
clickMoisture('wet');
ok('salon_stool_wet', document.getElementById('prompt').value.includes('Mandatory Soaked Wet Hair Physics'));

clickSeating('grooming_men');
clickMoisture('wet');
const barberPrompt = document.getElementById('prompt').value;
ok('salon_barber_keeps_haircut', barberPrompt.includes("Female model's personal hair: Her hair is freshly cut and styled into"));

// Veil landmark & haircut architecture locks
clickSeating('chair');
const vals = api.getValues();
const covOpts = api.getHairFaceCoverageOpts();
const findCov = sub => covOpts.find(o => o.label.includes(sub));
const cuts = [
  { key: 'pony', cut: api.getHair().find(h => h.label.includes('Sleek high ponytail')), arch: 'Keep the ponytail, bun, braid, or slicked back crown 100% neatly secured' },
  { key: 'chin', cut: api.getHair().find(h => h.label.includes('Chin-length French bob')), arch: 'Strictly keep the bob hem ending crisply at chin/jawline level' },
  { key: 'pixie', cut: api.getHair().find(h => h.label.includes('Short side-part crop')), arch: 'Keep the crisp cropped pixie crown & nape true to cut' },
  { key: 'long', cut: api.getHair().find(h => h.label.includes('tucked behind ears')), arch: 'Veronica-Lake satin sweep' },
];
for (const tc of cuts) {
  vals.salonHaircut = tc.cut;
  vals.salonFaceHairCoverage = findCov('80–85%');
  const [pos, neg] = api.buildSalonPrompt().split('AVOID / NEGATIVE GUIDANCE');
  ok(`salon_veil_${tc.key}_arch`, pos.includes(tc.arch));
  ok(`salon_veil_${tc.key}_zero_eyeballs`, pos.includes('ZERO visible eyeballs'));
  ok(`salon_veil_${tc.key}_cohesion`, pos.includes('RIBBON COHESION RULE'));
  ok(`salon_veil_${tc.key}_neg_dual`, /visible eyeballs|peeking eye/i.test(neg) && /wet spaghetti strings|sadako/i.test(neg));
}

// Positive-only & Negative extraction + Export/Import Presets
const fullText = document.getElementById('prompt').value;
const posOnly = api.getExtractedPositive();
const negOnly = api.getExtractedNegative();
ok('salon_copy_positive_strips_neg', posOnly.length > 100 && !posOnly.includes('AVOID / NEGATIVE GUIDANCE'));
ok('salon_copy_negative_extracts_live', negOnly.startsWith('AVOID / NEGATIVE GUIDANCE') && negOnly.includes('visible eyeballs'));

const imported = api.importCustomPresetsFromData({
  version: 1,
  studio: 'salon',
  customPresets: [{
    id: 'test_import_1',
    title: 'Imported Salon Test Look',
    sub: 'Test sub',
    set: { salonHaircut: cuts[1].cut.label }
  }]
});
ok('salon_import_preset_works', imported === 1 && api.getCustomPresets().some(p => p.id === 'test_import_1'));
const importedDup = api.importCustomPresetsFromData({
  customPresets: [{ id: 'test_import_1', title: 'Imported Salon Test Look', set: { salonHaircut: cuts[1].cut.label } }]
});
ok('salon_import_dedups', importedDup === 0);

// Verify real UI clicks on #copyPositive, #copyNegative, #btnQuickGrooming
document.getElementById('copyPositive').click();
ok('salon_toast_copy_positive', document.getElementById('toast').textContent.includes('positive'));
document.getElementById('copyNegative').click();
ok('salon_toast_copy_negative', document.getElementById('toast').textContent.includes('exclusions'));
document.getElementById('btnQuickGrooming').click();
ok('salon_quick_grooming_activates', api.getSeatingMode() === 'grooming_men');

// Theme 3 & 4: Clipper guard depth selector + token estimation + buzzword purge
ok('salon_clipper_guard_field_exists', !!api.getFields().salonClipperGuard && api.getFields().salonClipperGuard.opts.length === 6);
api.getValues().salonClipperGuard = api.getFields().salonClipperGuard.opts[3];
const sGuardPrompt = api.buildSalonPrompt();
ok('salon_clipper_guard_reflected', sGuardPrompt.includes('#1 magnetic clipper guard'));
ok('salon_token_estimate_present', document.getElementById('wordCount').textContent.includes('tokens'));
ok('salon_buzzwords_purged', !sGuardPrompt.includes('harmonized with the selected establishment'));
'''

PHOTOSHOOT_JS = r'''
const api = window.AfterglowStudio;
ok('ps_api_exposed', !!api);
ok('ps_starts_in_photoshoot_mode', api.getMode() === 'photoshoot');
ok('ps_initial_section', document.querySelector('.tab.active')?.dataset?.section === 'look');
ok('ps_hero_title', document.getElementById('heroTitle').textContent.includes('Photoshoot'));

// Track 1: Photoshoot Hair Moisture State UI & Prompt enforcement
const card = document.getElementById('moistureToggleCard');
ok('ps_moisture_card_rendered', !!card);
ok('ps_moisture_default_dry', api.getMoisture() === 'dry');

document.querySelector('.moisture-pill[data-moisture="wet"]').click();
const [psWetPos, psWetNeg] = document.getElementById('prompt').value.split('AVOID / NEGATIVE GUIDANCE');
ok('ps_wet_primary', psWetPos.includes('Mandatory Soaked Wet Hair Physics'));
ok('ps_wet_strands', psWetPos.includes('Soaked Hair Strand Physics'));
ok('ps_wet_summary_tag', document.getElementById('summary').textContent.includes('Soaked Wet'));
ok('ps_wet_neg_excludes_dry', psWetNeg.includes('dry hair'));

document.querySelector('.moisture-pill[data-moisture="dry"]').click();
const [psDryPos, psDryNeg] = document.getElementById('prompt').value.split('AVOID / NEGATIVE GUIDANCE');
ok('ps_dry_restored', psDryPos.includes('Dry Blown-Out Hair Physics') && psDryNeg.includes('soaked wet hair'));

// Photoshoot Veil suppression + Lookbook + styleRef
const vals = api.getValues();
const flds = api.getFields();
const covOpts = api.getHairFaceCoverageOpts();
const findCov = sub => covOpts.find(o => o.label.includes(sub));
vals.hair = api.getHair().find(h => h.label.includes('Sleek high ponytail'));
if (flds.eyewear) vals.eyewear = flds.eyewear.opts[2];
vals.makeup = flds.makeup.opts.find(o => /eyeliner|kohl|smoky/i.test(o.text)) || flds.makeup.opts[2];
vals.hairFaceCoverage = findCov('65–70%');
api.buildPrompt();
const [p65Pos, p65Neg] = document.getElementById('prompt').value.split('AVOID / NEGATIVE GUIDANCE');
ok('ps_65_preserves_pony', p65Pos.includes('a sleek high ponytail') && p65Pos.includes('Keep the ponytail'));
ok('ps_65_no_eyewear', !flds.eyewear || !p65Pos.includes(vals.eyewear.text));
ok('ps_65_no_eyeliner', !/winged black eyeliner|winged eyeliner|kohl-lined eyes/i.test(p65Pos));
ok('ps_65_no_eye_shape', !p65Pos.includes('natural eye shape'));

api.setLookbookMode(true, '1');
const lbPos = document.getElementById('prompt').value.split('AVOID / NEGATIVE GUIDANCE')[0];
ok('ps_lookbook_65_no_catchlights', !lbPos.includes('catchlights in the eyes'));
api.setLookbookMode(false, 'all');

// Positive extraction keeps OUTPUT INSTRUCTIONS & strips AVOID block
const fullOut = document.getElementById('prompt').value;
const posOnly = api.getExtractedPositive();
ok('ps_copy_positive_strips_neg_keeps_output', !posOnly.includes('AVOID / NEGATIVE GUIDANCE') && posOnly.includes('OUTPUT INSTRUCTIONS'));
ok('ps_copy_negative_live', api.getExtractedNegative().includes('sadako') || api.getExtractedNegative().includes('soaked wet'));

// Real UI clicks + localStorage persistence roundtrip for photoHairMoisture
document.querySelector('.moisture-pill[data-moisture="damp"]').click();
ok('ps_localstorage_saves_moisture_damp', (localStorage.getItem('afterglow-prompt-studio-v2') || '').includes('"pm":"damp"'));
document.getElementById('copyPositive').click();
ok('ps_toast_copy_positive', document.getElementById('toast').textContent.includes('positive'));

// Theme 3 & 4: 35mm optical detail + dry water check gating + token estimation
ok('ps_4k_buzzwords_purged', !document.getElementById('prompt').value.includes('4K-style'));
ok('ps_token_estimate_present', document.getElementById('wordCount').textContent.includes('tokens'));
api.setMoisture('dry');
api.getCheckState().waterReal = true;
const psDryPrompt = api.buildPrompt();
ok('ps_dry_no_water_droplets', !psDryPrompt.includes('Authentic water droplets, believable wet hair clumping'));
'''

TATTOO_JS = r'''
const api = window.AfterglowTattoo;
ok('tattoo_api_exposed', !!api);
ok('tattoo_shared_datasets', api.getHair().length === 261 && api.getFields().outfit.opts.length === 438);

// Track 1 Bugfix #1: Mobile Drawer (.drawer-open) & Backdrop & Handle & FAB
document.getElementById('openDrawerBtn').click();
const previewEl = document.querySelector('.preview');
const backdropEl = document.getElementById('drawerBackdrop');
ok('tattoo_drawer_opens_with_correct_class', previewEl.classList.contains('drawer-open') && backdropEl.classList.contains('active'));
backdropEl.click();
ok('tattoo_backdrop_closes_drawer', !previewEl.classList.contains('drawer-open') && !backdropEl.classList.contains('active'));
document.getElementById('sheetHandle').click();
ok('tattoo_handle_toggles_open', previewEl.classList.contains('drawer-open'));
document.getElementById('closeDrawer').click();
ok('tattoo_close_btn_closes', !previewEl.classList.contains('drawer-open'));

// Track 1 Bugfix #2: Save Look persistence into localStorage & delete
const saved = api.saveCustomTattooPreset('My Clavicle Test');
ok('tattoo_save_preset_adds_to_custom', !!saved && api.getCustomPresets().some(p => p.title === 'My Clavicle Test'));
const rawStorage = localStorage.getItem('afterglow_tattoo_v1') || '';
ok('tattoo_custom_preset_saved_to_localstorage', rawStorage.includes('My Clavicle Test'));
ok('tattoo_custom_preset_rendered_in_dom', [...document.querySelectorAll('.preset.custom-preset')].some(b => b.textContent.includes('My Clavicle Test')));
api.deleteCustomPreset(saved.id);
ok('tattoo_delete_custom_preset_works', !api.getCustomPresets().some(p => p.id === saved.id));

// Track 1 Bugfix #3: Shuffle Looks does NOT overwrite current user choices
const vals = api.getValues();
const flds = api.getFields();
vals.tattooPlacement = flds.tattooPlacement.opts[4];
vals.tattooMotif = flds.tattooMotif.opts[5];
const beforePlace = vals.tattooPlacement.label;
document.getElementById('shuffleLooks').click();
ok('tattoo_shuffle_preserves_user_selection', api.getValues().tattooPlacement.label === beforePlace);

// Track 1 Parity: Tattoo Hair Moisture State
const mCard = document.getElementById('moistureToggleCard');
ok('tattoo_moisture_card_rendered', !!mCard);
document.querySelector('.moisture-pill[data-moisture="wet"]').click();
const [tWetPos, tWetNeg] = document.getElementById('prompt').value.split('AVOID / NEGATIVE GUIDANCE:');
ok('tattoo_wet_enforced', tWetPos.includes('Mandatory Soaked Wet Hair Physics') && tWetNeg.includes('dry hair'));
ok('tattoo_wet_summary_tag', document.getElementById('summary').textContent.includes('Soaked Wet'));

// Tattoo Haircut Architecture + Veil Landmark Lock
vals.tattooHair = api.getHair().find(h => h.label.includes('Chin-length French bob'));
vals.tattooHairFaceCoverage = api.getHairFaceCoverageOpts().find(o => o.label.includes('95–100%'));
const tVeilPrompt = api.buildPrompt();
ok('tattoo_95_chin_bob_lock', tVeilPrompt.includes('Strictly keep the bob hem ending crisply at chin/jawline level') && tVeilPrompt.includes('ZERO visible eyes'));

// Track 1 Parity: Copy Positive Only + Export/Import JSON
ok('tattoo_copy_positive_strips_neg', !api.getExtractedPositive().includes('AVOID / NEGATIVE GUIDANCE'));
ok('tattoo_copy_negative_live', api.getExtractedNegative().startsWith('AVOID / NEGATIVE GUIDANCE:'));
const impCount = api.importTattooPresetsFromData({
  customPresets: [{
    id: 'tattoo_imp_1',
    title: 'Imported Butterfly Spine',
    hairMoisture: 'wet',
    set: { tattooPlacement: flds.tattooPlacement.opts[4].label }
  }]
});
ok('tattoo_import_preset_works', impCount === 1 && api.getCustomPresets().some(p => p.id === 'tattoo_imp_1'));

// Verify real UI clicks + localStorage reload roundtrip on tattoo
document.getElementById('copyPositive').click();
ok('tattoo_toast_copy_positive', document.getElementById('toast').textContent.includes('positive'));
document.getElementById('copyNegative').click();
ok('tattoo_toast_copy_negative', document.getElementById('toast').textContent.includes('exclusions'));
document.getElementById('fab').click();
ok('tattoo_fab_copy_feedback', document.getElementById('fab').textContent.includes('Copied'));
api.save();
api.getCustomPresets().length = 0;
api.load();
ok('tattoo_reload_restores_custom_preset', api.getCustomPresets().some(p => p.id === 'tattoo_imp_1'));

// Theme 3 & 4: Dual-placement layer + Finish textareas + Vector buzzwords purged + Token estimation
document.querySelector('.tab[data-section="finish"]').click();
ok('tattoo_finish_textareas_exist', !!document.getElementById('customDirInput') && !!document.getElementById('extraNegInput'));
ok('tattoo_secondary_placement_field_exists', !!api.getFields().tattooSecondaryPlacement && api.getFields().tattooSecondaryPlacement.opts.length === 6);
api.getValues().tattooSecondaryPlacement = api.getFields().tattooSecondaryPlacement.opts[1];
const tSecPrompt = api.buildPrompt();
ok('tattoo_secondary_placement_reflected', tSecPrompt.includes('Dual-placement accent') && tSecPrompt.includes('behind the left earlobe'));
ok('tattoo_vector_buzzword_purged', !tSecPrompt.includes('Vector-grade') && tSecPrompt.includes('Subdermal single-needle micro-stippling'));
ok('tattoo_token_estimate_present', document.getElementById('wordCount').textContent.includes('tokens'));
'''

MAKEUP_SPA_JS = r'''
const api = window.AfterglowMakeupSpa;
ok('makeup_api_exposed', !!api);
ok('makeup_shared_datasets', api.getHair().length === 261 && api.getFields().topPiece.opts.length === 35);
ok('makeup_starts_in_venue_sec', document.querySelector('.tab.active')?.dataset?.section === 'prepVenueSec');

// Navigate to Hair Prep & Apparel -> check moisture card & Separates toggle
document.querySelector('[data-section="prepHairWardrobeSec"]').click();
ok('makeup_moisture_card_rendered', !!document.getElementById('moistureToggleCard'));
document.querySelector('.moisture-pill[data-moisture="wet"]').click();
const [mWetPos, mWetNeg] = document.getElementById('prompt').value.split('AVOID / NEGATIVE GUIDANCE:');
ok('makeup_wet_physics_enforced', mWetPos.includes('Mandatory Soaked Wet Hair Physics') && mWetNeg.includes('dry hair'));
ok('makeup_wet_summary_tag', document.getElementById('summary').textContent.includes('Soaked Wet'));

// Toggle to Two-Piece Separates
document.getElementById('btnPrepSeparates').click();
ok('makeup_separates_updates_prompt', document.getElementById('prompt').value.includes('separates pairing'));

// Veil landmark lock + haircut architecture preservation + eye detail suppression
const vals = api.getValues();
vals.prepHair = api.getHair().find(h => h.label.includes('Chin-length French bob'));
vals.prepHairFaceCoverage = api.getHairFaceCoverageOpts().find(o => o.label.includes('80–85%'));
const pVeil = api.buildPrompt();
ok('makeup_80_veil_chin_bob', pVeil.includes('Strictly keep the bob hem ending crisply at chin/jawline level') && pVeil.includes('ZERO visible eyeballs'));
ok('makeup_80_veil_suppresses_eye_detail', !pVeil.split('AVOID / NEGATIVE GUIDANCE:')[0].includes('Eye detail:'));

// Check Finish & Controls customDirection + extraNegative + noMirror
document.querySelector('[data-section="finish"]').click();
const customDir = document.getElementById('customDirInput');
const extraNeg = document.getElementById('extraNegInput');
ok('makeup_finish_textareas_rendered', !!customDir && !!extraNeg);
customDir.value = 'silver hydrosol bottle beside marble tray';
customDir.dispatchEvent(new Event('input'));
extraNeg.value = 'harsh neon lighting';
extraNeg.dispatchEvent(new Event('input'));
const finishPrompt = document.getElementById('prompt').value;
ok('makeup_custom_dir_in_prompt', finishPrompt.includes('silver hydrosol bottle beside marble tray'));
ok('makeup_extra_neg_in_prompt', finishPrompt.includes('harsh neon lighting'));

document.getElementById('chkNoMirror').click();
const noMirrorPrompt = document.getElementById('prompt').value;
ok('makeup_no_mirror_removes_mirrors', !/\bmirror\b/i.test(noMirrorPrompt.split('AVOID / NEGATIVE GUIDANCE:')[0]));

// 2x2 Prep Collage toggle + Copy Positive/Negative
document.getElementById('btnLookbookMode').click();
ok('makeup_collage_2x2_panel', document.getElementById('prompt').value.includes('2×2 EDITORIAL PREP COLLAGE PROGRESSION'));
ok('makeup_copy_positive_strips_neg', !api.getExtractedPositive().includes('AVOID / NEGATIVE GUIDANCE:'));
ok('makeup_copy_negative_live', api.getExtractedNegative().startsWith('AVOID / NEGATIVE GUIDANCE:'));

// Mobile drawer + Custom Preset localStorage persistence + JSON import
document.getElementById('openDrawerBtn').click();
ok('makeup_drawer_opens', document.querySelector('.preview').classList.contains('drawer-open'));
document.getElementById('drawerBackdrop').click();
ok('makeup_drawer_closes', !document.querySelector('.preview').classList.contains('drawer-open'));

const saved = api.saveCustomPrepPreset('My Gua Sha Night');
ok('makeup_save_preset_persists', !!saved && (localStorage.getItem('afterglow_makeup_spa_v1') || '').includes('My Gua Sha Night'));
const imp = api.importPrepPresetsFromData({ customPresets: [{ id: 'imp_prep_1', title: 'Imported Spa Mist', hairMoisture: 'damp', set: { prepLocation: api.getFields().prepLocation.opts[2].label } }] });
ok('makeup_import_preset_works', imp === 1);

// Theme 3 & 4: Treatment phase + Steam density + Token estimation
ok('makeup_phase_and_steam_fields', !!api.getFields().prepPhase && !!api.getFields().prepSteamDensity);
api.getValues().prepSteamDensity = api.getFields().prepSteamDensity.opts[2];
api.getValues().prepPhase = api.getFields().prepPhase.opts[1];
const mPrompt = api.buildPrompt();
ok('makeup_phase_and_steam_reflected', mPrompt.includes('Dense Steam Sanctuary') || mPrompt.includes('warm, deeply humid spa steam'));
ok('makeup_token_estimate_present', document.getElementById('wordCount').textContent.includes('tokens'));
'''

VIDEO_JS = r'''
const api = window.AfterglowVideo;
ok('video_api_exposed', !!api);
const flds = api.getFields();
ok('video_rich_option_libraries', api.getHair().length === 261 && flds.vidOutfit.opts.length === 438 && flds.vidCameraMove.opts.length === 32 && flds.vidBeatStart.opts.length >= 25 && flds.vidBeatMid.opts.length >= 30 && flds.vidEnvironment.opts.length >= 15);
ok('video_starts_in_subject_sec', document.querySelector('.tab.active')?.dataset?.section === 'vidInputSec');

// Moisture toggle in Video Director
document.querySelector('.moisture-pill[data-moisture="wet"]').click();
const [vWetPos, vWetNeg] = document.getElementById('prompt').value.split('AVOID / NEGATIVE GUIDANCE:');
ok('video_wet_motion_physics', vWetPos.includes('Soaked Wet Hair Motion Physics') && vWetNeg.includes('hair magically drying out'));

// Separates switch + 80-85% Veil Lock in Video
document.getElementById('btnVidSeparates').click();
ok('video_separates_in_prompt', document.getElementById('prompt').value.includes('topPiece') === false && document.getElementById('prompt').value.includes('separates outfit'));
const vals = api.getValues();
vals.vidHair = api.getHair().find(h => h.label.includes('Chin-length French bob'));
vals.vidHairFaceCoverage = api.getHairFaceCoverageOpts().find(o => o.label.includes('80–85%'));
const vVeilPrompt = api.buildPrompt();
ok('video_80_veil_bob_rule', vVeilPrompt.includes('Strictly keep the bob hem ending crisply at chin/jawline level') && vVeilPrompt.includes('ZERO visible eyeballs'));

// Compact Prose vs 3-Beat Detailed mode
document.getElementById('btnCompactMotion').click();
ok('video_compact_mode_works', !document.getElementById('prompt').value.includes('TEMPORAL STABILITY & ARTIFACT SAFEGUARDS:'));
document.getElementById('btnStructuredMode').click();
ok('video_detailed_mode_restored', document.getElementById('prompt').value.includes('CHRONOLOGICAL 3-BEAT ACTION TIMELINE:'));

// Copy Positive/Negative + Finish textareas + Save & Import
document.querySelector('[data-section="finish"]').click();
const cd = document.getElementById('customDirInput');
const en = document.getElementById('extraNegInput');
ok('video_finish_inputs_present', !!cd && !!en);
cd.value = 'wind picks up at 3.2s'; cd.dispatchEvent(new Event('input'));
ok('video_custom_dir_in_prompt', document.getElementById('prompt').value.includes('wind picks up at 3.2s'));
ok('video_copy_positive_works', !api.getExtractedPositive().includes('AVOID / NEGATIVE GUIDANCE:'));
ok('video_copy_negative_works', api.getExtractedNegative().startsWith('AVOID / NEGATIVE GUIDANCE:'));
const saved = api.saveCustomVidPreset('Test Monsoon Motion');
ok('video_save_preset_localstorage', !!saved && (localStorage.getItem('afterglow_video_director_v1') || '').includes('Test Monsoon Motion'));

// Theme 3 & 4: Speed curve + Seamless loop + Token estimation
ok('video_speed_curve_field_exists', !!api.getFields().vidSpeedCurve);
api.getValues().vidSpeedCurve = api.getFields().vidSpeedCurve.opts[1];
const vCurvePrompt = api.buildPrompt();
ok('video_speed_curve_reflected', vCurvePrompt.includes('Dynamic Speed Ramp') || vCurvePrompt.includes('cinematic speed ramp curve'));
document.getElementById('chkLoop').click();
const vLoopPrompt = api.buildPrompt();
ok('video_seamless_loop_reflected', vLoopPrompt.includes('Seamless loop requirement') && vLoopPrompt.includes('jump cut at loop point'));
ok('video_token_estimate_present', document.getElementById('wordCount').textContent.includes('tokens'));
'''

STORYBOARD_JS = r'''
const api = window.AfterglowStoryboard;
ok('sb_api_exposed', !!api);
const flds = api.getFields();
ok('sb_rich_option_libraries', api.getHair().length === 261 && flds.sbOutfit.opts.length === 438 && flds.sbVenue.opts.length >= 20);
ok('sb_default_4_frames', api.getFrameCount() === 4);

// Frame Sequencer UI: switch to 6 frames, customize Frame 2 Veil override to 80-85% + Moisture Wet
document.querySelector('[data-section="sbFramesSec"]').click();
ok('sb_4_cards_rendered', document.querySelectorAll('.sb-frame-card').length === 4);
document.querySelector('[data-fc="6"]').click();
ok('sb_6_cards_rendered', document.querySelectorAll('.sb-frame-card').length === 6);

const card2 = document.querySelectorAll('.sb-frame-card')[1];
const veilSel = card2.querySelector('.sb-veil');
const opt80Idx = [...veilSel.options].findIndex(o => o.text.includes('80–85%'));
veilSel.selectedIndex = opt80Idx;
veilSel.dispatchEvent(new Event('change'));

// Check individual Shot 02 tab reflects per-frame 80-85% Veil Override
document.querySelector('.shot-tab[data-shot="2"]').click();
const shot2Prompt = document.getElementById('prompt').value;
ok('sb_shot2_has_80_veil_lock', shot2Prompt.includes('STORYBOARD SHOT 02') && shot2Prompt.includes('ZERO visible eyeballs'));

// Switch to Unified Grid mode on Full All Shots
document.getElementById('btnGridMode').click();
const gridPrompt = document.getElementById('prompt').value;
ok('sb_grid_mode_all_6_panels', gridPrompt.includes('6-FRAME 35MM CONTACT SHEET GRID') && gridPrompt.includes('PANEL 06'));

// Copy Positive & Negative + Custom Save & Import JSON
ok('sb_copy_positive_strips_neg', !api.getExtractedPositive().includes('AVOID / NEGATIVE GUIDANCE:'));
ok('sb_copy_negative_live', api.getExtractedNegative().startsWith('AVOID / NEGATIVE GUIDANCE:'));
const saved = api.saveCustomStoryPreset('6-Shot Salon Story');
ok('sb_save_preset_localstorage', !!saved && (localStorage.getItem('afterglow_storyboarder_v1') || '').includes('6-Shot Salon Story'));
const impCount = api.importStoriesFromData({ customPresets: [{ id: 'imp_sb_1', title: 'Imported 3-Shot Story', frameCount: 3, frames: api.getFrames().slice(0,3) }] });
ok('sb_import_preset_works', impCount === 1);

// Theme 3 & 4: Filmstrip UI + Per-frame lens override + Token estimation
const filmstrip = document.getElementById('sbFilmstrip');
ok('sb_filmstrip_rendered', !!filmstrip && filmstrip.querySelectorAll('.sb-film-box').length === 6);
const card1 = document.querySelectorAll('.sb-frame-card')[0];
const lensSel = card1.querySelector('.sb-lens');
ok('sb_frame_lens_selector_exists', !!lensSel);
lensSel.selectedIndex = 1;
lensSel.dispatchEvent(new Event('change'));
document.querySelector('.shot-tab[data-shot="1"]').click();
ok('sb_shot1_lens_override_reflected', document.getElementById('prompt').value.includes('85mm f/1.4 telephoto portrait lens'));
ok('sb_token_estimate_present', document.getElementById('wordCount').textContent.includes('tokens'));
'''


def main():
    browser = find_browser()
    suite = [
        ('index.html', INDEX_JS),
        ('salon.html', SALON_JS),
        ('photoshoot.html', PHOTOSHOOT_JS),
        ('tattoo.html', TATTOO_JS),
        ('makeup_spa.html', MAKEUP_SPA_JS),
        ('video.html', VIDEO_JS),
        ('storyboard.html', STORYBOARD_JS),
    ]
    total_passed = 0
    total_failed = 0

    for rel_path, js_code in suite:
        results = run_page_test(browser, rel_path, js_code)
        fails = [r for r in results if not r['ok']]
        total_passed += len(results) - len(fails)
        total_failed += len(fails)
        print(f'[{rel_path}] {len(results) - len(fails)}/{len(results)} passed')
        for f in fails:
            print(f'  FAIL {f["name"]}: {f["detail"]}')

    print(f'\nSUMMARY: {total_passed} passed, {total_failed} failed')
    return 0 if total_failed == 0 else 1


if __name__ == '__main__':
    sys.exit(main())
