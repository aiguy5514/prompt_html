#!/usr/bin/env python3
"""
Afterglow Studio Suite — Unified Headless Chrome Regression Suite (file:/// offline verification)
Tests index.html, salon.html, photoshoot.html, and tattoo.html directly against js/shared-*.js modules.
"""

import html as pyhtml
import json
import os
import re
import shutil
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

    user_data_dir = tempfile.mkdtemp(prefix='_tmp_chrome_profile_')

    try:
        proc = subprocess.run(
            [
                browser,
                '--headless=new',
                '--disable-gpu',
                '--no-sandbox',
                '--virtual-time-budget=3500',
                f'--user-data-dir={user_data_dir}',
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
        if os.path.exists(user_data_dir):
            import time
            for _ in range(5):
                try:
                    shutil.rmtree(user_data_dir, ignore_errors=True)
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
ok('index_has_romance_link', links.some(h => h.includes('romance.html')));
ok('index_has_image_doctor_link', links.some(h => h.includes('image_doctor.html')));
ok('index_has_gym_link', links.some(h => h.includes('gym.html')));
'''

SALON_JS = r'''
const api = window.AfterglowStudio;
ok('studio_api_exposed', !!api);
ok('salon_starts_in_salon_mode', api.getMode() === 'salon');
ok('salon_initial_section', document.querySelector('.tab.active')?.dataset?.section === 'salonVenueSec');
ok('salon_hero_title', document.getElementById('heroTitle').textContent.includes('Salon'));
ok('shared_datasets_loaded', api.getHair().length === 276 && api.getFields().outfit.opts.length >= 438, `hair=${api.getHair().length}, outfit=${api.getFields().outfit.opts.length}`);

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
const importedSingle = api.importCustomPresetsFromData({
  title: 'Single Naked Preset',
  set: { salonHaircut: cuts[2].cut.label.toLowerCase() }
});
ok('salon_import_single_and_fuzzy', importedSingle === 1);
const oldSalonAnchorClick = HTMLAnchorElement.prototype.click;
HTMLAnchorElement.prototype.click = function(){};
const salonExp = api.exportCustomPresets('Artisan Salon Bob');
HTMLAnchorElement.prototype.click = oldSalonAnchorClick;
ok('salon_export_custom_name_slug', salonExp && salonExp.filename === 'afterglow-salon-artisan-salon-bob.json' && salonExp.title === 'Artisan Salon Bob');

// Test clean import: importing an exported activeLook does NOT inject an unwanted card into customPresets
const customCountBefore = api.getCustomPresets().length;
api.importCustomPresetsFromData(salonExp.payload);
const customCountAfter = api.getCustomPresets().length;
ok('salon_export_import_does_not_inject_card', customCountAfter === customCountBefore);

const diffBanner = document.querySelector('.applied-preset-diff');
ok('salon_applied_preset_diff_rendered', !!diffBanner);
ok('salon_applied_preset_diff_shows_matching', diffBanner.textContent.includes('All settings match current studio configuration'));

// Test banner save button
const oldPrompt = window.prompt;
window.prompt = () => 'Saved Salon Direction';
const saveBtn = diffBanner.querySelector('.diff-save-btn');
ok('salon_diff_save_btn_exists', !!saveBtn);
saveBtn.click();
window.prompt = oldPrompt;
ok('salon_diff_save_btn_added_preset', api.getCustomPresets().some(p => p.title === 'Saved Salon Direction'));

// Verify real UI clicks on #copyPositive, #copyNegative, #btnQuickGrooming
document.getElementById('copyPositive').click();
ok('salon_toast_copy_positive', document.getElementById('toast').textContent.includes('positive'));
document.getElementById('copyNegative').click();
ok('salon_toast_copy_negative', document.getElementById('toast').textContent.includes('exclusions'));
document.getElementById('btnQuickGrooming').click();
ok('salon_quick_grooming_activates', api.getSeatingMode() === 'grooming_men');

// Theme 3 & 4: Clipper guard depth selector + token estimation + buzzword purge
ok('salon_clipper_guard_field_exists', !!api.getFields().salonClipperGuard && api.getFields().salonClipperGuard.opts.length === 12);
api.getValues().salonClipperGuard = api.getFields().salonClipperGuard.opts[5];
const sGuardPrompt = api.buildSalonPrompt();
ok('salon_clipper_guard_reflected', sGuardPrompt.includes('#1 magnetic clipper guard'));
api.getValues().salonClipperGuard = api.getFields().salonClipperGuard.opts[1];
const sFoilPrompt = api.buildSalonPrompt();
ok('salon_foil_shaver_guard', sFoilPrompt.includes('dual-foil titanium electric shavers'));
ok('salon_token_estimate_present', document.getElementById('wordCount').textContent.includes('tokens'));
ok('salon_buzzwords_purged', !sGuardPrompt.includes('harmonized with the selected establishment'));

// Barber lotions, tonics & temple clipper detailing
ok('salon_lotion_field_exists', !!api.getFields().salonLotion && api.getFields().salonLotion.opts.length >= 10);
api.getValues().salonLotion = api.getFields().salonLotion.opts[1];
const sLotionPrompt = api.buildSalonPrompt();
ok('salon_lotion_reflected', sLotionPrompt.includes('BARBER LOTIONS, TONICS & SKIN TREATMENT') && sLotionPrompt.includes('cooling eucalyptus and menthol aftershave balm'));

const templeClipperStage = api.getFields().salonStage.opts.find(o => o.label.includes('Electric clippers buzzing up the temple taper'));
ok('salon_temple_clipper_stage_exists', !!templeClipperStage);
api.getValues().salonStage = templeClipperStage;
const sTempleStagePrompt = api.buildSalonPrompt();
ok('salon_temple_clipper_stage_reflected', sTempleStagePrompt.includes('buzzing smoothly upward with an audible hum to blend a tight temple taper'));

const fadeHaircut = api.getHair().find(h => h.label.includes('Low Temple Skin Fade Buzz Cut'));
ok('salon_fade_haircut_exists', !!fadeHaircut && fadeHaircut.cat === 'fade');
api.getValues().salonHaircut = fadeHaircut;
const sFadeCutPrompt = api.buildSalonPrompt();
ok('salon_fade_haircut_reflected', sFadeCutPrompt.includes('Low Temple Skin Fade Buzz Cut'));

// Face Obfuscation modes in Salon
ok('salon_face_obfusc_field_exists', !!api.getFields().salonFaceObfuscMode && api.getFields().salonFaceObfuscMode.opts.length >= 8);
api.getValues().salonFaceObfuscMode = api.getFields().salonFaceObfuscMode.opts.find(o => o.id === 'hands_shield');
const sObfPrompt = api.buildSalonPrompt();
ok('salon_face_obfusc_hands_shield', sObfPrompt.includes('HAND & FINGER SHIELD'));
'''

PHOTOSHOOT_JS = r'''
const api = window.AfterglowStudio;
ok('ps_api_exposed', !!api);
ok('ps_starts_in_photoshoot_mode', api.getMode() === 'photoshoot');
ok('ps_initial_section', document.querySelector('.tab.active')?.dataset?.section === 'look');
ok('ps_hero_title', document.getElementById('heroTitle').textContent.includes('Photoshoot'));
ok('ps_initial_not_lookbook', !document.getElementById('prompt').value.includes('=== SHOT 1:'));
ok('ps_lookbook_false_by_default', api.getLookbookMode ? api.getLookbookMode() === false : true);

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
ok('ps_lookbook_reset_clears_shot1', !document.getElementById('prompt').value.includes('=== SHOT 1:'));
api.setLookbookMode(true, '1');
document.querySelector('.preset').click();
ok('ps_preset_click_resets_lookbook', !document.getElementById('prompt').value.includes('=== SHOT 1:') && api.getLookbookMode() === false);
vals.hair = api.getHair().find(h => h.label.includes('Sleek high ponytail'));
vals.hairFaceCoverage = findCov('65–70%');
api.buildPrompt();

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

// Face Obfuscation modes in Photoshoot
ok('ps_face_obfusc_field_exists', !!api.getFields().faceObfuscMode && api.getFields().faceObfuscMode.opts.length >= 8);
api.getValues().faceObfuscMode = api.getFields().faceObfuscMode.opts.find(o => o.id === 'minimalist_censor_bar');
const psObfPrompt = api.buildPrompt();
ok('ps_face_obfusc_censor_bar', psObfPrompt.includes('EDITORIAL PRIVACY BAR'));

// Prompt Start dynamically reflects styling, hair, and identity in top lines
const psPromptTopLines = document.getElementById('prompt').value.split('\n').slice(0, 15).join('\n');
ok('ps_start_has_editorial_styling', psPromptTopLines.includes('PRIMARY SUBJECT & EDITORIAL STYLING:') && psPromptTopLines.includes('Model (Reference Subject)') && psPromptTopLines.includes('Signature Post-Makeover Haircut'));

// Makeover moments with clipper touch-up & temple fade haircuts
const clipperMakeover = api.getFields().makeover.opts.find(o => o.label.includes('Backstage cordless clipper fade touch-up'));
ok('ps_clipper_makeover_exists', !!clipperMakeover);
api.getValues().makeover = clipperMakeover;
const psMakeoverPrompt = api.buildPrompt();
ok('ps_clipper_makeover_reflected', psMakeoverPrompt.includes('cordless clippers') && psMakeoverPrompt.includes('temple fade'));

const psFadeHaircut = api.getHair().find(h => h.label.includes('Textured French Crop with Tapered Temples'));
ok('ps_fade_haircut_exists', !!psFadeHaircut && psFadeHaircut.cat === 'fade');
api.getValues().hair = psFadeHaircut;
const psFadePrompt = api.buildPrompt();
ok('ps_fade_haircut_reflected', psFadePrompt.includes('Textured French Crop with Tapered Temples'));
'''

TATTOO_JS = r'''
const api = window.AfterglowTattoo;
ok('tattoo_api_exposed', !!api);
ok('tattoo_shared_datasets', api.getHair().length === 276 && api.getFields().outfit.opts.length >= 438);

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

// Face Obfuscation modes in Tattoo
ok('tattoo_face_obfusc_field_exists', !!api.getFields().tattooFaceObfuscMode && api.getFields().tattooFaceObfuscMode.opts.length >= 8);
api.getValues().tattooFaceObfuscMode = api.getFields().tattooFaceObfuscMode.opts.find(o => o.id === 'optical_gaussian_blur');
const tObfPrompt = api.buildPrompt();
ok('tattoo_face_obfusc_gaussian', tObfPrompt.includes('GAUSSIAN DEPTH BLUR'));

// Category filter tests: Hair, Motif, and Location
document.querySelector('[data-section="tattooSubjectSec"]').click();
const hCats = api.getFields().tattooHairCategory.opts;
const fadeCat = hCats.find(o => o.text === 'fade');
ok('tattoo_hair_category_fade_exists', !!fadeCat);
api.getValues().tattooHairCategory = fadeCat;
api.renderFields();
ok('tattoo_hair_category_fade_filter', api.getValues().tattooHair?.cat === 'fade', `hair cat should be fade, got: ${api.getValues().tattooHair?.cat}`);

const bobCat = hCats.find(o => o.text === 'bob');
api.getValues().tattooHairCategory = bobCat;
api.renderFields();
ok('tattoo_hair_category_bob_filter', api.getValues().tattooHair?.cat === 'bob', `hair cat should be bob, got: ${api.getValues().tattooHair?.cat}`);

const mCats = api.getFields().tattooMotifCategory.opts;
const botanicalCat = mCats.find(o => o.text === 'botanical');
api.getValues().tattooMotifCategory = botanicalCat;
api.renderFields();
ok('tattoo_motif_category_botanical_filter', api.getValues().tattooMotif?.cat === 'botanical', `motif cat should be botanical, got: ${api.getValues().tattooMotif?.cat}`);

const lCats = api.getFields().tattooLocationCategory.opts;
const studioCat = lCats.find(o => o.text === 'studio');
api.getValues().tattooLocationCategory = studioCat;
api.renderFields();
ok('tattoo_location_category_studio_filter', api.getValues().tattooLocation?.cat === 'studio', `location cat should be studio, got: ${api.getValues().tattooLocation?.cat}`);
'''

MAKEUP_SPA_JS = r'''
const api = window.AfterglowMakeupSpa;
ok('makeup_api_exposed', !!api);
ok('makeup_shared_datasets', api.getHair().length === 276 && api.getFields().topPiece.opts.length >= 35);
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

// Face Obfuscation modes in Makeup & Spa
ok('makeup_face_obfusc_field_exists', !!api.getFields().prepFaceObfuscMode && api.getFields().prepFaceObfuscMode.opts.length >= 8);
api.getValues().prepFaceObfuscMode = api.getFields().prepFaceObfuscMode.opts.find(o => o.id === 'chiaroscuro_shadow');
const mObfPrompt = api.buildPrompt();
ok('makeup_face_obfusc_chiaroscuro', mObfPrompt.includes('CHIAROSCURO SILHOUETTE'));
'''

VIDEO_JS = r'''
const api = window.AfterglowVideo;
ok('video_api_exposed', !!api);
const flds = api.getFields();
ok('video_rich_option_libraries', api.getHair().length === 276 && flds.vidOutfit.opts.length >= 438 && flds.vidCameraMove.opts.length === 32 && flds.vidBeatStart.opts.length >= 25 && flds.vidBeatMid.opts.length >= 30 && flds.vidEnvironment.opts.length >= 15);
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
const vidImp = api.importVidPresetsFromData({ customPresets: [{ id: 'vid_imp_1', title: 'Imported Dolly', values: { vidCameraMove: api.getFields().vidCameraMove.opts[1].label } }] });
ok('video_import_preset_works', vidImp === 1);
const vidImpSingle = api.importVidPresetsFromData({ title: 'Single Video Motion', values: { vidCameraMove: api.getFields().vidCameraMove.opts[2].label.toLowerCase() } });
ok('video_import_single_and_fuzzy', vidImpSingle === 1);

// Theme 3 & 4: Speed curve + Seamless loop + Token estimation
ok('video_speed_curve_field_exists', !!api.getFields().vidSpeedCurve);
api.getValues().vidSpeedCurve = api.getFields().vidSpeedCurve.opts[1];
const vCurvePrompt = api.buildPrompt();
ok('video_speed_curve_reflected', vCurvePrompt.includes('Dynamic Speed Ramp') || vCurvePrompt.includes('cinematic speed ramp curve'));
document.getElementById('chkLoop').click();
const vLoopPrompt = api.buildPrompt();
ok('video_seamless_loop_reflected', vLoopPrompt.includes('Seamless loop requirement') && vLoopPrompt.includes('jump cut at loop point'));
ok('video_token_estimate_present', document.getElementById('wordCount').textContent.includes('tokens'));

// Face Obfuscation modes in Video
ok('video_face_obfusc_field_exists', !!api.getFields().vidFaceObfuscMode && api.getFields().vidFaceObfuscMode.opts.length >= 8);
api.getValues().vidFaceObfuscMode = api.getFields().vidFaceObfuscMode.opts.find(o => o.id === 'prop_shield');
const vObfPrompt = api.buildPrompt();
ok('video_face_obfusc_prop_shield', vObfPrompt.includes('PROP & OBJECT OCCLUSION'));
'''

STORYBOARD_JS = r'''
const api = window.AfterglowStoryboard;
ok('sb_api_exposed', !!api);
const flds = api.getFields();
ok('sb_rich_option_libraries', api.getHair().length === 276 && flds.sbOutfit.opts.length >= 438 && flds.sbVenue.opts.length >= 20);
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

// Face Obfuscation modes in Storyboard
ok('sb_face_obfusc_field_exists', !!api.getFields().sbFaceObfuscMode && api.getFields().sbFaceObfuscMode.opts.length >= 8);
api.getValues().sbFaceObfuscMode = api.getFields().sbFaceObfuscMode.opts.find(o => o.id === 'shutter_motion_blur');
const sbObfPrompt = api.buildPrompt();
ok('sb_face_obfusc_motion_blur', sbObfPrompt.includes('SHUTTER MOTION BLUR'));
'''

ROMANCE_JS = r'''
const api = window.AfterglowRomance;
ok('romance_api_exposed', !!api);
ok('romance_initial_section', document.querySelector('.tab.active')?.dataset?.section === 'romanceCoupleSec');
ok('romance_hero_title', document.getElementById('heroTitle').textContent.includes('Romantic'));
ok('romance_bike_options_loaded', api.getBikeScenes().length >= 7);
ok('romance_date_options_loaded', api.getDateVenues().length >= 8);
ok('romance_couple_options_loaded', api.getCoupleInteractions().length >= 10);
ok('romance_face_obfusc_field', !!api.getFields().romanceFaceObfuscMode && api.getFields().romanceFaceObfuscMode.opts.length === 10);
ok('romance_helmet_opts_loaded', api.getHelmetModeOpts().length === 3);
ok('romance_prompt_generated', document.getElementById('prompt').value.length > 100);

// Assert Duo Composition and Anti-Morph Negatives in initial prompt
const [initPos, initNeg] = document.getElementById('prompt').value.split('AVOID / NEGATIVE GUIDANCE:');
ok('romance_duo_rule', initPos.includes('CINEMATIC DUO PORTRAIT') && initPos.includes('Duo Composition Rule: Exactly one woman and one man in frame'));
ok('romance_anti_morph_negs', initNeg.includes('fused bodies') && initNeg.includes('phantom limbs') && initNeg.includes('missing partner'));

// Face Obfuscation modes in Romance
const findObf = id => api.getFields().romanceFaceObfuscMode.opts.find(o => o.id === id);
api.getValues().romanceFaceObfuscMode = findObf('hands_shield');
const pHand = api.buildPrompt();
ok('romance_face_obfusc_hand_shield', pHand.includes('HAND & FINGER SHIELD'));

api.getValues().romanceFaceObfuscMode = findObf('minimalist_censor_bar');
const pCensor = api.buildPrompt();
ok('romance_face_obfusc_censor_bar', pCensor.includes('EDITORIAL PRIVACY BAR'));

api.getValues().romanceFaceObfuscMode = findObf('turned_away');
const pTurned = api.buildPrompt();
ok('romance_face_obfusc_turned_away', pTurned.includes('TURNED-AWAY PROFILE'));

// Reel mode toggle
document.getElementById('btnReelMode').click();
const pReel = document.getElementById('prompt').value;
ok('romance_reel_mode_toggle', pReel.includes('CINEMATIC 2-SHOT COUPLE VIDEO REEL') && pReel.includes('SHOT 1') && pReel.includes('SHOT 2'));
document.getElementById('btnSingleMode').click();
ok('romance_single_mode_restored', !document.getElementById('prompt').value.includes('CINEMATIC 2-SHOT COUPLE VIDEO REEL'));

// Switch to Her Wardrobe & Makeup section to reveal separates controls
document.querySelector('.tab[data-section="romanceWardrobeSec"]').click();
document.getElementById('btnSeparates').click();
ok('romance_separates_toggle', document.getElementById('prompt').value.includes('paired with'));

// Switch to Her Hair, Moisture & Privacy section to reveal moisture & helmet controls
document.querySelector('.tab[data-section="romanceHairSec"]').click();
document.querySelector('.moisture-pill[data-moisture="wet"]').click();
const [rWetPos, rWetNeg] = document.getElementById('prompt').value.split('AVOID / NEGATIVE GUIDANCE:');
ok('romance_wet_physics', rWetPos.includes('Mandatory Wet Hair Physics') && rWetNeg.includes('dry hair'));

// Test Option B Helmet Resting mode
api.getValues().romanceHelmetMode = api.getHelmetModeOpts()[1];
const pResting = api.buildPrompt();
ok('romance_helmet_resting', pResting.includes('Motorcycle Helmet Continuity: Both riders are completely bareheaded enjoying the view'));

// Copy positive / negative
ok('romance_copy_positive', !api.getExtractedPositive().includes('AVOID / NEGATIVE GUIDANCE:'));
ok('romance_copy_negative', api.getExtractedNegative().startsWith('AVOID / NEGATIVE GUIDANCE:'));

// Finish custom direction & extra negative
document.querySelector('.tab[data-section="finish"]').click();
const cd = document.getElementById('customDirInput');
const en = document.getElementById('extraNegInput');
ok('romance_finish_inputs', !!cd && !!en);
cd.value = 'midnight neon highway reflections'; cd.dispatchEvent(new Event('input'));
ok('romance_custom_dir_reflected', document.getElementById('prompt').value.includes('midnight neon highway reflections'));

// Custom Presets save & import
const saved = api.saveCustomRomancePreset('My Bike Road Trip');
ok('romance_save_preset', !!saved && (localStorage.getItem('afterglow_romance_v1') || '').includes('My Bike Road Trip'));
const imp = api.importRomancePresetsFromData({ customPresets: [{ id: 'imp_rom_1', title: 'Imported Cafe Romance', hairMoisture: 'damp', set: { romanceSetting: api.getFields().romanceSetting.opts[1].label } }] });
ok('romance_import_preset', imp === 1);
const impSingle = api.importRomancePresetsFromData({ title: 'Single Romance Look', set: { romanceSetting: 'whispering sea breeze' } });
ok('romance_import_single_preset', impSingle === 1);
const rPrompt = api.buildPrompt();
ok('romance_prompt_valid_after_import', !rPrompt.includes('undefined'));
'''

IMAGE_DOCTOR_JS = r'''
const api = window.AfterglowImageDoctor;
ok('doctor_api_exposed', !!api);
ok('doctor_starts_in_preserve_sec', document.querySelector('.tab.active')?.dataset?.section === 'doctorPreserveSec');
ok('doctor_hero_title', document.getElementById('heroTitle').textContent.includes('Doctor'));

// Section 1: Preservation locks
const locks = api.getLockState();
ok('doctor_10_locks_exist', Object.keys(locks).length === 10);
ok('doctor_default_identity_locked', locks.identity === true);
ok('doctor_default_hair_locked', locks.hair === true);
ok('doctor_default_wardrobe_locked', locks.wardrobe === true);

// Initial prompt has preservation blocks
const initPrompt = document.getElementById('prompt').value;
ok('doctor_prompt_has_header', initPrompt.includes('IMAGE DOCTOR · SURGICAL REFERENCE EDIT'));
ok('doctor_prompt_has_preservation_block', initPrompt.includes('MANDATORY PRESERVATION LOCKS'));
ok('doctor_token_estimate_present', document.getElementById('wordCount').textContent.includes('tokens'));

// Section 2: Surgical Face Edits
document.querySelector('.tab[data-section="doctorFaceSec"]').click();
ok('doctor_face_sec_active', document.querySelector('.tab.active')?.dataset?.section === 'doctorFaceSec');
const flds = api.getFields();
const vals = api.getValues();
const buttonNose = flds.nose.opts.find(o => o.label.includes('Petite upturned button nose'));
ok('doctor_button_nose_opt_exists', !!buttonNose);
vals.nose = buttonNose;
const pNose = api.buildPrompt();
ok('doctor_nose_edit_reflected', pNose.includes('TARGET ZONE: FACIAL ANATOMY SURGERY') && pNose.includes('Petite upturned button nose'));

// Section 3: Hair Makeover + Auto-unlock of hair lock + Moisture
document.querySelector('.tab[data-section="doctorHairSec"]').click();
const frenchBob = api.getHair().find(h => h.label.includes('Chin-length French bob'));
ok('doctor_french_bob_exists', !!frenchBob);
vals.haircut = frenchBob;
const pHair = api.buildPrompt();
ok('doctor_hair_edit_reflected', pHair.includes('TARGET ZONE: HAIR TRANSFORMATION') && pHair.includes('French bob'));
ok('doctor_hair_auto_unlocked', api.getLockState().hair === false);

// Moisture selector in hair
const mCard = document.getElementById('moistureToggleCard');
ok('doctor_moisture_card_rendered', !!mCard);
document.querySelector('.moisture-pill[data-moisture="wet"]').click();
const pWet = document.getElementById('prompt').value;
ok('doctor_wet_physics_reflected', pWet.includes('Mandatory Soaked Wet Hair Physics') && pWet.includes('dry hair'));

// Section 4: Wardrobe Separates & Full Look toggle
document.querySelector('.tab[data-section="doctorWardrobeSec"]').click();
document.getElementById('btnDoctorSeparates').click();
ok('doctor_separates_mode_active', api.getWardrobeMode() === 'separates');
const linenTop = flds.topPiece.opts.find(o => o.label.includes('linen'));
if (linenTop) vals.topPiece = linenTop;
const pSep = api.buildPrompt();
ok('doctor_wardrobe_separates_reflected', pSep.includes('Two-Piece Separates Ensemble') && api.getLockState().wardrobe === false);

// Section 5: Inpaint finish & custom direction & negative
document.querySelector('.tab[data-section="doctorFinishSec"]').click();
const cd = document.getElementById('customDirInput');
const en = document.getElementById('extraNegInput');
ok('doctor_finish_inputs_rendered', !!cd && !!en);
cd.value = 'blend hairline naturally across temple'; cd.dispatchEvent(new Event('input'));
en.value = 'plastic forehead highlights'; en.dispatchEvent(new Event('input'));
const pFinish = document.getElementById('prompt').value;
ok('doctor_custom_dir_reflected', pFinish.includes('blend hairline naturally across temple'));
ok('doctor_extra_neg_reflected', pFinish.includes('plastic forehead highlights'));

// Positive & Negative extraction
ok('doctor_copy_positive_works', !api.getExtractedPositive().includes('AVOID / NEGATIVE GUIDANCE:'));
ok('doctor_copy_negative_works', api.getExtractedNegative().startsWith('AVOID / NEGATIVE GUIDANCE:'));

// Custom Presets save & import
const saved = api.saveCustomDoctorPreset('My Surgical Bob Test');
ok('doctor_save_preset', !!saved && (localStorage.getItem('afterglow_image_doctor_v1') || '').includes('My Surgical Bob Test'));
const imp = api.importDoctorPresetsFromData({ customPresets: [{ id: 'imp_doc_1', title: 'Imported Nose Edit', edits: { nose: 'Petite upturned button nose' } }] });
ok('doctor_import_preset', imp === 1);
const oldClick = HTMLAnchorElement.prototype.click;
HTMLAnchorElement.prototype.click = function(){};
const docExport = api.exportDoctorPresets('My Surgical Direction Test');
HTMLAnchorElement.prototype.click = oldClick;
ok('doctor_export_has_active_look_and_version', docExport.version === 2 && !!docExport.activeLook && Array.isArray(docExport.starterPresets));
ok('doctor_export_custom_name_slug', docExport.filename === 'afterglow-doctor-my-surgical-direction-test.json' && docExport.title === 'My Surgical Direction Test');
const impSingleDoc = api.importDoctorPresetsFromData({ title: 'Single Doctor Look', edits: { haircut: 'french bob' } });
ok('doctor_import_single_preset', impSingleDoc === 1);
const docDiffBanner = document.querySelector('.applied-preset-diff');
ok('doctor_applied_preset_diff_rendered', !!docDiffBanner);
ok('doctor_diff_save_btn_exists', !!docDiffBanner && !!docDiffBanner.querySelector('.diff-save-btn'));

// Mobile drawer open / close
document.getElementById('openDrawerBtn').click();
ok('doctor_drawer_opens', document.querySelector('.preview').classList.contains('drawer-open'));
document.getElementById('drawerBackdrop').click();
ok('doctor_drawer_closes', !document.querySelector('.preview').classList.contains('drawer-open'));
'''

GYM_JS = r'''
const api = window.AfterglowGym;
ok('gym_api_exposed', !!api);
const flds = api.getFields();
ok('gym_options_loaded', flds.gymVenue.opts.length === 15 && flds.gymOutfit.opts.length >= 25 && api.getHair().length === 276);
ok('gym_starts_in_venue_sec', document.querySelector('.tab.active')?.dataset?.section === 'gymVenueSec');
ok('gym_starter_presets_count', api.getStarterPresets().length === 8);
ok('gym_tabs_count', document.querySelectorAll('.section-tab').length === 6);

// Navigate to Physique & Exertion -> check moisture card & veil
document.querySelector('[data-section="gymPhysiqueSec"]').click();
ok('gym_moisture_card_rendered', !!document.getElementById('moistureToggleCard'));
document.querySelector('.moisture-pill[data-moisture="wet"]').click();
const [gWetPos, gWetNeg] = document.getElementById('prompt').value.split('AVOID / NEGATIVE GUIDANCE:');
ok('gym_wet_physics_enforced', gWetPos.includes('Mandatory Soaked Wet Hair Physics') && gWetNeg.includes('dry hair'));
ok('gym_wet_summary_tag', document.getElementById('summary').textContent.includes('Soaked Wet'));

// Veil landmark lock
const vals = api.getValues();
vals.gymHair = api.getHair().find(h => h.label.includes('Chin-length French bob'));
vals.gymHairFaceCoverage = api.getHairFaceCoverageOpts().find(o => o.label.includes('80–85%'));
const pVeil = api.buildPrompt();
ok('gym_80_veil_chin_bob', pVeil.includes('Strictly keep the bob hem ending crisply at chin/jawline level') && pVeil.includes('ZERO visible eyeballs'));

// Navigate to Wardrobe & Gear -> toggle Separates
document.querySelector('[data-section="gymWardrobeSec"]').click();
document.getElementById('btnGymSeparates').click();
ok('gym_separates_updates_prompt', document.getElementById('prompt').value.includes('athletic two-piece workout separates'));

// Section 6: Finish controls, custom direction & negative
document.querySelector('[data-section="finish"]').click();
const customDir = document.getElementById('customDirInput');
const extraNeg = document.getElementById('extraNegInput');
ok('gym_finish_inputs_rendered', !!customDir && !!extraNeg);
customDir.value = 'silver shaker bottle on floor, dust particles in sunbeam';
customDir.dispatchEvent(new Event('input'));
extraNeg.value = 'high heels, gold chain necklace';
extraNeg.dispatchEvent(new Event('input'));
const finishPrompt = document.getElementById('prompt').value;
ok('gym_custom_dir_reflected', finishPrompt.includes('silver shaker bottle on floor, dust particles in sunbeam'));
ok('gym_extra_neg_reflected', finishPrompt.includes('high heels') && finishPrompt.includes('gold chain necklace'));

// 2x2 Workout Series toggle + Copy Positive/Negative
document.getElementById('btnLookbookMode').click();
ok('gym_collage_2x2_panel', document.getElementById('prompt').value.includes('2×2 EDITORIAL WORKOUT SERIES COLLAGE'));
ok('gym_copy_positive_strips_neg', !api.getExtractedPositive().includes('AVOID / NEGATIVE GUIDANCE:'));
ok('gym_copy_negative_live', api.getExtractedNegative().startsWith('AVOID / NEGATIVE GUIDANCE:'));

// Custom Presets save, export & import
const saved = api.saveCustomGymPreset('My CrossFit Workout Test');
ok('gym_save_preset', !!saved && (localStorage.getItem('afterglow_gym_v1') || '').includes('My CrossFit Workout Test'));
const oldClick = HTMLAnchorElement.prototype.click;
HTMLAnchorElement.prototype.click = function(){};
const gymExport = api.exportGymPresets('My Gym Direction Test');
HTMLAnchorElement.prototype.click = oldClick;
ok('gym_export_has_active_look_and_version', gymExport.version === 2 && !!gymExport.activeLook && Array.isArray(gymExport.starterPresets));
ok('gym_export_custom_name_slug', gymExport.filename === 'afterglow-gym-my-gym-direction-test.json' && gymExport.title === 'My Gym Direction Test');

const imp = api.importGymPresetsFromData({ customPresets: [{ id: 'imp_gym_1', title: 'Imported Turf Run', values: { gymVenue: flds.gymVenue.opts[3].label } }] });
ok('gym_import_preset', imp === 1);
const impSingleGym = api.importGymPresetsFromData({ title: 'Single Gym Look', set: { gymMovement: flds.gymMovement.opts[0].label } });
ok('gym_import_single_preset', impSingleGym === 1);
const gymDiffBanner = document.querySelector('.applied-preset-diff');
ok('gym_applied_preset_diff_rendered', !!gymDiffBanner);
ok('gym_diff_save_btn_exists', !!gymDiffBanner && !!gymDiffBanner.querySelector('.diff-save-btn'));

// Mobile drawer open / close
document.getElementById('openDrawerBtn').click();
ok('gym_drawer_opens', document.querySelector('.preview').classList.contains('drawer-open'));
document.getElementById('drawerBackdrop').click();
ok('gym_drawer_closes', !document.querySelector('.preview').classList.contains('drawer-open'));

// Face Obfuscation modes in Gym
ok('gym_face_obfusc_field_exists', !!flds.gymFaceObfuscMode && flds.gymFaceObfuscMode.opts.length >= 8);
vals.gymFaceObfuscMode = flds.gymFaceObfuscMode.opts.find(o => o.id === 'chiaroscuro_shadow');
const gObfPrompt = api.buildPrompt();
ok('gym_face_obfusc_chiaroscuro', gObfPrompt.includes('CHIAROSCURO SILHOUETTE'));
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
        ('romance.html', ROMANCE_JS),
        ('image_doctor.html', IMAGE_DOCTOR_JS),
        ('gym.html', GYM_JS),
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
